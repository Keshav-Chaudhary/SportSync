import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Get user role
    const [userRows] = await pool.query(
      `SELECT u.user_id, r.role 
       FROM USER_ACCOUNT u
       JOIN USER_ROLES r ON u.user_id = r.user_id
       WHERE u.user_id = ?`,
      [userId]
    ) as any

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const role = userRows[0].role
    let userDetails: any = null

    // Fetch details based on role
    if (role === 'STUDENT') {
      const [studentRows] = await pool.query(
        `SELECT s.roll_no, s.name, s.email, s.phone, s.is_hosteler, s.hostel_name, s.room_no, s.created_at
         FROM STUDENT s WHERE s.user_id = ?`,
        [userId]
      ) as any
      if (studentRows && studentRows.length > 0) {
        userDetails = { ...studentRows[0], role }
      }
    } else if (role === 'STAFF') {
      const [staffRows] = await pool.query(
        `SELECT s.staff_id, s.name, s.email, s.phone, s.created_at
         FROM STAFF s WHERE s.user_id = ?`,
        [userId]
      ) as any
      if (staffRows && staffRows.length > 0) {
        userDetails = { ...staffRows[0], role }
      }
    } else if (role === 'ADMIN') {
      const [adminRows] = await pool.query(
        `SELECT u.user_id, u.email, u.created_at, 'System Administrator' as name
         FROM USER_ACCOUNT u WHERE u.user_id = ?`,
        [userId]
      ) as any
      if (adminRows && adminRows.length > 0) {
        userDetails = { ...adminRows[0], role }
      }
    }

    if (!userDetails) {
      // Fallback details if tables STUDENT/STAFF don't have matching record yet
      const [accountRows] = await pool.query(
        `SELECT user_id, email, created_at, email as name FROM USER_ACCOUNT WHERE user_id = ?`,
        [userId]
      ) as any
      if (accountRows && accountRows.length > 0) {
        userDetails = { ...accountRows[0], role }
      } else {
        return NextResponse.json({ error: 'User details not found' }, { status: 404 })
      }
    }

    if (role === 'STAFF') {
      const staffId = userDetails.staff_id

      const [gymEntries] = await pool.query(
        `SELECT g.entry_id, g.entry_time, g.exit_time, s.name as student_name, s.roll_no as student_roll
         FROM GYM_ENTRY g
         JOIN STUDENT s ON g.student_id = s.roll_no
         WHERE g.recorded_by = ?
         ORDER BY g.entry_time DESC
         LIMIT 20`,
        [staffId]
      ) as any

      const [loans] = await pool.query(
        `SELECT el.loan_id, e.name as equipment_name, el.quantity, el.status, el.issued_at, el.returned_at, s.name as student_name
         FROM EQUIPMENT_LOAN el
         JOIN EQUIPMENT e ON el.equipment_id = e.equipment_id
         JOIN STUDENT s ON el.student_id = s.roll_no
         WHERE el.issued_by = ? OR el.returned_by = ?
         ORDER BY el.issued_at DESC
         LIMIT 20`,
        [staffId, staffId]
      ) as any

      return NextResponse.json({ user_details: userDetails, gym_entries: gymEntries, equipment_loans: loans })

    } else if (role === 'STUDENT') {
      const rollNo = userDetails.roll_no

      const [gymEntries] = await pool.query(
        `SELECT entry_id, entry_time, exit_time
         FROM GYM_ENTRY
         WHERE student_id = ?
         ORDER BY entry_time DESC
         LIMIT 20`,
        [rollNo]
      ) as any

      const [loans] = await pool.query(
        `SELECT el.loan_id, e.name as equipment_name, el.quantity, el.status, el.issued_at, el.returned_at
         FROM EQUIPMENT_LOAN el
         JOIN EQUIPMENT e ON el.equipment_id = e.equipment_id
         WHERE el.student_id = ?
         ORDER BY el.issued_at DESC
         LIMIT 20`,
        [rollNo]
      ) as any

      return NextResponse.json({ user_details: userDetails, gym_entries: gymEntries, equipment_loans: loans })
    }

    // Admins don't have this history unless they are also staff/student
    return NextResponse.json({ user_details: userDetails, gym_entries: [], equipment_loans: [] })

  } catch (error: any) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
