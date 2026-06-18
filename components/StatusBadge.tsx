const config: Record<string, { label: string; color: string }> = {
  activo:     { label: 'Activo',     color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  asignado:   { label: 'Asignado',   color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  descartado: { label: 'Descartado', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
  pendiente:  { label: 'Pendiente',  color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  contactado: { label: 'Contactado', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
}

export default function StatusBadge({ status }: { status: string }) {
  const cfg = config[status] ?? { label: status, color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}
