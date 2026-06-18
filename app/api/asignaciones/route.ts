import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const rows = await query(`
      SELECT a.*,
        c.nombre AS candidato_nombre, c.phone, c.vacante_aplicada,
        r.nombre AS reclutador_nombre, r.whatsapp AS reclutador_wa
      FROM asignaciones a
      JOIN candidatos c ON c.id = a.candidato_id
      JOIN reclutadores r ON r.id = a.reclutador_id
      ORDER BY a.fecha_asignacion DESC
      LIMIT 100
    `)
    return NextResponse.json({ data: rows })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
