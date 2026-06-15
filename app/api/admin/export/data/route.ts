import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const results = await Promise.all([
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM user_account) as total_users,
          (SELECT COUNT(*) FROM student) as total_students,
          (SELECT COUNT(*) FROM staff) as total_staff,
          (SELECT COUNT(*) FROM equipment) as total_equipment,
          (SELECT COUNT(*) FROM equipment_loan WHERE status = 'ISSUED') as active_loans,
          (SELECT COUNT(*) FROM equipment_loan WHERE status = 'OVERDUE') as overdue_loans,
          (SELECT COUNT(*) FROM gym_entry) as total_gym_entries
      `),
      pool.query('SELECT * FROM user_account ORDER BY created_at DESC'),
      pool.query('SELECT * FROM user_roles ORDER BY id DESC'),
      pool.query(`
        SELECT s.*, u.email as user_email 
        FROM student s 
        LEFT JOIN user_account u ON s.user_id = u.user_id 
        ORDER BY s.created_at DESC
      `),
      pool.query(`
        SELECT s.*, u.email as user_email 
        FROM staff s 
        LEFT JOIN user_account u ON s.user_id = u.user_id 
        ORDER BY s.created_at DESC
      `),
      pool.query('SELECT * FROM equipment_category ORDER BY name'),
      pool.query(`
        SELECT e.*, ec.name as category_name 
        FROM equipment e 
        JOIN equipment_category ec ON e.category_id = ec.category_id 
        ORDER BY e.name
      `),
      pool.query(`
        SELECT 
          el.*,
          e.name as equipment_name,
          ec.name as category_name,
          s.name as student_name,
          st.name as issued_by_staff
        FROM equipment_loan el
        JOIN equipment e ON el.equipment_id = e.equipment_id
        JOIN equipment_category ec ON e.category_id = ec.category_id
        LEFT JOIN student s ON el.student_id = s.roll_no
        LEFT JOIN staff st ON el.issued_by = st.staff_id
        ORDER BY el.created_at DESC
      `),
      pool.query(`
        SELECT 
          ge.*,
          s.name as student_name,
          st.name as recorded_by_staff
        FROM gym_entry ge
        LEFT JOIN student s ON ge.student_id = s.roll_no
        LEFT JOIN staff st ON ge.recorded_by = st.staff_id
        ORDER BY ge.entry_time DESC
      `)
    ])

    const [[summary], userAccounts, userRoles, students, staff, categories, equipment, loans, gymEntries] = results

    return NextResponse.json({
      summary: summary[0],
      userAccounts,
      userRoles,
      students,
      staff,
      categories,
      equipment,
      loans,
      gymEntries,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

