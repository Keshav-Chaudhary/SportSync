import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const [userRole] = await pool.query(
      'SELECT role FROM USER_ROLES WHERE user_id = ?',
      [session.user_id]
    ) as any

    if (!userRole || userRole.length === 0 || userRole[0].role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Only staff members can view gym entries' },
        { status: 403 }
      )
    }

    // Get staff_id
    const [staffResult] = await pool.query(
      'SELECT staff_id FROM STAFF WHERE user_id = ?',
      [session.user_id]
    ) as any
    const staffId = staffResult?.[0]?.staff_id

    // Get all gym entries (today's and ongoing) OR entries recorded by this staff member
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [result] = await pool.query(
      `SELECT ge.entry_id, ge.student_id, ge.entry_time, ge.exit_time, s.name as student_name
       FROM GYM_ENTRY ge
       LEFT JOIN STUDENT s ON ge.student_id = s.roll_no
       WHERE ge.entry_time >= ? OR ge.recorded_by = ?
       ORDER BY ge.entry_time DESC
       LIMIT 200`,
      [today, staffId]
    ) as any

    return NextResponse.json(
      result?.map((entry: any) => ({
        entry_id: entry.entry_id,
        student_id: entry.student_id,
        entry_time: entry.entry_time,
        exit_time: entry.exit_time,
        student: { name: entry.student_name || 'Unknown', roll_no: entry.student_id },
      })) || []
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
