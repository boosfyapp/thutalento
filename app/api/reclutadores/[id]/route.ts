import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { activo, nombre, whatsapp } = body
  try {
    const fields: string[] = []
    const values: unknown[] = []

    if (activo !== undefined) { fields.push(`activo = $${fields.length + 1}`); values.push(activo) }
    if (nombre)  { fields.push(`nombre = $${fields.length + 1}`); values.push(nombre) }
    if (whatsapp){ fields.push(`whatsapp = $${fields.length + 1}`); values.push(whatsapp) }

    values.push(params.id)
    const [row] = await query(
      `UPDATE reclutadores SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    )
    return NextResponse.json({ data: row })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
