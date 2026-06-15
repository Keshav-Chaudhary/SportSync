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
      'SELECT category_id, name as category_name FROM EQUIPMENT_CATEGORY ORDER BY name'
    ) as any

    return NextResponse.json(result || [])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
