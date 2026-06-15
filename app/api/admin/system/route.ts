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

    // Get total users
    const [totalUsersResult] = await pool.query(
      'SELECT COUNT(*) as count FROM USER_ACCOUNT'
    ) as any
    const total_users = totalUsersResult[0]?.count || 0

    // Get total students
    const [totalStudentsResult] = await pool.query(
      "SELECT COUNT(*) as count FROM USER_ROLES WHERE role = 'STUDENT'"
    ) as any
    const total_students = totalStudentsResult[0]?.count || 0

    // Get total staff
    const [totalStaffResult] = await pool.query(
      "SELECT COUNT(*) as count FROM USER_ROLES WHERE role = 'STAFF'"
    ) as any
    const total_staff = totalStaffResult[0]?.count || 0

    // Get total admins
    const [totalAdminsResult] = await pool.query(
      "SELECT COUNT(*) as count FROM USER_ROLES WHERE role = 'ADMIN'"
    ) as any
    const total_admins = totalAdminsResult[0]?.count || 0

    let system_health: 'healthy' | 'warning' | 'critical' = 'healthy'

    // No users at all → system unusable
    if (total_users === 0) {
      system_health = 'critical'
    }
    // No admin or no staff → system risky
    else if (total_admins === 0 || total_staff === 0) {
      system_health = 'warning'
    }
    // Otherwise → system is operational
    else {
      system_health = 'healthy'
    }


    return NextResponse.json({
      total_users,
      total_students,
      total_staff,
      total_admins,
      system_health,
    })
  } catch (error) {
    console.error('Error fetching system stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch system statistics' },
      { status: 500 }
    )
  }
}
