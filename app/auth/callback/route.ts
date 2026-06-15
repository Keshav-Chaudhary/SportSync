import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { origin } = new URL(request.url)
    
    // Get current session
    const session = await getSession()

    if (!session) {
      return NextResponse.redirect(`${origin}/auth/login`)
    }

    // Get user role and redirect accordingly
    const [users] = await pool.query(
      `SELECT ur.role_name FROM USER_ACCOUNT ua
       JOIN USER_ROLES ur ON ua.role_id = ur.role_id
       WHERE ua.user_id = ?`,
      [session.user_id]
    ) as any

    if (!users || users.length === 0) {
      return NextResponse.redirect(`${origin}/auth/login`)
    }

    const roleName = users[0].role_name

    if (roleName === 'Admin') {
      return NextResponse.redirect(`${origin}/admin`)
    } else if (roleName === 'Staff') {
      return NextResponse.redirect(`${origin}/staff`)
    } else {
      return NextResponse.redirect(`${origin}/student`)
    }
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/error`)
  }
}
