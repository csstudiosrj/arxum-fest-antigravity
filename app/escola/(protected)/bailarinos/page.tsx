"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  X,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  User,
  Calendar,
  FileText,
  Shield,
  Pencil,
  Trash2,
  Users,
  Filter,
  ArrowUpDown,
  Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

type Terminologia = {
  termo_participante: string | null;
  termo_grupo: string | null;
  termo_evento: string | null;
  termo_apresentacao: string | null;
  termo_inscricao: string | null;
};

type Estilo = {
  id: string;
  nome: string;
  descricao: string | null;
};

type Participante = {
  id: string;
  organizacao_id: string;
  nome: string;
  data_nascimento: string;
  documento: string | null;
  termo_assinado: boolean;
  estilo_id: string | null;
  created_at: string;
};

type Toast = {
  id: number;
  tipo: "sucesso" | "erro" | "aviso";
  mensagem: string;
};

type OrdemCampo = "nome" | "data_nascimento" | "created_at";
type OrdemDir = "asc" | "desc";

type FormData = {
  nome: string;
  data_nascimento: string;
  documento: string;
  estilo_id: string;
  termo_assinado: boolean;
};

const FORM_INICIAL: FormData = {
  nome: "",
  data_nascimento: "",
  documento: "",
  estilo_id: "",
  termo_assinado: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────────────────────

function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNascimento + "T00:00:00");
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarDocumento(valor: string): string {
  const nums = valor.replace(/\D/g, "");
  if (nums.length <= 11) {
    return nums
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return nums
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

let _toastId = 0;

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  remover,
}: {
  toasts: Toast[];
  remover: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto
            ${t.tipo === "sucesso" ? "bg-[#1a1413] border-emerald-500/30" : ""}
            ${t.tipo === "erro" ? "bg-[#1a1413] border-red-500/30" : ""}
            ${t.tipo === "aviso" ? "bg-[#1a1413] border-yellow-500/30" : ""}
          `}
        >
          {t.tipo === "sucesso" && <CheckCircle size={15} className="text-emerald-400 shrink-0" />}
          {t.tipo === "erro" && <XCircle size={15} className="text-red-400 shrink-0" />}
          {t.tipo === "aviso" && <AlertTriangle size={15} className="text-yellow-400 shrink-0" />}
          <span className="text-sm font-medium text-white">{t.mensagem}</span>
          <button
            onClick={() => remover(t.id)}
            className="ml-1 text-gray-600 hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#2e2825]/70 rounded-lg ${className ?? ""}`} />
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="bg-[#1a1413] border border-[#2e2825] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#2e2825]">
          <Skeleton className="h-3.5 w-56" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-[#2e2825]/50"
          >
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL EXCLUSÃO
// ─────────────────────────────────────────────────────────────────────────────

function ModalExcluir({
  nome,
  termoParticipante,
  onConfirmar,
  onCancelar,
  carregando,
}: {
  nome: string;
  termoParticipante: string;
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
        <div className="bg-[#1a1413] border border-[#2e2825] rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 shrink-0">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Excluir {termoParticipante}?
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                <strong className="text-gray-300">{nome}</strong> será removido
                permanentemente. Apresentações já vinculadas não serão afetadas.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancelar}
              disabled={carregando}
              className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={carregando}
              className="flex items-center gap-2 bg-red-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-red-400 transition-colors text-sm disabled:opacity-50 min-w-[100px] justify-center"
            >
              {carregando ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Excluir"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAWER — FORMULÁRIO
// ─────────────────────────────────────────────────────────────────────────────

function DrawerParticipante({
  aberto,
  onFechar,
  onSalvar,
  salvando,
  form,
  setForm,
  estilos,
  terminologia,
  modoEdicao,
}: {
  aberto: boolean;
  onFechar: () => void;
  onSalvar: () => void;
  salvando: boolean;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  estilos: Estilo[];
  terminologia: Terminologia;
  modoEdicao: boolean;
}) {
  const termo = terminologia.termo_participante || "Participante";
  const campoValido = form.nome.trim().length >= 2 && form.data_nascimento !== "";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[90] transition-opacity duration-300 ${
          aberto ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={!salvando ? onFechar : undefined}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-[#120f0e] border-l border-[#2e2825] z-[90] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2e2825] shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">
              {modoEdicao ? `Editar ${termo}` : `Novo ${termo}`}
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              {modoEdicao
                ? "Atualize os dados e salve."
                : `Preencha os dados para cadastrar.`}
            </p>
          </div>
          {!salvando && (
            <button
              onClick={onFechar}
              className="text-gray-600 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <User size={11} />
              Nome completo *
            </label>
            <input
              type="text"
              placeholder={`Nome do ${termo.toLowerCase()}`}
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              disabled={salvando}
              autoFocus={aberto}
              className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50"
            />
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <Calendar size={11} />
              Data de Nascimento *
            </label>
            <input
              type="date"
              value={form.data_nascimento}
              onChange={(e) =>
                setForm((p) => ({ ...p, data_nascimento: e.target.value }))
              }
              disabled={salvando}
              max={new Date().toISOString().split("T")[0]}
              className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50 [color-scheme:dark]"
            />
            {form.data_nascimento && (
              <p className="text-xs text-gray-600">
                {calcularIdade(form.data_nascimento)} anos
              </p>
            )}
          </div>

          {/* Documento */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <FileText size={11} />
              Documento
              <span className="text-gray-700 font-normal normal-case ml-1">
                (CPF, RG ou passaporte)
              </span>
            </label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={form.documento}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  documento: formatarDocumento(e.target.value),
                }))
              }
              disabled={salvando}
              maxLength={18}
              className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50 font-mono"
            />
          </div>

          {/* Modalidade */}
          {estilos.length > 0 && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                <Filter size={11} />
                Modalidade principal
              </label>
              <div className="relative">
                <select
                  value={form.estilo_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, estilo_id: e.target.value }))
                  }
                  disabled={salvando}
                  className="w-full bg-[#0d0807] border border-[#2e2825] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50 appearance-none pr-10 [color-scheme:dark]"
                >
                  <option value="">Selecione uma modalidade</option>
                  {estilos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                />
              </div>
              <p className="text-xs text-gray-700">
                Modalidades definidas pelo organizador do festival.
              </p>
            </div>
          )}

          {/* Termo */}
          <div className="bg-[#0d0807] border border-[#2e2825] rounded-xl p-4">
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, termo_assinado: !p.termo_assinado }))
              }
              disabled={salvando}
              className="flex items-start gap-3 w-full text-left disabled:opacity-50"
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                  form.termo_assinado
                    ? "bg-[#C5A059] border-[#C5A059]"
                    : "border-[#3e3835] bg-transparent"
                }`}
              >
                {form.termo_assinado && (
                  <Check size={10} className="text-black" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white flex items-center gap-1.5">
                  <Shield size={13} className="text-[#C5A059]" />
                  Termo de Imagem e Dados Assinado
                </p>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  Confirme que o {termo.toLowerCase()} (ou responsável legal)
                  assinou os termos de uso de imagem e autorização de dados.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2e2825] shrink-0 flex gap-3 justify-end">
          {!salvando && (
            <button
              onClick={onFechar}
              className="px-5 py-2.5 text-sm text-gray-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={onSalvar}
            disabled={salvando || !campoValido}
            className="flex items-center gap-2 bg-[#C5A059] text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-[#d4b06a] transition-colors text-sm disabled:opacity-40 min-w-[130px] justify-center"
          >
            {salvando ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Salvando...
              </>
            ) : modoEdicao ? (
              "Salvar alterações"
            ) : (
              <>
                <Plus size={14} />
                Cadastrar
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function ParticipantesPage() {
  const supabase = createClient();

  // ── Infra ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [organizacaoId, setOrganizacaoId] = useState<string | null>(null);

  // ── Dados ──────────────────────────────────────────────────────────────────
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [terminologia, setTerminologia] = useState<Terminologia>({
    termo_participante: null,
    termo_grupo: null,
    termo_evento: null,
    termo_apresentacao: null,
    termo_inscricao: null,
  });

  // ── Filtros ────────────────────────────────────────────────────────────────
  const [busca, setBusca] = useState("");
  const [filtroEstilo, setFiltroEstilo] = useState("");
  const [filtroTermo, setFiltroTermo] = useState<"todos" | "assinado" | "pendente">("todos");
  const [ordem, setOrdem] = useState<{ campo: OrdemCampo; dir: OrdemDir }>({
    campo: "created_at",
    dir: "desc",
  });

  // ── Drawer ─────────────────────────────────────────────────────────────────
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // ── Modal exclusão ─────────────────────────────────────────────────────────
  const [excluindo, setExcluindo] = useState<Participante | null>(null);
  const [excluindoLoading, setExcluindoLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // TOASTS
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
        // 1. Auth
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Usuário não autenticado.");

        // 2. organizacao_id
        const { data: usuarioData, error: usuarioError } = await supabase
          .from("usuarios")
          .select("organizacao_id")
          .eq("id", user.id)
          .single();
        if (usuarioError || !usuarioData?.organizacao_id)
          throw new Error("Organização não encontrada.");

        const orgId = usuarioData.organizacao_id;
        setOrganizacaoId(orgId);

        // 3. Paralelo: terminologia + estilos ativos + participantes
        const [
          { data: configData },
          { data: estilosAtivosData },
          { data: participantesData, error: participantesError },
        ] = await Promise.all([
          supabase
            .from("tenant_config")
            .select(
              "termo_participante, termo_grupo, termo_evento, termo_apresentacao, termo_inscricao"
            )
            .eq("organizacao_id", orgId)
            .single(),
          supabase
            .from("tenant_estilos_ativos")
            .select("estilo_id")
            .eq("organizacao_id", orgId),
          supabase
            .from("participantes")
            .select("*")
            .eq("organizacao_id", orgId)
            .order("created_at", { ascending: false }),
        ]);

        if (participantesError) throw participantesError;
        if (configData) setTerminologia(configData);
        setParticipantes(participantesData ?? []);

        // 4. Detalhes dos estilos ativos
        if (estilosAtivosData && estilosAtivosData.length > 0) {
          const ids = estilosAtivosData.map((e) => e.estilo_id);
          const { data: estilosData } = await supabase
            .from("estilos")
            .select("id, nome, descricao")
            .in("id", ids)
            .order("nome");
          setEstilos(estilosData ?? []);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao carregar dados.";
        addToast("erro", msg);
      } finally {
        setLoading(false);
      }
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // LISTA FILTRADA (memo)
  // ─────────────────────────────────────────────────────────────────────────

  const participantesFiltrados = useMemo(() => {
    let lista = [...participantes];

    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          (p.documento &&
            p.documento.replace(/\D/g, "").includes(q.replace(/\D/g, "")))
      );
    }
    if (filtroEstilo) lista = lista.filter((p) => p.estilo_id === filtroEstilo);
    if (filtroTermo === "assinado") lista = lista.filter((p) => p.termo_assinado);
    if (filtroTermo === "pendente") lista = lista.filter((p) => !p.termo_assinado);

    lista.sort((a, b) => {
      const dir = ordem.dir === "asc" ? 1 : -1;
      if (ordem.campo === "nome") return a.nome.localeCompare(b.nome) * dir;
      if (ordem.campo === "data_nascimento")
        return (a.data_nascimento > b.data_nascimento ? 1 : -1) * dir;
      return (a.created_at > b.created_at ? 1 : -1) * dir;
    });

    return lista;
  }, [participantes, busca, filtroEstilo, filtroTermo, ordem]);

  // ─────────────────────────────────────────────────────────────────────────
  // DRAWER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  function abrirNovo() {
    setForm(FORM_INICIAL);
    setEditandoId(null);
    setDrawerAberto(true);
  }

  function abrirEdicao(p: Participante) {
    setForm({
      nome: p.nome,
      data_nascimento: p.data_nascimento,
      documento: p.documento ?? "",
      estilo_id: p.estilo_id ?? "",
      termo_assinado: p.termo_assinado,
    });
    setEditandoId(p.id);
    setDrawerAberto(true);
  }

  function fecharDrawer() {
    if (salvando) return;
    setDrawerAberto(false);
    setTimeout(() => {
      setForm(FORM_INICIAL);
      setEditandoId(null);
    }, 300);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SALVAR
  // ─────────────────────────────────────────────────────────────────────────

  async function salvar() {
    if (!organizacaoId) return;
    if (!form.nome.trim() || !form.data_nascimento) {
      addToast("aviso", "Nome e data de nascimento são obrigatórios.");
      return;
    }

    setSalvando(true);
    const termo = terminologia.termo_participante || "Participante";

    try {
      const payload = {
        nome: form.nome.trim(),
        data_nascimento: form.data_nascimento,
        documento: form.documento.trim() || null,
        estilo_id: form.estilo_id || null,
        termo_assinado: form.termo_assinado,
        organizacao_id: organizacaoId,
      };

      if (editandoId) {
        const { data, error } = await supabase
          .from("participantes")
          .update(payload)
          .eq("id", editandoId)
          .eq("organizacao_id", organizacaoId)
          .select()
          .single();
        if (error) throw error;
        setParticipantes((p) => p.map((x) => (x.id === editandoId ? data : x)));
        addToast("sucesso", `${termo} atualizado com sucesso!`);
      } else {
        const { data, error } = await supabase
          .from("participantes")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setParticipantes((p) => [data, ...p]);
        addToast("sucesso", `${termo} cadastrado com sucesso!`);
      }

      fecharDrawer();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar.";
      addToast("erro", msg);
    } finally {
      setSalvando(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXCLUIR
  // ─────────────────────────────────────────────────────────────────────────

  async function confirmarExclusao() {
    if (!excluindo || !organizacaoId) return;
    setExcluindoLoading(true);
    const termo = terminologia.termo_participante || "Participante";
    try {
      const { error } = await supabase
        .from("participantes")
        .delete()
        .eq("id", excluindo.id)
        .eq("organizacao_id", organizacaoId);
      if (error) throw error;
      setParticipantes((p) => p.filter((x) => x.id !== excluindo.id));
      addToast("sucesso", `${termo} excluído.`);
      setExcluindo(null);
    } catch {
      addToast("erro", "Erro ao excluir. Tente novamente.");
    } finally {
      setExcluindoLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ORDENAÇÃO
  // ─────────────────────────────────────────────────────────────────────────

  function toggleOrdem(campo: OrdemCampo) {
    setOrdem((p) => ({
      campo,
      dir: p.campo === campo && p.dir === "asc" ? "desc" : "asc",
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return <PageSkeleton />;

  const termo = terminologia.termo_participante || "Participante";
  const termoPlural = `${termo}s`;
  const semTermoPendente = participantes.filter((p) => !p.termo_assinado).length;
  const filtrosAtivos = !!(busca || filtroEstilo || filtroTermo !== "todos");

  return (
    <>
      <ToastContainer toasts={toasts} remover={removerToast} />

      {excluindo && (
        <ModalExcluir
          nome={excluindo.nome}
          termoParticipante={termo}
          onConfirmar={confirmarExclusao}
          onCancelar={() => !excluindoLoading && setExcluindo(null)}
          carregando={excluindoLoading}
        />
      )}

      <DrawerParticipante
        aberto={drawerAberto}
        onFechar={fecharDrawer}
        onSalvar={salvar}
        salvando={salvando}
        form={form}
        setForm={setForm}
        estilos={estilos}
        terminologia={terminologia}
        modoEdicao={!!editandoId}
      />

      <div className="max-w-6xl mx-auto space-y-5 pb-12">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <Users size={18} className="text-[#C5A059]" />
              <h1 className="text-xl font-bold text-white tracking-tight">
                {termoPlural}
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              {participantes.length}{" "}
              {participantes.length === 1
                ? termo.toLowerCase()
                : termoPlural.toLowerCase()}{" "}
              cadastrado{participantes.length !== 1 && "s"}
              {semTermoPendente > 0 && (
                <span className="ml-2 text-yellow-500/80">
                  · {semTermoPendente} com termo pendente
                </span>
              )}
            </p>
          </div>
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 bg-[#C5A059] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-[#d4b06a] transition-colors text-sm whitespace-nowrap shrink-0"
          >
            <Plus size={15} />
            Novo {termo}
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Busca */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              type="text"
              placeholder="Buscar por nome ou documento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-[#1a1413] border border-[#2e2825] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#C5A059] transition-colors"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtro termo */}
          <div className="relative">
            <select
              value={filtroTermo}
              onChange={(e) =>
                setFiltroTermo(e.target.value as typeof filtroTermo)
              }
              className="bg-[#1a1413] border border-[#2e2825] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors appearance-none pr-8 [color-scheme:dark]"
            >
              <option value="todos">Todos os termos</option>
              <option value="assinado">Termo assinado</option>
              <option value="pendente">Termo pendente</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
            />
          </div>

          {/* Filtro estilo */}
          {estilos.length > 0 && (
            <div className="relative">
              <select
                value={filtroEstilo}
                onChange={(e) => setFiltroEstilo(e.target.value)}
                className="bg-[#1a1413] border border-[#2e2825] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors appearance-none pr-8 [color-scheme:dark]"
              >
                <option value="">Todas as modalidades</option>
                {estilos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
              />
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-[#1a1413] border border-[#2e2825] rounded-2xl overflow-hidden">

          {/* Cabeçalho */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-[#2e2825]">
            {[
              { label: "Nome", campo: "nome" as OrdemCampo },
              { label: "Nascimento", campo: "data_nascimento" as OrdemCampo },
            ].map(({ label, campo }) => (
              <button
                key={campo}
                onClick={() => toggleOrdem(campo)}
                className="flex items-center gap-1.5 text-xs text-gray-600 uppercase tracking-wider font-medium hover:text-gray-400 transition-colors text-left"
              >
                {label}
                <ArrowUpDown
                  size={11}
                  className={ordem.campo === campo ? "text-[#C5A059]" : ""}
                />
              </button>
            ))}
            <span className="text-xs text-gray-600 uppercase tracking-wider font-medium">
              Modalidade
            </span>
            <span className="text-xs text-gray-600 uppercase tracking-wider font-medium">
              Termo
            </span>
            <span className="text-xs text-gray-600 uppercase tracking-wider font-medium text-right">
              Ações
            </span>
          </div>

          {/* Vazio */}
          {participantesFiltrados.length === 0 && (
            <div className="text-center py-16 px-4 text-gray-600">
              <Users size={32} className="mx-auto mb-3 opacity-20" />
              {participantes.length === 0 ? (
                <>
                  <p className="text-sm font-medium text-gray-500">
                    Nenhum {termo.toLowerCase()} cadastrado ainda.
                  </p>
                  <button
                    onClick={abrirNovo}
                    className="text-[#C5A059] text-sm hover:text-[#d4b06a] transition-colors mt-2"
                  >
                    Cadastrar o primeiro {termo.toLowerCase()} →
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">
                    Nenhum resultado para os filtros aplicados.
                  </p>
                  <button
                    onClick={() => {
                      setBusca("");
                      setFiltroEstilo("");
                      setFiltroTermo("todos");
                    }}
                    className="text-[#C5A059] text-sm hover:text-[#d4b06a] transition-colors"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Linhas */}
          {participantesFiltrados.map((p, idx) => {
            const estilo = estilos.find((e) => e.id === p.estilo_id);
            const idade = calcularIdade(p.data_nascimento);
            const isLast = idx === participantesFiltrados.length - 1;

            return (
              <div
                key={p.id}
                className={`group flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_80px] gap-3 md:gap-4 items-start md:items-center px-5 py-4 transition-colors hover:bg-[#1e1917] ${
                  !isLast ? "border-b border-[#2e2825]/60" : ""
                }`}
              >
                {/* Nome */}
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <div className="w-8 h-8 rounded-full bg-[#2e2825] flex items-center justify-center shrink-0 text-xs font-bold text-[#C5A059] select-none">
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {p.nome}
                    </p>
                    {p.documento && (
                      <p className="text-xs text-gray-600 font-mono truncate">
                        {p.documento}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nascimento */}
                <div>
                  <p className="text-sm text-gray-400">
                    {formatarData(p.data_nascimento)}
                  </p>
                  <p className="text-xs text-gray-600">{idade} anos</p>
                </div>

                {/* Modalidade */}
                <div>
                  {estilo ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 max-w-[140px] truncate">
                      {estilo.nome}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-700">—</span>
                  )}
                </div>

                {/* Termo */}
                <div>
                  {p.termo_assinado ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={10} />
                      Assinado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      <AlertTriangle size={10} />
                      Pendente
                    </span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => abrirEdicao(p)}
                    title={`Editar ${termo.toLowerCase()}`}
                    className="p-2 text-gray-600 hover:text-white hover:bg-[#2e2825] rounded-lg transition-all"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setExcluindo(p)}
                    title={`Excluir ${termo.toLowerCase()}`}
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Rodapé */}
          {participantesFiltrados.length > 0 && (
            <div className="px-5 py-3 border-t border-[#2e2825] text-xs text-gray-700 flex items-center justify-between">
              <span>
                {filtrosAtivos
                  ? `${participantesFiltrados.length} de ${participantes.length} ${termoPlural.toLowerCase()}`
                  : `${participantes.length} ${termoPlural.toLowerCase()} no total`}
              </span>
              {filtrosAtivos && (
                <button
                  onClick={() => {
                    setBusca("");
                    setFiltroEstilo("");
                    setFiltroTermo("todos");
                  }}
                  className="text-[#C5A059] hover:text-[#d4b06a] transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}