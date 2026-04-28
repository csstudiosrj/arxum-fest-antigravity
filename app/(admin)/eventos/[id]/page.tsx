"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  ChevronLeft, Settings, ListTree, CalendarDays, GripVertical,
  Plus, Trash2, Save, Loader2, X, CheckCircle, XCircle,
  Users, CreditCard, Star, ShoppingCart, Ticket, Pencil,
  LayoutDashboard,
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────
type Evento = {
  id: string; nome: string; data_inicio: string; data_fim: string;
  local: string; status: string; descricao: string | null;
};
type Categoria = {
  id: string; nome: string; valor_solo: number; valor_duo: number; valor_conjunto: number;
  genero: string; faixa_etaria_min: number | null; faixa_etaria_max: number | null;
  faixa_etaria_label: string | null; categoria_pai_id: string | null;
  subcategorias?: Categoria[];
};
type Apresentação = {
  id: string; nome: string; categoria: string;
  ordem_apresentacao: number | null; escolas: { nome: string }[] | null;
};
type Toast = { id: number; tipo: "sucesso" | "erro"; mensagem: string };
type Metricas = {
  total_inscricoes: number;
  pagamentos_pendentes: number;
  jurados_configurados: boolean;
  cantina_configurada: boolean;
  bilheteria_configurada: boolean;
};

