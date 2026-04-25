"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, CalendarDays, Users, Mic2, Ticket,
  Settings, LogOut, ChevronLeft, ChevronRight, ChevronDown,
  User, Gavel, ShoppingBag, FileSignature, Megaphone, Loader2, ShieldCheck
} from "lucide-react";

const navLinks =[
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Line-up & Eventos", href: "/eventos", icon: CalendarDays },
  { name: "Inscrições & Elenco", href: "/inscricoes", icon: Users },
  { name: "Mídias & Áudio", href: "/midias", icon: Mic2 },
  { name: "Jurados & Apuração", href: "/jurados", icon: Gavel },
  { name: "Loja & Upsell", href: "/loja", icon: ShoppingBag },
  { name: "Termos & Contratos", href: "/termos", icon: FileSignature },
  { name: "Marketing", href: "/marketing", icon: Megaphone },
  { name: "PDV & Bilheteria", href: "/pdv", icon: Ticket },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const[isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const[authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Estados do Modo Diagnóstico
  const [hasError, setHasError] = useState(false);
  const [debugMsg, setDebugMsg] = useState("Iniciando verificação...");

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        setDebugMsg("1. Verificando sessão no navegador...");

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setDebugMsg("Erro de Sessão: " + sessionError.message);
          setHasError(true);
          return;
        }

        if (!session) {
          setDebugMsg("Nenhuma sessão encontrada. O cookie de login não foi salvo pelo navegador.");
          setHasError(true);
          return;
        }

        setDebugMsg("2. Sessão encontrada! Buscando cargo no banco de dados...");

        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userError) {
          setDebugMsg("Erro ao ler tabela 'usuarios' (Provável bloqueio de RLS): " + userError.message);
          setHasError(true);
          return;
        }

        if (!userData) {
          setDebugMsg("Usuário não encontrado na tabela 'usuarios'.");
          setHasError(true);
          return;
        }

        setDebugMsg("3. Cargo encontrado: " + userData.role);

        if (userData.role !== 'admin' && userData.role !== 'super_admin') {
          setDebugMsg("Acesso Negado. Seu cargo é: " + userData.role);
          setHasError(true);
          return;
        }

        // Se passou por tudo, libera o acesso!
        setUserEmail(session.user.email || "");
        setAuthorized(true);
        setLoading(false);

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setDebugMsg("Erro Fatal no Código: " + message);
        setHasError(true);
      }
    };

    checkUser();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // TELA DE DIAGNÓSTICO (Se der erro, ele para aqui e te mostra o motivo)
  if (hasError) {
    return (
      <div className="h-screen w-full bg-[#0d0807] flex flex-col items-center justify-center p-8 text-white">
        <div className="bg-[#1a1413] border border-red-500 p-8 rounded-xl max-w-2xl w-full text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Diagnóstico de Erro</h1>
          <p className="text-lg font-mono text-gray-300 bg-black p-4 rounded mb-6">{debugMsg}</p>
          <button onClick={() => router.push('/login')} className="bg-[#C5A059] text-black px-6 py-2 rounded font-bold hover:bg-opacity-90">
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0d0807] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0807] text-white">
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-[#1a1413] border-r border-[#1a1413]/50 flex flex-col transition-all duration-300 ease-in-out relative z-20`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a1413]/50">
          {isSidebarOpen ? (
            <span className="text-xl font-bold tracking-wider truncate px-2">
              AXON <span className="text-[#C5A059] font-light">Fest</span>
            </span>
          ) : (
            <span className="text-xl font-bold tracking-wider mx-auto text-[#C5A059]">AX</span>
          )}
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-[#1a1413] border border-[#1a1413]/50 rounded-full p-1 text-gray-400 hover:text-white hover:border-[#C5A059] transition-colors z-30"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <nav className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-md transition-colors ${
                  isActive ? "bg-[#C5A059]/10 text-[#C5A059] font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"
                } ${isSidebarOpen ? "px-3 py-2" : "p-3 justify-center"}`}
              >
                <Icon size={20} className="shrink-0" />
                {isSidebarOpen && <span className="text-sm">{link.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-[#1a1413]/80 backdrop-blur-md border-b border-[#1a1413]/50 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-gray-400 text-sm font-medium">Painel do Organizador</div>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-[#1a1413]/50"
            >
              <div className="w-9 h-9 rounded-full bg-[#1a1413]/50 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] font-bold text-sm uppercase">
                {userEmail.substring(0, 2)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-white leading-tight">Organizador</div>
                <div className="text-xs text-gray-500 leading-tight">Admin</div>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />

                <div className="fixed top-16 right-6 w-64 bg-[#1a1413] border border-[#2e2825] rounded-xl shadow-2xl z-50 py-2 overflow-hidden">

                  <div className="px-4 py-3 border-b border-[#2e2825] mb-1">
                    <p className="text-sm text-white font-medium capitalize">Organizador</p>
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  </div>

                  <Link
                    href="/perfil"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User size={16} />
                    <span>Meu Perfil</span>
                  </Link>

                  <div className="h-px bg-[#2e2825] my-1" />
                  <p className="px-4 py-1.5 text-xs text-gray-600 font-medium uppercase tracking-wider">Gestão</p>

                  <Link
                    href="/usuarios"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <ShieldCheck size={16} />
                    <span>Usuários & Permissões</span>
                  </Link>

                  <Link
                    href="/configuracoes"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings size={16} />
                    <span>Configurações do Sistema</span>
                  </Link>

                  <div className="h-px bg-[#2e2825] my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sair da plataforma</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}