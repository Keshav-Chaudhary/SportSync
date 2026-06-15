import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const loanId = parseInt(id)
    if (isNaN(loanId)) {
      return NextResponse.json({ error: 'Invalid loan ID' }, { status: 400 })
    }

    // Check if user is staff or admin
    const [userRole] = await pool.query(
      'SELECT ur.role FROM USER_ROLES ur WHERE ur.user_id = ?',
      [session.user_id]
    ) as any

    const userRoleName = userRole[0]?.role
    if (!userRoleName || !['STAFF', 'ADMIN'].includes(userRoleName)) {
      return NextResponse.json({ error: 'Only staff or admin can process returns or modify loans' }, { status: 403 })
    }

    // Parse body if present to check for general loan edit
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Default to empty body for return action
    }

    // General loan manipulation (Admin only)
    if (body.hasOwnProperty('due_date') || body.hasOwnProperty('quantity') || body.hasOwnProperty('status')) {
      if (userRoleName !== 'ADMIN') {
        return NextResponse.json({ error: 'Only administrators can modify loan records.' }, { status: 403 })
      }

      const { due_date, quantity: newQty, status: newStatus } = body

      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()

        // Lock loan row
        const [loanRows] = await connection.query(
          'SELECT equipment_id, quantity, status FROM EQUIPMENT_LOAN WHERE loan_id = ? FOR UPDATE',
          [loanId]
        ) as any

        if (!loanRows || loanRows.length === 0) {
          await connection.rollback()
          return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
        }

        const { equipment_id, quantity: oldQty, status: oldStatus } = loanRows[0]

        // Validate status transition if changing status
        let statusToUse = oldStatus
        if (newStatus) {
          if (!['ISSUED', 'RETURNED', 'OVERDUE'].includes(newStatus)) {
            await connection.rollback()
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
          }
          statusToUse = newStatus
        }

        let qtyToUse = oldQty
        if (newQty !== undefined) {
          const parsedQty = parseInt(newQty)
          if (isNaN(parsedQty) || parsedQty < 1) {
            await connection.rollback()
            return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
          }
          qtyToUse = parsedQty
        }

        // Calculate equipment stock adjustments
        const wasActive = ['ISSUED', 'OVERDUE'].includes(oldStatus)
        const isActiveNow = ['ISSUED', 'OVERDUE'].includes(statusToUse)

        let stockAdjustment = 0
        if (wasActive && !isActiveNow) {
          // Loan is now returned, restore the old quantity to stock
          stockAdjustment = oldQty
        } else if (!wasActive && isActiveNow) {
          // Loan is now active, subtract the new quantity from stock
          stockAdjustment = -qtyToUse
        } else if (wasActive && isActiveNow) {
          // Loan stays active, adjust stock by difference: oldQty - qtyToUse
          stockAdjustment = oldQty - qtyToUse
        }

        if (stockAdjustment !== 0) {
          // Check if adjustment leaves enough available stock
          const [equipmentResult] = await connection.query(
            'SELECT available_quantity, total_quantity FROM EQUIPMENT WHERE equipment_id = ? FOR UPDATE',
            [equipment_id]
          ) as any

          if (!equipmentResult || equipmentResult.length === 0) {
            await connection.rollback()
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
          }

          const { available_quantity, total_quantity } = equipmentResult[0]
          const newAvail = available_quantity + stockAdjustment

          if (newAvail < 0 || newAvail > total_quantity) {
            await connection.rollback()
            return NextResponse.json({ error: 'Stock adjustment violates quantity limits' }, { status: 400 })
          }

          // Apply adjustment
          await connection.query(
            'UPDATE EQUIPMENT SET available_quantity = ? WHERE equipment_id = ?',
            [newAvail, equipment_id]
          )
        }

        // Build update query dynamically
        const fieldsToUpdate: string[] = []
        const paramsToUse: any[] = []

        if (due_date !== undefined) {
          fieldsToUpdate.push('due_date = ?')
          paramsToUse.push(due_date)
        }
        if (newQty !== undefined) {
          fieldsToUpdate.push('quantity = ?')
          paramsToUse.push(qtyToUse)
        }
        if (newStatus !== undefined) {
          fieldsToUpdate.push('status = ?')
          paramsToUse.push(statusToUse)
          if (newStatus === 'RETURNED' && oldStatus !== 'RETURNED') {
            fieldsToUpdate.push('returned_at = NOW()')
          } else if (newStatus !== 'RETURNED' && oldStatus === 'RETURNED') {
            fieldsToUpdate.push('returned_at = NULL')
            fieldsToUpdate.push('returned_by = NULL')
          }
        }

        if (fieldsToUpdate.length > 0) {
          paramsToUse.push(loanId)
          await connection.query(
            `UPDATE EQUIPMENT_LOAN SET ${fieldsToUpdate.join(', ')} WHERE loan_id = ?`,
            paramsToUse
          )
        }

        await connection.commit()
        return NextResponse.json({ success: true })
      } catch (txError: any) {
        await connection.rollback()
        throw txError
      } finally {
        connection.release()
      }
    }

    // Default action: Process standard return (Staff or Admin)
    let staffId: number | null = null
    const [staffResult] = await pool.query(
      'SELECT staff_id FROM STAFF WHERE user_id = ?',
      [session.user_id]
    ) as any

    if (staffResult && staffResult.length > 0) {
      staffId = staffResult[0].staff_id
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const [loanData] = await connection.query(
        `SELECT equipment_id, quantity, status FROM EQUIPMENT_LOAN WHERE loan_id = ? FOR UPDATE`,
        [loanId]
      ) as any

      if (!loanData || loanData.length === 0) {
        await connection.rollback()
        return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
      }

      const { status } = loanData[0]

      if (status === 'RETURNED') {
        await connection.rollback()
        return NextResponse.json({ success: true })
      }

      // Update status to RETURNED; trigger restores stock automatically
      await connection.query(
        `UPDATE EQUIPMENT_LOAN 
         SET status = 'RETURNED', returned_at = NOW(), returned_by = ?
         WHERE loan_id = ?`,
        [staffId, loanId]
      )

      await connection.commit()
      return NextResponse.json({ success: true })
    } catch (error: any) {
      await connection.rollback()
      const message =
        typeof error?.message === 'string' &&
        error.message.includes('CHECK constraint')
          ? 'Return would exceed equipment stock limits'
          : error?.message || 'Failed to process return'

      return NextResponse.json({ error: message }, { status: 500 })
    } finally {
      connection.release()
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const loanId = parseInt(id)
    if (isNaN(loanId)) {
      return NextResponse.json({ error: 'Invalid loan ID' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Fetch the loan to check its status and quantity for restoring inventory
      const [loanRows] = await connection.query(
        'SELECT equipment_id, quantity, status FROM EQUIPMENT_LOAN WHERE loan_id = ? FOR UPDATE',
        [loanId]
      ) as any

      if (!loanRows || loanRows.length === 0) {
        await connection.rollback()
        return NextResponse.json({ error: 'Loan record not found' }, { status: 404 })
      }

      const { equipment_id, quantity, status } = loanRows[0]

      // If the loan is active (ISSUED or OVERDUE), restore the inventory quantity
      if (status === 'ISSUED' || status === 'OVERDUE') {
        await connection.query(
          'UPDATE EQUIPMENT SET available_quantity = available_quantity + ? WHERE equipment_id = ?',
          [quantity, equipment_id]
        )
      }

      // Delete the loan record
      await connection.query(
        'DELETE FROM EQUIPMENT_LOAN WHERE loan_id = ?',
        [loanId]
      )

      await connection.commit()
      return NextResponse.json({ success: true })
    } catch (txError: any) {
      await connection.rollback()
      throw txError
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Error deleting loan:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
