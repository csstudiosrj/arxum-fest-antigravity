"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  ChevronLeft, Settings, ListTree, CalendarDays, GripVertical,
  Plus, Trash2, Save, Loader2, X, CheckCircle, XCircle,
  Users, CreditCard, Star, ShoppingCart, Pencil,
  LayoutDashboard, Info, AlertCircle,
} from "lucide-react";

// ============================================================
// MAPEAMENTO DE PRESETS DINÂMICOS
// ============================================================
const PRESETS: Record<string, {
  placeholderNovo: string;
  dica: React.ReactNode;
  placeholderNome: string;
  taxaSolo: string;
  taxaDuo: string;
  taxaConjunto: string;
  explicacaoSub: string;
}> = {
  danca: {
    placeholderNovo: "Ex: Festival de Dança ARXUM 2026",
    dica: (
      <>
        <strong>Como funciona:</strong> Crie categorias-pai (ex: <em>Ballet</em>) e, dentro delas, subcategorias por faixa etária ou gênero (ex: <em>Ballet Infantil Feminino</em>). As taxas de inscrição são definidas por categoria. Solo, Duo e Conjunto têm valores diferentes.
      </>
    ),
    placeholderNome: "Ex: Ballet Clássico, Jazz Adulto, Contemporâneo...",
    taxaSolo: "Solo (R$)",
    taxaDuo: "Duo (R$)",
    taxaConjunto: "Conjunto/pax (R$)",
    explicacaoSub: "Subcategoria vinculada a uma categoria-pai. Herda o estilo, mas tem faixa etária e gênero próprios.",
  },
  musica: {
    placeholderNovo: "Ex: Festival de Música ARXUM 2026",
    dica: (
      <>
        <strong>Como funciona:</strong> Crie categorias-pai (ex: <em>MPB, Rock</em>) e, dentro delas, subcategorias por formato (ex: <em>Solo Vocal, Banda Instrumental</em>). As taxas de inscrição são definidas por categoria.
      </>
    ),
    placeholderNome: "Ex: MPB, Rock, Solo Vocal, Música Clássica...",
    taxaSolo: "Solo (R$)",
    taxaDuo: "Duo/Dupla (R$)",
    taxaConjunto: "Banda/Grupo (R$)",
    explicacaoSub: "Subcategoria vinculada a uma categoria-pai. Herda o estilo musical, mas tem formato e características próprias.",
  },
  teatro: {
    placeholderNovo: "Ex: Mostra de Teatro ARXUM 2026",
    dica: (
      <>
        <strong>Como funciona:</strong> Crie categorias-pai (ex: <em>Comédia, Drama</em>) e, dentro delas, subcategorias (ex: <em>Cena Curta, Monólogo</em>). As taxas de inscrição são definidas por categoria.
      </>
    ),
    placeholderNome: "Ex: Comédia, Drama, Monólogo, Teatro Musical...",
    taxaSolo: "Monólogo (R$)",
    taxaDuo: "Cena em Dupla (R$)",
    taxaConjunto: "Elenco/Grupo (R$)",
    explicacaoSub: "Subcategoria vinculada a uma categoria-pai. Herda o gênero teatral, mas tem duração ou elenco específicos.",
  },
};

// ============================================================
// TIPOS
// ============================================================
type Evento = {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  status: string;
  descricao: string | null;
  produtora_id: string | null;
};

type Categoria = {
  id: string;
  nome: string;
  valor_solo: number;
  valor_duo: number;
  valor_conjunto: number;
  genero: string;
  faixa_etaria_min: number | null;
  faixa_etaria_max: number | null;
  faixa_etaria_label: string | null;
  categoria_pai_id: string | null;
  subcategorias?: Categoria[];
};

type Apresentacao = {
  id: string;
  nome: string;
  tipo: string;
  ordem_apresentacao: number | null;
  status_pagamento?: string | null;
};

type Toast = {
  id: number;
  tipo: "sucesso" | "erro" | "info";
  mensagem: string;
};

