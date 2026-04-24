"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search, Filter, MoreHorizontal, Users, Music,
  DollarSign, CheckCircle2, Clock, Loader2, X, Plus,
  ChevronRight, ChevronLeft, Building2, UserPlus, Trash2
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Coreografia = {
  id: string; nome: string; categoria: string; tipo: string;
  quantidade_bailarinos: number | null; valor_total: number | null;
  status_pagamento: string | null; escolas: { nome: string } | null;
};

type Bailarino = {
  id: string; nome: string; data_nascimento: string;
  cpf: string | null; termo_assinado: boolean | null;
  escolas: { nome: string } | null; inscricoes_count?: number;
};

type Escola = { id: string; nome: string; responsavel: string | null; email: string; };
type Categoria = { id: string; nome: string; valor_solo: number | null; valor_duo: number | null; valor_conjunto: number | null; };
type BailarinoElenco = { id?: string; nome: string; cpf: string; data_nascimento: string; ja_existe: boolean; };

type KPIs = { total_coreografias: number; bailarinos_unicos: number; receita_confirmada: number; };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcularIdade(data: string) {
  const hoje = new Date(); const nasc = new Date(data);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje.getMonth() - nasc.getMonth() < 0 || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatarReais(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcularValor(cat: Categoria | null, tipo: string): number {
  if (!cat) return 0;
  if (tipo === "Solo") return cat.valor_solo ?? 0;
  if (tipo === "Duo") return cat.valor_duo ?? 0;
  return cat.valor_conjunto ?? 0;
}

// ─── Modal Nova Inscrição ─────────────────────────────────────────────────────

function ModalNovaInscricao({ onClose, onSucesso, eventoId }: {
  onClose: () => void; onSucesso: () => void; eventoId: string | null;
}) {
  const supabase = createClient();
  const [etapa, setEtapa] = useState(1);
  const [salvando, setSalvando] = useState(false);

  // Etapa 1 — Escola
  const [buscaEscola, setBuscaEscola] = useState("");
  const [escolasEncontradas, setEscolasEncontradas] = useState<Escola[]>([]);
  const [escolaSelecionada, setEscolaSelecionada] = useState<Escola | null>(null);
  const [novaEscola, setNovaEscola] = useState({ nome: "", email: "", responsavel: "" });
  const [modoNovaEscola, setModoNovaEscola] = useState(false);
  const [buscandoEscola, setBuscandoEscola] = useState(false);

  // Etapa 2 — Coreografia
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);
  const [formCor, setFormCor] = useState({ nome: "", tipo: "Solo", quantidade_bailarinos: 1 });

  // Etapa 3 — Elenco
  const [elenco, setElenco] = useState<BailarinoElenco[]>([]);
  const [buscaCpf, setBuscaCpf] = useState("");
  const [novoBailarino, setNovoBailarino] = useState({ nome: "", cpf: "", data_nascimento: "" });
  const [buscandoBailarino, setBuscandoBailarino] = useState(false);
  const [erroBailarino, setErroBailarino] = useState("");

  // Etapa 4 — Pagamento
  const [statusPagamento, setStatusPagamento] = useState("pendente");

  const valorTotal = calcularValor(categoriaSelecionada, formCor.tipo);

  // Busca escolas
  useEffect(() => {
    if (buscaEscola.length < 2) { setEscolasEncontradas([]); return; }
    setBuscandoEscola(true);
    const timeout = setTimeout(async () => {
      const { data } = await supabase.from("escolas").select("id, nome, responsavel, email").ilike("nome", `%${buscaEscola}%`).limit(5);
      setEscolasEncontradas(data ?? []);
      setBuscandoEscola(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [buscaEscola, supabase]);

  // Carrega categorias do evento
  useEffect(() => {
    if (!eventoId) return;
    supabase.from("categorias").select("id, nome, valor_solo, valor_duo, valor_conjunto").eq("evento_id", eventoId)
      .then(({ data }) => setCategorias(data ?? []));
  }, [eventoId, supabase]);

  async function buscarBailarinoPorCpf() {
    if (!buscaCpf.trim()) return;
    setBuscandoBailarino(true); setErroBailarino("");
    const { data } = await supabase.from("bailarinos").select("id, nome, cpf, data_nascimento").eq("cpf", buscaCpf.trim()).maybeSingle();
    if (data) {
      if (elenco.find((b) => b.cpf === data.cpf)) { setErroBailarino("Bailarino já adicionado."); }
      else { setElenco((prev) => [...prev, { id: data.id, nome: data.nome, cpf: data.cpf ?? "", data_nascimento: data.data_nascimento, ja_existe: true }]); setBuscaCpf(""); }
    } else {
      setNovoBailarino((p) => ({ ...p, cpf: buscaCpf }));
      setErroBailarino("CPF não encontrado. Preencha os dados abaixo para cadastrar.");
    }
    setBuscandoBailarino(false);
  }

  function adicionarNovoBailarino() {
    if (!novoBailarino.nome || !novoBailarino.cpf || !novoBailarino.data_nascimento) return;
    if (elenco.find((b) => b.cpf === novoBailarino.cpf)) { setErroBailarino("CPF já adicionado."); return; }
    setElenco((prev) => [...prev, { ...novoBailarino, ja_existe: false }]);
    setNovoBailarino({ nome: "", cpf: "", data_nascimento: "" });
    setBuscaCpf(""); setErroBailarino("");
  }

  async function salvar() {
    if (!escolaSelecionada && !modoNovaEscola) return;
    setSalvando(true);
    try {
      let escola_id = escolaSelecionada?.id ?? "";

      // Cria escola se necessário
      if (modoNovaEscola) {
        const { data, error } = await supabase.from("escolas").insert(novaEscola).select("id").single();
        if (error || !data) throw new Error("Erro ao criar escola");
        escola_id = data.id;
      }

      // Cria coreografia
      const { data: cor, error: corError } = await supabase.from("coreografias").insert({
        escola_id, evento_id: eventoId,
        nome: formCor.nome, categoria: categoriaSelecionada?.nome ?? "",
        tipo: formCor.tipo, quantidade_bailarinos: formCor.quantidade_bailarinos,
        valor_total: valorTotal, status_pagamento: statusPagamento,
      }).select("id").single();

      if (corError || !cor) throw new Error("Erro ao criar coreografia");

      // Cria bailarinos novos e monta elenco
      const bailarinoIds: string[] = [];
      for (const b of elenco) {
        if (b.ja_existe && b.id) { bailarinoIds.push(b.id); continue; }
        const { data: bd, error: be } = await supabase.from("bailarinos")
          .insert({ nome: b.nome, cpf: b.cpf, data_nascimento: b.data_nascimento, escola_id })
          .select("id").single();
        if (be || !bd) throw new Error("Erro ao cadastrar bailarino");
        bailarinoIds.push(bd.id);
      }

      // Insere elenco
      if (bailarinoIds.length > 0) {
        await supabase.from("coreografia_elenco").insert(bailarinoIds.map((id) => ({ coreografia_id: cor.id, bailarino_id: id })));
      }

      onSucesso();
    } catch (e) {
      console.error(e);
      setSalvando(false);
    }
  }

  const etapas = ["Escola", "Coreografia", "Elenco", "Confirmação"];

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={() => !salvando && onClose()} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-axon-border shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-white">Nova Inscrição Manual</h3>
              <p className="text-xs text-gray-500 mt-0.5">Etapa {etapa} de 4 — {etapas[etapa - 1]}</p>
            </div>
            {!salvando && <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>}
          </div>

          {/* Progress */}
          <div className="flex px-6 pt-4 gap-2 shrink-0">
            {etapas.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i + 1 <= etapa ? "bg-axon-green" : "bg-axon-border"}`} />
            ))}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {/* ── ETAPA 1: ESCOLA ── */}
            {etapa === 1 && (
              <>
                {!modoNovaEscola ? (
                  <>
                    <p className="text-sm text-gray-400">Busque a escola pelo nome ou cadastre uma nova.</p>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="text" placeholder="Nome da escola..." value={buscaEscola}
                        onChange={(e) => { setBuscaEscola(e.target.value); setEscolaSelecionada(null); }}
                        className="w-full bg-axon-bg border border-axon-border rounded-md pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green transition-colors" />
                    </div>
                    {buscandoEscola && <div className="flex justify-center py-2"><Loader2 size={18} className="animate-spin text-gray-400" /></div>}
                    {escolasEncontradas.length > 0 && !escolaSelecionada && (
                      <div className="bg-axon-bg border border-axon-border rounded-lg overflow-hidden">
                        {escolasEncontradas.map((e) => (
                          <button key={e.id} onClick={() => { setEscolaSelecionada(e); setBuscaEscola(e.nome); setEscolasEncontradas([]); }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition-colors border-b border-axon-border last:border-0">
                            <p className="font-medium">{e.nome}</p>
                            <p className="text-xs text-gray-500">{e.responsavel ?? e.email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    {escolaSelecionada && (
                      <div className="bg-axon-green/10 border border-axon-green/20 rounded-lg px-4 py-3 flex items-center gap-3">
                        <Building2 size={18} className="text-axon-green shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-white">{escolaSelecionada.nome}</p>
                          <p className="text-xs text-gray-400">{escolaSelecionada.responsavel ?? escolaSelecionada.email}</p>
                        </div>
                        <button onClick={() => { setEscolaSelecionada(null); setBuscaEscola(""); }} className="ml-auto text-gray-500 hover:text-white"><X size={16} /></button>
                      </div>
                    )}
                    <button onClick={() => setModoNovaEscola(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-axon-border rounded-lg text-sm text-gray-400 hover:text-white hover:border-axon-green/40 transition-colors">
                      <Plus size={16} /> Cadastrar nova escola
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setModoNovaEscola(false)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-2">
                      <ChevronLeft size={16} /> Voltar para busca
                    </button>
                    <p className="text-sm text-gray-400">Preencha os dados da nova escola.</p>
                    {[
                      { label: "Nome da Escola *", key: "nome", placeholder: "Ex: Studio Alpha Dança" },
                      { label: "E-mail *", key: "email", placeholder: "contato@escola.com" },
                      { label: "Responsável", key: "responsavel", placeholder: "Nome do responsável" },
                    ].map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-xs text-gray-400">{f.label}</label>
                        <input type="text" placeholder={f.placeholder}
                          value={novaEscola[f.key as keyof typeof novaEscola]}
                          onChange={(e) => setNovaEscola((p) => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green transition-colors" />
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {/* ── ETAPA 2: COREOGRAFIA ── */}
            {etapa === 2 && (
              <>
                <p className="text-sm text-gray-400">Informe os dados da coreografia.</p>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Nome da Coreografia *</label>
                  <input type="text" placeholder="Ex: O Despertar" value={formCor.nome}
                    onChange={(e) => setFormCor((p) => ({ ...p, nome: e.target.value }))}
                    className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Categoria *</label>
                  <select value={categoriaSelecionada?.id ?? ""}
                    onChange={(e) => setCategoriaSelecionada(categorias.find((c) => c.id === e.target.value) ?? null)}
                    className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green transition-colors">
                    <option value="">Selecione uma categoria...</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  {categorias.length === 0 && <p className="text-xs text-yellow-500">Nenhuma categoria cadastrada neste evento.</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400">Tipo *</label>
                    <select value={formCor.tipo} onChange={(e) => setFormCor((p) => ({ ...p, tipo: e.target.value }))}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green transition-colors">
                      <option>Solo</option>
                      <option>Duo</option>
                      <option>Conjunto</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400">Nº de Bailarinos</label>
                    <input type="number" min={1} value={formCor.quantidade_bailarinos}
                      onChange={(e) => setFormCor((p) => ({ ...p, quantidade_bailarinos: Number(e.target.value) }))}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green transition-colors" />
                  </div>
                </div>
                {valorTotal > 0 && (
                  <div className="bg-axon-green/10 border border-axon-green/20 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-300">Valor calculado</span>
                    <span className="text-lg font-bold text-axon-green">{formatarReais(valorTotal)}</span>
                  </div>
                )}
              </>
            )}

            {/* ── ETAPA 3: ELENCO ── */}
            {etapa === 3 && (
              <>
                <p className="text-sm text-gray-400">Adicione os bailarinos pelo CPF. Se não existir no banco, cadastre na hora.</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Digite o CPF..." value={buscaCpf}
                      onChange={(e) => { setBuscaCpf(e.target.value); setErroBailarino(""); }}
                      onKeyDown={(e) => e.key === "Enter" && buscarBailarinoPorCpf()}
                      className="w-full bg-axon-bg border border-axon-border rounded-md pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green transition-colors" />
                  </div>
                  <button onClick={buscarBailarinoPorCpf} disabled={buscandoBailarino}
                    className="bg-axon-green/10 border border-axon-green/20 text-axon-green px-4 py-2.5 rounded-md text-sm hover:bg-axon-green/20 transition-colors disabled:opacity-50">
                    {buscandoBailarino ? <Loader2 size={16} className="animate-spin" /> : "Buscar"}
                  </button>
                </div>

                {erroBailarino && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 space-y-3">
                    <p className="text-xs text-yellow-400">{erroBailarino}</p>
                    {erroBailarino.includes("Preencha") && (
                      <div className="space-y-2">
                        {[
                          { label: "Nome completo *", key: "nome", type: "text", placeholder: "Nome do bailarino" },
                          { label: "Data de nascimento *", key: "data_nascimento", type: "date", placeholder: "" },
                        ].map((f) => (
                          <input key={f.key} type={f.type} placeholder={f.placeholder}
                            value={novoBailarino[f.key as keyof typeof novoBailarino]}
                            onChange={(e) => setNovoBailarino((p) => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full bg-axon-bg border border-axon-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-green transition-colors" />
                        ))}
                        <button onClick={adicionarNovoBailarino}
                          className="w-full flex items-center justify-center gap-2 bg-axon-green text-black font-semibold py-2 rounded-md text-sm hover:bg-axon-green/90 transition-colors">
                          <UserPlus size={16} /> Cadastrar e Adicionar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {elenco.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{elenco.length} bailarino(s) adicionado(s)</p>
                    {elenco.map((b, i) => (
                      <div key={i} className="flex items-center gap-3 bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-axon-border flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                          {b.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{b.nome}</p>
                          <p className="text-xs text-gray-500">{b.cpf} · {calcularIdade(b.data_nascimento)} anos {b.ja_existe ? "· já cadastrado" : "· novo"}</p>
                        </div>
                        <button onClick={() => setElenco((prev) => prev.filter((_, idx) => idx !== i))} className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── ETAPA 4: CONFIRMAÇÃO ── */}
            {etapa === 4 && (
              <>
                <p className="text-sm text-gray-400">Revise os dados antes de salvar.</p>
                <div className="bg-axon-bg border border-axon-border rounded-xl divide-y divide-axon-border overflow-hidden">
                  {[
                    { label: "Escola", value: escolaSelecionada?.nome ?? novaEscola.nome },
                    { label: "Coreografia", value: formCor.nome },
                    { label: "Categoria", value: `${categoriaSelecionada?.nome ?? "—"} · ${formCor.tipo}` },
                    { label: "Bailarinos", value: `${elenco.length} no elenco` },
                    { label: "Valor Total", value: formatarReais(valorTotal) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-sm text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Status do Pagamento</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["pendente", "pago"].map((s) => (
                      <button key={s} onClick={() => setStatusPagamento(s)}
                        className={`py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize ${statusPagamento === s ? (s === "pago" ? "bg-axon-green/10 border-axon-green text-axon-green" : "bg-yellow-500/10 border-yellow-500 text-yellow-400") : "bg-axon-bg border-axon-border text-gray-400 hover:text-white"}`}>
                        {s === "pago" ? "✓ Pago" : "⏳ Pendente"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-axon-border shrink-0">
            <button onClick={() => etapa > 1 ? setEtapa((p) => p - 1) : onClose()}
              disabled={salvando}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50">
              <ChevronLeft size={16} /> {etapa === 1 ? "Cancelar" : "Voltar"}
            </button>
            {etapa < 4 ? (
              <button
                onClick={() => setEtapa((p) => p + 1)}
                disabled={
                  (etapa === 1 && !escolaSelecionada && !(modoNovaEscola && novaEscola.nome && novaEscola.email)) ||
                  (etapa === 2 && (!formCor.nome || !categoriaSelecionada))
                }
                className="flex items-center gap-2 bg-axon-green text-black font-semibold px-5 py-2.5 rounded-md text-sm hover:bg-axon-green/90 transition-colors disabled:opacity-40">
                Próximo <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={salvar} disabled={salvando}
                className="flex items-center gap-2 bg-axon-green text-black font-semibold px-5 py-2.5 rounded-md text-sm hover:bg-axon-green/90 transition-colors disabled:opacity-50 min-w-[130px] justify-center">
                {salvando ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : <><CheckCircle2 size={16} /> Confirmar</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function InscricoesPage() {
  const supabase = createClient();

  const [abaAtiva, setAbaAtiva]             = useState("coreografias");
  const [busca, setBusca]                   = useState("");
  const [coreografias, setCoreografias]     = useState<Coreografia[]>([]);
  const [bailarinos, setBailarinos]         = useState<Bailarino[]>([]);
  const [kpis, setKpis]                     = useState<KPIs>({ total_coreografias: 0, bailarinos_unicos: 0, receita_confirmada: 0 });
  const [loading, setLoading]               = useState(true);
  const [pagina, setPagina]                 = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [modalAberto, setModalAberto]       = useState(false);
  const [eventoAtivo, setEventoAtivo]       = useState<string | null>(null);
  const POR_PAGINA = 20;

  // Pega evento ativo (mais recente com inscrições abertas)
  useEffect(() => {
    supabase.from("eventos").select("id").eq("status", "inscricoes_abertas").order("data_inicio", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setEventoAtivo(data?.id ?? null));
  }, [supabase]);

  const carregarKpis = useCallback(async () => {
    const [{ count: totalCor }, { count: totalBail }, { data: receita }] = await Promise.all([
      supabase.from("coreografias").select("*", { count: "exact", head: true }),
      supabase.from("bailarinos").select("*", { count: "exact", head: true }),
      supabase.from("coreografias").select("valor_total").eq("status_pagamento", "pago"),
    ]);
    setKpis({
      total_coreografias: totalCor ?? 0,
      bailarinos_unicos: totalBail ?? 0,
      receita_confirmada: (receita ?? []).reduce((acc, c) => acc + (c.valor_total ?? 0), 0),
    });
  }, [supabase]);

  const carregarCoreografias = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("coreografias")
      .select("id, nome, categoria, tipo, quantidade_bailarinos, valor_total, status_pagamento, escolas(nome)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
    if (busca.trim()) query = query.or(`nome.ilike.%${busca}%,categoria.ilike.%${busca}%`);
    const { data, count } = await query;
    setCoreografias((data as unknown as Coreografia[]) ?? []);
    setTotalRegistros(count ?? 0);
    setLoading(false);
  }, [supabase, pagina, busca]);

  const carregarBailarinos = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("bailarinos")
      .select("id, nome, data_nascimento, cpf, termo_assinado, escolas(nome)", { count: "exact" })
      .order("nome", { ascending: true })
      .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
    if (busca.trim()) query = query.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`);
    const { data, count } = await query;
    const ids = (data ?? []).map((b: { id: string }) => b.id);
    const { data: elenco } = await supabase.from("coreografia_elenco").select("bailarino_id").in("bailarino_id", ids);
    const contagem: Record<string, number> = {};
    (elenco ?? []).forEach((e: { bailarino_id: string }) => { contagem[e.bailarino_id] = (contagem[e.bailarino_id] ?? 0) + 1; });
    setBailarinos(((data ?? []) as { id: string }[]).map((b) => ({ ...(b as object), inscricoes_count: contagem[b.id] ?? 0 })) as Bailarino[]);
    setTotalRegistros(count ?? 0);
    setLoading(false);
  }, [supabase, pagina, busca]);

  useEffect(() => { void carregarKpis(); }, [carregarKpis]);
  useEffect(() => { setPagina(1); }, [busca, abaAtiva]);
  useEffect(() => {
    if (abaAtiva === "coreografias") void carregarCoreografias();
    else void carregarBailarinos();
  }, [abaAtiva, pagina, busca, carregarCoreografias, carregarBailarinos]);

  const totalPaginas = Math.ceil(totalRegistros / POR_PAGINA);
  const inicio = totalRegistros === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1;
  const fim = Math.min(pagina * POR_PAGINA, totalRegistros);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {modalAberto && (
        <ModalNovaInscricao
          eventoId={eventoAtivo}
          onClose={() => setModalAberto(false)}
          onSucesso={() => { setModalAberto(false); void carregarKpis(); void carregarCoreografias(); }}
        />
      )}

      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Inscrições & Elenco</h1>
          <p className="text-gray-400 mt-1">Gestão de coreografias, bailarinos e status financeiro.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-axon-panel border border-axon-border text-white px-4 py-2 rounded-md font-medium hover:bg-white/5 transition-colors">
            Exportar Excel
          </button>
          <button onClick={() => setModalAberto(true)}
            className="bg-axon-green text-black px-4 py-2 rounded-md font-medium hover:bg-[#00c866] transition-colors flex items-center gap-2">
            <Plus size={18} /> Nova Inscrição Manual
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total de Coreografias", value: kpis.total_coreografias, icon: Music, cor: "text-blue-500 bg-blue-500/10" },
          { label: "Bailarinos Únicos", value: kpis.bailarinos_unicos, icon: Users, cor: "text-purple-400 bg-purple-500/10" },
          { label: "Receita Confirmada", value: formatarReais(kpis.receita_confirmada), icon: DollarSign, cor: "text-axon-green bg-axon-green/10" },
        ].map((k) => (
          <div key={k.label} className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${k.cor}`}>
              <k.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">{k.label}</p>
              <p className="text-2xl font-bold text-white">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TABELAS */}
      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
        <div className="flex border-b border-axon-border px-4">
          {[{ key: "coreografias", label: "Coreografias Inscritas", icon: Music }, { key: "elenco", label: "Banco de Elenco", icon: Users }].map((aba) => (
            <button key={aba.key} onClick={() => setAbaAtiva(aba.key)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === aba.key ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}>
              <aba.icon size={18} /> {aba.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-axon-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
              placeholder={abaAtiva === "coreografias" ? "Buscar por coreografia ou categoria..." : "Buscar por nome ou CPF..."}
              className="w-full bg-axon-bg border border-axon-border rounded-md pl-10 pr-10 py-2 text-sm text-white focus:outline-none focus:border-axon-green transition-colors" />
            {busca && <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={16} /></button>}
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-axon-bg border border-axon-border rounded-md text-sm text-gray-300 hover:text-white transition-colors">
            <Filter size={16} /> Filtros Avançados
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 size={28} className="animate-spin text-axon-gold" /></div>
        ) : (
          <>
            {abaAtiva === "coreografias" && (
              <div className="overflow-x-auto">
                {coreografias.length === 0 ? (
                  <div className="text-center py-16 text-gray-500"><Music size={40} className="mx-auto mb-3 opacity-20" /><p>Nenhuma coreografia encontrada.</p></div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-axon-bg/50 text-gray-400 border-b border-axon-border">
                      <tr>
                        {["Escola / Grupo", "Coreografia", "Categoria", "Pax", "Valor", "Status", "Ações"].map((h, i) => (
                          <th key={h} className={`px-6 py-4 font-medium ${i === 3 || i === 6 ? "text-center" : ""} ${i === 6 ? "text-right" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-axon-border">
                      {coreografias.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{item.escolas?.nome ?? "—"}</td>
                          <td className="px-6 py-4 text-gray-300">{item.nome}</td>
                          <td className="px-6 py-4 text-gray-400">{item.categoria}<span className="text-xs text-gray-500 block">{item.tipo}</span></td>
                          <td className="px-6 py-4 text-center text-gray-300">{item.quantidade_bailarinos ?? "—"}</td>
                          <td className="px-6 py-4 text-gray-300">{item.valor_total != null ? formatarReais(item.valor_total) : "—"}</td>
                          <td className="px-6 py-4">
                            {item.status_pagamento === "pago" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-axon-green bg-axon-green/10 border border-axon-green/20"><CheckCircle2 size={12} /> Pago</span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-yellow-500 bg-yellow-500/10 border border-yellow-500/20"><Clock size={12} /> {item.status_pagamento ?? "Pendente"}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right"><button className="text-gray-500 hover:text-white transition-colors p-1"><MoreHorizontal size={18} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {abaAtiva === "elenco" && (
              <div className="overflow-x-auto">
                {bailarinos.length === 0 ? (
                  <div className="text-center py-16 text-gray-500"><Users size={40} className="mx-auto mb-3 opacity-20" /><p>Nenhum bailarino encontrado.</p></div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-axon-bg/50 text-gray-400 border-b border-axon-border">
                      <tr>
                        {["Nome do Bailarino", "Escola Vinculada", "Idade", "CPF", "Coreografias", "Termo", "Ações"].map((h, i) => (
                          <th key={h} className={`px-6 py-4 font-medium ${[2, 4, 5, 6].includes(i) ? "text-center" : ""} ${i === 6 ? "text-right" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-axon-border">
                      {bailarinos.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{item.nome}</td>
                          <td className="px-6 py-4 text-gray-300">{item.escolas?.nome ?? "—"}</td>
                          <td className="px-6 py-4 text-center text-gray-300">{calcularIdade(item.data_nascimento)} anos</td>
                          <td className="px-6 py-4 text-gray-400">{item.cpf ?? "—"}</td>
                          <td className="px-6 py-4 text-center"><span className="bg-white/5 text-gray-300 px-2.5 py-1 rounded-md text-xs font-medium">{item.inscricoes_count ?? 0}</span></td>
                          <td className="px-6 py-4 text-center">
                            {item.termo_assinado
                              ? <span className="inline-flex items-center gap-1 text-xs text-axon-green"><CheckCircle2 size={14} /> Assinado</span>
                              : <span className="inline-flex items-center gap-1 text-xs text-yellow-500"><Clock size={14} /> Pendente</span>}
                          </td>
                          <td className="px-6 py-4 text-right"><button className="text-gray-500 hover:text-white transition-colors p-1"><MoreHorizontal size={18} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}

        <div className="p-4 border-t border-axon-border flex items-center justify-between text-sm text-gray-400">
          <span>{totalRegistros === 0 ? "Nenhum registro" : `Mostrando ${inicio} a ${fim} de ${totalRegistros} registros`}</span>
          <div className="flex gap-2">
            <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}
              className="px-3 py-1 border border-axon-border rounded hover:bg-white/5 disabled:opacity-30 transition-colors">Anterior</button>
            <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina >= totalPaginas}
              className="px-3 py-1 border border-axon-border rounded hover:bg-white/5 disabled:opacity-30 transition-colors">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
}