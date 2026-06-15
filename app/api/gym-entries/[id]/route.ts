import { getSession } from '@/lib/auth/session'
import { pool } from '@/lib/db/mysql'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const entryId = id

    await pool.query(
      `UPDATE GYM_ENTRY SET exit_time = NOW()
       WHERE entry_id = ?`,
      [entryId]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const entryId = parseInt(id)
    if (isNaN(entryId)) {
      return NextResponse.json({ error: 'Invalid gym entry ID' }, { status: 400 })
    }

    await pool.query(
      'DELETE FROM GYM_ENTRY WHERE entry_id = ?',
      [entryId]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting gym entry:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

