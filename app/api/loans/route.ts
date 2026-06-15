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
  const all = searchParams.get('all') === 'true'
  const userId = searchParams.get('userId')

  // If staff requested all loans
  if (all) {
    if (!['STAFF', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Only staff can view all loans' }, { status: 403 })
    }

  const [result] = await pool.query(
    `SELECT el.*, e.name, s.name as student_name
     FROM EQUIPMENT_LOAN el
     JOIN EQUIPMENT e ON el.equipment_id = e.equipment_id
     JOIN STUDENT s ON el.student_id = s.roll_no
     ORDER BY GREATEST(el.issued_at, COALESCE(el.returned_at, el.issued_at)) DESC
     LIMIT 200`
  ) as any

      return NextResponse.json(
        result?.map((loan: any) => ({
          ...loan,
          equipment: { name: loan.name },
          student: { name: loan.student_name },
        })) || []
      )
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    console.log('API: Fetching loans for userId:', userId)

    // Get student by user_id
    const [studentResult] = await pool.query(
      'SELECT roll_no FROM STUDENT WHERE user_id = ?',
      [userId]
    ) as any

    console.log('API: Student result:', studentResult)

    if (!studentResult || studentResult.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const studentId = studentResult[0].roll_no
    console.log('API: Student roll_no:', studentId)

    const [result] = await pool.query(
      `SELECT el.*, e.name FROM EQUIPMENT_LOAN el
       JOIN EQUIPMENT e ON el.equipment_id = e.equipment_id
       WHERE el.student_id = ? AND el.status IN ('ISSUED', 'OVERDUE')
       ORDER BY el.issued_at DESC`,
      [studentId]
    ) as any

    console.log('API: Loans result:', result)
    console.log('API: Result type:', typeof result, 'Is array:', Array.isArray(result))

    const loansArray = Array.isArray(result) ? result : []
    console.log('API: Final loans to return:', loansArray)

    return NextResponse.json(loansArray)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  let connection: any

  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    if (session.role !== 'STAFF') {
      return NextResponse.json({ error: 'Only staff can issue equipment' }, { status: 403 })
    }

    const body = await req.json()
    const { equipment_id, student_id, quantity, due_date } = body

    if (!equipment_id || !student_id || !quantity || !due_date) {
      return NextResponse.json(
        { error: 'equipment_id, student_id, quantity, and due_date required' },
        { status: 400 }
      )
    }

    // Validate quantity
    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    // Get staff_id from user_id
    const [staffResult] = await pool.query(
      'SELECT staff_id FROM STAFF WHERE user_id = ?',
      [session.user_id]
    ) as any

    if (!staffResult || staffResult.length === 0) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    const staffId = staffResult[0].staff_id

    // Use a transaction to prevent race conditions when issuing equipment
    connection = await pool.getConnection()
    await connection.beginTransaction()

    const [equipmentResult] = await connection.query(
      'SELECT available_quantity FROM EQUIPMENT WHERE equipment_id = ? FOR UPDATE',
      [equipment_id]
    ) as any

    if (!equipmentResult || equipmentResult.length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    if (equipmentResult[0].available_quantity < quantity) {
      await connection.rollback()
      return NextResponse.json({ error: 'Insufficient equipment available' }, { status: 400 })
    }

    // Create loan (trigger will update available_quantity)
    const [result] = await connection.query(
      `INSERT INTO EQUIPMENT_LOAN (equipment_id, student_id, quantity, issued_by, issued_at, due_date, status, created_at)
       VALUES (?, ?, ?, ?, NOW(), ?, 'ISSUED', NOW())`,
      [equipment_id, student_id, quantity, staffId, due_date]
    ) as any

    await connection.commit()

    return NextResponse.json({ success: true, loanId: result.insertId })
  } catch (error: any) {
    if (connection) {
      try {
        await connection.rollback()
      } catch {
        // ignore rollback errors
      }
    }


    const message =
      typeof error?.message === 'string' &&
      error.message.includes('CHECK constraint')
        ? 'Insufficient equipment available'
        : error.message.includes('foreign key constraint fails')
        ? 'Invalid student roll number. Student not found.'
        : error?.message || 'An unexpected error occurred'

    return NextResponse.json(
      { error: message },
      { status: 400 }
    )

  } finally {
    if (connection) connection.release()
  }
}
