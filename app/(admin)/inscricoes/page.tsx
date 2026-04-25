// app/(admin)/inscricoes/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Users,
  Music4,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  Copy,
  Check,
  MessageCircle,
  Pencil,
  Trash2,
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────

type StatusPagamento = "pago" | "pendente";

interface Terminologia {
  grupo: string;
  participante: string;
  apresentacao: string;
  inscricao: string;
  organizacao: string;
}

interface Escola {
  id: string;
  nome: string;
  responsavel: string;
  telefone: string;
  email: string;
}

interface Bailarino {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  escola_id: string;
  termo_assinado: boolean;
}

interface Coreografia {
  id: string;
  nome: string;
  escola_id: string;
  categoria: string;
  tipo: string;
  quantidade_bailarinos: number;
  valor_total: number;
  status_pagamento: StatusPagamento;
  created_at: string;
}

interface ElencoRow {
  coreografia_id: string;
  bailarino_id: string;
}

interface EscolaComDados extends Escola {
  coreografias: Coreografia[];
  bailarinos: Bailarino[];
  elenco: ElencoRow[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatMoeda(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function cpfFormatado(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// ── Modal Cadastrar Grupo ──────────────────────────────────────────────────

interface ModalCadastrarGrupoProps {
  termo: Terminologia;
  onClose: () => void;
  onSaved: () => void;
}

type EtapaModal = "formulario" | "confirmacao";

interface ModalCadastrarGrupoProps {
  termo: Terminologia;
  escola?: Escola | null;
  onClose: () => void;
  onSaved: () => void;
}

function ModalCadastrarGrupo({ termo, escola, onClose, onSaved }: ModalCadastrarGrupoProps) {
  const supabase = createClient();

  const [nome, setNome] = useState(escola?.nome ?? "");
  const [responsavel, setResponsavel] = useState(escola?.responsavel ?? "");
  const [telefone, setTelefone] = useState(escola?.telefone ?? "");
  const [email, setEmail] = useState(escola?.email ?? "");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<EtapaModal>("formulario");
  const [copiado, setCopiado] = useState(false);
  const [escolaSalva, setEscolaSalva] = useState<Escola | null>(null);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) { setErro(`Nome do ${termo.grupo.toLowerCase()} e obrigatorio.`); return; }
    if (!email.trim()) { setErro("E-mail do responsavel e obrigatorio para enviar o convite."); return; }

    setSalvando(true);

    if (escola) {
      const { error: escolaErr } = await supabase
        .from("escolas")
        .update({
          nome: nome.trim(),
          responsavel: responsavel.trim() || null,
          telefone: telefone.trim() || null,
          email: email.trim(),
        })
        .eq("id", escola.id);

      if (escolaErr) { setErro(escolaErr.message); setSalvando(false); return; }
      setEtapa("confirmacao");
      setEscolaSalva({
        ...escola,
        nome: nome.trim(),
        responsavel: responsavel.trim() || "",
        telefone: telefone.trim() || "",
        email: email.trim(),
      });
      onSaved();
      return;
    }

    const { data: escolaCadastrada, error: escolaErr } = await supabase
      .from("escolas")
      .insert({
        nome: nome.trim(),
        responsavel: responsavel.trim() || null,
        telefone: telefone.trim() || null,
        email: email.trim(),
      })
      .select()
      .single();

    if (escolaErr) { setErro(escolaErr.message); setSalvando(false); return; }

    const inviteRes = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        role: "escola_admin",
        action: "invite",
        inviterRole: "admin",
        escola_id: escolaCadastrada.id,
        nome: responsavel.trim() || null,
      }),
    });
    const inviteJson = await inviteRes.json();
    if (!inviteRes.ok) {
      setErro(`Escola cadastrada, mas erro ao criar usuário: ${inviteJson.error || "Erro desconhecido"}`);
      setSalvando(false);
      return;
    }

    setEscolaSalva(escolaCadastrada as Escola);
    setEtapa("confirmacao");
    onSaved();
  }

  function copiarLink() {
    const url = `${window.location.origin}/convite/${email.trim()}`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function abrirWhatsApp() {
    if (!escolaSalva) return;
    const link = `${window.location.origin}/convite/${email.trim()}`;
    const mensagem = encodeURIComponent(
      `Ola, ${responsavel.trim() || "responsavel"}! ${termo.organizacao} convidou o ${termo.grupo.toLowerCase()} *${escolaSalva.nome}* para se cadastrar no sistema.\n\nClique no link abaixo para criar sua senha e comecar a cadastrar suas ${termo.apresentacao.toLowerCase()}s e ${termo.participante.toLowerCase()}s:\n\n${link}`
    );
    window.open(`https://wa.me/?text=${mensagem}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
          <h2 className="text-base font-semibold text-white">
            {etapa === "formulario" ? `Cadastrar ${termo.grupo}` : `${termo.grupo} cadastrado`}
          </h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white transition-colors" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        {etapa === "formulario" && (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1" htmlFor="cg-nome">
                  Nome do {termo.grupo.toLowerCase()} *
                </label>
                <input id="cg-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                  placeholder={`Nome do ${termo.grupo.toLowerCase()}`} />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1" htmlFor="cg-resp">
                  Nome do responsavel
                </label>
                <input id="cg-resp" type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                  placeholder="Nome do diretor / responsavel" />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1" htmlFor="cg-tel">
                  Telefone / WhatsApp
                </label>
                <input id="cg-tel" type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                  placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1" htmlFor="cg-email">
                  E-mail do responsavel *
                </label>
                <input id="cg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                  placeholder="email@exemplo.com" />
                <p className="text-xs text-neutral-600 mt-1">
                  O Supabase enviara um convite automaticamente para este e-mail.
                </p>
              </div>

              {erro && (
                <p className="flex items-start gap-2 text-xs text-red-400">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {erro}
                </p>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
              <button onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors">
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando}
                className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
                {salvando && <Loader2 size={14} className="animate-spin" />}
                Cadastrar e convidar
              </button>
            </div>
          </>
        )}

        {/* Confirmacao */}
        {etapa === "confirmacao" && escolaSalva && (
          <>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-4 bg-axon-green-dim border border-axon-green/20 rounded-lg">
                <CheckCircle2 size={18} className="text-axon-green shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{escolaSalva.nome} cadastrado</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Convite enviado para <span className="text-white">{email}</span>
                  </p>
                </div>
              </div>

              {erro && (
                <p className="flex items-start gap-2 text-xs text-amber-400">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {erro}
                </p>
              )}

              <div>
                <p className="text-xs text-neutral-500 mb-3">
                  Alem do e-mail, voce pode compartilhar o acesso manualmente:
                </p>
                <div className="space-y-2">
                  <button onClick={copiarLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors">
                    {copiado ? <Check size={15} className="text-axon-green" /> : <Copy size={15} />}
                    {copiado ? "Link copiado" : "Copiar link de acesso"}
                  </button>
                  <button onClick={abrirWhatsApp}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors">
                    <MessageCircle size={15} />
                    Enviar pelo WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-axon-border">
              <button onClick={onClose}
                className="w-full px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-semibold hover:opacity-90 transition-opacity">
                Concluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Card de Grupo (expansivel) ─────────────────────────────────────────────

interface CardGrupoProps {
  escola: EscolaComDados;
  termo: Terminologia;
  onEdit: (escola: EscolaComDados) => void;
  onDelete: (escola: EscolaComDados) => void;
}

function CardGrupo({ escola, termo, onEdit, onDelete }: CardGrupoProps) {
  const [expandido, setExpandido] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"apresentacoes" | "participantes">("apresentacoes");

  const totalCoreos = escola.coreografias.length;
  const totalBailarinos = escola.bailarinos.length;
  const totalValor = escola.coreografias.reduce((acc, c) => acc + (c.valor_total ?? 0), 0);
  const totalPago = escola.coreografias
    .filter((c) => c.status_pagamento === "pago")
    .reduce((acc, c) => acc + (c.valor_total ?? 0), 0);
  const totalPendente = totalValor - totalPago;
  const tudoPago = totalPendente === 0 && totalCoreos > 0;

  return (
    <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
      {/* Header do card */}
      <div
        role="button"
        onClick={() => setExpandido((p) => !p)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-white truncate">{escola.nome}</span>
            {tudoPago ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-axon-green-dim text-axon-green">
                <CheckCircle2 size={11} /> Quitado
              </span>
            ) : totalPendente > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-axon-gold-dim text-axon-gold">
                <Clock3 size={11} /> Pendente
              </span>
            ) : null}
          </div>
          {escola.responsavel && (
            <p className="text-xs text-neutral-500 mt-0.5">{escola.responsavel}</p>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-xs text-neutral-500">{termo.apresentacao}s</p>
            <p className="text-sm font-semibold text-white tabular-nums">{totalCoreos}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500">{termo.participante}s</p>
            <p className="text-sm font-semibold text-white tabular-nums">{totalBailarinos}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-sm font-semibold text-white tabular-nums">{formatMoeda(totalValor)}</p>
          </div>
          {totalPendente > 0 && (
            <div className="text-center">
              <p className="text-xs text-neutral-500">A receber</p>
              <p className="text-sm font-semibold text-axon-gold tabular-nums">{formatMoeda(totalPendente)}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(escola); }}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Editar escola"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(escola); }}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Excluir escola"
          >
            <Trash2 size={16} />
          </button>
          <div className="text-neutral-500">
            {expandido ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </div>
      </div>

      {/* Resumo mobile */}
      <div className="sm:hidden flex items-center gap-4 px-5 pb-3 text-xs text-neutral-500">
        <span>{totalCoreos} {termo.apresentacao.toLowerCase()}s</span>
        <span>{totalBailarinos} {termo.participante.toLowerCase()}s</span>
        <span className="ml-auto tabular-nums">{formatMoeda(totalValor)}</span>
      </div>

      {/* Conteudo expandido */}
      {expandido && (
        <div className="border-t border-axon-border">
          <div className="flex border-b border-axon-border px-5">
            {([
              { id: "apresentacoes", label: `${termo.apresentacao}s` },
              { id: "participantes", label: `${termo.participante}s` },
            ] as const).map(({ id, label }) => (
              <button key={id} onClick={() => setAbaAtiva(id)}
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  abaAtiva === id
                    ? "border-axon-gold text-axon-gold"
                    : "border-transparent text-neutral-500 hover:text-white"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Aba Apresentacoes */}
          {abaAtiva === "apresentacoes" && (
            <div className="p-5">
              {escola.coreografias.length === 0 ? (
                <p className="text-sm text-neutral-600 text-center py-6">
                  Nenhuma {termo.apresentacao.toLowerCase()} inscrita.
                </p>
              ) : (
                <div className="space-y-3">
                  {escola.coreografias.map((c) => {
                    const participantesNaCoreo = escola.elenco
                      .filter((e) => e.coreografia_id === c.id)
                      .map((e) => escola.bailarinos.find((b) => b.id === e.bailarino_id))
                      .filter(Boolean) as Bailarino[];

                    return (
                      <div key={c.id} className="bg-axon-bg border border-axon-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{c.nome}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs text-neutral-500 capitalize">{c.tipo}</span>
                              {c.categoria && c.categoria !== "Geral" && (
                                <>
                                  <span className="text-neutral-700">·</span>
                                  <span className="text-xs text-neutral-500">{c.categoria}</span>
                                </>
                              )}
                              <span className="text-neutral-700">·</span>
                              <span className="text-xs text-neutral-500">
                                {c.quantidade_bailarinos} {termo.participante.toLowerCase()}{c.quantidade_bailarinos !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-sm font-semibold text-white tabular-nums">
                              {formatMoeda(c.valor_total ?? 0)}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.status_pagamento === "pago"
                                ? "bg-axon-green-dim text-axon-green"
                                : "bg-axon-gold-dim text-axon-gold"
                            }`}>
                              {c.status_pagamento === "pago" ? "Pago" : "Pendente"}
                            </span>
                          </div>
                        </div>

                        {participantesNaCoreo.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-axon-border/50">
                            <p className="text-xs text-neutral-500 mb-2">
                              {termo.participante}s
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {participantesNaCoreo.map((b) => (
                                <span key={b.id}
                                  className="text-xs bg-white/5 border border-axon-border rounded-full px-2.5 py-1 text-neutral-300">
                                  {b.nome}
                                </span>
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

          {/* Aba Participantes */}
          {abaAtiva === "participantes" && (
            <div className="p-5">
              {escola.bailarinos.length === 0 ? (
                <p className="text-sm text-neutral-600 text-center py-6">
                  Nenhum {termo.participante.toLowerCase()} cadastrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {escola.bailarinos.map((b) => {
                    const apresentacoesDoP = escola.elenco
                      .filter((e) => e.bailarino_id === b.id)
                      .map((e) => escola.coreografias.find((c) => c.id === e.coreografia_id))
                      .filter(Boolean) as Coreografia[];

                    return (
                      <div key={b.id} className="bg-axon-bg border border-axon-border rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{b.nome}</p>
                            {b.cpf && (
                              <p className="text-xs text-neutral-500 tabular-nums mt-0.5">
                                {cpfFormatado(b.cpf)}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0">
                            {b.termo_assinado ? (
                              <span className="text-xs text-axon-green">Termo OK</span>
                            ) : (
                              <span className="text-xs text-neutral-600">Sem termo</span>
                            )}
                          </div>
                        </div>

                        {apresentacoesDoP.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {apresentacoesDoP.map((c) => (
                              <span key={c.id}
                                className="text-xs bg-axon-gold-dim text-axon-gold rounded-full px-2.5 py-0.5 border border-axon-gold/20">
                                {c.nome}
                              </span>
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

// ── Pagina Principal ───────────────────────────────────────────────────────

export default function InscricoesPage() {
  const supabase = createClient();

  const [escolasComDados, setEscolasComDados] = useState<EscolaComDados[]>([]);
  const [termo, setTermo] = useState<Terminologia>({
    grupo: "Escola",
    participante: "Bailarino",
    apresentacao: "Coreografia",
    inscricao: "Inscricao",
    organizacao: "Organizacao",
  });
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalGrupo, setModalGrupo] = useState(false);
  const [editarEscola, setEditarEscola] = useState<Escola | null>(null);

  const [kpis, setKpis] = useState({
    grupos: 0,
    apresentacoes: 0,
    participantes: 0,
    totalPago: 0,
    totalPendente: 0,
  });

  const carregar = useCallback(async () => {
    setCarregando(true);

    const [
      { data: config },
      { data: escolas },
      { data: coreografias },
      { data: bailarinos },
      { data: elenco },
    ] = await Promise.all([
      supabase.from("tenant_config").select("termo_grupo, termo_participante, termo_apresentacao, termo_inscricao, nome_organizacao").single(),
      supabase.from("escolas").select("*").order("nome"),
      supabase.from("coreografias").select("*").order("created_at", { ascending: false }),
      supabase.from("bailarinos").select("*").order("nome"),
      supabase.from("coreografia_elenco").select("*"),
    ]);

    if (config) {
      setTermo({
        grupo:        (config as Record<string, string>).termo_grupo        || "Escola",
        participante: (config as Record<string, string>).termo_participante || "Bailarino",
        apresentacao: (config as Record<string, string>).termo_apresentacao || "Coreografia",
        inscricao:    (config as Record<string, string>).termo_inscricao    || "Inscricao",
        organizacao:  (config as Record<string, string>).nome_organizacao   || "Organizacao",
      });
    }

    const escolasArr = (escolas as Escola[]) ?? [];
    const coreosArr  = (coreografias as Coreografia[]) ?? [];
    const bailArr    = (bailarinos as Bailarino[]) ?? [];
    const elencoArr  = (elenco as ElencoRow[]) ?? [];

    const compostas: EscolaComDados[] = escolasArr.map((e) => ({
      ...e,
      coreografias: coreosArr.filter((c) => c.escola_id === e.id),
      bailarinos:   bailArr.filter((b) => b.escola_id === e.id),
      elenco:       elencoArr.filter((el) =>
        coreosArr.filter((c) => c.escola_id === e.id).some((c) => c.id === el.coreografia_id)
      ),
    }));

    setEscolasComDados(compostas);

    const totalPago = coreosArr
      .filter((c) => c.status_pagamento === "pago")
      .reduce((acc, c) => acc + (c.valor_total ?? 0), 0);
    const totalPendente = coreosArr
      .filter((c) => c.status_pagamento === "pendente")
      .reduce((acc, c) => acc + (c.valor_total ?? 0), 0);

    setKpis({
      grupos:        escolasArr.length,
      apresentacoes: coreosArr.length,
      participantes: bailArr.length,
      totalPago,
      totalPendente,
    });

    setCarregando(false);
  }, [supabase]);

  useEffect(() => { carregar(); }, [carregar]);

  const gruposFiltrados = escolasComDados.filter((e) =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (e.responsavel ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      {modalGrupo && (
        <ModalCadastrarGrupo
          termo={termo}
          escola={editarEscola}
          onClose={() => { setModalGrupo(false); setEditarEscola(null); }}
          onSaved={() => { setEditarEscola(null); carregar(); }}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {termo.inscricao}s e Elenco
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Visualize as {termo.inscricao.toLowerCase()}s por {termo.grupo.toLowerCase()}, {termo.apresentacao.toLowerCase()}s e {termo.participante.toLowerCase()}s participantes.
            </p>
          </div>
          <button
            onClick={() => setModalGrupo(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-axon-border text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus size={14} />
            Cadastrar {termo.grupo.toLowerCase()}
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: `${termo.grupo}s`,        value: kpis.grupos.toString(),             icon: Users,            cor: "" },
            { label: `${termo.apresentacao}s`, value: kpis.apresentacoes.toString(),      icon: Music4,           cor: "" },
            { label: `${termo.participante}s`, value: kpis.participantes.toString(),      icon: Users,            cor: "" },
            { label: "Total pago",             value: formatMoeda(kpis.totalPago),        icon: CircleDollarSign, cor: "green" },
            { label: "A receber",              value: formatMoeda(kpis.totalPendente),    icon: CircleDollarSign, cor: "gold" },
          ].map(({ label, value, icon: Icon, cor }) => (
            <div key={label} className="bg-axon-panel border border-axon-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={cor === "green" ? "text-axon-green" : cor === "gold" ? "text-axon-gold" : "text-neutral-500"} />
                <p className="text-xs text-neutral-500">{label}</p>
              </div>
              <p className={`text-lg font-semibold tabular-nums ${
                cor === "green" ? "text-axon-green" : cor === "gold" ? "text-axon-gold" : "text-white"
              }`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Busca */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar ${termo.grupo.toLowerCase()} ou responsavel...`}
            className="w-full bg-axon-panel border border-axon-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
          />
        </div>

        {/* Lista de grupos */}
        {carregando ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-axon-panel border border-axon-border rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : gruposFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
            <Users size={36} className="mb-3 opacity-30" />
            <p className="text-sm">
              {busca
                ? `Nenhum ${termo.grupo.toLowerCase()} encontrado para esta busca.`
                : `Nenhum ${termo.grupo.toLowerCase()} cadastrado ainda.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gruposFiltrados.map((escola) => (
              <CardGrupo
                key={escola.id}
                escola={escola}
                termo={termo}
                onEdit={(escola) => { setEditarEscola(escola); setModalGrupo(true); }}
                onDelete={async (escola) => {
                  if (!confirm(`Excluir ${escola.nome}? Esta ação não pode ser desfeita.`)) return;
                  const { error } = await supabase.from("escolas").delete().eq("id", escola.id);
                  if (error) {
                    alert(`Erro ao excluir escola: ${error.message}`);
                    return;
                  }
                  carregar();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}