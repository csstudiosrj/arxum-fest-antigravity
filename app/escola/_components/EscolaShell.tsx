"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ClipboardList,
  ShoppingBag,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Music,
} from "lucide-react";

const navLinks = [
  { name: "Banco de Elenco", href: "/escola/elenco", icon: Users },
  {
    name: "Minhas Inscrições",
    href: "/escola/inscricoes-escola",
    icon: ClipboardList,
  },
  { name: "Músicas", href: "/escola/musicas", icon: Music },
  { name: "Loja do Evento", href: "/escola/loja-escola", icon: ShoppingBag },
];

export default function EscolaShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-axon-bg text-white flex flex-col">
      <header className="h-16 bg-axon-panel border-b border-axon-border flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold tracking-wider shrink-0">
            AXON <span className="text-axon-green font-light">Fest</span>
          </span>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-axon-green-dim text-axon-green font-medium"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-axon-border"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-axon-border flex items-center justify-center text-axon-green font-bold text-xs">
              EC
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-white leading-tight">
                Escola
              </div>
              <div className="text-xs text-gray-500 leading-tight">
                Coreógrafo
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-axon-panel border border-axon-border rounded-xl shadow-2xl z-50 py-2 overflow-hidden">
                <div className="px-4 py-2 border-b border-axon-border mb-2">
                  <p className="text-sm text-white font-medium">Minha Escola</p>
                  <p className="text-xs text-gray-400 truncate">
                    escola@axonfest.com.br
                  </p>
                </div>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={16} /> Meu Perfil
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings size={16} /> Configurações
                </a>
                <div className="h-px bg-axon-border my-2" />
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                >
                  <LogOut size={16} /> Sair
                </a>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}