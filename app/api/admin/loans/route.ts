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

    // Get loan statistics
    const [activeLoansResult] = await pool.query(
      "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status IN ('ISSUED', 'OVERDUE')"
    ) as any
    const total_active = activeLoansResult[0]?.count || 0

    const [overdueLoansResult] = await pool.query(
      "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status = 'OVERDUE'"
    ) as any
    const total_overdue = overdueLoansResult[0]?.count || 0

    const [returnedLoansResult] = await pool.query(
      "SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status = 'RETURNED'"
    ) as any
    const total_returned = returnedLoansResult[0]?.count || 0

    // Calculate average loan duration in days
    const [avgDurationResult] = await pool.query(`
      SELECT AVG(DATEDIFF(
        COALESCE(returned_at, NOW()),
        issued_at
      )) as avg_days FROM EQUIPMENT_LOAN
    `) as any
    const avg_loan_duration = Math.round(avgDurationResult[0]?.avg_days || 0)

    return NextResponse.json({
      total_active,
      total_overdue,
      total_returned,
      avg_loan_duration,
    })
  } catch (error) {
    console.error('Error fetching loan stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loan statistics' },
      { status: 500 }
    )
  }
}
