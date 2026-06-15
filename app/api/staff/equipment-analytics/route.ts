import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db/mysql'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    // 🔐 AUTH CHECK
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 📅 Common Dates
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // =========================================================
    // 1️⃣ TOP BORROWED EQUIPMENT (Last 30 Days)
    // =========================================================
    const [topEquipmentResult] = await pool.execute(
      `SELECT 
        e.name as equipment,
        ec.name as category,
        COUNT(*) as borrow_count
      FROM EQUIPMENT_LOAN el
      JOIN EQUIPMENT e ON el.equipment_id = e.equipment_id
      JOIN equipment_category ec ON e.category_id = ec.category_id
      WHERE el.issued_at >= ?
      GROUP BY e.equipment_id, e.name, ec.name
      ORDER BY borrow_count DESC
      LIMIT 8`,
      [thirtyDaysAgo]
    ) as any

    const topEquipment = topEquipmentResult || []

    // =========================================================
    // 2️⃣ DAILY LOAN TREND (Last 30 Days) — FIXED
    // =========================================================
    const [dailyTrendResult] = await pool.execute(
      `SELECT 
        DATE(el.issued_at) as day,
        COUNT(*) as loans
      FROM EQUIPMENT_LOAN el
      WHERE el.issued_at >= ?
        AND el.status IN ('ISSUED', 'RETURNED')
      GROUP BY DATE(el.issued_at)
      ORDER BY DATE(el.issued_at) ASC`,
      [thirtyDaysAgo]
    ) as any

    const trendData = (dailyTrendResult || []).map((row: any) => ({
      day: new Date(row.day).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }).replace('/', '-'),
      loans: row.loans
    }))

    // =========================================================
    // 3️⃣ OVERDUE BY CATEGORY
    // =========================================================
    const [overdueResult] = await pool.execute(
      `SELECT 
        ec.name as category,
        COUNT(*) as overdue_count
      FROM EQUIPMENT_LOAN el
      JOIN EQUIPMENT e ON el.equipment_id = e.equipment_id
      JOIN equipment_category ec ON e.category_id = ec.category_id
      WHERE el.status = 'OVERDUE'
      GROUP BY ec.category_id, ec.name
      ORDER BY overdue_count DESC`
    ) as any

    const overdueByCategory = overdueResult || []

    // =========================================================
    // 4️⃣ MONTHLY GYM USERS (Last 6 Months)
    // =========================================================
    const [monthlyGymUsersResult] = await pool.execute(
      `SELECT 
        YEAR(entry_time) as year,
        MONTH(entry_time) as month_num,
        COUNT(DISTINCT student_id) as users
      FROM gym_entry
      WHERE entry_time >= ?
      GROUP BY YEAR(entry_time), MONTH(entry_time)
      ORDER BY YEAR(entry_time), MONTH(entry_time)`,
      [sixMonthsAgo]
    ) as any

    const monthlyGymUsers = (monthlyGymUsersResult || []).map((row: any) => ({
      month: new Date(row.year, row.month_num - 1).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      users: row.users,
    }))

    // =========================================================
    // ✅ FINAL RESPONSE
    // =========================================================
    return NextResponse.json({
      topEquipment,
      trend: trendData,
      overdueByCategory,
      monthlyGymUsers
    })

  } catch (error: any) {
    console.error('Equipment analytics error:', error)

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}