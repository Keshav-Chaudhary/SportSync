import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required for system stats' }, { status: 403 })
    }

    // Get system statistics
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM USER_ACCOUNT') as any
    const [activeLoans] = await pool.query("SELECT COUNT(*) as count FROM EQUIPMENT_LOAN WHERE status = 'ISSUED'") as any
    const [totalEquipment] = await pool.query('SELECT SUM(total_quantity) as count FROM EQUIPMENT') as any
    const [gymEntries] = await pool.query(
      `SELECT COUNT(*) as count FROM GYM_ENTRY WHERE DATE(entry_time) = CURDATE()`
    ) as any

    return NextResponse.json({
      totalUsers: totalUsers[0]?.count || 0,
      activeLoans: activeLoans[0]?.count || 0,
      totalEquipment: totalEquipment[0]?.count || 0,
      todayGymEntries: gymEntries[0]?.count || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
