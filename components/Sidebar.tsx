'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, UserCheck, GitBranch } from 'lucide-react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidatos', label: 'Candidatos', icon: Users },
  { href: '/reclutadores', label: 'Reclutadores', icon: UserCheck },
  { href: '/asignaciones', label: 'Asignaciones', icon: GitBranch },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0 bg-[#161B27] border-r border-[#1E2A3A] flex flex-col">
      <div className="p-5 border-b border-[#1E2A3A]">
        <p className="text-xs font-medium text-[#0EA5E9] uppercase tracking-widest">Thu</p>
        <h1 className="text-base font-700 text-white mt-0.5 leading-tight">Talento Humano</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                active
                  ? 'bg-[#0369A1]/20 text-[#0EA5E9] border border-[#0369A1]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-[#1E2A3A]">
        <p className="text-xs text-slate-600">Panel v1.0</p>
      </div>
    </aside>
  )
}