const GENERO_LABELS: Record<string, string> = {
  livre: "Livre",
  masculino: "Masculino",
  feminino: "Feminino",
  misto: "Misto",
};

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  inscricoes_abertas: "Inscrições Abertas",
  em_andamento: "Em Andamento",
  encerrado: "Encerrado",
};

const STATUS_CORES: Record<string, string> = {
  inscricoes_abertas: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  encerrado: "text-red-400 bg-red-400/10 border-red-400/20",
  rascunho: "text-gray-400 bg-white/5 border-white/10",
  em_andamento: "text-axon-gold bg-axon-gold/10 border-axon-gold/20",
};

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

let toastId = 0;

function ToastContainer({ toasts, remover }: { toasts: Toast[]; remover: (id: number) => void }) {
  const cores: Record<Toast["tipo"], string> = {
    sucesso: "border-emerald-500/30 bg-axon-panel",
    erro: "border-red-400/30 bg-axon-panel",
    info: "border-axon-gold/30 bg-axon-panel",
  };

  const icones: Record<Toast["tipo"], React.ReactNode> = {
    sucesso: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
    erro: <XCircle size={16} className="text-red-400 shrink-0" />,
    info: <Info size={16} className="text-axon-gold shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto transition-all ${cores[t.tipo]}`}
        >
          {icones[t.tipo]}
          <span className="text-sm font-medium text-white">{t.mensagem}</span>
          <button onClick={() => remover(t.id)} className="ml-2 text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Dica({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-axon-gold/5 border border-axon-gold/15 rounded-xl px-4 py-3">
      <Info size={14} className="text-axon-gold shrink-0 mt-0.5" />
      <p className="text-xs text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
}

export default function PainelEventoPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id as string;

  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [form, setForm] = useState<Partial<Evento>>({});
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [apresentacoes, setApresentacoes] = useState<Apresentacao[]>([]);
  const [totalInscritos, setTotalInscritos] = useState(0);
  const [totalPendentes, setTotalPendentes] = useState(0);
  const [totalJurados, setTotalJurados] = useState(0);
  const [pdvConfigurado, setPdvConfigurado] = useState(false);
  const [criteriosConfigurados, setCriteriosConfigurados] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [perfilSlug, setPerfilSlug] = useState("danca");
  const [modalCat, setModalCat] = useState(false);
  const [catEditando, setCatEditando] = useState<Categoria | null>(null);
  const [formCat, setFormCat] = useState({
    nome: "",
    valor_solo: 0,
    valor_duo: 0,
    valor_conjunto: 0,
    genero: "livre",
    faixa_etaria_min: "",
    faixa_etaria_max: "",
    faixa_etaria_label: "",
    categoria_pai_id: "",
  });

  const addToast = useCallback((tipo: Toast["tipo"], mensagem: string) => {
    const id = ++toastId;
    setToasts((p) => [...p, { id, tipo, mensagem }]);
    setTimeout(() => {
      setToasts((p) => p.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removerToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    async function carregar() {
      const supabase = createClient();
      setLoading(true);

      const [{ data: ev }, { data: cats }, { data: apres }] = await Promise.all([
        supabase.from("eventos").select("*").eq("id", eventoId).single(),
        supabase.from("categorias").select("*").eq("evento_id", eventoId).order("nome"),
        supabase
          .from("apresentacoes")
          .select("id, nome, tipo, ordem_apresentacao, status_pagamento")
          .eq("evento_id", eventoId)
          .order("ordem_apresentacao", { ascending: true, nullsFirst: false }),
      ]);

      if (!ev) {
        router.push("/eventos");
        return;
      }

      setEvento(ev);
      setForm(ev);

      if (ev.produtora_id) {
        const { data: config } = await supabase
          .from("tenant_config")
          .select("perfis_festival:perfil_id ( slug )")
          .eq("produtora_id", ev.produtora_id)
          .maybeSingle();

        const slugConfig = (config as { perfis_festival?: { slug?: string } | null } | null)?.perfis_festival?.slug;
        if (slugConfig) {
          setPerfilSlug(slugConfig);
        }
      }

      const todasCats = (cats ?? []) as Categoria[];
      const pais = todasCats
        .filter((c) => !c.categoria_pai_id)
        .map((pai) => ({
          ...pai,
          subcategorias: todasCats.filter((c) => c.categoria_pai_id === pai.id),
        }));

      setCategorias(pais);
      setApresentacoes((apres ?? []) as Apresentacao[]);

      const total = (apres ?? []).length;
      const pendentes = (apres ?? []).filter((a) => a.status_pagamento === "Pendente").length;
      setTotalInscritos(total);
      setTotalPendentes(pendentes);

      try {
        const { count } = await supabase
          .from("usuarios")
          .select("id", { count: "exact", head: true })
          .eq("role", "jurado");

        setTotalJurados(count ?? 0);
      } catch {}

      try {
        const { count } = await supabase
          .from("criterios_avaliacao")
          .select("id", { count: "exact", head: true })
          .eq("evento_id", eventoId);

        setCriteriosConfigurados((count ?? 0) > 0);
      } catch {}

      try {
        const { count } = await supabase
          .from("pdv_config")
          .select("id", { count: "exact", head: true })
          .eq("evento_id", eventoId);

        setPdvConfigurado((count ?? 0) > 0);
      } catch {}

      setLoading(false);
    }

    carregar();
  }, [eventoId, router]);

  async function salvarEvento() {
    const supabase = createClient();
    setSalvando(true);

    const { error } = await supabase
      .from("eventos")
      .update({
        nome: form.nome,
        local: form.local,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        status: form.status,
        descricao: form.descricao,
      })
      .eq("id", eventoId);

    if (!error) {
      setEvento({ ...evento!, ...(form as Evento) });
      addToast("sucesso", "Evento salvo com sucesso!");
    } else {
      addToast("erro", "Erro ao salvar. Tente novamente.");
    }

    setSalvando(false);
  }

  async function recarregarCategorias() {
    const supabase = createClient();
    const { data } = await supabase.from("categorias").select("*").eq("evento_id", eventoId).order("nome");

    const todasCats = (data ?? []) as Categoria[];
    const pais = todasCats
      .filter((c) => !c.categoria_pai_id)
      .map((pai) => ({
        ...pai,
        subcategorias: todasCats.filter((c) => c.categoria_pai_id === pai.id),
      }));

    setCategorias(pais);
  }

  function abrirModalNova() {
    setCatEditando(null);
    setFormCat({
      nome: "",
      valor_solo: 0,
      valor_duo: 0,
      valor_conjunto: 0,
      genero: "livre",
      faixa_etaria_min: "",
      faixa_etaria_max: "",
      faixa_etaria_label: "",
      categoria_pai_id: "",
    });
    setModalCat(true);
  }

  function abrirModalEditar(cat: Categoria) {
    setCatEditando(cat);
    setFormCat({
      nome: cat.nome,
      valor_solo: cat.valor_solo,
      valor_duo: cat.valor_duo,
      valor_conjunto: cat.valor_conjunto,
      genero: cat.genero,
      faixa_etaria_min: cat.faixa_etaria_min?.toString() ?? "",
      faixa_etaria_max: cat.faixa_etaria_max?.toString() ?? "",
      faixa_etaria_label: cat.faixa_etaria_label ?? "",
      categoria_pai_id: cat.categoria_pai_id ?? "",
    });
    setModalCat(true);
  }

  async function salvarCategoria() {
    const supabase = createClient();

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
        addToast("sucesso", `"${formCat.nome}" atualizada!`);
        recarregarCategorias();
      } else {
        addToast("erro", "Erro ao atualizar categoria.");
      }
    } else {
      const { error } = await supabase.from("categorias").insert(payload);

      if (!error) {
        addToast("sucesso", `"${formCat.nome}" criada!`);
        recarregarCategorias();
      } else {
        addToast("erro", "Erro ao criar categoria.");
      }
    }

    setModalCat(false);
  }

  async function excluirCategoria(id: string, nome: string) {
    const supabase = createClient();
    const { error } = await supabase.from("categorias").delete().eq("id", id);

    if (!error) {
      addToast("sucesso", `"${nome}" removida.`);
      recarregarCategorias();
    } else {
      addToast("erro", "Erro ao remover categoria.");
    }
  }

  async function onDragEnd(result: DropResult) {
    const supabase = createClient();

    if (!result.destination) return;

    const items = Array.from(apresentacoes);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const reordenadas = items.map((c, i) => ({ ...c, ordem_apresentacao: i + 1 }));
    setApresentacoes(reordenadas);

    await Promise.all(
      reordenadas.map((c) =>
        supabase.from("apresentacoes").update({ ordem_apresentacao: c.ordem_apresentacao }).eq("id", c.id)
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

  const categoriasRaiz = categorias.filter((c) => !c.categoria_pai_id);
  const presetAtual = PRESETS[perfilSlug] || PRESETS.multidisciplinar;

  return (
    <>
      <ToastContainer toasts={toasts} remover={removerToast} />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/eventos"
            className="w-10 h-10 bg-axon-panel border border-axon-border rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-axon-gold hover:bg-axon-gold/10 transition-all duration-200"
          >
            <ChevronLeft size={20} />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{evento.nome}</h1>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CORES[evento.status] ?? "text-gray-400 bg-white/5 border-white/10"}`}
              >
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

        <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
          <div className="flex border-b border-axon-border px-4 overflow-x-auto">
            {[
              { id: "visao-geral", label: "Visão Geral", icon: LayoutDashboard },
              { id: "configuracoes", label: "Configurações", icon: Settings },
              { id: "categorias", label: "Categorias & Taxas", icon: ListTree },
              { id: "lineup", label: "Line-up", icon: CalendarDays },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAbaAtiva(id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${
                  abaAtiva === id
                    ? "border-axon-gold text-axon-gold"
                    : "border-transparent text-gray-400 hover:text-white hover:border-gray-600"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {abaAtiva === "visao-geral" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Visão Geral do Evento</h3>
                  <p className="text-sm text-gray-400">
                    Acompanhe o status atual e verifique o que ainda precisa ser configurado antes de abrir as inscrições.
                  </p>
                </div>

                {evento.status === "rascunho" && (
                  <div className="bg-axon-gold/10 border border-axon-gold/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-axon-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-axon-gold font-semibold text-sm">Evento em Rascunho — inscrições bloqueadas</p>
                      <p className="text-gray-300 text-sm mt-1">
                        As organizações ainda não podem se inscrever. Quando tudo estiver configurado, vá em{" "}
                        <button
                          onClick={() => setAbaAtiva("configuracoes")}
                          className="text-axon-gold underline hover:no-underline"
                        >
                          Configurações
                        </button>{" "}
                        e mude o status para <strong>Inscrições Abertas</strong>.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Inscrições",
                      valor: totalInscritos,
                      icon: Users,
                      cor: "text-axon-gold",
                      sufixo: totalInscritos === 1 ? "inscrição" : "inscrições",
                    },
                    {
                      label: "Pagamentos Pendentes",
                      valor: totalPendentes,
                      icon: CreditCard,
                      cor: totalPendentes > 0 ? "text-red-400" : "text-emerald-400",
                      sufixo: totalPendentes > 0 ? "aguardando" : "tudo em dia",
                    },
                    {
                      label: "Jurados",
                      valor: totalJurados,
                      icon: Star,
                      cor: "text-white",
                      sufixo: totalJurados === 1 ? "jurado cadastrado" : "jurados cadastrados",
                      onClick: () => router.push(`/jurados?eventoId=${eventoId}`),
                    },
                    {
                      label: "PDV & Bilheteria",
                      valor: pdvConfigurado ? "Ativo" : "Inativo",
                      icon: ShoppingCart,
                      cor: pdvConfigurado ? "text-emerald-400" : "text-gray-500",
                      sufixo: pdvConfigurado ? "Configurado" : "Não configurado",
                      onClick: () => router.push(`/pdv?eventoId=${eventoId}`),
                    },
                  ].map(({ label, valor, icon: Icon, cor, sufixo, onClick }) =>
                    onClick ? (
                      <button
                        key={label}
                        onClick={onClick}
                        className="bg-axon-bg border border-axon-border rounded-xl p-5 text-left hover:border-gray-600 hover:bg-white/[0.02] transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
                          <Icon size={16} className={cor} />
                        </div>
                        <p className={`text-2xl font-bold tabular-nums ${cor}`}>{valor}</p>
                        <p className="text-xs text-gray-500 mt-1">{sufixo}</p>
                      </button>
                    ) : (
                      <div key={label} className="bg-axon-bg border border-axon-border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
                          <Icon size={16} className={cor} />
                        </div>
                        <p className={`text-2xl font-bold tabular-nums ${cor}`}>{valor}</p>
                        <p className="text-xs text-gray-500 mt-1">{sufixo}</p>
                      </div>
                    )
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Checklist de Preparação</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Complete esses itens antes de abrir as inscrições para as organizações.
                  </p>

                  <div className="bg-axon-bg border border-axon-border rounded-xl divide-y divide-axon-border">
                    {[
                      {
                        label: "Dados básicos preenchidos",
                        descricao: "Nome, local e datas do evento",
                        ok: !!(evento.nome && evento.local && evento.data_inicio),
                        acao: "configuracoes",
                        onAcao: null as null | (() => void),
                        acaoLabel: "Preencher →",
                      },
                      {
                        label: "Ao menos 1 categoria criada",
                        descricao: "Categorias definem as taxas e faixas etárias aceitas",
                        ok: categorias.length > 0,
                        acao: "categorias",
                        onAcao: null as null | (() => void),
                        acaoLabel: "Criar categoria →",
                      },
                      {
                        label: "Jurados configurados",
                        descricao: "Módulo de avaliação",
                        ok: criteriosConfigurados,
                        acao: null,
                        onAcao: () => router.push(`/jurados?eventoId=${eventoId}`),
                        acaoLabel: "Configurar →",
                      },
                      {
                        label: "PDV & Bilheteria configurados",
                        descricao: "Ponto de venda no dia do evento",
                        ok: pdvConfigurado,
                        acao: null,
                        onAcao: () => router.push(`/pdv?eventoId=${eventoId}`),
                        acaoLabel: "Configurar →",
                      },
                    ].map(({ label, descricao, ok, acao, onAcao, acaoLabel }) => (
                      <div key={label} className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-emerald-500/20" : "bg-white/5"}`}>
                            {ok ? (
                              <CheckCircle size={14} className="text-emerald-400" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-gray-600" />
                            )}
                          </div>

                          <div>
                            <p className={`text-sm font-medium ${ok ? "text-white" : "text-gray-300"}`}>{label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{descricao}</p>
                          </div>
                        </div>

                        {!ok && acao && acaoLabel && (
                          <button
                            onClick={() => setAbaAtiva(acao)}
                            className="text-xs text-axon-gold hover:text-white hover:bg-axon-gold/10 px-3 py-1.5 rounded-lg border border-axon-gold/30 transition-all duration-200 whitespace-nowrap"
                          >
                            {acaoLabel}
                          </button>
                        )}

                        {!ok && onAcao && acaoLabel && (
                          <button
                            onClick={onAcao}
                            className="text-xs text-axon-gold hover:text-white hover:bg-axon-gold/10 px-3 py-1.5 rounded-lg border border-axon-gold/30 transition-all duration-200 whitespace-nowrap"
                          >
                            {acaoLabel}
                          </button>
                        )}

                        {!ok && !acao && !onAcao && (
                          <span className="text-xs text-gray-600 bg-white/5 px-2.5 py-1 rounded-full">Em breve</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {abaAtiva === "configuracoes" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Dados do Evento</h3>
                  <p className="text-sm text-gray-400">
                    Informações básicas do festival. O status controla se as inscrições estão abertas ou não.
                  </p>
                </div>

                <div
                  className={`rounded-xl p-4 border text-sm flex items-start gap-2.5 ${
                    form.status === "inscricoes_abertas"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      : form.status === "em_andamento"
                        ? "bg-axon-gold/10 border-axon-gold/20 text-axon-gold"
                        : form.status === "encerrado"
                          ? "bg-red-400/10 border-red-400/20 text-red-300"
                          : "bg-white/5 border-white/10 text-gray-400"
                  }`}
                >
                  <Info size={15} className="shrink-0 mt-0.5" />
                  <span>
                    {form.status === "rascunho" && "Rascunho — o formulário de inscrição está bloqueado para as organizações."}
                    {form.status === "inscricoes_abertas" && "Inscrições Abertas — as organizações já podem se inscrever neste evento."}
                    {form.status === "em_andamento" && "Em Andamento — inscrições encerradas, evento em curso."}
                    {form.status === "encerrado" && "Encerrado — evento concluído. Os resultados podem ser disponibilizados."}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-gray-400 font-medium">Nome do Festival</label>
                    <input
                      type="text"
                      value={form.nome ?? ""}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold focus:ring-1 focus:ring-axon-gold/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Local</label>
                    <input
                      type="text"
                      value={form.local ?? ""}
                      placeholder="Ex: Teatro Municipal, São Paulo - SP"
                      onChange={(e) => setForm({ ...form, local: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold focus:ring-1 focus:ring-axon-gold/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Status</label>
                    <select
                      value={form.status ?? ""}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold focus:ring-1 focus:ring-axon-gold/20 transition-all duration-200"
                    >
                      <option value="rascunho">Rascunho</option>
                      <option value="inscricoes_abertas">Inscrições Abertas</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="encerrado">Encerrado</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Data de Início</label>
                    <input
                      type="date"
                      value={form.data_inicio ?? ""}
                      onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold focus:ring-1 focus:ring-axon-gold/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Data de Fim</label>
                    <input
                      type="date"
                      value={form.data_fim ?? ""}
                      onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold focus:ring-1 focus:ring-axon-gold/20 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-gray-400 font-medium">Descrição / Observações</label>
                    <textarea
                      rows={3}
                      value={form.descricao ?? ""}
                      placeholder="Informações adicionais sobre o evento, regras gerais, etc."
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold focus:ring-1 focus:ring-axon-gold/20 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={salvarEvento}
                    disabled={salvando}
                    className="flex items-center gap-2 bg-axon-gold text-black font-bold px-6 py-2.5 rounded-lg hover:bg-axon-gold/80 hover:shadow-lg hover:shadow-axon-gold/20 active:scale-95 transition-all duration-200 disabled:opacity-50"
                  >
                    {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {salvando ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </div>
            )}

            {abaAtiva === "categorias" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Categorias & Taxas</h3>
                    <p className="text-sm text-gray-400">
                      Defina as categorias de competição deste evento com suas respectivas taxas de inscrição.
                    </p>
                  </div>

                  <button
                    onClick={abrirModalNova}
                    className="flex items-center gap-2 text-sm bg-axon-gold text-black font-bold px-4 py-2.5 rounded-lg hover:bg-axon-gold/80 hover:shadow-lg hover:shadow-axon-gold/20 active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0"
                  >
                    <Plus size={16} />
                    Nova Categoria
                  </button>
                </div>

                <Dica>{presetAtual.dica}</Dica>

                {categorias.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-axon-border rounded-xl text-gray-500">
                    <ListTree size={40} className="mx-auto mb-3 opacity-20 text-axon-gold" />
                    <p className="font-medium text-gray-300">Nenhuma categoria ainda</p>
                    <p className="text-sm mt-1 text-gray-500">
                      Crie a primeira categoria para definir as taxas de inscrição do evento.
                    </p>
                    <button
                      onClick={abrirModalNova}
                      className="mt-4 text-sm text-axon-gold hover:text-white border border-axon-gold/30 hover:border-axon-gold hover:bg-axon-gold/10 px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Criar primeira categoria
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categorias.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-axon-bg border border-axon-border rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center justify-between p-4 group">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-semibold">{cat.nome}</p>
                              <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                {GENERO_LABELS[cat.genero]}
                              </span>
                              {cat.faixa_etaria_label && (
                                <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                  {cat.faixa_etaria_label}
                                  {cat.faixa_etaria_min && cat.faixa_etaria_max
                                    ? ` (${cat.faixa_etaria_min}–${cat.faixa_etaria_max} anos)`
                                    : ""}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-400 mt-1.5">
                              {presetAtual.taxaSolo.replace(" (R$)", "")}: <span className="text-white">{moeda(cat.valor_solo)}</span>
                              {" · "}
                              {presetAtual.taxaDuo.replace(" (R$)", "")}: <span className="text-white">{moeda(cat.valor_duo)}</span>
                              {" · "}
                              {presetAtual.taxaConjunto.replace(" (R$)", "")}: <span className="text-white">{moeda(cat.valor_conjunto)}/pax</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => abrirModalEditar(cat)}
                              className="p-2 text-gray-400 hover:text-axon-gold hover:bg-axon-gold/10 rounded-lg transition-all duration-200"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => excluirCategoria(cat.id, cat.nome)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {cat.subcategorias && cat.subcategorias.length > 0 && (
                          <div className="border-t border-axon-border divide-y divide-axon-border bg-black/10">
                            {cat.subcategorias.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between px-4 py-3 group">
                                <div className="flex items-center gap-3 pl-4">
                                  <div className="w-px h-4 bg-axon-border" />
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm text-gray-200 font-medium">{sub.nome}</p>
                                      <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                        {GENERO_LABELS[sub.genero]}
                                      </span>
                                      {sub.faixa_etaria_label && (
                                        <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                          {sub.faixa_etaria_label}
                                          {sub.faixa_etaria_min && sub.faixa_etaria_max
                                            ? ` (${sub.faixa_etaria_min}–${sub.faixa_etaria_max} anos)`
                                            : ""}
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {presetAtual.taxaSolo.replace(" (R$)", "")}: {moeda(sub.valor_solo)} ·{" "}
                                      {presetAtual.taxaDuo.replace(" (R$)", "")}: {moeda(sub.valor_duo)} ·{" "}
                                      {presetAtual.taxaConjunto.replace(" (R$)", "")}: {moeda(sub.valor_conjunto)}/pax
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => abrirModalEditar(sub)}
                                    className="p-2 text-gray-400 hover:text-axon-gold hover:bg-axon-gold/10 rounded-lg transition-all duration-200"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => excluirCategoria(sub.id, sub.nome)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="border-t border-axon-border px-4 py-2">
                          <button
                            onClick={() => {
                              setCatEditando(null);
                              setFormCat({
                                nome: "",
                                valor_solo: 0,
                                valor_duo: 0,
                                valor_conjunto: 0,
                                genero: "livre",
                                faixa_etaria_min: "",
                                faixa_etaria_max: "",
                                faixa_etaria_label: "",
                                categoria_pai_id: cat.id,
                              });
                              setModalCat(true);
                            }}
                            className="text-xs text-gray-500 hover:text-axon-gold transition-all duration-200 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-axon-gold/5"
                          >
                            <Plus size={12} />
                            Adicionar subcategoria
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {abaAtiva === "lineup" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Montagem do Line-up</h3>
                  <p className="text-sm text-gray-400">
                    Defina a ordem de apresentação do evento. As apresentações aparecem aqui após as inscrições serem aprovadas.
                  </p>
                </div>

                <Dica>
                  Arraste e solte as apresentações para reordenar. A ordem salva automaticamente e será usada na geração do programa oficial do evento.
                </Dica>

                {apresentacoes.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-axon-border rounded-xl text-gray-500">
                    <CalendarDays size={40} className="mx-auto mb-3 opacity-20 text-axon-gold" />
                    <p className="font-medium text-gray-300">Nenhuma apresentação ainda</p>
                    <p className="text-sm mt-1 text-gray-500">
                      As apresentações aparecerão aqui após as organizações se inscreverem e as inscrições forem aprovadas.
                    </p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="lineup">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {apresentacoes.map((ap, index) => (
                            <Draggable key={ap.id} draggableId={ap.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-4 bg-axon-bg border rounded-xl p-3.5 transition-all cursor-move group ${
                                    snapshot.isDragging
                                      ? "border-axon-gold shadow-lg shadow-axon-gold/10 scale-[1.02]"
                                      : "border-axon-border hover:border-gray-600"
                                  }`}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                    <GripVertical size={20} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                                  </div>

                                  <div className="w-8 h-8 rounded-lg bg-axon-gold/10 border border-axon-gold/20 flex items-center justify-center text-xs font-bold text-axon-gold">
                                    {index + 1}
                                  </div>

                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium">{ap.nome}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{ap.tipo || "Tipo não informado"}</p>
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

      {modalCat && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setModalCat(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {catEditando ? "Editar Categoria" : formCat.categoria_pai_id ? "Nova Subcategoria" : "Nova Categoria"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formCat.categoria_pai_id
                      ? presetAtual.explicacaoSub
                      : "Categoria principal. Você pode adicionar subcategorias depois."}
                  </p>
                </div>

                <button
                  onClick={() => setModalCat(false)}
                  className="text-gray-500 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-all duration-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {!formCat.categoria_pai_id && !catEditando?.categoria_pai_id && (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">
                      Categoria Pai <span className="text-gray-600 font-normal">(opcional)</span>
                    </label>
                    <select
                      value={formCat.categoria_pai_id}
                      onChange={(e) => setFormCat({ ...formCat, categoria_pai_id: e.target.value })}
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-all duration-200"
                    >
                      <option value="">Nenhuma (categoria raiz)</option>
                      {categoriasRaiz.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Nome *</label>
                  <input
                    type="text"
                    placeholder={presetAtual.placeholderNome}
                    value={formCat.nome}
                    onChange={(e) => setFormCat({ ...formCat, nome: e.target.value })}
                    className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Gênero</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["livre", "feminino", "masculino", "misto"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setFormCat({ ...formCat, genero: g })}
                        className={`py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                          formCat.genero === g
                            ? "bg-axon-gold text-black border-axon-gold shadow-md shadow-axon-gold/20"
                            : "bg-axon-bg border-axon-border text-gray-400 hover:text-white hover:border-gray-500"
                        }`}
                      >
                        {GENERO_LABELS[g]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">
                    Faixa Etária <span className="text-gray-600 font-normal">(opcional)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Label</label>
                      <input
                        type="text"
                        placeholder="Ex: Infantil"
                        value={formCat.faixa_etaria_label}
                        onChange={(e) => setFormCat({ ...formCat, faixa_etaria_label: e.target.value })}
                        className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-axon-gold transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Idade mínima</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="6"
                        value={formCat.faixa_etaria_min}
                        onChange={(e) => setFormCat({ ...formCat, faixa_etaria_min: e.target.value })}
                        className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-axon-gold transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Idade máxima</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="12"
                        value={formCat.faixa_etaria_max}
                        onChange={(e) => setFormCat({ ...formCat, faixa_etaria_max: e.target.value })}
                        className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-axon-gold transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">Taxas de Inscrição</label>
                  <p className="text-xs text-gray-500">Valor cobrado por modalidade. O terceiro campo é o valor por participante.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["valor_solo", "valor_duo", "valor_conjunto"] as const).map((campo) => {
                      const labelTaxa =
                        campo === "valor_solo"
                          ? presetAtual.taxaSolo
                          : campo === "valor_duo"
                            ? presetAtual.taxaDuo
                            : presetAtual.taxaConjunto;

                      return (
                        <div key={campo} className="space-y-1">
                          <label className="text-xs text-gray-500">{labelTaxa}</label>
                          <input
                            type="number"
                            min={0}
                            value={formCat[campo]}
                            onChange={(e) => setFormCat({ ...formCat, [campo]: Number(e.target.value) })}
                            className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-axon-gold transition-all duration-200"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setModalCat(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  Cancelar
                </button>

                <button
                  onClick={salvarCategoria}
                  disabled={!formCat.nome.trim()}
                  className="flex items-center gap-2 bg-axon-gold text-black font-bold px-5 py-2.5 rounded-lg hover:bg-axon-gold/80 hover:shadow-lg hover:shadow-axon-gold/20 active:scale-95 transition-all duration-200 text-sm disabled:opacity-50"
                >
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