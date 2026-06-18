'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import FichaModal, { Candidato } from '@/components/FichaModal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADOS = ['todos', 'activo', 'asignado', 'descartado']

function CompletitudBadge({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-[#1E2A3A] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{pct}%</span>
    </div>
  )
}

export default function CandidatosPage() {
  const [data, setData]       = useState<Candidato[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [estado, setEstado]   = useState('todos')
  const [selected, setSelected] = useState<Candidato | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (estado !== 'todos') params.set('estado', estado)
    const res  = await fetch(`/api/candidatos?${params}`)
    const json = await res.json()
    setData(json.data || [])
    setTotal(json.total || 0)
    setLoading(false)
  }, [search, estado])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-600 text-white">Candidatos</h2>
          <p className="text-sm text-slate-500 mt-0.5">{total} registros — haz clic en cualquiera para ver su ficha completa</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-[#161B27] border border-[#1E2A3A] rounded-lg text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nombre, teléfono o vacante..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#161B27] border border-[#1E2A3A] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0369A1] transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-[#161B27] border border-[#1E2A3A] rounded-lg p-1">
          {ESTADOS.map(e => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${estado === e ? 'bg-[#0369A1] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#161B27] border border-[#1E2A3A] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1E2A3A]">
              {['Nombre', 'Teléfono', 'Vacante', 'Ficha', 'Estado', 'Reclutador', 'Ingreso'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-600 text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Cargando...</td></tr>
            )}
            {!loading && data.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Sin resultados</td></tr>
            )}
            {data.map(c => (
              <tr
                key={c.id}
                onClick={() => setSelected(c)}
                className="border-b border-[#1E2A3A] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-white font-medium">
                  {c.nombre ?? <span className="text-slate-600 italic text-xs">Sin nombre</span>}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{c.phone}</td>
                <td className="px-4 py-3 text-slate-400 max-w-[140px] truncate text-xs">
                  {c.vacante_aplicada ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <CompletitudBadge pct={c.ficha_completitud ?? 0} />
                </td>
                <td className="px-4 py-3"><StatusBadge status={c.estado} /></td>
                <td className="px-4 py-3 text-slate-400 text-xs">{c.reclutador_nombre ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {format(new Date(c.created_at), 'd MMM', { locale: es })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <FichaModal candidato={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
