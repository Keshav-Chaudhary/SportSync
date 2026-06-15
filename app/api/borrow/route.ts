import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Students cannot borrow equipment directly via the API. Only staff can issue loans.
    return NextResponse.json(
      { error: 'Forbidden: Students cannot request loans directly. Please coordinate with a staff member at the desk.' },
      { status: 403 }
    )

    // Get student_id (roll_no)
    const [studentResult] = await pool.query(
      'SELECT roll_no FROM STUDENT WHERE user_id = ?',
      [session.user_id]
    ) as any

    if (!studentResult || studentResult.length === 0) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    const studentId = studentResult[0].roll_no
    const body = await req.json()
    const { equipment_id, quantity, due_date } = body

    if (!equipment_id || !quantity || !due_date) {
      return NextResponse.json(
        { error: 'equipment_id, quantity, and due_date required' },
        { status: 400 }
      )
    }

    // Validate quantity
    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    // Check equipment availability
    const [equipmentResult] = await pool.query(
      'SELECT available_quantity FROM EQUIPMENT WHERE equipment_id = ?',
      [equipment_id]
    ) as any

    if (!equipmentResult || equipmentResult.length === 0) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    if (equipmentResult[0].available_quantity < quantity) {
      return NextResponse.json(
        { error: `Only ${equipmentResult[0].available_quantity} units available` },
        { status: 400 }
      )
    }

    // Get a staff member to assign as issuer (first available staff member)
    const [staffResult] = await pool.query(
      'SELECT staff_id FROM STAFF LIMIT 1'
    ) as any

    if (!staffResult || staffResult.length === 0) {
      return NextResponse.json({ error: 'No staff available to issue equipment' }, { status: 503 })
    }

    const staffId = staffResult[0].staff_id

    // Create loan in a transaction to avoid race conditions
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const [equipmentForUpdate] = await connection.query(
        'SELECT available_quantity FROM EQUIPMENT WHERE equipment_id = ? FOR UPDATE',
        [equipment_id]
      ) as any

      if (!equipmentForUpdate || equipmentForUpdate.length === 0) {
        await connection.rollback()
        return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
      }

      if (equipmentForUpdate[0].available_quantity < quantity) {
        await connection.rollback()
        return NextResponse.json(
          { error: `Only ${equipmentForUpdate[0].available_quantity} units available` },
          { status: 400 }
        )
      }

      const [result] = await connection.query(
        `INSERT INTO EQUIPMENT_LOAN (equipment_id, student_id, quantity, issued_by, issued_at, due_date, status, created_at)
         VALUES (?, ?, ?, ?, NOW(), ?, 'ISSUED', NOW())`,
        [equipment_id, studentId, quantity, staffId, due_date]
      ) as any

      await connection.commit()

      return NextResponse.json({ 
        success: true, 
        message: 'Equipment borrowed successfully',
        loanId: result.insertId 
      })
    } catch (error: any) {
      console.error('Borrow error:', error)
      try {
        await connection.rollback()
      } catch {
        /* ignore */
      }
      const message =
        typeof error?.message === 'string' &&
        error.message.includes('CHECK constraint')
          ? 'Insufficient equipment available'
          : error?.message || 'Failed to borrow equipment'

      return NextResponse.json(
        { error: message },
        { status: 500 }
      )
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Borrow error:', error)

    const message =
      typeof error?.message === 'string' &&
      error.message.includes('CHECK constraint')
        ? 'Insufficient equipment available'
        : error?.message || 'Failed to borrow equipment'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
