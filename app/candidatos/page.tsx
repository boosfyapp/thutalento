'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Candidato {
  id: number
  phone: string
  nombre: string | null
  vacante_aplicada: string | null
  estado: string
  notas_ia: string | null
  reclutador_nombre: string | null
  created_at: string
}

const ESTADOS = ['todos', 'activo', 'asignado', 'descartado']

export default function CandidatosPage() {
  const [data, setData] = useState<Candidato[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('todos')
  const [selected, setSelected] = useState<Candidato | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (estado !== 'todos') params.set('estado', estado)
    const res = await fetch(`/api/candidatos?${params}`)
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
          <p className="text-sm text-slate-500 mt-0.5">{total} registros totales</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-[#161B27] border border-[#1E2A3A] rounded-lg text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
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
              {['Nombre', 'Teléfono', 'Vacante', 'Estado', 'Reclutador', 'Fecha'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-600 text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">Cargando...</td></tr>
            )}
            {!loading && data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">Sin resultados</td></tr>
            )}
            {data.map(c => (
              <tr
                key={c.id}
                onClick={() => setSelected(c)}
                className="border-b border-[#1E2A3A] hover:bg-white/2 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-white font-medium">{c.nombre ?? <span className="text-slate-600 italic">Sin nombre</span>}</td>
                <td className="px-4 py-3 text-slate-400">{c.phone}</td>
                <td className="px-4 py-3 text-slate-400 max-w-[160px] truncate">{c.vacante_aplicada ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={c.estado} /></td>
                <td className="px-4 py-3 text-slate-400">{c.reclutador_nombre ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{format(new Date(c.created_at), 'd MMM yyyy', { locale: es })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-[#161B27] border border-[#1E2A3A] rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-base font-600 text-white">{selected.nombre ?? 'Candidato'}</h3>
              <StatusBadge status={selected.estado} />
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Teléfono" value={selected.phone} />
              <Row label="Vacante" value={selected.vacante_aplicada ?? '—'} />
              <Row label="Reclutador" value={selected.reclutador_nombre ?? 'Sin asignar'} />
              <Row label="Ingreso" value={format(new Date(selected.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })} />
              {selected.notas_ia && (
                <div>
                  <p className="text-slate-500 mb-1">Notas IA</p>
                  <p className="text-slate-300 bg-[#0F1117] rounded-lg p-3 text-xs leading-relaxed">{selected.notas_ia}</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="mt-5 w-full py-2 rounded-lg bg-[#1E2A3A] text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-slate-500 w-24 shrink-0">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
