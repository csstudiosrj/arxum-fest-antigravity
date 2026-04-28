"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  PersonStanding,
  Music2,
  Drama,
  GraduationCap,
  Zap,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  Plus,
  X,
  Building2,
  Type,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

type PerfilFestival = {
  id: string;
  slug: string;
  nome: string;
  icone: string;
  descricao: string;
  ordem: number;
};

type Estilo = {
  id: string;
  perfil_id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
};

type EstiloAtivo = {
  id: string;
  estilo_id: string;
  organizacao_id: string;
  ativo: boolean;
};

type TenantConfig = {
  id: string;
  organizacao_id: string;
  perfil_id: string | null;
  nome_organizacao: string | null;
  logo_url: string | null;
  cor_primaria: string | null;
  termo_inscricao: string | null;
  termo_participante: string | null;
  termo_grupo: string | null;
  termo_apresentacao: string | null;
  termo_evento: string | null;
};

type Toast = {
  id: number;
  tipo: "sucesso" | "erro" | "aviso";
  mensagem: string;
};

type AbaId = "perfil" | "estilos" | "terminologia" | "organizacao";

// ─────────────────────────────────────────────────────────────────────────────
// ÍCONES DOS PERFIS
// ─────────────────────────────────────────────────────────────────────────────

const ICONE_MAP: Record<string, React.ReactNode> = {
  PersonStanding: <PersonStanding size={26} />,
  Music2: <Music2 size={26} />,
  Drama: <Drama size={26} />,
  GraduationCap: <GraduationCap size={26} />,
  Zap: <Zap size={26} />,
  Sparkles: <Sparkles size={26} />,
};

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────

let _toastId = 0;

