import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Get student by user_id
    const [studentResult] = await pool.query(
      'SELECT roll_no FROM STUDENT WHERE user_id = ?',
      [userId]
    ) as any

    if (!studentResult || studentResult.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const studentId = studentResult[0].roll_no

    const [result] = await pool.query(
      `SELECT * FROM GYM_ENTRY
       WHERE student_id = ? AND exit_time IS NULL
       ORDER BY entry_time DESC LIMIT 1`,
      [studentId]
    ) as any

    if (result && result.length > 0) {
      return NextResponse.json(result[0])
    }

    return NextResponse.json(null)

  } catch (error: any) {

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )

  }
}


export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify that the user is STAFF (server-side)
    if (session.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Only staff members can record gym entries' },
        { status: 403 }
      )
    }

    // Get staff_id
    const [staffData] = await pool.query(
      'SELECT staff_id FROM STAFF WHERE user_id = ?',
      [session.user_id]
    ) as any

    if (!staffData || staffData.length === 0) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const staffId = staffData[0].staff_id

    // Get body with student_id
    const body = await req.json()
    const { student_id } = body

    if (!student_id) {
      return NextResponse.json({ error: 'student_id required' }, { status: 400 })
    }

    const [result] = await pool.query(
      `INSERT INTO GYM_ENTRY (student_id, recorded_by, entry_time)
       VALUES (?, ?, NOW())`,
      [student_id, staffId]
    ) as any

    return NextResponse.json({ success: true, entryId: result.insertId })

  } catch (error: any) {
    let message = error?.message || 'An unexpected error occurred'
    
    if (typeof message === 'string' && message.includes('foreign key constraint fails')) {
      message = 'Invalid student roll number. Student not found.'
    }
    
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}

