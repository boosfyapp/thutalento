'use client'
import { useEffect, useState } from 'react'
import { Users, UserCheck, TrendingUp, Calendar } from 'lucide-react'
import MetricCard from '@/components/MetricCard'

interface Stats {
  totalCandidatos: number
  asignadosHoy: number
  reclutadoresActivos: number
  totalAsignados: number
  porReclutador: { nombre: string; leads_asignados: number }[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }, [])

  const maxLeads = stats?.porReclutador?.[0]?.leads_asignados || 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-600 text-white">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Candidatos totales" value={stats?.totalCandidatos ?? '—'} icon={Users} color="#0EA5E9" />
        <MetricCard label="Asignados hoy" value={stats?.asignadosHoy ?? '—'} icon={Calendar} color="#22C55E" />
        <MetricCard label="Reclutadores activos" value={stats?.reclutadoresActivos ?? '—'} icon={UserCheck} color="#A78BFA" />
        <MetricCard label="Total asignados" value={stats?.totalAsignados ?? '—'} icon={TrendingUp} color="#F59E0B" />
      </div>

      <div className="bg-[#161B27] border border-[#1E2A3A] rounded-xl p-5">
        <h3 className="text-sm font-600 text-white mb-4">Leads por reclutador</h3>
        {!stats && <p className="text-sm text-slate-500">Cargando...</p>}
        <div className="space-y-3">
          {stats?.porReclutador.map(r => (
            <div key={r.nombre} className="flex items-center gap-3">
              <div className="w-28 text-xs text-slate-400 truncate shrink-0">{r.nombre}</div>
              <div className="flex-1 bg-[#1E2A3A] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#0369A1] rounded-full transition-all duration-500"
                  style={{ width: `${(r.leads_asignados / maxLeads) * 100}%` }}
                />
              </div>
              <div className="w-8 text-right text-xs font-600 text-white shrink-0">{r.leads_asignados}</div>
            </div>
          ))}
          {stats?.porReclutador.length === 0 && (
            <p className="text-sm text-slate-500">No hay reclutadores aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}
