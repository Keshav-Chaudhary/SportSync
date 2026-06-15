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

    // Get equipment by category with availability
    const [equipment] = await pool.query(`
      SELECT 
        ec.category_id,
        ec.name as category_name,
        COUNT(e.equipment_id) as total_items,
        SUM(e.total_quantity) as total_quantity,
        SUM(e.available_quantity) as available_quantity
      FROM EQUIPMENT_CATEGORY ec
      LEFT JOIN EQUIPMENT e ON ec.category_id = e.category_id
      GROUP BY ec.category_id, ec.name
      ORDER BY ec.name
    `) as any

    const categories = equipment.map((item: any) => ({
      category_id: item.category_id,
      category_name: item.category_name,
      total_items: item.total_items || 0,
      total_quantity: item.total_quantity || 0,
      available_quantity: item.available_quantity || 0,
      utilization_percent: item.total_quantity > 0 
        ? Math.round(((item.total_quantity - item.available_quantity) / item.total_quantity) * 100)
        : 0,
    }))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching equipment stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment statistics' },
      { status: 500 }
    )
  }
}
