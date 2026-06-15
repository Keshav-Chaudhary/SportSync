import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db/mysql'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const [studentResult] = await pool.query(
      'SELECT roll_no FROM STUDENT WHERE user_id = ?',
      [userId]
    ) as any

    const student = studentResult?.[0]
    if (!student) {
      return NextResponse.json([])
    }

    const [entries] = await pool.query(
      `SELECT * FROM GYM_ENTRY
       WHERE student_id = ?
       ORDER BY entry_time DESC`,
      [student.roll_no]
    ) as any

    return NextResponse.json(entries)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}