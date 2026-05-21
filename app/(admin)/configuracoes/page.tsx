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
  produtora_id: string;
  ativo: boolean;
};

type TenantConfig = {
  id: string;
  produtora_id: string;
  perfil_id: string | null;
  nome_organizacao: string | null;
  logo_url: string | null;
  cor_primaria: string | null;
  termo_inscricao: string | null;
  termo_participante: string | null;
  termo_grupo: string | null;
  termo_apresentacao: string | null;
  termo_evento: string | null;
  updated_at?: string | null;
};

type Toast = {
  id: number;
  tipo: "sucesso" | "erro" | "aviso";
  mensagem: string;
};

type AbaId = "perfil" | "estilos" | "terminologia" | "organizacao";

const ICONE_MAP: Record<string, React.ReactNode> = {
  PersonStanding: <PersonStanding size={26} />,
  Music2: <Music2 size={26} />,
  Drama: <Drama size={26} />,
  GraduationCap: <GraduationCap size={26} />,
  Zap: <Zap size={26} />,
  Sparkles: <Sparkles size={26} />,
};

let toastId = 0;

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
      <div
        className="fixed inset-0 bg-black/70 z-[100]"
        onClick={!carregando ? onCancelar : undefined}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
        <div className="bg-[#1a1413] border border-[#2e2825] rounded-2xl w-full max-w-md p-7 space-y-5 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20 shrink-0">
              <AlertTriangle size={22} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Trocar tipo de festival?
              </h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                Ao mudar para <strong className="text-white">{perfilNome}</strong>,
                todos os estilos atualmente ativados serão{" "}
                <strong className="text-red-400">desativados</strong>. Você
                precisará reconfigurar os estilos vinculados ao novo perfil.
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
              ) : null}
              Sim, trocar perfil
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#2e282560] rounded-lg ${className ?? ""}`} />
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

