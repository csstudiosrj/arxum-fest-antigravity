"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Users, ClipboardList, ShoppingBag, Music,
  ChevronDown, LogOut, User, Settings,
  GraduationCap, LayoutDashboard,
} from "lucide-react";

const navLinks = [
  { name: "Início",           href: "/escola/dashboard",         icon: LayoutDashboard },
  { name: "Banco de Elenco",  href: "/escola/elenco",            icon: Users },
  { name: "Inscrições",       href: "/escola/inscricoes-escola",  icon: ClipboardList },
  { name: "Músicas",          href: "/escola/musicas",           icon: Music },
  { name: "Loja",             href: "/escola/loja-escola",       icon: ShoppingBag },
];

export default function EscolaShell({ children }: { children: React.ReactNode }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/escola/login";
  };

  return (
    <div className="min-h-screen bg-axon-bg text-white flex flex-col">

      {/* Topbar */}
      <header className="h-16 bg-axon-panel border-b border-axon-border flex items-center justify-between px-6 sticky top-0 z-20">

        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-axon-green-dim flex items-center justify-center">
              <GraduationCap size={15} className="text-axon-green" />
            </div>
            <span className="text-base font-bold tracking-wider">
              AXON <span className="text-axon-green font-light">Fest</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-axon-green-dim text-axon-green font-medium"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 hover:bg-white/5 px-2 py-1.5 rounded-xl transition-colors border border-transparent hover:border-axon-border"
            aria-expanded={isUserMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-axon-green-dim border border-axon-green/20 flex items-center justify-center text-axon-green font-bold text-xs">
              EC
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-white leading-tight">Minha Escola</div>
              <div className="text-xs text-gray-500 leading-tight">Portal</div>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-axon-panel border border-axon-border rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden">
                <Link
                  href="/escola/perfil"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={15} /> Meu Perfil
                </Link>
                <Link
                  href="/escola/configuracoes"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings size={15} /> Configurações
                </Link>
                <div className="h-px bg-axon-border my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                >
                  <LogOut size={15} /> Sair
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}