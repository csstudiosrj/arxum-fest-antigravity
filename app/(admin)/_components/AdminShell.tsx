"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, CalendarDays, Users, Mic2, Ticket,
  Settings, LogOut, ChevronLeft, ChevronRight, ChevronDown,
  User, Gavel, ShoppingBag, FileSignature, Megaphone,
} from "lucide-react";

const navLinks = [
  { name: "Dashboard",         href: "/dashboard",  icon: LayoutDashboard },
  { name: "Line-up & Eventos", href: "/eventos",    icon: CalendarDays },
  { name: "Inscrições & Elenco",href: "/inscricoes", icon: Users },
  { name: "Mídias & Áudio",    href: "/midias",     icon: Mic2 },
  { name: "Jurados & Apuração",href: "/jurados",    icon: Gavel },
  { name: "Loja & Upsell",     href: "/loja",       icon: ShoppingBag },
  { name: "Termos & Contratos",href: "/termos",     icon: FileSignature },
  { name: "Marketing",         href: "/marketing",  icon: Megaphone },
  { name: "PDV & Bilheteria",  href: "/pdv",        icon: Ticket },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen]   = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail]           = useState<string>("");
  const [userName, setUserName]             = useState<string>("Organizador");

  const pathname = usePathname();
  const router   = useRouter();

  // ── Busca dados do usuário logado via Supabase ──
  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? "");
        // Usa o nome do metadata se existir, senão usa a parte antes do @ do email
        const name =
          user.user_metadata?.nome_completo ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Organizador";
        setUserName(name);
      }
    }
    loadUser();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Iniciais para o avatar (ex: "João Silva" → "JS")
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AX";

  return (
    <div className="flex h-screen overflow-hidden bg-axon-bg text-white">

      {/* ── Sidebar ── */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-axon-panel border-r border-axon-border flex flex-col transition-all duration-300 ease-in-out relative z-20`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-axon-border">
          {isSidebarOpen ? (
            <span className="text-xl font-bold tracking-wider truncate px-2">
              AXON <span className="text-axon-gold font-light">Fest</span>
            </span>
          ) : (
            <span className="text-xl font-bold tracking-wider mx-auto text-axon-gold">AX</span>
          )}
        </div>

        {/* Botão colapsar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-axon-panel border border-axon-border rounded-full p-1 text-gray-400 hover:text-white hover:border-axon-gold transition-colors z-30"
          aria-label={isSidebarOpen ? "Recolher menu" : "Expandir menu"}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Nav links */}
        <nav className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-axon-gold-dim text-axon-gold font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                } ${isSidebarOpen ? "px-3 py-2" : "p-3 justify-center"}`}
              >
                <Icon size={20} className="shrink-0" />
                {isSidebarOpen && <span className="text-sm">{link.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Área principal ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Header */}
        <header className="h-16 bg-axon-panel/80 backdrop-blur-md border-b border-axon-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-gray-400 text-sm font-medium">
            Painel do Organizador
          </div>

          {/* Menu do usuário */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-axon-border"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-9 h-9 rounded-full bg-axon-border flex items-center justify-center text-axon-gold font-bold text-sm">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-white leading-tight capitalize">
                  {userName}
                </div>
                <div className="text-xs text-gray-500 leading-tight">Admin</div>
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
                {/* Overlay para fechar */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-64 bg-axon-panel border border-axon-border rounded-xl shadow-2xl z-50 py-2 overflow-hidden">
                  {/* Info do usuário */}
                  <div className="px-4 py-3 border-b border-axon-border mb-2">
                    <p className="text-sm text-white font-medium capitalize">{userName}</p>
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  </div>

                  {/* Meu Perfil */}
                  <Link
                    href="/perfil"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User size={16} />
                    <span>Meu Perfil</span>
                  </Link>

                  {/* Configurações */}
                  <Link
                    href="/configuracoes"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings size={16} />
                    <span>Configurações</span>
                  </Link>

                  <div className="h-px bg-axon-border my-2" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sair da plataforma</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}