export default function ConfiguracoesPage() {
  // FIX 1: createClient() movido para useRef para evitar recriação a cada render
  // e consequente loop no useEffect que depende de `supabase`.
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [abaAtiva, setAbaAtiva] = useState<AbaId>("perfil");
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [produtoraId, setProdutoraId] = useState<string | null>(null);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [formConfig, setFormConfig] = useState<Partial<TenantConfig>>({});

  const [perfis, setPerfis] = useState<PerfilFestival[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [estilosAtivos, setEstilosAtivos] = useState<EstiloAtivo[]>([]);

  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoTerminologia, setSalvandoTerminologia] = useState(false);
  const [salvandoOrganizacao, setSalvandoOrganizacao] = useState(false);

  const [modalTroca, setModalTroca] = useState<PerfilFestival | null>(null);
  const [trocandoPerfil, setTrocandoPerfil] = useState(false);

  const [modalEstilo, setModalEstilo] = useState(false);
  const [novoEstilo, setNovoEstilo] = useState({ nome: "", descricao: "" });
  const [criandoEstilo, setCriandoEstilo] = useState(false);

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

  // FIX 2: carregarEstilosDoPerfil agora está em useCallback para ser
  // referenciado de forma estável no useEffect e em outros handlers,
  // evitando warnings de exhaustive-deps e re-execuções desnecessárias.
  const carregarEstilosDoPerfil = useCallback(
    async (perfilId: string) => {
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
    },
    [supabase, addToast]
  );

  useEffect(() => {
    async function carregar() {
      setLoading(true);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Usuário não autenticado.");
        }

        const { data: usuarioData, error: usuarioError } = await supabase
          .from("usuarios")
          .select("id, produtora_id")
          .eq("id", user.id)
          .single();

        if (usuarioError || !usuarioData) {
          throw new Error("Usuário não encontrado.");
        }

        if (!usuarioData.produtora_id) {
          throw new Error(
            "Sua conta ainda não está vinculada a uma produtora. Entre em contato com o suporte."
          );
        }

        const pid = usuarioData.produtora_id;
        setProdutoraId(pid);

        const [
          { data: perfisData, error: perfisError },
          { data: configData, error: configError },
          { data: estilosAtivosData, error: estilosAtivosError },
        ] = await Promise.all([
          supabase.from("perfis_festival").select("*").order("ordem"),
          supabase
            .from("tenant_config")
            .select("*")
            .eq("produtora_id", pid)
            .maybeSingle(),
          supabase
            .from("tenant_estilos_ativos")
            .select("*")
            .eq("produtora_id", pid),
        ]);

        if (perfisError) throw perfisError;
        if (configError) throw configError;
        if (estilosAtivosError) throw estilosAtivosError;

        setPerfis(perfisData ?? []);
        setEstilosAtivos(estilosAtivosData ?? []);

        if (configData) {
          setConfig(configData);
          setFormConfig(configData);

          if (configData.perfil_id) {
            await carregarEstilosDoPerfil(configData.perfil_id);
          }
        } else {
          const { data: novaConfig, error: criacaoError } = await supabase
            .from("tenant_config")
            .insert({ produtora_id: pid })
            .select()
            .single();

          if (criacaoError) throw criacaoError;

          setConfig(novaConfig);
          setFormConfig(novaConfig);
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Erro ao carregar configurações.";
        addToast("erro", msg);
      } finally {
        setLoading(false);
      }
    }

    void carregar();
    // supabase vem do ref e é estável; carregarEstilosDoPerfil e addToast
    // são memoizados com useCallback — sem risco de loop.
  }, [supabase, addToast, carregarEstilosDoPerfil]);

  function selecionarPerfil(perfil: PerfilFestival) {
    if (formConfig.perfil_id === perfil.id) return;

    if (formConfig.perfil_id && estilosAtivos.length > 0) {
      setModalTroca(perfil);
      return;
    }

    void executarTrocaDePerfil(perfil);
  }

  async function executarTrocaDePerfil(perfil: PerfilFestival) {
    setTrocandoPerfil(true);

    try {
      if (!produtoraId) {
        throw new Error("produtora_id não encontrada.");
      }

      if (estilosAtivos.length > 0) {
        const { error } = await supabase
          .from("tenant_estilos_ativos")
          .delete()
          .eq("produtora_id", produtoraId);

        if (error) throw error;
        setEstilosAtivos([]);
      }

      setFormConfig((p) => ({ ...p, perfil_id: perfil.id }));
      await carregarEstilosDoPerfil(perfil.id);
      addToast("sucesso", `Perfil ${perfil.nome} selecionado. Salve para confirmar.`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao trocar perfil.";
      addToast("erro", msg);
    } finally {
      setTrocandoPerfil(false);
      setModalTroca(null);
    }
  }

  // ============================================================
  // toggleEstilo
  // FIX 3: o branch de INSERT (registro inexistente) usava
  // onConflict: 'id', mas não enviava nenhum `id`, tornando o
  // conflito inoperante e abrindo espaço para duplicatas.
  // Ambos os branches agora usam onConflict: 'produtora_id,estilo_id',
  // que reflete a unique constraint real da tabela.
  // ============================================================
  async function toggleEstilo(estilo: Estilo) {
    if (!produtoraId) return;

    const registroExistente = estilosAtivos.find(
      (e) => e.estilo_id === estilo.id
    );
    const atualAtivo = !!(registroExistente && registroExistente.ativo);

    try {
      const { data, error } = await supabase
        .from("tenant_estilos_ativos")
        .upsert(
          {
            ...(registroExistente ? { id: registroExistente.id } : {}),
            estilo_id: estilo.id,
            produtora_id: produtoraId,
            ativo: !atualAtivo,
          },
          { onConflict: "produtora_id,estilo_id" }
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEstilosAtivos((prev) => {
          if (registroExistente) {
            return prev.map((e) => (e.id === registroExistente.id ? data : e));
          }
          return [...prev, data];
        });
      }
    } catch {
      addToast(
        "erro",
        `Erro ao ${atualAtivo ? "desativar" : "ativar"} ${estilo.nome}.`
      );
    }
  }

  // ============================================================
  // toggleTodos
  // FIX 4: o branch de desativação usava onConflict: 'id', que
  // funciona apenas quando todos os registros já possuem `id`.
  // Unificado para onConflict: 'produtora_id,estilo_id' em ambos
  // os branches, garantindo consistência com a constraint da tabela.
  // ============================================================
  async function toggleTodos(ativar: boolean) {
    if (!produtoraId) return;

    try {
      if (ativar) {
        const faltando = estilos.filter(
          (e) => !estilosAtivos.find((a) => a.estilo_id === e.id && a.ativo)
        );

        if (faltando.length === 0) {
          addToast("aviso", "Todos os estilos já estão ativos.");
          return;
        }

        const dadosUpsert = faltando.map((e) => {
          const existente = estilosAtivos.find((a) => a.estilo_id === e.id);
          return existente
            ? { id: existente.id, estilo_id: e.id, produtora_id: produtoraId, ativo: true }
            : { estilo_id: e.id, produtora_id: produtoraId, ativo: true };
        });

        const { data, error } = await supabase
          .from("tenant_estilos_ativos")
          .upsert(dadosUpsert, { onConflict: "produtora_id,estilo_id" })
          .select();

        if (error) throw error;

        if (data) {
          setEstilosAtivos((prev) => {
            const mapa = new Map(prev.map((a) => [a.estilo_id, a]));
            for (const item of data) {
              mapa.set(item.estilo_id, item);
            }
            return Array.from(mapa.values());
          });
        }

        addToast("sucesso", `${faltando.length} estilos ativados!`);
      } else {
        const registrosParaDesativar = estilosAtivos.filter((a) =>
          estilos.find((e) => e.id === a.estilo_id)
        );

        if (registrosParaDesativar.length === 0) {
          addToast("aviso", "Nenhum estilo ativo para desativar.");
          return;
        }

        const dadosUpsert = registrosParaDesativar.map((a) => ({
          id: a.id,
          estilo_id: a.estilo_id,
          produtora_id: produtoraId,
          ativo: false,
        }));

        const { data, error } = await supabase
          .from("tenant_estilos_ativos")
          .upsert(dadosUpsert, { onConflict: "produtora_id,estilo_id" })
          .select();

        if (error) throw error;

        if (data) {
          setEstilosAtivos((prev) => {
            const mapa = new Map(prev.map((a) => [a.estilo_id, a]));
            for (const item of data) {
              mapa.set(item.estilo_id, item);
            }
            return Array.from(mapa.values());
          });
        }

        addToast("sucesso", "Todos os estilos foram desativados.");
      }
    } catch {
      addToast("erro", "Erro ao atualizar estilos em lote.");
    }
  }

  // ============================================================
  // criarEstiloManual — INSERT novo estilo + INSERT novo registro ativo
  // ============================================================
  async function criarEstiloManual() {
    if (!novoEstilo.nome.trim() || !formConfig.perfil_id || !produtoraId) return;

    setCriandoEstilo(true);

    try {
      const slug = `custom-${novoEstilo.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/--+/g, "-")}-${Date.now()}`;

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

      // Novo estilo: nunca terá registro em tenant_estilos_ativos ainda,
      // então faz INSERT direto (sem id) com onConflict correto.
      const { data: ativoData, error: ativoError } = await supabase
        .from("tenant_estilos_ativos")
        .insert({
          estilo_id: estiloData.id,
          produtora_id: produtoraId,
          ativo: true,
        })
        .select()
        .single();

      if (ativoError) throw ativoError;

      if (ativoData) setEstilosAtivos((p) => [...p, ativoData]);

      addToast("sucesso", `${novoEstilo.nome} criado e ativado!`);
      setNovoEstilo({ nome: "", descricao: "" });
      setModalEstilo(false);
    } catch {
      addToast("erro", "Erro ao criar estilo. Verifique e tente novamente.");
    } finally {
      setCriandoEstilo(false);
    }
  }

  async function salvarPerfil() {
    if (!config?.id || !produtoraId) return;

    setSalvandoPerfil(true);

    try {
      const { error } = await supabase
        .from("tenant_config")
        .update({
          perfil_id: formConfig.perfil_id,
          updated_at: new Date().toISOString(),
        })
        .eq("produtora_id", produtoraId);

      if (error) throw error;

      setConfig((c) => (c ? { ...c, perfil_id: formConfig.perfil_id ?? null } : c));
      addToast("sucesso", "Tipo de festival salvo com sucesso!");
    } catch {
      addToast("erro", "Erro ao salvar tipo de festival.");
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function salvarTerminologia() {
    if (!config?.id || !produtoraId) return;

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
        .eq("produtora_id", produtoraId);

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
    if (!config?.id || !produtoraId) return;

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
        .eq("produtora_id", produtoraId);

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

  // FIX 5: previewTimeoutRef removido — o callback era `() => {}` (vazio),
  // portanto o debounce não tinha efeito algum. A função agora atualiza
  // o formConfig diretamente, que já é reativo e alimenta o preview em
  // tempo real sem necessidade de timeout.
  function handleTerminologiaChange(campo: keyof TenantConfig, valor: string) {
    setFormConfig((p) => ({ ...p, [campo]: valor }));
  }

  if (loading) return <LoadingSkeleton />;

  const perfilAtivo = perfis.find((p) => p.id === formConfig.perfil_id);

  const totalAtivos = estilosAtivos.filter(
    (a) => estilos.find((e) => e.id === a.estilo_id) && a.ativo
  ).length;

  const abas: { id: AbaId; label: string; icon: React.ElementType }[] = [
    { id: "perfil", label: "Tipo de Festival", icon: Sparkles },
    { id: "estilos", label: "Estilos / Modalidades", icon: ToggleRight },
    { id: "terminologia", label: "Terminologia", icon: Type },
    { id: "organizacao", label: "Organização", icon: Building2 },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} remover={removerToast} />

      {modalTroca && (
        <ModalConfirmacao
          perfilNome={modalTroca.nome}
          onConfirmar={() => executarTrocaDePerfil(modalTroca)}
          onCancelar={() => !trocandoPerfil && setModalTroca(null)}
          carregando={trocandoPerfil}
        />
      )}

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
                  <h3 className="text-base font-semibold text-white">
                    Novo Estilo / Modalidade
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Vinculado ao perfil{" "}
                    <span className="text-gray-300 font-medium">
                      {perfilAtivo?.nome}
                    </span>{" "}
                    e ativado automaticamente.
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
                    Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Ex.: Solo Contemporâneo, Quarteto Vocal, Cena Curta..."
                    value={novoEstilo.nome}
                    onChange={(e) =>
                      setNovoEstilo((p) => ({ ...p, nome: e.target.value }))
                    }
                    disabled={criandoEstilo}
                    onKeyDown={(e) => e.key === "Enter" && void criarEstiloManual()}
                    className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Descrição opcional
                  </label>
                  <input
                    type="text"
                    placeholder="Breve descrição da modalidade..."
                    value={novoEstilo.descricao}
                    onChange={(e) =>
                      setNovoEstilo((p) => ({ ...p, descricao: e.target.value }))
                    }
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
                  onClick={() => void criarEstiloManual()}
                  disabled={criandoEstilo || !novoEstilo.nome.trim()}
                  className="flex items-center gap-2 bg-[#C5A059] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-[#d4b06a] transition-colors text-sm disabled:opacity-40 min-w-[140px] justify-center"
                >
                  {criandoEstilo ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  {criandoEstilo ? "Criando..." : "Criar Estilo"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-5xl mx-auto space-y-6 pb-12">
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

        <div className="bg-[#1a1413] border border-[#2e2825] rounded-2xl overflow-hidden">
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
            {abaAtiva === "perfil" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Qual o tipo do seu festival?
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-xl">
                      Define os estilos disponíveis, terminologia padrão e comportamento do sistema.
                      Trocar de perfil desativa os estilos atuais.
                    </p>
                  </div>

                  <button
                    onClick={() => void salvarPerfil()}
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
                            ? "border-[#C5A059] bg-[#C5A05908] shadow-[0_0_20px_rgba(197,160,89,0.08)]"
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
                          <p className="text-xs text-gray-600 mt-1 leading-snug">
                            {perfil.descricao}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {perfilAtivo && (
                  <div className="bg-[#C5A05908] border border-[#C5A05925] rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-[#C5A059] shrink-0" />
                      <p className="text-sm text-[#C5A059]">
                        <strong>{perfilAtivo.nome}</strong> selecionado. Vá para{" "}
                        <strong>Estilos / Modalidades</strong> para configurar as opções.
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

            {abaAtiva === "estilos" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Estilos / Modalidades
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
                      Criar o primeiro estilo
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        <span className="text-white font-semibold">{totalAtivos}</span> de{" "}
                        <span className="text-white font-semibold">{estilos.length}</span>{" "}
                        estilos ativos
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => void toggleTodos(true)}
                          className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg border border-[#2e2825] hover:border-[#3e3835] transition-colors"
                        >
                          Ativar todos
                        </button>
                        <button
                          onClick={() => void toggleTodos(false)}
                          className="text-xs text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-lg border border-[#2e2825] hover:border-red-500/30 transition-colors"
                        >
                          Desativar todos
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {estilos.map((estilo) => {
                        const ativo = !!estilosAtivos.find(
                          (a) => a.estilo_id === estilo.id && a.ativo
                        );

                        return (
                          <button
                            key={estilo.id}
                            onClick={() => void toggleEstilo(estilo)}
                            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                              ativo
                                ? "border-[#C5A05935] bg-[#C5A05905]"
                                : "border-[#2e2825] bg-[#0d0807] hover:border-[#3e3835]"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium text-sm ${
                                  ativo ? "text-white" : "text-gray-300"
                                }`}
                              >
                                {estilo.nome}
                              </p>
                              {estilo.descricao && (
                                <p className="text-xs text-gray-600 mt-0.5 truncate">
                                  {estilo.descricao}
                                </p>
                              )}
                            </div>

                            <div
                              className={`ml-4 shrink-0 transition-colors ${
                                ativo ? "text-[#C5A059]" : "text-gray-700"
                              }`}
                            >
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

            {abaAtiva === "terminologia" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Terminologia do Sistema
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Adapte o vocabulário ao seu festival. Esses termos aparecem em formulários,
                      e-mails e relatórios.
                    </p>
                  </div>

                  <button
                    onClick={() => void salvarTerminologia()}
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
                      label: "Evento",
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
                      placeholder: "Apresentação, Peça, Performance, Música...",
                    },
                    {
                      campo: "termo_participante",
                      label: "Participante",
                      placeholder: "Participante, Músico, Ator, Aluno...",
                    },
                    {
                      campo: "termo_grupo",
                      label: "Grupo / Instituição",
                      placeholder: "Grupo, Banda, Companhia, Instituição...",
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
                        onChange={(e) =>
                          handleTerminologiaChange(campo as keyof TenantConfig, e.target.value)
                        }
                        className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#C5A059] transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-[#0d0807] border border-[#2e2825] rounded-xl p-5 space-y-3">
                  <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                    Preview em tempo real
                  </p>

                  <p className="text-sm text-gray-400 leading-relaxed">
                    {"Bem-vindo ao "}
                    <span className="text-white font-medium">
                      {formConfig.termo_evento || "Evento"}
                    </span>
                    .{" Faça sua "}
                    <span className="text-white font-medium">
                      {formConfig.termo_inscricao || "Inscrição"}
                    </span>
                    {" agora e registre cada "}
                    <span className="text-white font-medium">
                      {formConfig.termo_apresentacao || "Apresentação"}
                    </span>
                    {" com os "}
                    <span className="text-white font-medium">
                      {formConfig.termo_participante || "Participantes"}
                    </span>
                    {" do seu "}
                    <span className="text-white font-medium">
                      {formConfig.termo_grupo || "Grupo"}
                    </span>
                    .
                  </p>

                  <div className="pt-2 border-t border-[#2e2825] grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: "Evento", valor: formConfig.termo_evento || "Evento" },
                      { label: "Inscrição", valor: formConfig.termo_inscricao || "Inscrição" },
                      {
                        label: "Apresentação",
                        valor: formConfig.termo_apresentacao || "Apresentação",
                      },
                      {
                        label: "Participante",
                        valor: formConfig.termo_participante || "Participante",
                      },
                      { label: "Grupo", valor: formConfig.termo_grupo || "Grupo" },
                    ].map(({ label, valor }) => (
                      <div key={label} className="text-center">
                        <p className="text-xs text-gray-600">{label}</p>
                        <p className="text-xs text-[#C5A059] font-medium mt-0.5 truncate">
                          {valor}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {abaAtiva === "organizacao" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Dados da Organização
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Informações que aparecem em relatórios, e-mails e comunicações do sistema.
                    </p>
                  </div>

                  <button
                    onClick={() => void salvarOrganizacao()}
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
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nome da Organização
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: Produtora Horizonte Cultural"
                      value={formConfig.nome_organizacao ?? ""}
                      onChange={(e) =>
                        setFormConfig((p) => ({ ...p, nome_organizacao: e.target.value }))
                      }
                      className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>

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
                      {formConfig.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={formConfig.logo_url}
                          alt="Preview do logo"
                          className="w-10 h-10 rounded-lg object-contain border border-[#2e2825] bg-[#0d0807] p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                    </div>
                  </div>

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
                          Link de ação
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