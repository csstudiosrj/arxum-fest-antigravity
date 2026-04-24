"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings, PersonStanding, Music2, Drama, GraduationCap,
  Zap, Sparkles, CheckCircle, XCircle, Loader2, Save,
  Plus, X, Building2, Palette, Type, ToggleLeft, ToggleRight,
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────────────────────────
type PerfilFestival = {
  id: string; slug: string; nome: string; icone: string; descricao: string; ordem: number;
};
type Estilo = {
  id: string; perfil_id: string; nome: string; slug: string; descricao: string | null; ativo: boolean;
};
type EstiloAtivo = { id: string; estilo_id: string; ativo: boolean };
type TenantConfig = {
  id: string; perfil_id: string | null; nome_organizacao: string | null;
  logo_url: string | null; cor_primaria: string | null;
  termo_inscricao: string | null; termo_participante: string | null;
  termo_grupo: string | null; termo_apresentacao: string | null; termo_evento: string | null;
};
type Toast = { id: number; tipo: "sucesso" | "erro"; mensagem: string };

// ── Ícones dos perfis ──────────────────────────────────────────────────────
const ICONE_MAP: Record<string, React.ReactNode> = {
  PersonStanding: <PersonStanding size={28} />,
  Music2:         <Music2 size={28} />,
  Drama:          <Drama size={28} />,
  GraduationCap:  <GraduationCap size={28} />,
  Zap:            <Zap size={28} />,
  Sparkles:       <Sparkles size={28} />,
};

let toastId = 0;

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

