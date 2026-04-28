'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Music2,
  Users,
  Upload,
  Lightbulb,
  UserCog,
  School,
  ChevronDown,
  LogOut,
  User,
  Menu,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/escola/dashboard', icon: LayoutDashboard },
  { label: 'Coreografias', href: '/escola/coreografias', icon: Music2 },
  { label: 'Bailarinos & Elenco', href: '/escola/bailarinos', icon: Users },
  { label: 'Musicas & Audio', href: '/escola/midias', icon: Upload },
  { label: 'Mapas de Luz', href: '/escola/mapas-de-luz', icon: Lightbulb },
  { label: 'Coreografos', href: '/escola/coreografos', icon: UserCog },
  { label: 'Minha Escola', href: '/escola/perfil', icon: School },
]

interface Usuario {
  nome: string
  email: string
  role: string
}

export default function EscolaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [organizacaoNome, setOrganizacaoNome] = useState<string>('')

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('usuarios')
        .select('nome, email, role, organizacao_id')
        .eq('id', user.id)
        .single()

      if (data) {
        setUsuario({
          nome: data.nome,
          email: data.email ?? user.email ?? '',
          role: data.role,
        })

        if (data.organizacao_id) {
          const { data: organizacao } = await supabase
            .from('organizacoes')
            .select('nome')
            .eq('id', data.organizacao_id)
            .single()

          if (organizacao) {
            setOrganizacaoNome(organizacao.nome)
          }
        }
      }
    }

    loadUser()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/escola/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-axon-bg)] text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-axon-border bg-axon-panel transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center gap-3 border-b border-axon-border px-5">
          <span className="text-base font-bold tracking-tight">
            <span className="text-axon-gold">AXON</span>
            <span className="text-white"> Fest</span>
          </span>
          {organizacaoNome && (
            <span className="truncate text-xs text-white/40">{organizacaoNome}</span>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-[var(--color-axon-gold-dim)] text-axon-gold'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-axon-border px-3 py-3">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-axon-gold text-xs font-bold uppercase text-[var(--color-axon-bg)]">
              {usuario?.nome?.[0] ?? 'U'}
            </div>

            <div className="flex flex-1 flex-col text-left">
              <span className="truncate text-xs font-medium text-white/80">
                {usuario?.nome ?? 'Usuario'}
              </span>
              <span className="truncate text-xs text-white/35">{usuario?.email ?? ''}</span>
            </div>

            <ChevronDown
              size={14}
              className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="mt-1 rounded-lg border border-axon-border bg-[var(--color-axon-bg)] py-1">
              <Link
                href="/escola/perfil"
                className="flex items-center gap-2 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={13} />
                Meu Perfil
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-white/5"
              >
                <LogOut size={13} />
                Sair da plataforma
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-axon-border bg-axon-panel px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/50 transition-colors hover:text-white"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>

          <span className="text-sm font-bold">
            <span className="text-axon-gold">AXON</span>
            <span className="text-white"> Fest</span>
          </span>

          <div className="w-5" />
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}