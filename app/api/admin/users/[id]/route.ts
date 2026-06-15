import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const userId = parseInt(id)
    const body = await request.json()
    const { role_id } = body

    if (!userId || !role_id) {
      return NextResponse.json(
        { error: 'Missing userId or role_id' },
        { status: 400 }
      )
    }

    // Map role_id to role name
    const roleMap: { [key: number]: string } = {
      1: 'ADMIN',
      2: 'STAFF',
      3: 'STUDENT'
    }

    const newRole = roleMap[role_id]
    if (!newRole) {
      return NextResponse.json(
        { error: 'Invalid role_id' },
        { status: 400 }
      )
    }

    // Update user role
    await pool.query(
      'UPDATE USER_ROLES SET role = ? WHERE user_id = ?',
      [newRole, userId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      )
    }

    // Get user role
    const [userRoleRows] = await pool.query(
      'SELECT role FROM USER_ROLES WHERE user_id = ?',
      [userId]
    ) as any

    if (!userRoleRows || userRoleRows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userRole = userRoleRows[0].role

    // Get connection for transaction
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      if (userRole === 'STUDENT') {
        const [studentRows] = await connection.query(
          'SELECT roll_no FROM STUDENT WHERE user_id = ?',
          [userId]
        ) as any

        if (studentRows && studentRows.length > 0) {
          const rollNo = studentRows[0].roll_no

          // Check if student has active or overdue equipment loans
          const [activeLoans] = await connection.query(
            "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE student_id = ? AND status IN ('ISSUED', 'OVERDUE')",
            [rollNo]
          ) as any

          if (activeLoans[0]?.count > 0) {
            await connection.rollback()
            return NextResponse.json(
              { error: 'Cannot delete student: User has active or overdue equipment loans. Please ensure all equipment is returned first.' },
              { status: 400 }
            )
          }

          // Delete returned loans
          await connection.query(
            'DELETE FROM EQUIPMENT_LOAN WHERE student_id = ?',
            [rollNo]
          )

          // Delete gym entries
          await connection.query(
            'DELETE FROM GYM_ENTRY WHERE student_id = ?',
            [rollNo]
          )

          // Delete student record
          await connection.query(
            'DELETE FROM STUDENT WHERE user_id = ?',
            [userId]
          )
        }
      } else if (userRole === 'STAFF') {
        const [staffRows] = await connection.query(
          'SELECT staff_id FROM STAFF WHERE user_id = ?',
          [userId]
        ) as any

        if (staffRows && staffRows.length > 0) {
          const staffId = staffRows[0].staff_id

          // Check if staff has recorded gym entries or issued/returned loans
          const [recordedGym] = await connection.query(
            'SELECT COUNT(*) as count FROM GYM_ENTRY WHERE recorded_by = ?',
            [staffId]
          ) as any

          const [issuedLoans] = await connection.query(
            'SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE issued_by = ? OR returned_by = ?',
            [staffId, staffId]
          ) as any

          if (recordedGym[0]?.count > 0 || issuedLoans[0]?.count > 0) {
            await connection.rollback()
            return NextResponse.json(
              { error: 'Cannot delete staff member: User has recorded gym entries or issued/returned equipment loans. Their profile must be kept for auditing.' },
              { status: 400 }
            )
          }

          // Delete staff record
          await connection.query(
            'DELETE FROM STAFF WHERE user_id = ?',
            [userId]
          )
        }
      } else if (userRole === 'ADMIN') {
        // Prevent deleting last admin
        const [adminCount] = await connection.query(
          "SELECT COUNT(*) as count FROM USER_ROLES WHERE role = 'ADMIN'"
        ) as any

        if (adminCount[0]?.count <= 1) {
          await connection.rollback()
          return NextResponse.json(
            { error: 'Cannot delete the only administrator account.' },
            { status: 400 }
          )
        }

        // Prevent self deletion
        if (userId.toString() === session.user_id.toString()) {
          await connection.rollback()
          return NextResponse.json(
            { error: 'Cannot delete your own administrator account while logged in.' },
            { status: 400 }
          )
        }
      }

      // Delete USER_ACCOUNT (which cascade deletes USER_ROLES)
      await connection.query(
        'DELETE FROM USER_ACCOUNT WHERE user_id = ?',
        [userId]
      )

      await connection.commit()
      return NextResponse.json({ success: true })
    } catch (txError) {
      await connection.rollback()
      throw txError
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

