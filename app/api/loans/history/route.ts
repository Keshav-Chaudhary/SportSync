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

    const [loans] = await pool.query(
      `SELECT el.*, e.name 
       FROM EQUIPMENT_LOAN el
       LEFT JOIN EQUIPMENT e ON e.equipment_id = el.equipment_id
       WHERE el.student_id = ? AND el.status = 'RETURNED'
       ORDER BY el.returned_at DESC`,
      [student.roll_no]
    ) as any

    return NextResponse.json(loans)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}