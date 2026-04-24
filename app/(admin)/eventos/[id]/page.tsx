"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  ChevronLeft, Settings, ListTree, CalendarDays,
  GripVertical, Plus, Trash2, Save, Loader2, X,
  CheckCircle, XCircle,
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────
type Evento = {
  id: string; nome: string; data_inicio: string; data_fim: string;
  local: string; status: string; descricao: string | null;
};
type Categoria = {
  id: string; nome: string; valor_solo: number; valor_duo: number; valor_conjunto: number;
};
type Coreografia = {
  id: string; nome: string; categoria: string;
  ordem_apresentacao: number | null; escolas: { nome: string }[] | null;
};
type Toast = { id: number; tipo: "sucesso" | "erro"; mensagem: string };

// ── Toast Component ────────────────────────────────────────────────────────
function ToastContainer({ toasts, remover }: { toasts: Toast[]; remover: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto
            backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-300
            ${t.tipo === "sucesso"
              ? "bg-axon-panel border-axon-green/30 text-axon-green"
              : "bg-axon-panel border-red-400/30 text-red-400"
            }`}
        >
          {t.tipo === "sucesso"
            ? <CheckCircle size={18} className="shrink-0" />
            : <XCircle size={18} className="shrink-0" />}
          <span className="text-sm font-medium text-white">{t.mensagem}</span>
          <button onClick={() => remover(t.id)} className="ml-2 text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

let toastId = 0;

// ── Componente principal ───────────────────────────────────────────────────
export default function PainelEventoPage() {
  const params   = useParams();
  const router   = useRouter();
  const eventoId = params.id as string;

  const [abaAtiva, setAbaAtiva]           = useState("configuracoes");
  const [loading, setLoading]             = useState(true);
  const [salvando, setSalvando]           = useState(false);
  const [evento, setEvento]               = useState<Evento | null>(null);
  const [form, setForm]                   = useState<Partial<Evento>>({});
  const [categorias, setCategorias]       = useState<Categoria[]>([]);
  const [coreografias, setCoreografias]   = useState<Coreografia[]>([]);
  const [modalCat, setModalCat]           = useState(false);
  const [novaCategoria, setNovaCategoria] = useState({ nome: "", valor_solo: 0, valor_duo: 0, valor_conjunto: 0 });
  const [toasts, setToasts]               = useState<Toast[]>([]);

  const supabase = createClient();

  // ── Toast helpers ──────────────────────────────────────────────────────
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
      const [{ data: ev }, { data: cats }, { data: coreos }] = await Promise.all([
        supabase.from("eventos").select("*").eq("id", eventoId).single(),
        supabase.from("categorias").select("*").eq("evento_id", eventoId).order("nome"),
        supabase
          .from("coreografias")
          .select("id, nome, categoria, ordem_apresentacao, escolas(nome)")
          .eq("evento_id", eventoId)
          .order("ordem_apresentacao", { ascending: true, nullsFirst: false }),
      ]);
      if (!ev) { router.push("/eventos"); return; }
      setEvento(ev);
      setForm(ev);
      setCategorias(cats ?? []);
      setCoreografias((coreos ?? []) as Coreografia[]);
      setLoading(false);
    }
    carregar();
  }, [eventoId]);

  // ── Salvar configurações ───────────────────────────────────────────────
  async function salvarEvento() {
    setSalvando(true);
    const { error } = await supabase
      .from("eventos")
      .update({ nome: form.nome, local: form.local, data_inicio: form.data_inicio, data_fim: form.data_fim, status: form.status, descricao: form.descricao })
      .eq("id", eventoId);

    if (!error) {
      setEvento({ ...evento!, ...form as Evento });
      addToast("sucesso", "Evento salvo com sucesso!");
    } else {
      addToast("erro", "Erro ao salvar. Tente novamente.");
    }
    setSalvando(false);
  }

  // ── Adicionar categoria ────────────────────────────────────────────────
  async function adicionarCategoria() {
    if (!novaCategoria.nome.trim()) return;
    const { data, error } = await supabase
      .from("categorias")
      .insert({ ...novaCategoria, evento_id: eventoId })
      .select()
      .single();

    if (!error && data) {
      setCategorias((prev) => [...prev, data]);
      setNovaCategoria({ nome: "", valor_solo: 0, valor_duo: 0, valor_conjunto: 0 });
      setModalCat(false);
      addToast("sucesso", `Categoria "${data.nome}" adicionada!`);
    } else {
      addToast("erro", "Erro ao adicionar categoria.");
    }
  }

  // ── Excluir categoria ──────────────────────────────────────────────────
  async function excluirCategoria(id: string, nome: string) {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (!error) {
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      addToast("sucesso", `Categoria "${nome}" removida.`);
    } else {
      addToast("erro", "Erro ao remover categoria.");
    }
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────
  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const items = Array.from(coreografias);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    const reordenadas = items.map((c, i) => ({ ...c, ordem_apresentacao: i + 1 }));
    setCoreografias(reordenadas);
    const { error } = await Promise.all(
      reordenadas.map((c) =>
        supabase.from("coreografias").update({ ordem_apresentacao: c.ordem_apresentacao }).eq("id", c.id)
      )
    ).then((results) => results.find((r) => r.error) ?? { error: null });

    if (!error) addToast("sucesso", "Ordem salva!");
    else addToast("erro", "Erro ao salvar ordem.");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-axon-gold" />
      </div>
    );
  }

  if (!evento) return null;

  const statusCores: Record<string, string> = {
    inscricoes_abertas: "text-axon-green bg-axon-green/10 border-axon-green/20",
    encerrado:          "text-red-400 bg-red-400/10 border-red-400/20",
    rascunho:           "text-gray-400 bg-white/5 border-white/10",
    em_andamento:       "text-axon-gold bg-axon-gold/10 border-axon-gold/20",
  };

  const statusLabels: Record<string, string> = {
    inscricoes_abertas: "Inscrições Abertas",
    encerrado:          "Encerrado",
    rascunho:           "Rascunho",
    em_andamento:       "Em Andamento",
  };

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
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusCores[evento.status] ?? "text-gray-400 bg-white/5 border-white/10"}`}>
                {statusLabels[evento.status] ?? evento.status}
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
          <div className="flex border-b border-axon-border px-4">
            {[
              { id: "configuracoes", label: "Configurações",      icon: Settings },
              { id: "categorias",    label: "Categorias & Taxas", icon: ListTree },
              { id: "lineup",        label: "Line-up",            icon: CalendarDays },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setAbaAtiva(id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  abaAtiva === id ? "border-axon-gold text-axon-gold" : "border-transparent text-gray-400 hover:text-white"
                }`}>
                <Icon size={18} />{label}
              </button>
            ))}
          </div>

          <div className="p-8">

            {/* ── Configurações ── */}
            {abaAtiva === "configuracoes" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Dados do Evento</h3>
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
                    <label className="text-sm text-gray-400">Descrição</label>
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
                  <h3 className="text-lg font-medium text-white">Categorias & Taxas</h3>
                  <button onClick={() => setModalCat(true)}
                    className="flex items-center gap-2 text-sm bg-axon-gold text-black font-semibold px-4 py-2 rounded-md hover:bg-axon-gold/90 transition-colors">
                    <Plus size={16} /> Adicionar Categoria
                  </button>
                </div>
                {categorias.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <ListTree size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Nenhuma categoria cadastrada ainda.</p>
                  </div>
                ) : (
                  <div className="bg-axon-bg border border-axon-border rounded-lg divide-y divide-axon-border">
                    {categorias.map((cat) => (
                      <div key={cat.id} className="p-4 flex justify-between items-center group">
                        <div>
                          <p className="text-white font-medium">{cat.nome}</p>
                          <p className="text-sm text-gray-400 mt-0.5">
                            Solo: {moeda(cat.valor_solo)} &bull; Duo: {moeda(cat.valor_duo)} &bull; Conjunto: {moeda(cat.valor_conjunto)}/pax
                          </p>
                        </div>
                        <button onClick={() => excluirCategoria(cat.id, cat.nome)}
                          className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
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
                {coreografias.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Nenhuma coreografia inscrita ainda.</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="lineup">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {coreografias.map((coreo, index) => (
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

      {/* Modal Nova Categoria */}
      {modalCat && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalCat(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Nova Categoria</h3>
                <button onClick={() => setModalCat(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Nome da Categoria</label>
                <input type="text" placeholder="Ex: Jazz Avançado" value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                  className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(["valor_solo", "valor_duo", "valor_conjunto"] as const).map((campo) => (
                  <div key={campo} className="space-y-2">
                    <label className="text-xs text-gray-400">
                      {campo === "valor_solo" ? "Solo (R$)" : campo === "valor_duo" ? "Duo (R$)" : "Conj./pax (R$)"}
                    </label>
                    <input type="number" min={0} value={novaCategoria[campo]}
                      onChange={(e) => setNovaCategoria({ ...novaCategoria, [campo]: Number(e.target.value) })}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-axon-gold transition-colors" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setModalCat(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button onClick={adicionarCategoria}
                  className="flex items-center gap-2 bg-axon-gold text-black font-semibold px-5 py-2 rounded-md hover:bg-axon-gold/90 transition-colors text-sm">
                  <Plus size={15} /> Adicionar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}