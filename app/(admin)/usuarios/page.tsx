"use client";

import { useState, useEffect } from "react";
import {
  UserPlus, Mail, Lock, Shield, Trash2,
  Send, KeyRound, CheckCircle, AlertCircle,
  Loader2, ChevronDown, Crown, Users
} from "lucide-react";
import { createClient } from "../../../lib/supabase/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Usuario {
  id: string;
  email: string;
  nome: string | null;
  role: string;
  criado_em?: string;
}

type Acao = "invite" | "add";

// ─── Configuração de cargos ───────────────────────────────────────────────────

const CARGOS: Record<string, { label: string; descricao: string; cor: string }> = {
  super_admin: { label: "Super Admin",  descricao: "Acesso total incluindo assinatura e credenciais", cor: "text-purple-400 bg-purple-400/10 border-purple-400/30" },
  admin:       { label: "Admin",        descricao: "Acesso total exceto credenciais e assinatura",    cor: "text-[#C5A059] bg-[#C5A059]/10 border-[#C5A059]/30" },
  produtor:    { label: "Produtor",     descricao: "PDV, Loja, Inscrições e Dashboard",               cor: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  marketing:   { label: "Marketing",   descricao: "Marketing, Dashboard e Inscrições (sem valores)", cor: "text-pink-400 bg-pink-400/10 border-pink-400/30" },
  assistente:  { label: "Assistente",  descricao: "Inscrições & Elenco e Mídias & Áudio",            cor: "text-green-400 bg-green-400/10 border-green-400/30" },
};

const HIERARQUIA: Record<string, string[]> = {
  super_admin: ["super_admin", "admin", "produtor", "marketing", "assistente"],
  admin:       ["produtor", "marketing", "assistente"],
  produtor:    [],
  marketing:   [],
  assistente:  [],
};

// ─── Badge de cargo ───────────────────────────────────────────────────────────

function BadgeCargo({ role }: { role: string }) {
  const cfg = CARGOS[role] ?? { label: role, cor: "text-gray-400 bg-gray-400/10 border-gray-400/30" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cor}`}>
      {cfg.label}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, tipo, visivel }: { msg: string; tipo: "ok" | "erro"; visivel: boolean }) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full font-semibold text-sm shadow-xl transition-all duration-300 ${
      visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
    } ${tipo === "ok" ? "bg-[#C5A059] text-black" : "bg-red-500/90 text-white"}`}>
      {tipo === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

// ─── Modal Convidar/Adicionar ─────────────────────────────────────────────────

function ModalConvidar({
  inviterRole, onSucesso, onFechar,
}: {
  inviterRole: string; onSucesso: () => void; onFechar: () => void;
}) {
  const [acao, setAcao] = useState<Acao>("invite");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const cargosPermitidos = HIERARQUIA[inviterRole] ?? [];

  const handleSubmit = async () => {
    if (!email || !role) { setErro("Preencha e-mail e cargo."); return; }
    if (acao === "add" && senha.length < 6) { setErro("Senha deve ter no mínimo 6 caracteres."); return; }
    setErro(""); setEnviando(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, action: acao, password: senha, inviterRole }),
      });
      const json = await res.json();
      if (!res.ok) { setErro(json.error ?? "Erro desconhecido."); return; }
      onSucesso();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1413] border border-[#2e2825] rounded-2xl p-6 w-full max-w-md space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <UserPlus size={18} className="text-[#C5A059]" /> Adicionar Membro
          </h2>
          <button onClick={onFechar} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        {/* Abas de ação */}
        <div className="flex bg-[#0d0807] border border-[#2e2825] rounded-xl overflow-hidden">
          <button onClick={() => setAcao("invite")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              acao === "invite" ? "bg-[#1a1413] text-[#C5A059]" : "text-gray-500 hover:text-white"}`}>
            <Send size={14} /> Convite por E-mail
          </button>
          <button onClick={() => setAcao("add")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              acao === "add" ? "bg-[#1a1413] text-[#C5A059]" : "text-gray-500 hover:text-white"}`}>
            <KeyRound size={14} /> Criar Manualmente
          </button>
        </div>

        <p className="text-xs text-gray-500">
          {acao === "invite"
            ? "O usuário receberá um e-mail para definir a própria senha."
            : "O usuário receberá login e senha prontos — ideal para enviar via WhatsApp."}
        </p>

        {/* E-mail */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 uppercase tracking-wider">E-mail</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full bg-[#0d0807] border border-[#2e2825] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#C5A059] placeholder:text-gray-600" />
          </div>
        </div>

        {/* Cargo */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Cargo</label>
          <div className="relative">
            <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#0d0807] border border-[#2e2825] rounded-xl pl-10 pr-8 py-3 text-white text-sm focus:outline-none focus:border-[#C5A059] appearance-none">
              <option value="">Selecione um cargo...</option>
              {cargosPermitidos.map((c) => (
                <option key={c} value={c}>{CARGOS[c]?.label ?? c}</option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          {role && CARGOS[role] && (
            <p className="text-xs text-gray-500 pl-1">{CARGOS[role].descricao}</p>
          )}
        </div>

        {/* Senha (só no modo add) */}
        {acao === "add" && (
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Senha Provisória</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input type="text" value={senha} onChange={(e) => setSenha(e.target.value)}
                placeholder="Mín. 6 caracteres"
                className="w-full bg-[#0d0807] border border-[#2e2825] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#C5A059] placeholder:text-gray-600" />
            </div>
          </div>
        )}

        {erro && (
          <p className="text-red-400 text-xs flex items-center gap-1.5">
            <AlertCircle size={13} /> {erro}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button onClick={onFechar}
            className="py-3 rounded-xl border border-[#2e2825] text-gray-400 hover:text-white text-sm font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={enviando || !email || !role}
            className="py-3 rounded-xl bg-[#C5A059] text-black font-bold text-sm hover:bg-[#d4af6a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {enviando ? <Loader2 size={15} className="animate-spin" /> : acao === "invite" ? <Send size={15} /> : <KeyRound size={15} />}
            {enviando ? "Enviando..." : acao === "invite" ? "Enviar Convite" : "Criar Usuário"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function UsuariosPage() {
  const supabase = createClient();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [inviterRole, setInviterRole] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [toast, setToast] = useState({ msg: "", tipo: "ok" as "ok" | "erro", visivel: false });

  const mostrarToast = (msg: string, tipo: "ok" | "erro" = "ok") => {
    setToast({ msg, tipo, visivel: true });
    setTimeout(() => setToast((t) => ({ ...t, visivel: false })), 3000);
  };

  const carregar = async () => {
    setCarregando(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Role de quem está logado
    const { data: eu } = await supabase
      .from("usuarios").select("role").eq("id", session.user.id).single();
    if (eu) setInviterRole(eu.role);

    // Lista todos os usuários
    const { data } = await supabase
      .from("usuarios")
      .select("id, email, nome, role")
      .order("role");

    if (data) setUsuarios(data as Usuario[]);
    setCarregando(false);
  };

  useEffect(() => { carregar(); }, []);

  const removerUsuario = async (id: string, role: string) => {
    // Proteção: não pode remover super_admin
    if (role === "super_admin") {
      mostrarToast("Não é possível remover um Super Admin.", "erro");
      return;
    }
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;

    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", userId: id, inviterRole }),
    });
    if (res.ok) {
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      mostrarToast("Usuário removido.");
    } else {
      mostrarToast("Erro ao remover usuário.", "erro");
    }
  };

  const podeConvidar = (HIERARQUIA[inviterRole] ?? []).length > 0;

  return (
    <>
      <Toast msg={toast.msg} tipo={toast.tipo} visivel={toast.visivel} />

      {modalAberto && (
        <ModalConvidar
          inviterRole={inviterRole}
          onFechar={() => setModalAberto(false)}
          onSucesso={() => {
            setModalAberto(false);
            mostrarToast("Usuário adicionado com sucesso!");
            carregar();
          }}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Usuários & Permissões</h1>
            <p className="text-gray-400 mt-1 text-sm">Gerencie quem acessa o painel e com quais permissões.</p>
          </div>
          {podeConvidar && (
            <button onClick={() => setModalAberto(true)}
              className="flex items-center gap-2 bg-[#C5A059] text-black px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#d4af6a] transition-colors">
              <UserPlus size={16} /> Adicionar Membro
            </button>
          )}
        </div>

        {/* Mapa de permissões */}
        <div className="bg-axon-panel border border-axon-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-[#C5A059]" />
            <h2 className="text-white font-semibold text-sm">Mapa de Acessos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(CARGOS).map(([key, cfg]) => (
              <div key={key} className="bg-axon-bg border border-axon-border rounded-xl p-3 space-y-1.5">
                <BadgeCargo role={key} />
                <p className="text-xs text-gray-500 leading-relaxed">{cfg.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de usuários */}
        <div className="bg-axon-panel border border-axon-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-axon-border">
            <Users size={16} className="text-[#C5A059]" />
            <h2 className="text-white font-semibold text-sm">
              Equipe <span className="text-gray-500 font-normal">({usuarios.length})</span>
            </h2>
          </div>

          {carregando ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#C5A059]" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600 gap-3">
              <Users size={36} className="opacity-20" />
              <p className="text-sm">Nenhum usuário cadastrado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-axon-border">
              {usuarios.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#1a1413] border border-[#2e2825] flex items-center justify-center text-[#C5A059] font-bold text-sm uppercase shrink-0">
                      {(u.nome ?? u.email).substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.nome ?? "—"}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <BadgeCargo role={u.role} />
                    {u.role !== "super_admin" && inviterRole === "super_admin" || 
                     (HIERARQUIA[inviterRole] ?? []).includes(u.role) ? (
                      <button
                        onClick={() => removerUsuario(u.id, u.role)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : (
                      <div className="w-7" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}