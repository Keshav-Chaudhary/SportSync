import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with their roles
    const [result] = await pool.query(
      `SELECT ua.user_id, ua.email, ua.created_at, ur.role_name,
              COALESCE(s.first_name, st.first_name) as first_name,
              COALESCE(s.last_name, st.last_name) as last_name
       FROM USER_ACCOUNT ua
       JOIN USER_ROLES ur ON ua.role_id = ur.role_id
       LEFT JOIN STUDENTS s ON ua.user_id = s.user_id
       LEFT JOIN STAFF st ON ua.user_id = st.user_id
       ORDER BY ua.created_at DESC`
    ) as any

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
