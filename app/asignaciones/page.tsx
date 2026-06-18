'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import StatusBadge from '@/components/StatusBadge'

interface Asignacion {
  id: number
  candidato_nombre: string | null
  phone: string
  vacante_aplicada: string | null
  reclutador_nombre: string
  reclutador_wa: string
  estado: string
  fecha_asignacion: string
}

export default function AsignacionesPage() {
  const [data, setData] = useState<Asignacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/asignaciones').then(r => r.json()).then(j => {
      setData(j.data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-600 text-white">Asignaciones</h2>
        <p className="text-sm text-slate-500 mt-0.5">Historial de distribución de leads</p>
      </div>

      <div className="bg-[#161B27] border border-[#1E2A3A] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1E2A3A]">
              {['Candidato', 'Teléfono', 'Vacante', 'Reclutador', 'Estado', 'Fecha'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-600 text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Cargando...</td></tr>}
            {!loading && data.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Sin asignaciones aún.</td></tr>}
            {data.map(a => (
              <tr key={a.id} className="border-b border-[#1E2A3A] last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{a.candidato_nombre ?? <span className="text-slate-600 italic">Sin nombre</span>}</td>
                <td className="px-4 py-3 text-slate-400">{a.phone}</td>
                <td className="px-4 py-3 text-slate-400 max-w-[140px] truncate">{a.vacante_aplicada ?? '—'}</td>
                <td className="px-4 py-3 text-slate-300">{a.reclutador_nombre}</td>
                <td className="px-4 py-3"><StatusBadge status={a.estado} /></td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {format(new Date(a.fecha_asignacion), "d MMM 'a las' HH:mm", { locale: es })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
