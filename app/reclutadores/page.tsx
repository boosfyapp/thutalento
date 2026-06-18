'use client'
import { useEffect, useState } from 'react'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'

interface Reclutador {
  id: number
  nombre: string
  whatsapp: string
  activo: boolean
  leads_asignados: number
}

export default function ReclutadoresPage() {
  const [data, setData] = useState<Reclutador[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/reclutadores')
    const json = await res.json()
    setData(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggle = async (r: Reclutador) => {
    await fetch(`/api/reclutadores/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !r.activo }),
    })
    load()
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/reclutadores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, whatsapp }),
    })
    setNombre('')
    setWhatsapp('')
    setShowForm(false)
    setSaving(false)
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-600 text-white">Reclutadores</h2>
          <p className="text-sm text-slate-500 mt-0.5">Equipo activo para distribución de leads</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0369A1] hover:bg-[#0284C7] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Agregar
        </button>
      </div>

      {showForm && (
        <form onSubmit={add} className="bg-[#161B27] border border-[#0369A1]/40 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-600 text-white">Nuevo reclutador</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre completo"
              className="px-3 py-2.5 bg-[#0F1117] border border-[#1E2A3A] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0369A1]"
            />
            <input
              required
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="WhatsApp (52xxxxxxxxxx)"
              className="px-3 py-2.5 bg-[#0F1117] border border-[#1E2A3A] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0369A1]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-[#1E2A3A] text-slate-400 hover:text-white rounded-lg text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#161B27] border border-[#1E2A3A] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1E2A3A]">
              {['Nombre', 'WhatsApp', 'Leads asignados', 'Estado', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-600 text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Cargando...</td></tr>}
            {!loading && data.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Sin reclutadores aún.</td></tr>}
            {data.map(r => (
              <tr key={r.id} className="border-b border-[#1E2A3A] last:border-0">
                <td className="px-4 py-3 text-white font-medium">{r.nombre}</td>
                <td className="px-4 py-3 text-slate-400">{r.whatsapp}</td>
                <td className="px-4 py-3">
                  <span className="text-2xl font-700 text-white">{r.leads_asignados}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${r.activo ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-slate-500/15 text-slate-400 border-slate-500/20'}`}>
                    {r.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(r)} className="text-slate-400 hover:text-white transition-colors cursor-pointer" title={r.activo ? 'Desactivar' : 'Activar'}>
                    {r.activo ? <ToggleRight size={20} className="text-[#22C55E]" /> : <ToggleLeft size={20} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