// ══════════════════════════════════════════════════════════════════════════════
export default function ConfiguracoesPage() {
  const [abaAtiva, setAbaAtiva]         = useState("perfil");
  const [salvando, setSalvando]         = useState(false);
  const [loading, setLoading]           = useState(true);
  const [toasts, setToasts]             = useState<Toast[]>([]);

  const [perfis, setPerfis]             = useState<PerfilFestival[]>([]);
  const [estilos, setEstilos]           = useState<Estilo[]>([]);
  const [estilosAtivos, setEstilosAtivos] = useState<EstiloAtivo[]>([]);
  const [config, setConfig]             = useState<TenantConfig | null>(null);
  const [formConfig, setFormConfig]     = useState<Partial<TenantConfig>>({});

  // Modal novo estilo manual
  const [modalEstilo, setModalEstilo]   = useState(false);
  const [novoEstilo, setNovoEstilo]     = useState({ nome: "", descricao: "" });
  const [criandoEstilo, setCriandoEstilo] = useState(false);

  const supabase = createClient();

  const addToast = useCallback((tipo: Toast["tipo"], mensagem: string) => {
    const id = ++toastId;
    setToasts((p) => [...p, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const removerToast = useCallback((id: number) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  // ── Carga inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    async function carregar() {
      setLoading(true);
      const [{ data: pf }, { data: cfg }, { data: ea }] = await Promise.all([
        supabase.from("perfis_festival").select("*").order("ordem"),
        supabase.from("tenant_config").select("*").single(),
        supabase.from("tenant_estilos_ativos").select("*"),
      ]);

      setPerfis(pf ?? []);
      setConfig(cfg);
      setFormConfig(cfg ?? {});
      setEstilosAtivos(ea ?? []);

      // Carregar estilos do perfil ativo
      if (cfg?.perfil_id) {
        const { data: est } = await supabase
          .from("estilos")
          .select("*")
          .eq("perfil_id", cfg.perfil_id)
          .order("ordem");
        setEstilos(est ?? []);
      }

      setLoading(false);
    }
    carregar();
  }, [supabase]);

  // ── Mudar perfil ───────────────────────────────────────────────────────
  async function selecionarPerfil(perfil: PerfilFestival) {
    if (formConfig.perfil_id === perfil.id) return;
    setFormConfig((p) => ({ ...p, perfil_id: perfil.id }));

    // Carregar estilos do novo perfil
    const { data: est } = await supabase
      .from("estilos")
      .select("*")
      .eq("perfil_id", perfil.id)
      .order("ordem");
    setEstilos(est ?? []);
    setEstilosAtivos([]); // limpa ativos ao trocar perfil
  }

  // ── Toggle estilo ──────────────────────────────────────────────────────
  async function toggleEstilo(estilo: Estilo) {
    const jaAtivo = estilosAtivos.find((e) => e.estilo_id === estilo.id);

    if (jaAtivo) {
      // Desativar
      await supabase.from("tenant_estilos_ativos").delete().eq("estilo_id", estilo.id);
      setEstilosAtivos((p) => p.filter((e) => e.estilo_id !== estilo.id));
    } else {
      // Ativar
      const { data } = await supabase
        .from("tenant_estilos_ativos")
        .insert({ estilo_id: estilo.id, ativo: true })
        .select()
        .single();
      if (data) setEstilosAtivos((p) => [...p, data]);
    }
  }

  // ── Ativar/desativar todos ─────────────────────────────────────────────
  async function toggleTodos(ativar: boolean) {
    if (ativar) {
      // Ativa todos que ainda não estão ativos
      const faltando = estilos.filter((e) => !estilosAtivos.find((a) => a.estilo_id === e.id));
      if (faltando.length === 0) return;
      const { data } = await supabase
        .from("tenant_estilos_ativos")
        .insert(faltando.map((e) => ({ estilo_id: e.id, ativo: true })))
        .select();
      setEstilosAtivos((p) => [...p, ...(data ?? [])]);
      addToast("sucesso", `${faltando.length} estilos ativados!`);
    } else {
      // Desativa todos
      await supabase.from("tenant_estilos_ativos").delete().in("estilo_id", estilos.map((e) => e.id));
      setEstilosAtivos([]);
      addToast("sucesso", "Todos os estilos desativados.");
    }
  }

  // ── Criar estilo manual ────────────────────────────────────────────────
  async function criarEstiloManual() {
    if (!novoEstilo.nome.trim() || !formConfig.perfil_id) return;
    setCriandoEstilo(true);

    const slug = novoEstilo.nome.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data, error } = await supabase
      .from("estilos")
      .insert({
        perfil_id: formConfig.perfil_id,
        nome: novoEstilo.nome,
        slug: `custom-${slug}-${Date.now()}`,
        descricao: novoEstilo.descricao || null,
        ordem: estilos.length + 1,
      })
      .select()
      .single();

    if (!error && data) {
      setEstilos((p) => [...p, data]);
      // Já ativa automaticamente
      const { data: ativo } = await supabase
        .from("tenant_estilos_ativos")
        .insert({ estilo_id: data.id, ativo: true })
        .select()
        .single();
      if (ativo) setEstilosAtivos((p) => [...p, ativo]);
      addToast("sucesso", `Estilo "${novoEstilo.nome}" criado e ativado!`);
      setNovoEstilo({ nome: "", descricao: "" });
      setModalEstilo(false);
    } else {
      addToast("erro", "Erro ao criar estilo. Tente novamente.");
    }
    setCriandoEstilo(false);
  }

  // ── Salvar configurações ───────────────────────────────────────────────
  async function salvarConfig() {
    if (!config?.id) return;
    setSalvando(true);

    const { error } = await supabase
      .from("tenant_config")
      .update({
        perfil_id:          formConfig.perfil_id,
        nome_organizacao:   formConfig.nome_organizacao,
        cor_primaria:       formConfig.cor_primaria,
        termo_inscricao:    formConfig.termo_inscricao,
        termo_participante: formConfig.termo_participante,
        termo_grupo:        formConfig.termo_grupo,
        termo_apresentacao: formConfig.termo_apresentacao,
        termo_evento:       formConfig.termo_evento,
        configurado_em:     new Date().toISOString(),
        updated_at:         new Date().toISOString(),
      })
      .eq("id", config.id);

    if (!error) {
      setConfig({ ...config, ...formConfig as TenantConfig });
      addToast("sucesso", "Configurações salvas com sucesso!");
    } else {
      addToast("erro", "Erro ao salvar. Tente novamente.");
    }
    setSalvando(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-axon-gold" />
      </div>
    );
  }

  const perfilAtivo = perfis.find((p) => p.id === formConfig.perfil_id);
  const totalAtivos = estilosAtivos.filter((a) => estilos.find((e) => e.id === a.estilo_id)).length;

  return (
    <>
      <ToastContainer toasts={toasts} remover={removerToast} />

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Configurações do Sistema</h1>
            <p className="text-gray-400 mt-1">
              Configure o perfil e comportamento do seu festival.
            </p>
          </div>
          <button onClick={salvarConfig} disabled={salvando}
            className="flex items-center gap-2 bg-axon-gold text-black font-semibold px-5 py-2.5 rounded-md hover:bg-axon-gold/90 transition-colors disabled:opacity-50">
            {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {salvando ? "Salvando..." : "Salvar Tudo"}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
          <div className="flex border-b border-axon-border px-4 overflow-x-auto">
            {[
              { id: "perfil",       label: "Tipo de Festival", icon: Sparkles },
              { id: "estilos",      label: "Estilos & Modalidades", icon: ToggleRight },
              { id: "terminologia", label: "Terminologia", icon: Type },
              { id: "organizacao",  label: "Organização", icon: Building2 },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setAbaAtiva(id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  abaAtiva === id ? "border-axon-gold text-axon-gold" : "border-transparent text-gray-400 hover:text-white"
                }`}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>

          <div className="p-8">

            {/* ── ABA: Tipo de Festival ── */}
            {abaAtiva === "perfil" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Qual é o tipo do seu festival?</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Isso define os estilos disponíveis, a terminologia padrão e o comportamento de todo o sistema.
                    Você pode personalizar tudo depois.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {perfis.map((perfil) => {
                    const ativo = formConfig.perfil_id === perfil.id;
                    return (
                      <button key={perfil.id} onClick={() => selecionarPerfil(perfil)}
                        className={`relative flex flex-col items-center text-center gap-3 p-6 rounded-xl border transition-all ${
                          ativo
                            ? "border-axon-gold bg-axon-gold/10 text-axon-gold"
                            : "border-axon-border bg-axon-bg text-gray-400 hover:border-gray-500 hover:text-white"
                        }`}>
                        {ativo && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle size={16} className="text-axon-gold" />
                          </div>
                        )}
                        <div className={ativo ? "text-axon-gold" : "text-gray-500"}>
                          {ICONE_MAP[perfil.icone] ?? <Sparkles size={28} />}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{perfil.nome}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-snug">{perfil.descricao}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {perfilAtivo && (
                  <div className="bg-axon-gold/10 border border-axon-gold/30 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle size={18} className="text-axon-gold shrink-0" />
                    <p className="text-sm text-axon-gold">
                      Perfil <strong>{perfilAtivo.nome}</strong> selecionado. Vá para a aba{" "}
                      <button onClick={() => setAbaAtiva("estilos")} className="underline font-semibold">
                        Estilos & Modalidades
                      </button>{" "}
                      para ativar o que vai usar.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── ABA: Estilos & Modalidades ── */}
            {abaAtiva === "estilos" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Estilos & Modalidades</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Ative os estilos que o seu festival vai aceitar. Estilos inativos não aparecem nos formulários de inscrição.
                    </p>
                  </div>
                  <button onClick={() => setModalEstilo(true)}
                    className="flex items-center gap-2 text-sm border border-axon-border text-gray-300 hover:text-white hover:border-gray-500 px-4 py-2 rounded-md transition-colors whitespace-nowrap">
                    <Plus size={15} /> Adicionar estilo
                  </button>
                </div>

                {!formConfig.perfil_id ? (
                  <div className="text-center py-12 text-gray-500">
                    <ToggleLeft size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Selecione um tipo de festival primeiro.</p>
                    <button onClick={() => setAbaAtiva("perfil")} className="text-axon-gold text-sm hover:underline mt-2">
                      Ir para Tipo de Festival →
                    </button>
                  </div>
                ) : estilos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Nenhum estilo encontrado para este perfil.</p>
                  </div>
                ) : (
                  <>
                    {/* Ações em lote */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        <span className="text-white font-semibold">{totalAtivos}</span> de{" "}
                        <span className="text-white font-semibold">{estilos.length}</span> estilos ativos
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => toggleTodos(true)}
                          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-md border border-axon-border hover:border-gray-500 transition-colors">
                          Ativar todos
                        </button>
                        <button onClick={() => toggleTodos(false)}
                          className="text-xs text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-md border border-axon-border hover:border-red-400/30 transition-colors">
                          Desativar todos
                        </button>
                      </div>
                    </div>

                    {/* Lista de estilos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {estilos.map((estilo) => {
                        const ativo = !!estilosAtivos.find((a) => a.estilo_id === estilo.id);
                        return (
                          <button key={estilo.id} onClick={() => toggleEstilo(estilo)}
                            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                              ativo
                                ? "border-axon-gold/40 bg-axon-gold/5"
                                : "border-axon-border bg-axon-bg hover:border-gray-600"
                            }`}>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm ${ativo ? "text-white" : "text-gray-400"}`}>
                                {estilo.nome}
                              </p>
                              {estilo.descricao && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{estilo.descricao}</p>
                              )}
                            </div>
                            <div className={`ml-4 shrink-0 transition-colors ${ativo ? "text-axon-gold" : "text-gray-600"}`}>
                              {ativo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── ABA: Terminologia ── */}
            {abaAtiva === "terminologia" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Terminologia do Sistema</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Adapte o vocabulário do sistema ao seu tipo de festival. Estes termos aparecem em formulários, e-mails e relatórios.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { campo: "termo_evento",        label: "Festival / Evento",    placeholder: "Festival, Concurso, Mostra, Olimpíada..." },
                    { campo: "termo_inscricao",     label: "Inscrição",            placeholder: "Inscrição, Candidatura, Apresentação..." },
                    { campo: "termo_apresentacao",  label: "Apresentação / Obra",  placeholder: "Coreografia, Peça, Performance, Música..." },
                    { campo: "termo_participante",  label: "Participante",         placeholder: "Bailarino, Músico, Ator, Aluno..." },
                    { campo: "termo_grupo",         label: "Grupo / Instituição",  placeholder: "Escola, Banda, Companhia, Grupo..." },
                  ].map(({ campo, label, placeholder }) => (
                    <div key={campo} className="space-y-2">
                      <label className="text-sm text-gray-400">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                          value={(formConfig as Record<string, string | null | undefined>)[campo] ?? ""}
                        onChange={(e) => setFormConfig((p) => ({ ...p, [campo]: e.target.value }))}
                        className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors"
                      />
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div className="bg-axon-bg border border-axon-border rounded-xl p-5 space-y-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Preview — como vai aparecer no sistema</p>
                  <p className="text-sm text-gray-300">
                    &quot;Bem-vindo ao <strong className="text-white">{formConfig.termo_evento || "Festival"}</strong>. Faça sua{' '}
                    <strong className="text-white">{formConfig.termo_inscricao || "Inscrição"}</strong> agora e registre cada{' '}
                    <strong className="text-white">{formConfig.termo_apresentacao || "Coreografia"}</strong> com os{' '}
                    <strong className="text-white">{formConfig.termo_participante || "Bailarinos"}</strong> da sua{' '}
                    <strong className="text-white">{formConfig.termo_grupo || "Escola"}</strong>.&quot;
                  </p>
                </div>
              </div>
            )}

            {/* ── ABA: Organização ── */}
            {abaAtiva === "organizacao" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Dados da Organização</h3>
                  <p className="text-sm text-gray-400 mt-1">Informações da sua organização que aparecem em relatórios e comunicações.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-gray-400">Nome da Organização</label>
                    <input type="text" placeholder="Ex: Studio Arte & Dança"
                      value={formConfig.nome_organizacao ?? ""}
                      onChange={(e) => setFormConfig((p) => ({ ...p, nome_organizacao: e.target.value }))}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-gray-400">URL do Logo</label>
                    <input type="url" placeholder="https://..."
                      value={formConfig.logo_url ?? ""}
                      onChange={(e) => setFormConfig((p) => ({ ...p, logo_url: e.target.value }))}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Cor Primária</label>
                    <div className="flex items-center gap-3">
                      <input type="color"
                        value={formConfig.cor_primaria ?? "#C9A84C"}
                        onChange={(e) => setFormConfig((p) => ({ ...p, cor_primaria: e.target.value }))}
                        className="w-12 h-10 rounded-md border border-axon-border bg-axon-bg cursor-pointer p-1" />
                      <input type="text"
                        value={formConfig.cor_primaria ?? "#C9A84C"}
                        onChange={(e) => setFormConfig((p) => ({ ...p, cor_primaria: e.target.value }))}
                        className="flex-1 bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors font-mono" />
                    </div>
                    <p className="text-xs text-gray-500">Cor usada em botões, destaques e elementos principais do sistema.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Modal: Novo estilo manual ── */}
      {modalEstilo && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => !criandoEstilo && setModalEstilo(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Novo Estilo / Modalidade</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Será adicionado ao perfil <strong className="text-gray-300">{perfilAtivo?.nome}</strong> e ativado automaticamente.</p>
                </div>
                {!criandoEstilo && (
                  <button onClick={() => setModalEstilo(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Nome do estilo *</label>
                  <input type="text" placeholder="Ex: Dança Cigana, Kuduro, Lindy Hop..."
                    value={novoEstilo.nome}
                    onChange={(e) => setNovoEstilo((p) => ({ ...p, nome: e.target.value }))}
                    disabled={criandoEstilo}
                    className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors disabled:opacity-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Descrição (opcional)</label>
                  <input type="text" placeholder="Breve descrição da modalidade..."
                    value={novoEstilo.descricao}
                    onChange={(e) => setNovoEstilo((p) => ({ ...p, descricao: e.target.value }))}
                    disabled={criandoEstilo}
                    className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors disabled:opacity-50" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                {!criandoEstilo && (
                  <button onClick={() => setModalEstilo(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    Cancelar
                  </button>
                )}
                <button onClick={criarEstiloManual}
                  disabled={criandoEstilo || !novoEstilo.nome.trim()}
                  className="flex items-center gap-2 bg-axon-gold text-black font-semibold px-5 py-2.5 rounded-md hover:bg-axon-gold/90 transition-colors text-sm disabled:opacity-50 min-w-[140px] justify-center">
                  {criandoEstilo ? <><Loader2 size={15} className="animate-spin" /> Criando...</> : <><Plus size={15} /> Criar Estilo</>}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}