// ── Toast ──────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, remover }: { toasts: Toast[]; remover: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto
            ${t.tipo === "sucesso" ? "bg-axon-panel border-green-500/30" : "bg-axon-panel border-red-400/30"}`}>
          {t.tipo === "sucesso"
            ? <CheckCircle size={18} className="text-green-400 shrink-0" />
            : <XCircle size={18} className="text-red-400 shrink-0" />}
          <span className="text-sm font-medium text-white">{t.mensagem}</span>
          <button onClick={() => remover(t.id)} className="ml-2 text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

const GENERO_LABELS: Record<string, string> = {
  livre: "Livre", masculino: "Masculino", feminino: "Feminino", misto: "Misto",
};

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho", inscricoes_abertas: "Inscrições Abertas",
  em_andamento: "Em Andamento", encerrado: "Encerrado",
};
const STATUS_CORES: Record<string, string> = {
  inscricoes_abertas: "text-axon-green bg-axon-green/10 border-axon-green/20",
  encerrado: "text-red-400 bg-red-400/10 border-red-400/20",
  rascunho: "text-gray-400 bg-white/5 border-white/10",
  em_andamento: "text-axon-gold bg-axon-gold/10 border-axon-gold/20",
};

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

let toastId = 0;

// ── Componente principal ───────────────────────────────────────────────────
export default function PainelEventoPage() {
  const params   = useParams();
  const router   = useRouter();
  const eventoId = params.id as string;

  const [abaAtiva, setAbaAtiva]           = useState("visao-geral");
  const [loading, setLoading]             = useState(true);
  const [salvando, setSalvando]           = useState(false);
  const [evento, setEvento]               = useState<Evento | null>(null);
  const [form, setForm]                   = useState<Partial<Evento>>({});
  const [categorias, setCategorias]       = useState<Categoria[]>([]);
  const [apresentaçãos, setApresentaçãos]   = useState<Apresentação[]>([]);
  const [metricas, setMetricas]           = useState<Metricas | null>(null);
  const [toasts, setToasts]               = useState<Toast[]>([]);

  // Modal nova categoria
  const [modalCat, setModalCat]           = useState(false);
  const [catEditando, setCatEditando]     = useState<Categoria | null>(null);
  const [formCat, setFormCat]             = useState({
    nome: "", valor_solo: 0, valor_duo: 0, valor_conjunto: 0,
    genero: "livre", faixa_etaria_min: "", faixa_etaria_max: "",
    faixa_etaria_label: "", categoria_pai_id: "",
  });

  const supabase = createClient();

  const addToast = useCallback((tipo: Toast["tipo"], mensagem: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removerToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Carga inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    async function carregar() {
      setLoading(true);
      const [{ data: ev }, { data: cats }, { data: coreos }, { data: inscricoes }, { data: pagamentos }] =
        await Promise.all([
          supabase.from("eventos").select("*").eq("id", eventoId).single(),
          supabase.from("categorias").select("*").eq("evento_id", eventoId).order("nome"),
          supabase
            .from("apresentaçãos")
            .select("id, nome, categoria, ordem_apresentacao, escolas(nome)")
            .eq("evento_id", eventoId)
            .order("ordem_apresentacao", { ascending: true, nullsFirst: false }),
          supabase.from("inscricoes").select("id", { count: "exact" }).eq("evento_id", eventoId),
          supabase.from("inscricoes").select("id", { count: "exact" }).eq("evento_id", eventoId).eq("status_pagamento", "pendente"),
        ]);

      if (!ev) { router.push("/eventos"); return; }
      setEvento(ev);
      setForm(ev);

      // Organiza categorias em hierarquia
      const todasCats = (cats ?? []) as Categoria[];
      const pais = todasCats
        .filter((c) => !c.categoria_pai_id)
        .map((pai) => ({
          ...pai,
          subcategorias: todasCats.filter((c) => c.categoria_pai_id === pai.id),
        }));
      setCategorias(pais);
      setApresentaçãos((coreos ?? []) as Apresentação[]);

      setMetricas({
        total_inscricoes: inscricoes?.length ?? 0,
        pagamentos_pendentes: pagamentos?.length ?? 0,
        jurados_configurados: false, // implementar quando módulo de jurados existir
        cantina_configurada: false,
        bilheteria_configurada: false,
      });

      setLoading(false);
    }
    carregar();
  }, [eventoId, router, supabase]);

  // ── Salvar evento ──────────────────────────────────────────────────────
  async function salvarEvento() {
    setSalvando(true);
    const { error } = await supabase
      .from("eventos")
      .update({
        nome: form.nome, local: form.local, data_inicio: form.data_inicio,
        data_fim: form.data_fim, status: form.status, descricao: form.descricao,
      })
      .eq("id", eventoId);

    if (!error) {
      setEvento({ ...evento!, ...form as Evento });
      addToast("sucesso", "Evento salvo com sucesso!");
    } else {
      addToast("erro", "Erro ao salvar. Tente novamente.");
    }
    setSalvando(false);
  }

  // ── Abrir modal nova categoria ─────────────────────────────────────────
  function abrirModalNova() {
    setCatEditando(null);
    setFormCat({ nome: "", valor_solo: 0, valor_duo: 0, valor_conjunto: 0, genero: "livre", faixa_etaria_min: "", faixa_etaria_max: "", faixa_etaria_label: "", categoria_pai_id: "" });
    setModalCat(true);
  }

  // ── Abrir modal edição ─────────────────────────────────────────────────
  function abrirModalEditar(cat: Categoria) {
    setCatEditando(cat);
    setFormCat({
      nome: cat.nome, valor_solo: cat.valor_solo, valor_duo: cat.valor_duo,
      valor_conjunto: cat.valor_conjunto, genero: cat.genero,
      faixa_etaria_min: cat.faixa_etaria_min?.toString() ?? "",
      faixa_etaria_max: cat.faixa_etaria_max?.toString() ?? "",
      faixa_etaria_label: cat.faixa_etaria_label ?? "",
      categoria_pai_id: cat.categoria_pai_id ?? "",
    });
    setModalCat(true);
  }

  // ── Salvar categoria (criar ou editar) ─────────────────────────────────
  async function salvarCategoria() {
    if (!formCat.nome.trim()) return;

    const payload = {
      nome: formCat.nome,
      valor_solo: Number(formCat.valor_solo),
      valor_duo: Number(formCat.valor_duo),
      valor_conjunto: Number(formCat.valor_conjunto),
      genero: formCat.genero,
      faixa_etaria_min: formCat.faixa_etaria_min ? Number(formCat.faixa_etaria_min) : null,
      faixa_etaria_max: formCat.faixa_etaria_max ? Number(formCat.faixa_etaria_max) : null,
      faixa_etaria_label: formCat.faixa_etaria_label || null,
      categoria_pai_id: formCat.categoria_pai_id || null,
      evento_id: eventoId,
    };

    if (catEditando) {
      const { error } = await supabase.from("categorias").update(payload).eq("id", catEditando.id);
      if (!error) {
        addToast("sucesso", `Categoria "${formCat.nome}" atualizada!`);
        recarregarCategorias();
      } else {
        addToast("erro", "Erro ao atualizar categoria.");
      }
    } else {
      const { error } = await supabase.from("categorias").insert(payload);
      if (!error) {
        addToast("sucesso", `Categoria "${formCat.nome}" criada!`);
        recarregarCategorias();
      } else {
        addToast("erro", "Erro ao criar categoria.");
      }
    }
    setModalCat(false);
  }

  async function recarregarCategorias() {
    const { data } = await supabase.from("categorias").select("*").eq("evento_id", eventoId).order("nome");
    const todasCats = (data ?? []) as Categoria[];
    const pais = todasCats
      .filter((c) => !c.categoria_pai_id)
      .map((pai) => ({ ...pai, subcategorias: todasCats.filter((c) => c.categoria_pai_id === pai.id) }));
    setCategorias(pais);
  }

  // ── Excluir categoria ──────────────────────────────────────────────────
  async function excluirCategoria(id: string, nome: string) {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (!error) {
      addToast("sucesso", `Categoria "${nome}" removida.`);
      recarregarCategorias();
    } else {
      addToast("erro", "Erro ao remover categoria.");
    }
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────
  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const items = Array.from(apresentaçãos);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    const reordenadas = items.map((c, i) => ({ ...c, ordem_apresentacao: i + 1 }));
    setApresentaçãos(reordenadas);
    await Promise.all(
      reordenadas.map((c) =>
        supabase.from("apresentaçãos").update({ ordem_apresentacao: c.ordem_apresentacao }).eq("id", c.id)
      )
    );
    addToast("sucesso", "Ordem salva!");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-axon-gold" />
      </div>
    );
  }

  if (!evento) return null;

  // Categorias raiz (sem pai) para o select do modal
  const categoriasRaiz = categorias.filter((c) => !c.categoria_pai_id);

  return (
    <>
      <ToastContainer toasts={toasts} remover={removerToast} />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link href="/eventos"
            className="w-10 h-10 bg-axon-panel border border-axon-border rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{evento.nome}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CORES[evento.status] ?? "text-gray-400 bg-white/5 border-white/10"}`}>
                {STATUS_LABELS[evento.status] ?? evento.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(evento.data_inicio).toLocaleDateString("pt-BR")} até{" "}
              {new Date(evento.data_fim).toLocaleDateString("pt-BR")}
              {evento.local ? ` • ${evento.local}` : ""}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
          <div className="flex border-b border-axon-border px-4 overflow-x-auto">
            {[
              { id: "visao-geral",   label: "Visão Geral",       icon: LayoutDashboard },
              { id: "configuracoes", label: "Configurações",      icon: Settings },
              { id: "categorias",    label: "Categorias & Taxas", icon: ListTree },
              { id: "lineup",        label: "Line-up",            icon: CalendarDays },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setAbaAtiva(id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  abaAtiva === id ? "border-axon-gold text-axon-gold" : "border-transparent text-gray-400 hover:text-white"
                }`}>
                <Icon size={18} />{label}
              </button>
            ))}
          </div>

          <div className="p-8">

            {/* ── Visão Geral ── */}
            {abaAtiva === "visao-geral" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Visão Geral do Evento</h3>
                  <p className="text-sm text-gray-400">Situação atual e alertas de configuração.</p>
                </div>

                {/* Status do evento — aviso se rascunho */}
                {evento.status === "rascunho" && (
                  <div className="bg-axon-gold/10 border border-axon-gold/30 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-axon-gold mt-0.5">⚠️</span>
                    <div>
                      <p className="text-axon-gold font-medium text-sm">Evento em Rascunho</p>
                      <p className="text-gray-400 text-sm mt-0.5">
                          Inscrições estão bloqueadas. Mude o status para <strong>&quot;Inscrições Abertas&quot;</strong> na aba Configurações para liberar o formulário de inscrição.
                      </p>
                    </div>
                  </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Inscrições", valor: metricas?.total_inscricoes ?? 0, icon: Users, cor: "text-axon-gold", sufixo: "feitas" },
                    { label: "Pagamentos Pendentes", valor: metricas?.pagamentos_pendentes ?? 0, icon: CreditCard, cor: metricas?.pagamentos_pendentes ? "text-red-400" : "text-green-400", sufixo: "pendentes" },
                    { label: "Jurados", valor: metricas?.jurados_configurados ? "OK" : "Não config.", icon: Star, cor: metricas?.jurados_configurados ? "text-green-400" : "text-gray-500", sufixo: "" },
                    { label: "Cantina & Bilheteria", valor: metricas?.cantina_configurada ? "OK" : "Não config.", icon: ShoppingCart, cor: metricas?.cantina_configurada ? "text-green-400" : "text-gray-500", sufixo: "" },
                  ].map(({ label, valor, icon: Icon, cor, sufixo }) => (
                    <div key={label} className="bg-axon-bg border border-axon-border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-400 font-medium">{label}</p>
                        <Icon size={18} className={cor} />
                      </div>
                      <p className={`text-2xl font-bold tabular-nums ${cor}`}>{valor}</p>
                      {sufixo && <p className="text-xs text-gray-500 mt-1">{sufixo}</p>}
                    </div>
                  ))}
                </div>

                {/* Checklist de configuração */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Checklist de Preparação</h4>
                  <div className="bg-axon-bg border border-axon-border rounded-xl divide-y divide-axon-border">
                    {[
                      { label: "Dados básicos preenchidos", ok: !!(evento.nome && evento.local && evento.data_inicio), acao: "configuracoes" },
                      { label: "Ao menos 1 categoria criada", ok: categorias.length > 0, acao: "categorias" },
                      { label: "Jurados configurados", ok: metricas?.jurados_configurados ?? false, acao: null },
                      { label: "Cantina configurada", ok: metricas?.cantina_configurada ?? false, acao: null },
                      { label: "Bilheteria configurada", ok: metricas?.bilheteria_configurada ?? false, acao: null },
                    ].map(({ label, ok, acao }) => (
                      <div key={label} className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${ok ? "bg-green-500/20" : "bg-white/5"}`}>
                            {ok ? <CheckCircle size={14} className="text-green-400" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                          </div>
                          <span className={`text-sm ${ok ? "text-white" : "text-gray-400"}`}>{label}</span>
                        </div>
                        {!ok && acao && (
                          <button onClick={() => setAbaAtiva(acao)}
                            className="text-xs text-axon-gold hover:underline">
                            Configurar →
                          </button>
                        )}
                        {!ok && !acao && (
                          <span className="text-xs text-gray-600">Em breve</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Configurações ── */}
            {abaAtiva === "configuracoes" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Dados do Evento</h3>

                {/* Alerta de status */}
                <div className={`rounded-xl p-4 border text-sm ${
                  form.status === "inscricoes_abertas"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : form.status === "em_andamento"
                    ? "bg-axon-gold/10 border-axon-gold/20 text-axon-gold"
                    : form.status === "encerrado"
                    ? "bg-red-400/10 border-red-400/20 text-red-400"
                    : "bg-white/5 border-white/10 text-gray-400"
                }`}>
                  {form.status === "rascunho" && "🔒 Rascunho — formulário de inscrição bloqueado para as escolas."}
                  {form.status === "inscricoes_abertas" && "✅ Inscrições Abertas — formulário ativo para as escolas."}
                  {form.status === "em_andamento" && "⚡ Em Andamento — inscrições encerradas, evento ocorrendo."}
                  {form.status === "encerrado" && "🏁 Encerrado — evento concluído, resultados disponíveis."}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-gray-400">Nome do Festival</label>
                    <input type="text" value={form.nome ?? ""} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Local</label>
                    <input type="text" value={form.local ?? ""} onChange={(e) => setForm({ ...form, local: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Status</label>
                    <select value={form.status ?? ""} onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors">
                      <option value="rascunho">Rascunho</option>
                      <option value="inscricoes_abertas">Inscrições Abertas</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="encerrado">Encerrado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Data de Início</label>
                    <input type="date" value={form.data_inicio ?? ""} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Data de Fim</label>
                    <input type="date" value={form.data_fim ?? ""} onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-gray-400">Descrição / Observações</label>
                    <textarea rows={3} value={form.descricao ?? ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors resize-none" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={salvarEvento} disabled={salvando}
                    className="flex items-center gap-2 bg-axon-gold text-black font-semibold px-6 py-2.5 rounded-md hover:bg-axon-gold/90 transition-colors disabled:opacity-50">
                    {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {salvando ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Categorias ── */}
            {abaAtiva === "categorias" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Categorias & Taxas</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Crie categorias-pai e subcategorias por gênero e faixa etária.</p>
                  </div>
                  <button onClick={abrirModalNova}
                    className="flex items-center gap-2 text-sm bg-axon-gold text-black font-semibold px-4 py-2 rounded-md hover:bg-axon-gold/90 transition-colors">
                    <Plus size={16} /> Nova Categoria
                  </button>
                </div>

                {categorias.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <ListTree size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Nenhuma categoria ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categorias.map((cat) => (
                      <div key={cat.id} className="bg-axon-bg border border-axon-border rounded-xl overflow-hidden">
                        {/* Categoria pai */}
                        <div className="flex items-center justify-between p-4 group">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-semibold">{cat.nome}</p>
                              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                {GENERO_LABELS[cat.genero]}
                              </span>
                              {cat.faixa_etaria_label && (
                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                  {cat.faixa_etaria_label}
                                  {cat.faixa_etaria_min && cat.faixa_etaria_max
                                    ? ` (${cat.faixa_etaria_min}–${cat.faixa_etaria_max} anos)`
                                    : ""}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              Solo: {moeda(cat.valor_solo)} &bull; Duo: {moeda(cat.valor_duo)} &bull; Conjunto: {moeda(cat.valor_conjunto)}/pax
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => abrirModalEditar(cat)}
                              className="p-2 text-gray-400 hover:text-axon-gold transition-colors rounded-lg hover:bg-white/5">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => excluirCategoria(cat.id, cat.nome)}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Subcategorias */}
                        {cat.subcategorias && cat.subcategorias.length > 0 && (
                          <div className="border-t border-axon-border divide-y divide-axon-border bg-black/10">
                            {cat.subcategorias.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between px-4 py-3 group">
                                <div className="flex items-center gap-3 pl-4">
                                  <div className="w-px h-4 bg-axon-border" />
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm text-gray-200">{sub.nome}</p>
                                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                        {GENERO_LABELS[sub.genero]}
                                      </span>
                                      {sub.faixa_etaria_label && (
                                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                          {sub.faixa_etaria_label}
                                          {sub.faixa_etaria_min && sub.faixa_etaria_max
                                            ? ` (${sub.faixa_etaria_min}–${sub.faixa_etaria_max} anos)`
                                            : ""}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Solo: {moeda(sub.valor_solo)} &bull; Duo: {moeda(sub.valor_duo)} &bull; Conjunto: {moeda(sub.valor_conjunto)}/pax
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => abrirModalEditar(sub)}
                                    className="p-2 text-gray-400 hover:text-axon-gold transition-colors rounded-lg hover:bg-white/5">
                                    <Pencil size={14} />
                                  </button>
                                  <button onClick={() => excluirCategoria(sub.id, sub.nome)}
                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Botão adicionar subcategoria */}
                        <div className="border-t border-axon-border px-4 py-2">
                          <button
                            onClick={() => {
                              setCatEditando(null);
                              setFormCat({ nome: "", valor_solo: 0, valor_duo: 0, valor_conjunto: 0, genero: "livre", faixa_etaria_min: "", faixa_etaria_max: "", faixa_etaria_label: "", categoria_pai_id: cat.id });
                              setModalCat(true);
                            }}
                            className="text-xs text-gray-500 hover:text-axon-gold transition-colors flex items-center gap-1 py-1"
                          >
                            <Plus size={12} /> Adicionar subcategoria
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Line-up ── */}
            {abaAtiva === "lineup" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white">Montagem do Line-up</h3>
                  <p className="text-sm text-gray-400">Arraste para reordenar as apresentações.</p>
                </div>
                {apresentaçãos.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <CalendarDays size={40} className="mx-auto mb-3 opacity-30 text-axon-gold" />
                    <p>Nenhuma apresentação inscrita ainda.</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="lineup">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {apresentaçãos.map((coreo, index) => (
                            <Draggable key={coreo.id} draggableId={coreo.id} index={index}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps}
                                  className={`flex items-center gap-4 bg-axon-bg border rounded-lg p-3 transition-colors cursor-move group ${
                                    snapshot.isDragging ? "border-axon-gold shadow-lg shadow-axon-gold/10" : "border-axon-border hover:border-gray-600"
                                  }`}>
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical size={20} className="text-gray-600 group-hover:text-gray-400" />
                                  </div>
                                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs font-bold text-axon-gold">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium">{coreo.nome}</p>
                                    <p className="text-xs text-gray-400">
                                      {coreo.escolas?.[0]?.nome ?? "Escola não informada"} &bull; {coreo.categoria}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Modal Categoria (criar / editar) ── */}
      {modalCat && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalCat(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {catEditando ? "Editar Categoria" : formCat.categoria_pai_id ? "Nova Subcategoria" : "Nova Categoria"}
                </h3>
                <button onClick={() => setModalCat(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Categoria pai (só se não já tiver um pai definido) */}
                {!formCat.categoria_pai_id && !catEditando?.categoria_pai_id && (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Categoria Pai (opcional)</label>
                    <select value={formCat.categoria_pai_id}
                      onChange={(e) => setFormCat({ ...formCat, categoria_pai_id: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors">
                      <option value="">Nenhuma (categoria raiz)</option>
                      {categoriasRaiz.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Nome *</label>
                  <input type="text" placeholder="Ex: Jazz Avançado" value={formCat.nome}
                    onChange={(e) => setFormCat({ ...formCat, nome: e.target.value })}
                    className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Gênero</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["livre", "feminino", "masculino", "misto"] as const).map((g) => (
                      <button key={g} onClick={() => setFormCat({ ...formCat, genero: g })}
                        className={`py-2 rounded-md text-sm font-medium border transition-colors ${
                          formCat.genero === g
                            ? "bg-axon-gold text-black border-axon-gold"
                            : "bg-axon-bg border-axon-border text-gray-400 hover:text-white"
                        }`}>
                        {GENERO_LABELS[g]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Faixa Etária</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Label (ex: Infantil)</label>
                      <input type="text" placeholder="Infantil" value={formCat.faixa_etaria_label}
                        onChange={(e) => setFormCat({ ...formCat, faixa_etaria_label: e.target.value })}
                        className="w-full bg-axon-bg border border-axon-border rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-axon-gold transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Idade mínima</label>
                      <input type="number" min={0} placeholder="6" value={formCat.faixa_etaria_min}
                        onChange={(e) => setFormCat({ ...formCat, faixa_etaria_min: e.target.value })}
                        className="w-full bg-axon-bg border border-axon-border rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-axon-gold transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Idade máxima</label>
                      <input type="number" min={0} placeholder="12" value={formCat.faixa_etaria_max}
                        onChange={(e) => setFormCat({ ...formCat, faixa_etaria_max: e.target.value })}
                        className="w-full bg-axon-bg border border-axon-border rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-axon-gold transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Taxas de Inscrição</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["valor_solo", "valor_duo", "valor_conjunto"] as const).map((campo) => (
                      <div key={campo} className="space-y-1">
                        <label className="text-xs text-gray-500">
                          {campo === "valor_solo" ? "Solo (R$)" : campo === "valor_duo" ? "Duo (R$)" : "Conj./pax (R$)"}
                        </label>
                        <input type="number" min={0} value={formCat[campo]}
                          onChange={(e) => setFormCat({ ...formCat, [campo]: Number(e.target.value) })}
                          className="w-full bg-axon-bg border border-axon-border rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-axon-gold transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setModalCat(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button onClick={salvarCategoria} disabled={!formCat.nome.trim()}
                  className="flex items-center gap-2 bg-axon-gold text-black font-semibold px-5 py-2 rounded-md hover:bg-axon-gold/90 transition-colors text-sm disabled:opacity-50">
                  <Save size={15} />
                  {catEditando ? "Salvar Alterações" : "Criar Categoria"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}