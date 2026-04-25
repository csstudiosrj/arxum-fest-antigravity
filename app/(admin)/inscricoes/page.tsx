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
  UserPlus,
  Loader2,
  AlertCircle,
  Building2,
  Users,
  Music4,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────

type StatusPagamento = "pago" | "pendente";

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

// ── Masks ──────────────────────────────────────────────────────────────────

function maskCPF(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskDate(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2");
}

function dateMaskToISO(masked: string): string {
  const [d, m, y] = masked.split("/");
  if (!d || !m || !y || y.length < 4) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function formatMoeda(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function cpfFormatado(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// ── Modal Bailarino ────────────────────────────────────────────────────────

interface ModalBailarinoProps {
  escolaId: string;
  onClose: () => void;
  onSaved: (b: Bailarino) => void;
}

function ModalBailarino({ escolaId, onClose, onSaved }: ModalBailarinoProps) {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [termoAssinado, setTermoAssinado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) { setErro("Nome obrigatorio."); return; }
    setSalvando(true);
    const { data, error } = await supabase
      .from("bailarinos")
      .insert({
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ""),
        data_nascimento: dateMaskToISO(dataNasc) || null,
        escola_id: escolaId,
        termo_assinado: termoAssinado,
      })
      .select()
      .single();
    setSalvando(false);
    if (error) { setErro(error.message); return; }
    onSaved(data as Bailarino);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">Cadastrar Bailarino</h3>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white transition-colors" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1" htmlFor="mb-nome">Nome completo *</label>
            <input id="mb-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
              placeholder="Nome do bailarino" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1" htmlFor="mb-cpf">CPF</label>
            <input id="mb-cpf" type="text" value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
              placeholder="000.000.000-00" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1" htmlFor="mb-nasc">Data de nascimento</label>
            <input id="mb-nasc" type="text" value={dataNasc} onChange={(e) => setDataNasc(maskDate(e.target.value))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
              placeholder="dd/mm/aaaa" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={termoAssinado} onChange={(e) => setTermoAssinado(e.target.checked)}
              className="w-4 h-4 accent-axon-gold rounded" />
            <span className="text-sm text-neutral-300">Termo assinado</span>
          </label>
          {erro && (
            <p className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle size={14} /> {erro}
            </p>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors">
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando}
            className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
            {salvando && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Cadastro Manual (emergencia) ─────────────────────────────────────

interface ModalCadastroManualProps {
  onClose: () => void;
  onSaved: () => void;
}

function ModalCadastroManual({ onClose, onSaved }: ModalCadastroManualProps) {
  const supabase = createClient();

  // Escola
  const [nomeEscola, setNomeEscola] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [escolaExistente, setEscolaExistente] = useState<Escola | null>(null);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [modoEscola, setModoEscola] = useState<"nova" | "existente">("existente");

  // Coreografia
  const [nomeCoreo, setNomeCoreo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("solo");
  const [qtd, setQtd] = useState(1);
  const [valor, setValor] = useState("");
  const [status, setStatus] = useState<StatusPagamento>("pendente");

  // Elenco
  const [bailarinosDaEscola, setBailarinos] = useState<Bailarino[]>([]);
  const [elencoSelecionado, setElencoSelecionado] = useState<string[]>([]);
  const [modalBailarino, setModalBailarino] = useState(false);

  const [etapa, setEtapa] = useState<"escola" | "coreografia">("escola");
  const [escolaConfirmada, setEscolaConfirmada] = useState<Escola | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("escolas").select("*").order("nome").then(({ data }) => setEscolas((data as Escola[]) ?? []));
  }, [supabase]);

  useEffect(() => {
    if (!escolaConfirmada) return;
    supabase.from("bailarinos").select("*").eq("escola_id", escolaConfirmada.id).order("nome")
      .then(({ data }) => setBailarinos((data as Bailarino[]) ?? []));
  }, [supabase, escolaConfirmada]);

  async function confirmarEscola() {
    setErro(null);
    if (modoEscola === "existente") {
      if (!escolaExistente) { setErro("Selecione uma escola."); return; }
      setEscolaConfirmada(escolaExistente);
      setEtapa("coreografia");
      return;
    }
    if (!nomeEscola.trim()) { setErro("Nome da escola obrigatorio."); return; }
    setSalvando(true);
    const { data, error } = await supabase
      .from("escolas")
      .insert({ nome: nomeEscola.trim(), responsavel: responsavel.trim(), telefone, email })
      .select().single();
    setSalvando(false);
    if (error) { setErro(error.message); return; }
    setEscolaConfirmada(data as Escola);
    setEtapa("coreografia");
  }

  async function salvarCoreografia() {
    setErro(null);
    if (!nomeCoreo.trim()) { setErro("Nome da coreografia obrigatorio."); return; }
    if (!escolaConfirmada) return;
    setSalvando(true);

    const valorNum = parseFloat(valor.replace(",", ".")) || 0;
    const { data: coreo, error: coreoErr } = await supabase
      .from("coreografias")
      .insert({
        nome: nomeCoreo.trim(),
        categoria: categoria.trim() || "Geral",
        escola_id: escolaConfirmada.id,
        tipo,
        quantidade_bailarinos: qtd,
        valor_total: valorNum,
        status_pagamento: status,
      })
      .select().single();

    if (coreoErr) { setErro(coreoErr.message); setSalvando(false); return; }

    if (elencoSelecionado.length > 0) {
      await supabase.from("coreografia_elenco").insert(
        elencoSelecionado.map((bid) => ({ coreografia_id: coreo.id, bailarino_id: bid }))
      );
    }

    setSalvando(false);
    onSaved();
  }

  return (
    <>
      {modalBailarino && escolaConfirmada && (
        <ModalBailarino
          escolaId={escolaConfirmada.id}
          onClose={() => setModalBailarino(false)}
          onSaved={(b) => { setBailarinos((p) => [...p, b]); setModalBailarino(false); }}
        />
      )}

      <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10 px-4">
        <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-xl shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
            <div>
              <h2 className="text-base font-semibold text-white">Cadastro Manual de Emergencia</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {etapa === "escola" ? "Etapa 1 de 2 — Escola" : `Etapa 2 de 2 — Coreografia (${escolaConfirmada?.nome})`}
              </p>
            </div>
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white transition-colors" aria-label="Fechar">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">

            {/* ── Etapa 1: Escola ── */}
            {etapa === "escola" && (
              <>
                <div className="flex gap-2">
                  {(["existente", "nova"] as const).map((m) => (
                    <button key={m} onClick={() => setModoEscola(m)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        modoEscola === m
                          ? "border-axon-gold bg-axon-gold/10 text-axon-gold"
                          : "border-axon-border text-neutral-400 hover:text-white"
                      }`}>
                      {m === "existente" ? "Escola ja cadastrada" : "Nova escola"}
                    </button>
                  ))}
                </div>

                {modoEscola === "existente" ? (
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1" htmlFor="esc-sel">Selecionar escola</label>
                    <select id="esc-sel" value={escolaExistente?.id ?? ""}
                      onChange={(e) => setEscolaExistente(escolas.find((x) => x.id === e.target.value) ?? null)}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold transition-colors">
                      <option value="">Selecione...</option>
                      {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { id: "esc-nome", label: "Nome da escola *", value: nomeEscola, set: setNomeEscola, placeholder: "Nome da escola" },
                      { id: "esc-resp", label: "Responsavel", value: responsavel, set: setResponsavel, placeholder: "Nome do diretor/responsavel" },
                      { id: "esc-tel",  label: "Telefone", value: telefone, set: setTelefone, placeholder: "(00) 00000-0000" },
                      { id: "esc-email",label: "E-mail", value: email, set: setEmail, placeholder: "email@escola.com" },
                    ].map(({ id, label, value, set, placeholder }) => (
                      <div key={id}>
                        <label className="block text-xs text-neutral-400 mb-1" htmlFor={id}>{label}</label>
                        <input id={id} type="text" value={value} onChange={(e) => set(e.target.value)}
                          className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                          placeholder={placeholder} />
                      </div>
                    ))}
                  </div>
                )}

                {erro && <p className="flex items-center gap-2 text-xs text-red-400"><AlertCircle size={14} />{erro}</p>}
              </>
            )}

            {/* ── Etapa 2: Coreografia ── */}
            {etapa === "coreografia" && (
              <>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1" htmlFor="cm-nome">Nome da coreografia *</label>
                  <input id="cm-nome" type="text" value={nomeCoreo} onChange={(e) => setNomeCoreo(e.target.value)}
                    className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                    placeholder="Ex: Alma Livre" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1" htmlFor="cm-cat">
                    Categoria <span className="text-neutral-600">(opcional)</span>
                  </label>
                  <input id="cm-cat" type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                    placeholder="Ex: Infantil, Juvenil..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1" htmlFor="cm-tipo">Tipo</label>
                    <select id="cm-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold transition-colors">
                      <option value="solo">Solo</option>
                      <option value="duo">Duo</option>
                      <option value="conjunto">Conjunto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1" htmlFor="cm-qtd">Qtd. bailarinos</label>
                    <input id="cm-qtd" type="number" min={1} value={qtd} onChange={(e) => setQtd(Number(e.target.value))}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1" htmlFor="cm-valor">Valor total (R$)</label>
                    <input id="cm-valor" type="text" value={valor} onChange={(e) => setValor(e.target.value.replace(/[^0-9,\.]/g, ""))}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                      placeholder="0,00" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1" htmlFor="cm-status">Status pagamento</label>
                    <select id="cm-status" value={status} onChange={(e) => setStatus(e.target.value as StatusPagamento)}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold transition-colors">
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago</option>
                    </select>
                  </div>
                </div>

                {/* Elenco */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-400">Elenco — {bailarinosDaEscola.length} bailarinos cadastrados</span>
                    <button type="button" onClick={() => setModalBailarino(true)}
                      className="flex items-center gap-1 text-xs text-axon-gold hover:opacity-80 transition-opacity">
                      <UserPlus size={13} /> Novo bailarino
                    </button>
                  </div>
                  {bailarinosDaEscola.length === 0 ? (
                    <p className="text-xs text-neutral-600 bg-axon-bg border border-axon-border rounded-lg px-3 py-3">
                      Nenhum bailarino cadastrado para esta escola.
                    </p>
                  ) : (
                    <div className="bg-axon-bg border border-axon-border rounded-lg divide-y divide-axon-border max-h-44 overflow-y-auto">
                      {bailarinosDaEscola.map((b) => (
                        <label key={b.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/[0.03] transition-colors">
                          <input type="checkbox" checked={elencoSelecionado.includes(b.id)}
                            onChange={() => setElencoSelecionado((p) => p.includes(b.id) ? p.filter((x) => x !== b.id) : [...p, b.id])}
                            className="w-4 h-4 accent-axon-gold rounded" />
                          <span className="text-sm text-white">{b.nome}</span>
                          {b.cpf && <span className="text-xs text-neutral-500 ml-auto tabular-nums">{cpfFormatado(b.cpf)}</span>}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {erro && <p className="flex items-center gap-2 text-xs text-red-400"><AlertCircle size={14} />{erro}</p>}
              </>
            )}
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
            {etapa === "coreografia" && (
              <button onClick={() => { setEtapa("escola"); setErro(null); }}
                className="px-4 py-2 rounded-lg border border-axon-border text-sm text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors">
                Voltar
              </button>
            )}
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg border border-axon-border text-sm text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors">
              Cancelar
            </button>
            <button
              onClick={etapa === "escola" ? confirmarEscola : salvarCoreografia}
              disabled={salvando}
              className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
              {salvando && <Loader2 size={14} className="animate-spin" />}
              {etapa === "escola" ? "Continuar" : "Confirmar inscricao"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Card de Escola (expansivel) ────────────────────────────────────────────

interface CardEscolaProps {
  escola: EscolaComDados;
}

function CardEscola({ escola }: CardEscolaProps) {
  const [expandido, setExpandido] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"coreografias" | "bailarinos">("coreografias");

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
      <button
        onClick={() => setExpandido((p) => !p)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
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
            <p className="text-xs text-neutral-500">Coreografias</p>
            <p className="text-sm font-semibold text-white tabular-nums">{totalCoreos}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500">Bailarinos</p>
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

        <div className="text-neutral-500 shrink-0">
          {expandido ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {/* Resumo mobile */}
      <div className="sm:hidden flex items-center gap-4 px-5 pb-3 text-xs text-neutral-500">
        <span>{totalCoreos} coreografias</span>
        <span>{totalBailarinos} bailarinos</span>
        <span className="ml-auto tabular-nums">{formatMoeda(totalValor)}</span>
      </div>

      {/* Conteudo expandido */}
      {expandido && (
        <div className="border-t border-axon-border">
          {/* Tabs internas */}
          <div className="flex border-b border-axon-border px-5">
            {(["coreografias", "bailarinos"] as const).map((aba) => (
              <button key={aba} onClick={() => setAbaAtiva(aba)}
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors capitalize ${
                  abaAtiva === aba
                    ? "border-axon-gold text-axon-gold"
                    : "border-transparent text-neutral-500 hover:text-white"
                }`}>
                {aba}
              </button>
            ))}
          </div>

          {/* Aba Coreografias */}
          {abaAtiva === "coreografias" && (
            <div className="p-5">
              {escola.coreografias.length === 0 ? (
                <p className="text-sm text-neutral-600 text-center py-6">Nenhuma coreografia inscrita.</p>
              ) : (
                <div className="space-y-3">
                  {escola.coreografias.map((c) => {
                    const bailarinosNaCoreo = escola.elenco
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
                              <span className="text-xs text-neutral-500">{c.quantidade_bailarinos} bailarino{c.quantidade_bailarinos !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-sm font-semibold text-white tabular-nums">{formatMoeda(c.valor_total ?? 0)}</span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.status_pagamento === "pago"
                                ? "bg-axon-green-dim text-axon-green"
                                : "bg-axon-gold-dim text-axon-gold"
                            }`}>
                              {c.status_pagamento === "pago" ? "Pago" : "Pendente"}
                            </span>
                          </div>
                        </div>

                        {bailarinosNaCoreo.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-axon-border/50">
                            <p className="text-xs text-neutral-500 mb-2">Elenco</p>
                            <div className="flex flex-wrap gap-2">
                              {bailarinosNaCoreo.map((b) => (
                                <span key={b.id} className="text-xs bg-white/5 border border-axon-border rounded-full px-2.5 py-1 text-neutral-300">
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

          {/* Aba Bailarinos */}
          {abaAtiva === "bailarinos" && (
            <div className="p-5">
              {escola.bailarinos.length === 0 ? (
                <p className="text-sm text-neutral-600 text-center py-6">Nenhum bailarino cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {escola.bailarinos.map((b) => {
                    const coreografiasDoB = escola.elenco
                      .filter((e) => e.bailarino_id === b.id)
                      .map((e) => escola.coreografias.find((c) => c.id === e.coreografia_id))
                      .filter(Boolean) as Coreografia[];

                    return (
                      <div key={b.id} className="bg-axon-bg border border-axon-border rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{b.nome}</p>
                            {b.cpf && (
                              <p className="text-xs text-neutral-500 tabular-nums mt-0.5">{cpfFormatado(b.cpf)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {b.termo_assinado ? (
                              <span className="text-xs text-axon-green">Termo OK</span>
                            ) : (
                              <span className="text-xs text-neutral-600">Sem termo</span>
                            )}
                          </div>
                        </div>

                        {coreografiasDoB.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {coreografiasDoB.map((c) => (
                              <span key={c.id} className="text-xs bg-axon-gold-dim text-axon-gold rounded-full px-2.5 py-0.5 border border-axon-gold/20">
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
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalEmergencia, setModalEmergencia] = useState(false);

  // KPIs globais
  const [kpis, setKpis] = useState({
    escolas: 0,
    coreografias: 0,
    bailarinos: 0,
    totalPago: 0,
    totalPendente: 0,
  });

  const carregar = useCallback(async () => {
    setCarregando(true);

    const [
      { data: escolas },
      { data: coreografias },
      { data: bailarinos },
      { data: elenco },
    ] = await Promise.all([
      supabase.from("escolas").select("*").order("nome"),
      supabase.from("coreografias").select("*").order("created_at", { ascending: false }),
      supabase.from("bailarinos").select("*").order("nome"),
      supabase.from("coreografia_elenco").select("*"),
    ]);

    const escolasArr = (escolas as Escola[]) ?? [];
    const coreosArr = (coreografias as Coreografia[]) ?? [];
    const bailArr = (bailarinos as Bailarino[]) ?? [];
    const elencoArr = (elenco as ElencoRow[]) ?? [];

    const compostas: EscolaComDados[] = escolasArr.map((e) => ({
      ...e,
      coreografias: coreosArr.filter((c) => c.escola_id === e.id),
      bailarinos: bailArr.filter((b) => b.escola_id === e.id),
      elenco: elencoArr.filter((el) =>
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
      escolas: escolasArr.length,
      coreografias: coreosArr.length,
      bailarinos: bailArr.length,
      totalPago,
      totalPendente,
    });

    setCarregando(false);
  }, [supabase]);

  useEffect(() => { carregar(); }, [carregar]);

  const escolasFiltradas = escolasComDados.filter((e) =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (e.responsavel ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      {modalEmergencia && (
        <ModalCadastroManual
          onClose={() => setModalEmergencia(false)}
          onSaved={() => { setModalEmergencia(false); carregar(); }}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6 p-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Inscricoes e Elenco</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Visualize as inscricoes por escola, coreografias e bailarinos participantes.
            </p>
          </div>
          <button
            onClick={() => setModalEmergencia(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-axon-border text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus size={14} />
            Cadastro manual
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Escolas",       value: kpis.escolas.toString(),           icon: Building2,         cor: "" },
            { label: "Coreografias",  value: kpis.coreografias.toString(),       icon: Music4,            cor: "" },
            { label: "Bailarinos",    value: kpis.bailarinos.toString(),          icon: Users,             cor: "" },
            { label: "Total pago",    value: formatMoeda(kpis.totalPago),         icon: CircleDollarSign,  cor: "green" },
            { label: "A receber",     value: formatMoeda(kpis.totalPendente),     icon: CircleDollarSign,  cor: "gold" },
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
            placeholder="Buscar escola ou responsavel..."
            className="w-full bg-axon-panel border border-axon-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
          />
        </div>

        {/* Lista de escolas */}
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
        ) : escolasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
            <Building2 size={36} className="mb-3 opacity-30" />
            <p className="text-sm">
              {busca ? "Nenhuma escola encontrada para esta busca." : "Nenhuma escola inscrita ainda."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {escolasFiltradas.map((escola) => (
              <CardEscola key={escola.id} escola={escola} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}