import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const [total] = await query<{ count: string }>('SELECT COUNT(*) FROM candidatos')
    const [hoy] = await query<{ count: string }>(
      "SELECT COUNT(*) FROM asignaciones WHERE DATE(fecha_asignacion) = CURRENT_DATE"
    )
    const [activos] = await query<{ count: string }>(
      "SELECT COUNT(*) FROM reclutadores WHERE activo = true"
    )
    const [asignados] = await query<{ count: string }>(
      "SELECT COUNT(*) FROM candidatos WHERE estado = 'asignado'"
    )

    const porReclutador = await query<{ nombre: string; leads_asignados: number }>(
      'SELECT nombre, leads_asignados FROM reclutadores WHERE activo = true ORDER BY leads_asignados DESC'
    )

    return NextResponse.json({
      totalCandidatos: Number(total.count),
      asignadosHoy: Number(hoy.count),
      reclutadoresActivos: Number(activos.count),
      totalAsignados: Number(asignados.count),
      porReclutador,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
