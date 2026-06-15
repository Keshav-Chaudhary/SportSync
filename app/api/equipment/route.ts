import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [result] = await pool.query(
      `SELECT e.equipment_id, e.name, e.category_id, e.total_quantity, e.available_quantity,
              ec.name as category_name
       FROM EQUIPMENT e
       LEFT JOIN EQUIPMENT_CATEGORY ec ON e.category_id = ec.category_id
       ORDER BY ec.name, e.name`
    ) as any

    const formatted = result?.map((item: any) => ({
      equipment_id: item.equipment_id,
      name: item.name,
      category_id: item.category_id,
      category_name: item.category_name || 'Uncategorized',
      total_quantity: item.total_quantity,
      available_quantity: item.available_quantity,
    })) || []

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error('Equipment fetch error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
