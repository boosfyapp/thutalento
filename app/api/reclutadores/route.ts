import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const rows = await query(
      'SELECT * FROM reclutadores ORDER BY activo DESC, leads_asignados DESC'
    )
    return NextResponse.json({ data: rows })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { nombre, whatsapp } = await req.json()
  if (!nombre || !whatsapp) {
    return NextResponse.json({ error: 'nombre y whatsapp requeridos' }, { status: 400 })
  }
  try {
    const [row] = await query(
      'INSERT INTO reclutadores (nombre, whatsapp) VALUES ($1, $2) RETURNING *',
      [nombre, whatsapp]
    )
    return NextResponse.json({ data: row }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
