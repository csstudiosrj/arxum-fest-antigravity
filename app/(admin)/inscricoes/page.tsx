"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronDown, ChevronRight, Search, Plus, X, Loader2,
  AlertCircle, Users, Music4, CircleDollarSign, CheckCircle2,
  Clock3, Copy, Check, MessageCircle, Pencil, Trash2, Info,
} from "lucide-react";

type StatusPagamento = "pago" | "pendente";

interface Terminologia {
  grupo: string;
  participante: string;
  apresentacao: string;
  inscricao: string;
  organizacao: string;
}

interface Organizacao {
  id: string;
  nome: string;
  responsavel: string | null;
  telefone: string | null;
  email: string;
}

interface Participante {
  id: string;
  nome: string;
  documento: string | null;
  data_nascimento: string;
  organizacao_id: string | null;
  termo_assinado: boolean;
}

interface Apresentacao {
  id: string;
  nome: string;
  grupo_id: string | null;
  tipo: string;
  quantidade_bailarinos: number;
  valor_total: number;
  status_pagamento: StatusPagamento;
  created_at: string;
}

interface ElencoRow {
  apresentacao_id: string;
  participante_id: string;
}

interface OrgComDados extends Organizacao {
  apresentacoes: Apresentacao[];
  participantes: Participante[];
  elenco: ElencoRow[];
}

