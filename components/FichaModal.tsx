'use client'
import { X, User, Briefcase, MapPin, GraduationCap, Clock, DollarSign, Wrench, Languages, FileText, CheckCircle, Circle } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface Candidato {
  id: number
  phone: string
  conversation_id: string
  nombre: string | null
  vacante_aplicada: string | null
  estado: string
  ciudad: string | null
  experiencia_anos: number | null
  area_experiencia: string | null
  nivel_estudios: string | null
  disponibilidad: string | null
  expectativa_salarial: string | null
  habilidades: string | null
  idiomas: string | null
  tiene_cv: boolean | null
  cv_url: string | null
  notas_ia: string | null
  ficha_completitud: number
  reclutador_nombre: string | null
  created_at: string
  updated_at: string
}

interface Props {
  candidato: Candidato
  onClose: () => void
}

const FICHA_FIELDS = [
  { key: 'nombre',              label: 'Nombre',            icon: User },
  { key: 'vacante_aplicada',    label: 'Vacante',           icon: Briefcase },
  { key: 'ciudad',              label: 'Ciudad',            icon: MapPin },
  { key: 'area_experiencia',    label: 'Área',              icon: Briefcase },
  { key: 'experiencia_anos',    label: 'Experiencia',       icon: Clock, format: (v: number) => `${v} año${v !== 1 ? 's' : ''}` },
  { key: 'nivel_estudios',      label: 'Estudios',          icon: GraduationCap },
  { key: 'disponibilidad',      label: 'Disponibilidad',    icon: Clock },
  { key: 'expectativa_salarial',label: 'Expectativa salarial', icon: DollarSign },
  { key: 'habilidades',         label: 'Habilidades',       icon: Wrench },
  { key: 'idiomas',             label: 'Idiomas',           icon: Languages },
  { key: 'tiene_cv',            label: 'Tiene CV',          icon: FileText, format: (v: boolean) => v ? 'Sí' : 'No' },
] as const

function completitudColor(pct: number) {
  if (pct >= 80) return '#22C55E'
  if (pct >= 50) return '#F59E0B'
  return '#EF4444'
}

export default function FichaModal({ candidato: c, onClose }: Props) {
  const pct = c.ficha_completitud ?? 0
  const color = completitudColor(pct)

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#161B27] border border-[#1E2A3A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#161B27] border-b border-[#1E2A3A] p-5 flex items-start justify-between gap-4 rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-600 text-white truncate">
                {c.nombre ?? 'Sin nombre aún'}
              </h3>
              <StatusBadge status={c.estado} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{c.phone}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Completitud de ficha */}
          <div className="bg-[#0F1117] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-600 text-slate-400 uppercase tracking-wide">Ficha completada</span>
              <span className="text-sm font-700" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-2 bg-[#1E2A3A] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {pct < 30 && 'La IA aún está recopilando información del candidato.'}
              {pct >= 30 && pct < 70 && 'Perfil en progreso — continúa la conversación para completarlo.'}
              {pct >= 70 && pct < 100 && 'Perfil casi completo. Listo para evaluación.'}
              {pct === 100 && 'Perfil completo.'}
            </p>
          </div>

          {/* Campos de ficha */}
          <div className="space-y-2">
            <h4 className="text-xs font-600 text-slate-500 uppercase tracking-wide">Datos del candidato</h4>
            <div className="grid grid-cols-1 gap-2">
              {FICHA_FIELDS.map(({ key, label, icon: Icon, format: fmt }) => {
                const raw = c[key as keyof Candidato]
                const filled = raw !== null && raw !== undefined
                const display = filled
                  ? (fmt ? (fmt as (v: unknown) => string)(raw) : String(raw))
                  : null
                return (
                  <div
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      filled
                        ? 'bg-[#0F1117] border-[#1E2A3A]'
                        : 'bg-transparent border-dashed border-[#1E2A3A]/50'
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${filled ? 'text-[#0EA5E9]' : 'text-slate-700'}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">{label}</p>
                      {filled
                        ? <p className="text-sm text-white mt-0.5 break-words">{display}</p>
                        : <p className="text-xs text-slate-700 italic mt-0.5">Pendiente</p>
                      }
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {filled
                        ? <CheckCircle size={12} className="text-[#22C55E]" />
                        : <Circle size={12} className="text-slate-700" />
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CV URL si existe */}
          {c.cv_url && (
            <a
              href={c.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-[#0369A1]/10 border border-[#0369A1]/20 rounded-lg text-sm text-[#0EA5E9] hover:bg-[#0369A1]/20 transition-colors cursor-pointer"
            >
              <FileText size={14} />
              Ver CV / Portafolio
            </a>
          )}

          {/* Notas IA */}
          {c.notas_ia && (
            <div>
              <h4 className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Resumen IA</h4>
              <div className="bg-[#0F1117] rounded-lg p-3 text-xs text-slate-400 leading-relaxed max-h-32 overflow-y-auto">
                {c.notas_ia}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="border-t border-[#1E2A3A] pt-4 flex items-center justify-between text-xs text-slate-600">
            <span>Reclutador: {c.reclutador_nombre ?? 'Sin asignar'}</span>
            <span>Ingresó {format(new Date(c.created_at), "d MMM yyyy", { locale: es })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