function ToastContainer({
  toasts,
  remover,
}: {
  toasts: Toast[];
  remover: (id: number) => void;
}) {
  const cores: Record<Toast["tipo"], string> = {
    sucesso: "border-emerald-500/40 bg-[#1a1413]",
    erro: "border-red-500/40 bg-[#1a1413]",
    aviso: "border-yellow-500/40 bg-[#1a1413]",
  };
  const icones: Record<Toast["tipo"], React.ReactNode> = {
    sucesso: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
    erro: <XCircle size={16} className="text-red-400 shrink-0" />,
    aviso: <AlertTriangle size={16} className="text-yellow-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto transition-all duration-300 ${cores[t.tipo]}`}
        >
          {icones[t.tipo]}
          <span className="text-sm font-medium text-white">{t.mensagem}</span>
          <button
            onClick={() => remover(t.id)}
            className="ml-2 text-gray-600 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE CONFIRMAÇÃO (troca de perfil)
// ─────────────────────────────────────────────────────────────────────────────

function ModalConfirmacao({
  perfilNome,
  onConfirmar,
  onCancelar,
  carregando,
}: {
  perfilNome: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  carregando: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[100]" onClick={!carregando ? onCancelar : undefined} />
      <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
        <div className="bg-[#1a1413] border border-[#2e2825] rounded-2xl w-full max-w-md p-7 space-y-5 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20 shrink-0">
              <AlertTriangle size={22} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Trocar tipo de festival?</h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                Ao mudar para <strong className="text-white">{perfilNome}</strong>, todos os estilos
                atualmente ativados serão <strong className="text-red-400">desativados</strong>.
                Você precisará reconfigurar os estilos para o novo perfil.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancelar}
              disabled={carregando}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={carregando}
              className="flex items-center gap-2 bg-yellow-500 text-black font-semibold px-5 py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm disabled:opacity-50 min-w-[130px] justify-center"
            >
              {carregando ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Sim, trocar perfil"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON DE LOADING
// ─────────────────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#2e2825]/60 rounded-lg ${className ?? ""}`} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="bg-[#1a1413] border border-[#2e2825] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#2e2825] px-4 gap-2 py-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-32 my-2" />
          ))}
        </div>
        <div className="p-8 space-y-5">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const supabase = createClient();

  // ── Estado Global ──────────────────────────────────────────────────────────
  const [abaAtiva, setAbaAtiva] = useState<AbaId>("perfil");
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Estado do Tenant ───────────────────────────────────────────────────────
  const [organizacaoId, setOrganizacaoId] = useState<string | null>(null);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [formConfig, setFormConfig] = useState<Partial<TenantConfig>>({});

  // ── Estado de Perfis e Estilos ─────────────────────────────────────────────
  const [perfis, setPerfis] = useState<PerfilFestival[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [estilosAtivos, setEstilosAtivos] = useState<EstiloAtivo[]>([]);

  // ── Estados de Salvando por Seção ─────────────────────────────────────────
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoTerminologia, setSalvandoTerminologia] = useState(false);
  const [salvandoOrganizacao, setSalvandoOrganizacao] = useState(false);

  // ── Modal Troca de Perfil ──────────────────────────────────────────────────
  const [modalTroca, setModalTroca] = useState<PerfilFestival | null>(null);
  const [trocandoPerfil, setTrocandoPerfil] = useState(false);

  // ── Modal Novo Estilo ──────────────────────────────────────────────────────
  const [modalEstilo, setModalEstilo] = useState(false);
  const [novoEstilo, setNovoEstilo] = useState({ nome: "", descricao: "" });
  const [criandoEstilo, setCriandoEstilo] = useState(false);

  // ── Ref para debounce de preview ──────────────────────────────────────────
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // TOAST HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const addToast = useCallback((tipo: Toast["tipo"], mensagem: string) => {
    const id = ++_toastId;
    setToasts((p) => [...p, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removerToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // CARGA INICIAL
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      try {
        // 1. Identificar o usuário logado
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) throw new Error("Usuário não autenticado.");

        // 2. Buscar organizacao_id na tabela usuarios
        const { data: usuarioData, error: usuarioError } = await supabase
          .from("usuarios")
          .select("id, organizacao_id")
          .eq("id", user.id)
          .single();

        if (usuarioError || !usuarioData) throw new Error("Usuário não encontrado.");

        const eid = usuarioData.organizacao_id;
        setOrganizacaoId(eid);

        // 3. Carregar dados em paralelo
        const [
          { data: perfisData, error: perfisError },
          { data: configData, error: configError },
          { data: estilosAtivosData, error: estilosAtivosError },
        ] = await Promise.all([
          supabase.from("perfis_festival").select("*").order("ordem"),
          supabase.from("tenant_config").select("*").eq("organizacao_id", eid).single(),
          supabase.from("tenant_estilos_ativos").select("*").eq("organizacao_id", eid),
        ]);

        if (perfisError) throw perfisError;
        if (configError && configError.code !== "PGRST116") throw configError;
        if (estilosAtivosError) throw estilosAtivosError;

        setPerfis(perfisData ?? []);
        setEstilosAtivos(estilosAtivosData ?? []);

        // 4. Se config existe, usar; senão criar linha inicial
        if (configData) {
          setConfig(configData);
          setFormConfig(configData);

          // Carregar estilos do perfil ativo
          if (configData.perfil_id) {
            await carregarEstilosDoPerfil(configData.perfil_id);
          }
        } else {
          // Cria config inicial para este tenant
          const { data: novaConfig, error: criacaoError } = await supabase
            .from("tenant_config")
            .insert({ organizacao_id: eid })
            .select()
            .single();

          if (criacaoError) throw criacaoError;
          setConfig(novaConfig);
          setFormConfig(novaConfig);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao carregar configurações.";
        addToast("erro", msg);
      } finally {
        setLoading(false);
      }
    }

    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  async function carregarEstilosDoPerfil(perfilId: string) {
    try {
      const { data, error } = await supabase
        .from("estilos")
        .select("*")
        .eq("perfil_id", perfilId)
        .order("ordem");

      if (error) throw error;
      setEstilos(data ?? []);
    } catch {
      addToast("erro", "Erro ao carregar estilos do perfil.");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SELEÇÃO DE PERFIL (com modal de confirmação se já tem perfil)
  // ─────────────────────────────────────────────────────────────────────────

  function selecionarPerfil(perfil: PerfilFestival) {
    if (formConfig.perfil_id === perfil.id) return;

    // Se já tinha um perfil ativo com estilos, pede confirmação
    if (formConfig.perfil_id && estilosAtivos.length > 0) {
      setModalTroca(perfil);
      return;
    }

    // Sem estilos ativos, troca direto
    executarTrocaDePerfil(perfil);
  }

  async function executarTrocaDePerfil(perfil: PerfilFestival) {
    setTrocandoPerfil(true);
    try {
      if (!organizacaoId) throw new Error("organizacao_id não encontrado.");

      // Limpa estilos ativos do tenant
      if (estilosAtivos.length > 0) {
        const { error } = await supabase
          .from("tenant_estilos_ativos")
          .delete()
          .eq("organizacao_id", organizacaoId);
        if (error) throw error;
        setEstilosAtivos([]);
      }

      // Atualiza formConfig local
      setFormConfig((p) => ({ ...p, perfil_id: perfil.id }));

      // Carrega estilos do novo perfil
      await carregarEstilosDoPerfil(perfil.id);

      addToast("sucesso", `Perfil "${perfil.nome}" selecionado. Salve para confirmar.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao trocar perfil.";
      addToast("erro", msg);
    } finally {
      setTrocandoPerfil(false);
      setModalTroca(null);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOGGLE ESTILO
  // ─────────────────────────────────────────────────────────────────────────

  async function toggleEstilo(estilo: Estilo) {
    if (!organizacaoId) return;

    const jaAtivo = estilosAtivos.find((e) => e.estilo_id === estilo.id);

    try {
      if (jaAtivo) {
        const { error } = await supabase
          .from("tenant_estilos_ativos")
          .delete()
          .eq("estilo_id", estilo.id)
          .eq("organizacao_id", organizacaoId);

        if (error) throw error;
        setEstilosAtivos((p) => p.filter((e) => e.estilo_id !== estilo.id));
      } else {
        const { data, error } = await supabase
          .from("tenant_estilos_ativos")
          .insert({ estilo_id: estilo.id, organizacao_id: organizacaoId, ativo: true })
          .select()
          .single();

        if (error) throw error;
        if (data) setEstilosAtivos((p) => [...p, data]);
      }
    } catch {
      addToast("erro", `Erro ao ${jaAtivo ? "desativar" : "ativar"} "${estilo.nome}".`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ATIVAR / DESATIVAR TODOS
  // ─────────────────────────────────────────────────────────────────────────

  async function toggleTodos(ativar: boolean) {
    if (!organizacaoId) return;

    try {
      if (ativar) {
        const faltando = estilos.filter(
          (e) => !estilosAtivos.find((a) => a.estilo_id === e.id)
        );
        if (faltando.length === 0) {
          addToast("aviso", "Todos os estilos já estão ativos.");
          return;
        }

        const { data, error } = await supabase
          .from("tenant_estilos_ativos")
          .insert(faltando.map((e) => ({ estilo_id: e.id, organizacao_id: organizacaoId, ativo: true })))
          .select();

        if (error) throw error;
        setEstilosAtivos((p) => [...p, ...(data ?? [])]);
        addToast("sucesso", `${faltando.length} estilos ativados!`);
      } else {
        const { error } = await supabase
          .from("tenant_estilos_ativos")
          .delete()
          .eq("organizacao_id", organizacaoId)
          .in(
            "estilo_id",
            estilos.map((e) => e.id)
          );

        if (error) throw error;
        setEstilosAtivos([]);
        addToast("sucesso", "Todos os estilos foram desativados.");
      }
    } catch {
      addToast("erro", "Erro ao atualizar estilos em lote.");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRIAR ESTILO CUSTOMIZADO
  // ─────────────────────────────────────────────────────────────────────────

  async function criarEstiloManual() {
    if (!novoEstilo.nome.trim() || !formConfig.perfil_id || !organizacaoId) return;

    setCriandoEstilo(true);
    try {
      const slug =
        "custom-" +
        novoEstilo.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now();

      const { data: estiloData, error: estiloError } = await supabase
        .from("estilos")
        .insert({
          perfil_id: formConfig.perfil_id,
          nome: novoEstilo.nome.trim(),
          slug,
          descricao: novoEstilo.descricao.trim() || null,
          ordem: estilos.length + 1,
        })
        .select()
        .single();

      if (estiloError) throw estiloError;

      setEstilos((p) => [...p, estiloData]);

      // Ativa automaticamente
      const { data: ativoData, error: ativoError } = await supabase
        .from("tenant_estilos_ativos")
        .insert({ estilo_id: estiloData.id, organizacao_id: organizacaoId, ativo: true })
        .select()
        .single();

      if (ativoError) throw ativoError;
      if (ativoData) setEstilosAtivos((p) => [...p, ativoData]);

      addToast("sucesso", `"${novoEstilo.nome}" criado e ativado!`);
      setNovoEstilo({ nome: "", descricao: "" });
      setModalEstilo(false);
    } catch {
      addToast("erro", "Erro ao criar estilo. Verifique e tente novamente.");
    } finally {
      setCriandoEstilo(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SALVAR POR SEÇÃO
  // ─────────────────────────────────────────────────────────────────────────

  async function salvarPerfil() {
    if (!config?.id || !organizacaoId) return;
    setSalvandoPerfil(true);
    try {
      const { error } = await supabase
        .from("tenant_config")
        .update({
          perfil_id: formConfig.perfil_id,
          updated_at: new Date().toISOString(),
        })
        .eq("organizacao_id", organizacaoId);

      if (error) throw error;
      setConfig((c) => c ? { ...c, perfil_id: formConfig.perfil_id ?? null } : c);
      addToast("sucesso", "Tipo de festival salvo com sucesso!");
    } catch {
      addToast("erro", "Erro ao salvar tipo de festival.");
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function salvarTerminologia() {
    if (!config?.id || !organizacaoId) return;
    setSalvandoTerminologia(true);
    try {
      const { error } = await supabase
        .from("tenant_config")
        .update({
          termo_inscricao: formConfig.termo_inscricao,
          termo_participante: formConfig.termo_participante,
          termo_grupo: formConfig.termo_grupo,
          termo_apresentacao: formConfig.termo_apresentacao,
          termo_evento: formConfig.termo_evento,
          updated_at: new Date().toISOString(),
        })
        .eq("organizacao_id", organizacaoId);

      if (error) throw error;
      setConfig((c) =>
        c
          ? {
              ...c,
              termo_inscricao: formConfig.termo_inscricao ?? null,
              termo_participante: formConfig.termo_participante ?? null,
              termo_grupo: formConfig.termo_grupo ?? null,
              termo_apresentacao: formConfig.termo_apresentacao ?? null,
              termo_evento: formConfig.termo_evento ?? null,
            }
          : c
      );
      addToast("sucesso", "Terminologia salva com sucesso!");
    } catch {
      addToast("erro", "Erro ao salvar terminologia.");
    } finally {
      setSalvandoTerminologia(false);
    }
  }

  async function salvarOrganizacao() {
    if (!config?.id || !organizacaoId) return;
    setSalvandoOrganizacao(true);
    try {
      const { error } = await supabase
        .from("tenant_config")
        .update({
          nome_organizacao: formConfig.nome_organizacao,
          logo_url: formConfig.logo_url,
          cor_primaria: formConfig.cor_primaria,
          updated_at: new Date().toISOString(),
        })
        .eq("organizacao_id", organizacaoId);

      if (error) throw error;
      setConfig((c) =>
        c
          ? {
              ...c,
              nome_organizacao: formConfig.nome_organizacao ?? null,
              logo_url: formConfig.logo_url ?? null,
              cor_primaria: formConfig.cor_primaria ?? null,
            }
          : c
      );
      addToast("sucesso", "Dados da organização salvos!");
    } catch {
      addToast("erro", "Erro ao salvar organização.");
    } finally {
      setSalvandoOrganizacao(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS DE FORM
  // ─────────────────────────────────────────────────────────────────────────

  function handleTerminologiaChange(campo: string, valor: string) {
    setFormConfig((p) => ({ ...p, [campo]: valor }));

    // Debounce para não re-renderizar a cada tecla no preview
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => {
      // Preview já é reativo via formConfig, apenas limpa o timeout
    }, 300);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />;

  const perfilAtivo = perfis.find((p) => p.id === formConfig.perfil_id);
  const totalAtivos = estilosAtivos.filter((a) =>
    estilos.find((e) => e.id === a.estilo_id)
  ).length;

  const abas: { id: AbaId; label: string; icon: React.ElementType }[] = [
    { id: "perfil", label: "Tipo de Festival", icon: Sparkles },
    { id: "estilos", label: "Estilos & Modalidades", icon: ToggleRight },
    { id: "terminologia", label: "Terminologia", icon: Type },
    { id: "organizacao", label: "Organização", icon: Building2 },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} remover={removerToast} />

      {/* Modal de confirmação de troca de perfil */}
      {modalTroca && (
        <ModalConfirmacao
          perfilNome={modalTroca.nome}
          onConfirmar={() => executarTrocaDePerfil(modalTroca)}
          onCancelar={() => !trocandoPerfil && setModalTroca(null)}
          carregando={trocandoPerfil}
        />
      )}

      {/* Modal: Novo Estilo */}
      {modalEstilo && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-[100]"
            onClick={() => !criandoEstilo && setModalEstilo(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1a1413] border border-[#2e2825] rounded-2xl w-full max-w-md p-7 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Novo Estilo / Modalidade</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Vinculado ao perfil{" "}
                    <span className="text-gray-300 font-medium">{perfilAtivo?.nome}</span> e
                    ativado automaticamente.
                  </p>
                </div>
                {!criandoEstilo && (
                  <button
                    onClick={() => setModalEstilo(false)}
                    className="text-gray-600 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nome *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dança Cigana, Lindy Hop, Kuduro..."
                    value={novoEstilo.nome}
                    onChange={(e) => setNovoEstilo((p) => ({ ...p, nome: e.target.value }))}
                    disabled={criandoEstilo}
                    onKeyDown={(e) => e.key === "Enter" && criarEstiloManual()}
                    className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Breve descrição da modalidade..."
                    value={novoEstilo.descricao}
                    onChange={(e) => setNovoEstilo((p) => ({ ...p, descricao: e.target.value }))}
                    disabled={criandoEstilo}
                    className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-1">
                {!criandoEstilo && (
                  <button
                    onClick={() => setModalEstilo(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={criarEstiloManual}
                  disabled={criandoEstilo || !novoEstilo.nome.trim()}
                  className="flex items-center gap-2 bg-[#C5A059] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-[#d4b06a] transition-colors text-sm disabled:opacity-40 min-w-[140px] justify-center"
                >
                  {criandoEstilo ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Criar Estilo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PÁGINA ── */}
      <div className="max-w-5xl mx-auto space-y-6 pb-12">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Settings size={20} className="text-[#C5A059]" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Configurações do Sistema
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Configure o perfil, estilos, terminologia e dados da sua organização.
            </p>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-[#1a1413] border border-[#2e2825] rounded-2xl overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-[#2e2825] px-2 overflow-x-auto scrollbar-none">
            {abas.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAbaAtiva(id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${
                  abaAtiva === id
                    ? "border-[#C5A059] text-[#C5A059]"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">

            {/* ═══════════════════════════════════════════════
                ABA: TIPO DE FESTIVAL
            ═══════════════════════════════════════════════ */}
            {abaAtiva === "perfil" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Qual é o tipo do seu festival?
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-xl">
                      Define os estilos disponíveis, terminologia padrão e comportamento do sistema.
                      Trocar de perfil desativa os estilos atuais.
                    </p>
                  </div>
                  <button
                    onClick={salvarPerfil}
                    disabled={salvandoPerfil || !formConfig.perfil_id}
                    className="flex items-center gap-2 bg-[#C5A059] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-[#d4b06a] transition-colors text-sm disabled:opacity-40 whitespace-nowrap shrink-0"
                  >
                    {salvandoPerfil ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {salvandoPerfil ? "Salvando..." : "Salvar"}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {perfis.map((perfil) => {
                    const ativo = formConfig.perfil_id === perfil.id;
                    return (
                      <button
                        key={perfil.id}
                        onClick={() => selecionarPerfil(perfil)}
                        className={`relative flex flex-col items-center text-center gap-3 p-5 rounded-xl border transition-all duration-200 ${
                          ativo
                            ? "border-[#C5A059] bg-[#C5A059]/8 shadow-[0_0_20px_rgba(197,160,89,0.08)]"
                            : "border-[#2e2825] bg-[#0d0807] hover:border-[#3e3835] hover:bg-[#1a1413]"
                        }`}
                      >
                        {ativo && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle size={15} className="text-[#C5A059]" />
                          </div>
                        )}
                        <div className={ativo ? "text-[#C5A059]" : "text-gray-600"}>
                          {ICONE_MAP[perfil.icone] ?? <Sparkles size={26} />}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{perfil.nome}</p>
                          <p className="text-xs text-gray-600 mt-1 leading-snug">{perfil.descricao}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {perfilAtivo && (
                  <div className="bg-[#C5A059]/8 border border-[#C5A059]/25 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-[#C5A059] shrink-0" />
                      <p className="text-sm text-[#C5A059]">
                        <strong>{perfilAtivo.nome}</strong> selecionado. Vá para{" "}
                        <strong>Estilos & Modalidades</strong> para configurar as opções.
                      </p>
                    </div>
                    <button
                      onClick={() => setAbaAtiva("estilos")}
                      className="flex items-center gap-1 text-xs text-[#C5A059] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Ver estilos <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════
                ABA: ESTILOS & MODALIDADES
            ═══════════════════════════════════════════════ */}
            {abaAtiva === "estilos" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Estilos & Modalidades
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Ative os estilos que seu festival aceita. Estilos inativos não aparecem
                      nos formulários de inscrição.
                    </p>
                  </div>
                  {formConfig.perfil_id && (
                    <button
                      onClick={() => setModalEstilo(true)}
                      className="flex items-center gap-2 text-sm border border-[#2e2825] text-gray-400 hover:text-white hover:border-[#3e3835] px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plus size={14} />
                      Adicionar estilo
                    </button>
                  )}
                </div>

                {!formConfig.perfil_id ? (
                  <div className="text-center py-16 text-gray-600">
                    <ToggleLeft size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Selecione um tipo de festival primeiro.</p>
                    <button
                      onClick={() => setAbaAtiva("perfil")}
                      className="text-[#C5A059] text-sm hover:text-[#d4b06a] transition-colors mt-2 flex items-center gap-1 mx-auto"
                    >
                      Ir para Tipo de Festival <ChevronRight size={13} />
                    </button>
                  </div>
                ) : estilos.length === 0 ? (
                  <div className="text-center py-16 text-gray-600">
                    <p className="text-sm">Nenhum estilo encontrado para este perfil.</p>
                    <button
                      onClick={() => setModalEstilo(true)}
                      className="text-[#C5A059] text-sm hover:text-[#d4b06a] transition-colors mt-2"
                    >
                      Criar o primeiro estilo →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Ações em lote */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        <span className="text-white font-semibold">{totalAtivos}</span>
                        {" "}de{" "}
                        <span className="text-white font-semibold">{estilos.length}</span>
                        {" "}estilos ativos
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleTodos(true)}
                          className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg border border-[#2e2825] hover:border-[#3e3835] transition-colors"
                        >
                          Ativar todos
                        </button>
                        <button
                          onClick={() => toggleTodos(false)}
                          className="text-xs text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-lg border border-[#2e2825] hover:border-red-500/30 transition-colors"
                        >
                          Desativar todos
                        </button>
                      </div>
                    </div>

                    {/* Grid de estilos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {estilos.map((estilo) => {
                        const ativo = !!estilosAtivos.find((a) => a.estilo_id === estilo.id);
                        return (
                          <button
                            key={estilo.id}
                            onClick={() => toggleEstilo(estilo)}
                            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                              ativo
                                ? "border-[#C5A059]/35 bg-[#C5A059]/5"
                                : "border-[#2e2825] bg-[#0d0807] hover:border-[#3e3835]"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm ${ativo ? "text-white" : "text-gray-500"}`}>
                                {estilo.nome}
                              </p>
                              {estilo.descricao && (
                                <p className="text-xs text-gray-600 mt-0.5 truncate">
                                  {estilo.descricao}
                                </p>
                              )}
                            </div>
                            <div className={`ml-4 shrink-0 transition-colors ${ativo ? "text-[#C5A059]" : "text-gray-700"}`}>
                              {ativo ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════
                ABA: TERMINOLOGIA
            ═══════════════════════════════════════════════ */}
            {abaAtiva === "terminologia" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Terminologia do Sistema</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Adapte o vocabulário ao seu festival. Esses termos aparecem em formulários,
                      e-mails e relatórios.
                    </p>
                  </div>
                  <button
                    onClick={salvarTerminologia}
                    disabled={salvandoTerminologia}
                    className="flex items-center gap-2 bg-[#C5A059] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-[#d4b06a] transition-colors text-sm disabled:opacity-40 whitespace-nowrap shrink-0"
                  >
                    {salvandoTerminologia ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {salvandoTerminologia ? "Salvando..." : "Salvar"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      campo: "termo_evento",
                      label: "Festival / Evento",
                      placeholder: "Festival, Concurso, Mostra, Olimpíada...",
                    },
                    {
                      campo: "termo_inscricao",
                      label: "Inscrição",
                      placeholder: "Inscrição, Candidatura, Submissão...",
                    },
                    {
                      campo: "termo_apresentacao",
                      label: "Apresentação / Obra",
                      placeholder: "Coreografia, Peça, Performance, Música...",
                    },
                    {
                      campo: "termo_participante",
                      label: "Participante",
                      placeholder: "Bailarino, Músico, Ator, Aluno...",
                    },
                    {
                      campo: "termo_grupo",
                      label: "Grupo / Instituição",
                      placeholder: "Escola, Banda, Companhia, Grupo...",
                    },
                  ].map(({ campo, label, placeholder }) => (
                    <div key={campo} className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {label}
                      </label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={
                          (formConfig as Record<string, string | null | undefined>)[campo] ?? ""
                        }
                        onChange={(e) => handleTerminologiaChange(campo, e.target.value)}
                        className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#C5A059] transition-colors"
                      />
                    </div>
                  ))}
                </div>

                {/* Preview em tempo real */}
                <div className="bg-[#0d0807] border border-[#2e2825] rounded-xl p-5 space-y-3">
                  <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                    Preview em tempo real
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    &quot;Bem-vindo ao{" "}
                    <span className="text-white font-medium">
                      {formConfig.termo_evento || "Festival"}
                    </span>
                    . Faça sua{" "}
                    <span className="text-white font-medium">
                      {formConfig.termo_inscricao || "Inscrição"}
                    </span>{" "}
                    agora e registre cada{" "}
                    <span className="text-white font-medium">
                      {formConfig.termo_apresentacao || "Coreografia"}
                    </span>{" "}
                    com os{" "}
                    <span className="text-white font-medium">
                      {formConfig.termo_participante || "Bailarinos"}
                    </span>{" "}
                    da sua{" "}
                    <span className="text-white font-medium">
                      {formConfig.termo_grupo || "Escola"}
                    </span>
                    .&quot;
                  </p>
                  <div className="pt-2 border-t border-[#2e2825] grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: "Evento", valor: formConfig.termo_evento || "Festival" },
                      { label: "Inscrição", valor: formConfig.termo_inscricao || "Inscrição" },
                      { label: "Apresentação", valor: formConfig.termo_apresentacao || "Coreografia" },
                      { label: "Participante", valor: formConfig.termo_participante || "Bailarino" },
                      { label: "Grupo", valor: formConfig.termo_grupo || "Escola" },
                    ].map(({ label, valor }) => (
                      <div key={label} className="text-center">
                        <p className="text-xs text-gray-600">{label}</p>
                        <p className="text-xs text-[#C5A059] font-medium mt-0.5 truncate">{valor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════
                ABA: ORGANIZAÇÃO
            ═══════════════════════════════════════════════ */}
            {abaAtiva === "organizacao" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Dados da Organização</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Informações que aparecem em relatórios, e-mails e comunicações do sistema.
                    </p>
                  </div>
                  <button
                    onClick={salvarOrganizacao}
                    disabled={salvandoOrganizacao}
                    className="flex items-center gap-2 bg-[#C5A059] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-[#d4b06a] transition-colors text-sm disabled:opacity-40 whitespace-nowrap shrink-0"
                  >
                    {salvandoOrganizacao ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {salvandoOrganizacao ? "Salvando..." : "Salvar"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nome da Organização */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nome da Organização
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Studio Arte & Dança"
                      value={formConfig.nome_organizacao ?? ""}
                      onChange={(e) =>
                        setFormConfig((p) => ({ ...p, nome_organizacao: e.target.value }))
                      }
                      className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>

                  {/* URL do Logo */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      URL do Logo
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formConfig.logo_url ?? ""}
                        onChange={(e) =>
                          setFormConfig((p) => ({ ...p, logo_url: e.target.value }))
                        }
                        className="flex-1 bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#C5A059] transition-colors"
                      />
                      {formConfig.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={formConfig.logo_url}
                          alt="Preview do logo"
                          className="w-10 h-10 rounded-lg object-contain border border-[#2e2825] bg-[#0d0807] p-1"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                    </div>
                  </div>

                  {/* Cor Primária */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Cor Primária
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={formConfig.cor_primaria ?? "#C5A059"}
                          onChange={(e) =>
                            setFormConfig((p) => ({ ...p, cor_primaria: e.target.value }))
                          }
                          className="w-11 h-11 rounded-lg border border-[#2e2825] bg-[#0d0807] cursor-pointer p-1 appearance-none"
                        />
                      </div>
                      <input
                        type="text"
                        value={formConfig.cor_primaria ?? "#C5A059"}
                        onChange={(e) =>
                          setFormConfig((p) => ({ ...p, cor_primaria: e.target.value }))
                        }
                        className="flex-1 bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#C5A059] transition-colors"
                        maxLength={7}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Usada em botões, destaques e elementos principais do sistema.
                    </p>
                  </div>

                  {/* Preview da cor */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Preview
                    </label>
                    <div className="bg-[#0d0807] border border-[#2e2825] rounded-lg p-4 space-y-2.5">
                      <button
                        style={{ backgroundColor: formConfig.cor_primaria ?? "#C5A059" }}
                        className="w-full py-2 rounded-lg text-black font-semibold text-sm transition-opacity hover:opacity-90"
                      >
                        Botão Principal
                      </button>
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            borderColor: formConfig.cor_primaria ?? "#C5A059",
                            color: formConfig.cor_primaria ?? "#C5A059",
                          }}
                          className="border rounded-lg px-3 py-1.5 text-xs font-medium"
                        >
                          Badge Ativo
                        </div>
                        <div
                          style={{ color: formConfig.cor_primaria ?? "#C5A059" }}
                          className="text-xs font-medium"
                        >
                          Link de ação →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}