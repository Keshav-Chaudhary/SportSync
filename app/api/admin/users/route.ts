import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get all users with their roles
    const [users] = await pool.query(`
      SELECT 
        ua.user_id,
        COALESCE(s.name, st.name, ua.email) as username,
        ua.email,
        ua.created_at,
        CASE 
          WHEN ur.role = 'ADMIN' THEN 1
          WHEN ur.role = 'STAFF' THEN 2
          WHEN ur.role = 'STUDENT' THEN 3
          ELSE 3
        END as role_id,
        ur.role as user_type,
        s.roll_no,
        st.staff_id,
        ur.role as role_name
      FROM USER_ACCOUNT ua
      LEFT JOIN USER_ROLES ur ON ua.user_id = ur.user_id
      LEFT JOIN STUDENT s ON ua.user_id = s.user_id
      LEFT JOIN STAFF st ON ua.user_id = st.user_id
      ORDER BY ua.created_at DESC
    `) as any

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
