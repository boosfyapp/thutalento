import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const estado  = searchParams.get('estado')
  const search  = searchParams.get('q')
  const page    = Number(searchParams.get('page') || 1)
  const limit   = 50
  const offset  = (page - 1) * limit

  let sql = `
    SELECT
      c.id, c.phone, c.conversation_id, c.nombre, c.vacante_aplicada, c.estado,
      c.ciudad, c.experiencia_anos, c.area_experiencia, c.nivel_estudios,
      c.disponibilidad, c.expectativa_salarial, c.habilidades, c.idiomas,
      c.tiene_cv, c.cv_url, c.notas_ia,
      COALESCE(c.ficha_completitud, 0) AS ficha_completitud,
      c.created_at, c.updated_at,
      r.nombre AS reclutador_nombre, r.whatsapp AS reclutador_wa
    FROM candidatos c
    LEFT JOIN asignaciones a ON a.candidato_id = c.id
    LEFT JOIN reclutadores r ON r.id = a.reclutador_id
    WHERE 1=1
  `
  const params: unknown[] = []

  if (estado) {
    params.push(estado)
    sql += ` AND c.estado = $${params.length}`
  }
  if (search) {
    params.push(`%${search}%`)
    const idx = params.length
    sql += ` AND (c.nombre ILIKE $${idx} OR c.phone ILIKE $${idx} OR c.vacante_aplicada ILIKE $${idx})`
  }

  sql += ` ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`

  try {
    const rows = await query(sql, params)
    const [{ count }] = await query<{ count: string }>('SELECT COUNT(*) FROM candidatos')
    return NextResponse.json({ data: rows, total: Number(count) })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