function formatMoeda(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mascaraTelefone(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function Dica({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-axon-gold/5 border border-axon-gold/15 rounded-xl px-4 py-3">
      <Info size={14} className="text-axon-gold shrink-0 mt-0.5" />
      <p className="text-xs text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
}

interface ModalCadastrarGrupoProps {
  termo: Terminologia;
  org?: Organizacao | null;
  onClose: () => void;
  onSaved: () => void;
}

function ModalCadastrarGrupo({ termo, org, onClose, onSaved }: ModalCadastrarGrupoProps) {
  const [nome, setNome] = useState(org?.nome ?? "");
  const [responsavel, setResponsavel] = useState(org?.responsavel ?? "");
  const [telefone, setTelefone] = useState(org?.telefone ?? "");
  const [email, setEmail] = useState(org?.email ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<"formulario" | "confirmacao">("formulario");
  const [copiado, setCopiado] = useState(false);
  const [orgSalva, setOrgSalva] = useState<Organizacao | null>(null);

  async function salvar() {
    const supabase = createClient();
    setErro(null);
    if (!nome.trim()) { setErro(`Nome do ${termo.grupo.toLowerCase()} é obrigatório.`); return; }
    if (!email.trim()) { setErro("E-mail do responsável é obrigatório."); return; }
    setSalvando(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErro("Sessão expirada. Faça login novamente."); setSalvando(false); return; }

    const { data: userData } = await supabase
      .from("usuarios")
      .select("produtora_id")
      .eq("id", user.id)
      .single();

    const produtoraId = userData?.produtora_id;
    if (!produtoraId) { setErro("Conta não vinculada a uma produtora."); setSalvando(false); return; }

    if (org) {
      const { error } = await supabase
        .from("organizacoes")
        .update({ nome: nome.trim(), responsavel: responsavel.trim() || null, telefone: telefone.trim() || null, email: email.trim() })
        .eq("id", org.id);
      if (error) { setErro(error.message); setSalvando(false); return; }
      setOrgSalva({ ...org, nome: nome.trim(), responsavel: responsavel.trim() || null, telefone: telefone.trim() || null, email: email.trim() });
      setEtapa("confirmacao");
      onSaved();
      return;
    }

    const { data: orgCadastrada, error: orgErr } = await supabase
      .from("organizacoes")
      .insert({ nome: nome.trim(), responsavel: responsavel.trim() || null, telefone: telefone.trim() || null, email: email.trim(), produtora_id: produtoraId })
      .select()
      .single();

    if (orgErr) { setErro(orgErr.message); setSalvando(false); return; }

    const res = await fetch("/api/convite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), nome: responsavel.trim() || nome.trim(), role: "org_admin" }),
    });
    const json = await res.json();
    if (!res.ok) {
      setErro(`${termo.grupo} cadastrado, mas erro ao criar usuário: ${json.error || "Erro desconhecido"}`);
      setSalvando(false);
      setOrgSalva(orgCadastrada as Organizacao);
      setEtapa("confirmacao");
      return;
    }

    setOrgSalva(orgCadastrada as Organizacao);
    setEtapa("confirmacao");
    onSaved();
    setSalvando(false);
  }

  function copiarLink() {
    navigator.clipboard.writeText(`${window.location.origin}/convite/${email.trim()}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function abrirWhatsApp() {
    if (!orgSalva) return;
    const link = `${window.location.origin}/convite/${email.trim()}`;
    const msg = encodeURIComponent(
      `Olá, ${responsavel.trim() || "responsável"}! ${termo.organizacao} convidou o ${termo.grupo.toLowerCase()} *${orgSalva.nome}* para se cadastrar no sistema.\n\nClique no link para criar sua senha:\n\n${link}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
          <div>
            <h2 className="text-base font-semibold text-white">
              {etapa === "formulario" ? `Cadastrar ${termo.grupo}` : `${termo.grupo} cadastrado`}
            </h2>
            {etapa === "formulario" && (
              <p className="text-xs text-gray-500 mt-0.5">Um convite por e-mail será enviado automaticamente.</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {etapa === "formulario" && (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome do {termo.grupo.toLowerCase()} *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors"
                  placeholder={`Nome do ${termo.grupo.toLowerCase()}`} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome do responsável</label>
                <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors"
                  placeholder="Nome do diretor / responsável" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Telefone / WhatsApp</label>
                <input type="tel" value={telefone}
                  onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors"
                  placeholder="(21) 99999-9999" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">E-mail do responsável *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors"
                  placeholder="email@exemplo.com" />
                <p className="text-xs text-gray-600 mt-1">Um convite será enviado para este e-mail.</p>
              </div>
              {erro && <p className="flex items-start gap-2 text-xs text-red-400"><AlertCircle size={14} className="shrink-0 mt-0.5" /> {erro}</p>}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
              <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-200">Cancelar</button>
              <button onClick={salvar} disabled={salvando}
                className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
                {salvando && <Loader2 size={14} className="animate-spin" />}
                Cadastrar e convidar
              </button>
            </div>
          </>
        )}

        {etapa === "confirmacao" && orgSalva && (
          <>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{orgSalva.nome} cadastrado</p>
                  <p className="text-xs text-gray-400 mt-0.5">Convite enviado para <span className="text-white">{email}</span></p>
                </div>
              </div>
              {erro && <p className="flex items-start gap-2 text-xs text-yellow-400"><AlertCircle size={14} className="shrink-0 mt-0.5" /> {erro}</p>}
              <div className="space-y-2">
                <button onClick={copiarLink} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-all duration-200">
                  {copiado ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  {copiado ? "Link copiado!" : "Copiar link de acesso"}
                </button>
                <button onClick={abrirWhatsApp} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-all duration-200">
                  <MessageCircle size={15} /> Enviar pelo WhatsApp
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-axon-border">
              <button onClick={onClose} className="w-full px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 active:scale-95 transition-all duration-200">Concluir</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface CardGrupoProps {
  org: OrgComDados;
  termo: Terminologia;
  onEdit: (org: OrgComDados) => void;
  onDelete: (org: OrgComDados) => void;
}

function CardGrupo({ org, termo, onEdit, onDelete }: CardGrupoProps) {
  const [expandido, setExpandido] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"apresentacoes" | "participantes">("apresentacoes");

  const totalApres = org.apresentacoes.length;
  const totalParticipantes = org.participantes.length;
  const totalValor = org.apresentacoes.reduce((acc, c) => acc + (c.valor_total ?? 0), 0);
  const totalPago = org.apresentacoes.filter((c) => c.status_pagamento === "pago").reduce((acc, c) => acc + (c.valor_total ?? 0), 0);
  const totalPendente = totalValor - totalPago;
  const tudoPago = totalPendente === 0 && totalApres > 0;

  return (
    <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
      <div role="button" onClick={() => setExpandido((p) => !p)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-white truncate">{org.nome}</span>
            {tudoPago ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={11} /> Quitado
              </span>
            ) : totalPendente > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-axon-gold/10 text-axon-gold border border-axon-gold/20">
                <Clock3 size={11} /> Pendente
              </span>
            ) : null}
          </div>
          {org.responsavel && <p className="text-xs text-gray-500 mt-0.5">{org.responsavel}</p>}
        </div>

        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-xs text-gray-500">{termo.apresentacao}s</p>
            <p className="text-sm font-semibold text-white tabular-nums">{totalApres}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">{termo.participante}s</p>
            <p className="text-sm font-semibold text-white tabular-nums">{totalParticipantes}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-semibold text-white tabular-nums">{formatMoeda(totalValor)}</p>
          </div>
          {totalPendente > 0 && (
            <div className="text-center">
              <p className="text-xs text-gray-500">A receber</p>
              <p className="text-sm font-semibold text-axon-gold tabular-nums">{formatMoeda(totalPendente)}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit(org)} className="p-2 text-gray-400 hover:text-axon-gold hover:bg-axon-gold/10 rounded-lg transition-all duration-200"><Pencil size={15} /></button>
          <button onClick={() => onDelete(org)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"><Trash2 size={15} /></button>
          <div className="text-gray-500 ml-1">{expandido ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
        </div>
      </div>

      {expandido && (
        <div className="border-t border-axon-border">
          <div className="flex border-b border-axon-border px-5">
            {(["apresentacoes", "participantes"] as const).map((id) => (
              <button key={id} onClick={() => setAbaAtiva(id)}
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  abaAtiva === id ? "border-axon-gold text-axon-gold" : "border-transparent text-gray-500 hover:text-white"
                }`}>
                {id === "apresentacoes" ? `${termo.apresentacao}s` : `${termo.participante}s`}
              </button>
            ))}
          </div>

          {abaAtiva === "apresentacoes" && (
            <div className="p-5">
              {org.apresentacoes.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-6">Nenhuma {termo.apresentacao.toLowerCase()} inscrita.</p>
              ) : (
                <div className="space-y-3">
                  {org.apresentacoes.map((c) => {
                    const participantesNa = org.elenco
                      .filter((e) => e.apresentacao_id === c.id)
                      .map((e) => org.participantes.find((b) => b.id === e.participante_id))
                      .filter(Boolean) as Participante[];
                    return (
                      <div key={c.id} className="bg-axon-bg border border-axon-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{c.nome}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs text-gray-500 capitalize">{c.tipo}</span>
                              <span className="text-gray-700">·</span>
                              <span className="text-xs text-gray-500">{c.quantidade_bailarinos} {termo.participante.toLowerCase()}{c.quantidade_bailarinos !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-sm font-semibold text-white tabular-nums">{formatMoeda(c.valor_total ?? 0)}</span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.status_pagamento === "pago" ? "bg-emerald-500/10 text-emerald-400" : "bg-axon-gold/10 text-axon-gold"
                            }`}>
                              {c.status_pagamento === "pago" ? "Pago" : "Pendente"}
                            </span>
                          </div>
                        </div>
                        {participantesNa.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-axon-border/50">
                            <p className="text-xs text-gray-500 mb-2">{termo.participante}s</p>
                            <div className="flex flex-wrap gap-2">
                              {participantesNa.map((b) => (
                                <span key={b.id} className="text-xs bg-white/5 border border-axon-border rounded-full px-2.5 py-1 text-gray-300">{b.nome}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {abaAtiva === "participantes" && (
            <div className="p-5">
              {org.participantes.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-6">Nenhum {termo.participante.toLowerCase()} cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {org.participantes.map((b) => {
                    const apresDoP = org.elenco
                      .filter((e) => e.participante_id === b.id)
                      .map((e) => org.apresentacoes.find((c) => c.id === e.apresentacao_id))
                      .filter(Boolean) as Apresentacao[];
                    return (
                      <div key={b.id} className="bg-axon-bg border border-axon-border rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{b.nome}</p>
                            {b.documento && <p className="text-xs text-gray-500 tabular-nums mt-0.5">{b.documento}</p>}
                          </div>
                          <div className="shrink-0">
                            {b.termo_assinado ? (
                              <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> Termo OK</span>
                            ) : (
                              <span className="text-xs text-gray-600">Sem termo</span>
                            )}
                          </div>
                        </div>
                        {apresDoP.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {apresDoP.map((c) => (
                              <span key={c.id} className="text-xs bg-axon-gold/10 text-axon-gold rounded-full px-2.5 py-0.5 border border-axon-gold/20">{c.nome}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModalConfirmarExclusao({ org, onConfirmar, onCancelar, excluindo, erro }: {
  org: OrgComDados; onConfirmar: () => void; onCancelar: () => void; excluindo: boolean; erro: string | null;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-axon-panel border border-red-500/30 rounded-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <Trash2 size={22} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Excluir organização</h2>
            <p className="text-sm text-gray-400 mt-1">Tem certeza que deseja excluir <span className="text-white font-medium">{org.nome}</span>?</p>
            <p className="text-xs text-gray-500 mt-2">Esta ação também remove as inscrições e participantes associados.</p>
          </div>
        </div>
        {erro && <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300"><AlertCircle size={16} /> {erro}</div>}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancelar} disabled={excluindo} className="py-3 rounded-xl border border-axon-border text-gray-400 hover:text-white text-sm transition-all duration-200 disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirmar} disabled={excluindo} className="py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
            {excluindo ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {excluindo ? "Excluindo..." : "Sim, excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InscricoesPage() {
  const [orgsComDados, setOrgsComDados] = useState<OrgComDados[]>([]);
  const [termo, setTermo] = useState<Terminologia>({
    grupo: "Grupo", participante: "Participante",
    apresentacao: "Apresentação", inscricao: "Inscrição", organizacao: "Organização",
  });
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalGrupo, setModalGrupo] = useState(false);
  const [editarOrg, setEditarOrg] = useState<Organizacao | null>(null);
  const [orgExcluir, setOrgExcluir] = useState<OrgComDados | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);
  const [kpis, setKpis] = useState({ grupos: 0, apresentacoes: 0, participantes: 0, totalPago: 0, totalPendente: 0 });

  const mostrarToast = useCallback((msg: string, tipo: "ok" | "erro" = "ok") => {
    setToastMsg({ msg, tipo });
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    setCarregando(true);

    const [
      { data: config },
      { data: orgs },
      { data: apres },
      { data: participantes },
      { data: elenco },
    ] = await Promise.all([
      supabase.from("tenant_config").select("termo_grupo, termo_participante, termo_apresentacao, termo_inscricao, nome_organizacao").maybeSingle(),
      supabase.from("organizacoes").select("*").order("nome"),
      supabase.from("apresentacoes").select("*").order("created_at", { ascending: false }),
      supabase.from("participantes").select("*").order("nome"),
      supabase.from("apresentacao_elenco").select("apresentacao_id, participante_id"),
    ]);

    if (config) {
      setTermo({
        grupo:        (config as Record<string, string>).termo_grupo        || "Grupo",
        participante: (config as Record<string, string>).termo_participante || "Participante",
        apresentacao: (config as Record<string, string>).termo_apresentacao || "Apresentação",
        inscricao:    (config as Record<string, string>).termo_inscricao    || "Inscrição",
        organizacao:  (config as Record<string, string>).nome_organizacao   || "Organização",
      });
    }

    const orgsArr = (orgs as Organizacao[]) ?? [];
    const apresArr = (apres as Apresentacao[]) ?? [];
    const partArr = (participantes as Participante[]) ?? [];
    const elencoArr = (elenco as ElencoRow[]) ?? [];

    const compostas: OrgComDados[] = orgsArr.map((o) => ({
      ...o,
      apresentacoes: apresArr.filter((a) => a.grupo_id === o.id),
      participantes: partArr.filter((p) => p.organizacao_id === o.id),
      elenco: elencoArr.filter((el) => apresArr.filter((a) => a.grupo_id === o.id).some((a) => a.id === el.apresentacao_id)),
    }));

    setOrgsComDados(compostas);

    const totalPago = apresArr.filter((a) => a.status_pagamento === "pago").reduce((acc, a) => acc + (a.valor_total ?? 0), 0);
    const totalPendente = apresArr.filter((a) => a.status_pagamento === "pendente").reduce((acc, a) => acc + (a.valor_total ?? 0), 0);
    setKpis({ grupos: orgsArr.length, apresentacoes: apresArr.length, participantes: partArr.length, totalPago, totalPendente });

    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrados = orgsComDados.filter((o) =>
    o.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (o.responsavel ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  async function confirmarExcluir() {
    const supabase = createClient();
    if (!orgExcluir) return;
    setErroExcluir(null);
    setExcluindo(true);

    const apresIds = orgExcluir.apresentacoes.map((a) => a.id);
    if (apresIds.length > 0) {
      const { error } = await supabase.from("apresentacao_elenco").delete().in("apresentacao_id", apresIds);
      if (error) { setErroExcluir(error.message); setExcluindo(false); return; }
      const { error: e2 } = await supabase.from("apresentacoes").delete().eq("grupo_id", orgExcluir.id);
      if (e2) { setErroExcluir(e2.message); setExcluindo(false); return; }
    }

    const { error: e3 } = await supabase.from("participantes").delete().eq("organizacao_id", orgExcluir.id);
    if (e3) { setErroExcluir(e3.message); setExcluindo(false); return; }

    const { error: e4 } = await supabase.from("organizacoes").delete().eq("id", orgExcluir.id);
    if (e4) { setErroExcluir(e4.message); setExcluindo(false); return; }

    setOrgExcluir(null);
    setExcluindo(false);
    mostrarToast("Organização excluída com sucesso.");
    carregar();
  }

  return (
    <>
      {modalGrupo && (
        <ModalCadastrarGrupo
          termo={termo}
          org={editarOrg}
          onClose={() => { setModalGrupo(false); setEditarOrg(null); }}
          onSaved={() => { setEditarOrg(null); carregar(); }}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">{termo.inscricao}s e Elenco</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie os {termo.grupo.toLowerCase()}s participantes, suas {termo.apresentacao.toLowerCase()}s e {termo.participante.toLowerCase()}s.
            </p>
          </div>
          <button onClick={() => setModalGrupo(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0">
            <Plus size={15} /> Cadastrar {termo.grupo.toLowerCase()}
          </button>
        </div>

        <Dica>
          Cadastre os {termo.grupo.toLowerCase()}s participantes e envie o convite de acesso. Eles se conectarão pelo portal próprio para inserir {termo.apresentacao.toLowerCase()}s e {termo.participante.toLowerCase()}s diretamente.
        </Dica>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: `${termo.grupo}s`,        value: kpis.grupos.toString(),          icon: Users,            cor: "" },
            { label: `${termo.apresentacao}s`, value: kpis.apresentacoes.toString(),   icon: Music4,           cor: "" },
            { label: `${termo.participante}s`, value: kpis.participantes.toString(),   icon: Users,            cor: "" },
            { label: "Total pago",             value: formatMoeda(kpis.totalPago),     icon: CircleDollarSign, cor: "green" },
            { label: "A receber",              value: formatMoeda(kpis.totalPendente), icon: CircleDollarSign, cor: "gold" },
          ].map(({ label, value, icon: Icon, cor }) => (
            <div key={label} className="bg-axon-panel border border-axon-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={cor === "green" ? "text-emerald-400" : cor === "gold" ? "text-axon-gold" : "text-gray-500"} />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
              <p className={`text-lg font-semibold tabular-nums ${cor === "green" ? "text-emerald-400" : cor === "gold" ? "text-axon-gold" : "text-white"}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar ${termo.grupo.toLowerCase()} ou responsável...`}
            className="w-full bg-axon-panel border border-axon-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors" />
        </div>

        {carregando ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-axon-panel border border-axon-border rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-axon-border rounded-xl text-gray-600">
            <Users size={36} className="mb-3 opacity-20 text-axon-gold" />
            <p className="font-medium text-gray-300">{busca ? `Nenhum ${termo.grupo.toLowerCase()} encontrado` : `Nenhum ${termo.grupo.toLowerCase()} cadastrado ainda`}</p>
            {!busca && (
              <button onClick={() => setModalGrupo(true)} className="mt-3 text-sm text-axon-gold hover:text-white border border-axon-gold/30 hover:border-axon-gold hover:bg-axon-gold/10 px-4 py-2 rounded-lg transition-all duration-200">
                Cadastrar primeiro {termo.grupo.toLowerCase()}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((org) => (
              <CardGrupo key={org.id} org={org} termo={termo}
                onEdit={(o) => { setEditarOrg(o); setModalGrupo(true); }}
                onDelete={(o) => setOrgExcluir(o)}
              />
            ))}
          </div>
        )}
      </div>

      {orgExcluir && (
        <ModalConfirmarExclusao
          org={orgExcluir}
          onConfirmar={confirmarExcluir}
          onCancelar={() => { setOrgExcluir(null); setErroExcluir(null); }}
          excluindo={excluindo}
          erro={erroExcluir}
        />
      )}

      {toastMsg && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full text-sm font-semibold shadow-xl transition-all duration-300 ${
          toastMsg.tipo === "ok" ? "bg-axon-gold text-black" : "bg-red-500/90 text-white"
        }`}>
          {toastMsg.tipo === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toastMsg.msg}
        </div>
      )}
    </>
  );
}