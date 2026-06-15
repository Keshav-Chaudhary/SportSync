import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db/mysql'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    // Count current active gym entries (no exit_time) - public read for occupancy
    const [result] = await pool.execute(
      'SELECT COUNT(*) as occupancy FROM GYM_ENTRY WHERE exit_time IS NULL'
    )

    const occupancy = (result as any[])[0].occupancy || 0

    return NextResponse.json({ occupancy })
  } catch (error) {
    console.error('Gym occupancy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
