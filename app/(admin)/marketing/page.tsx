"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadButton } from "@/utils/uploadthing";
import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  ImageIcon,
  Megaphone,
  CheckCircle2,
  Trash2,
  Sparkles,
  Palette,
  Type,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Link2,
  Layers3,
  ChevronRight,
  Wand2,
  FolderOpen,
} from "lucide-react";

type PostStatus = "agendado" | "publicado" | "erro";
type FiltroPosts = "todos" | PostStatus;
type AbaAtiva = "posts" | "identidade";
type FonteFamilia = "sans" | "serif" | "mono" | "montserrat";

interface Post {
  id: string;
  legenda: string;
  imagem_url: string | null;
  agendado_para: string;
  status: PostStatus;
  plataforma: string;
  publicado_em: string | null;
  erro: string | null;
}

interface EventoMarketing {
  id: string;
  nome: string;
  slug: string | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  fonte_familia: FonteFamilia | null;
  logo_url: string | null;
  banner_url: string | null;
}

interface ToastItem {
  id: number;
  tipo: "sucesso" | "erro" | "info";
  mensagem: string;
}

interface ModalPostProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

interface IdentidadeEventoForm {
  slug: string;
  cor_primaria: string;
  cor_secundaria: string;
  fonte_familia: FonteFamilia;
  logo_url: string | null;
  banner_url: string | null;
}

const FONT_OPTIONS: Array<{ value: FonteFamilia; label: string; helper: string; className: string }> = [
  { value: "sans", label: "Inter / Padrão", helper: "Clara e versátil", className: "font-sans" },
  { value: "serif", label: "Playfair Display / Elegante", helper: "Editorial e sofisticada", className: "font-serif" },
  { value: "mono", label: "Fira Code / Moderno", helper: "Tecnológica e distinta", className: "font-mono" },
  { value: "montserrat", label: "Montserrat / Corporativo", helper: "Institucional e limpa", className: "font-[Montserrat,sans-serif]" },
];

const PALETA_PRESETS: Array<{ nome: string; prim: string; sec: string }> = [
  { nome: "Noite Dourada", prim: "#d4af37", sec: "#1f2937" },
  { nome: "Champagne", prim: "#c8a96b", sec: "#6b7280" },
  { nome: "Bordô Luxo", prim: "#9f1239", sec: "#f59e0b" },
];

let toastCounter = 0;

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function slugifyEvento(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function hexSeguro(valor: string | null | undefined, fallback: string) {
  if (!valor) return fallback;
  const v = valor.trim();
  return /^#([0-9A-Fa-f]{6})$/.test(v) ? v : fallback;
}

function classeFontePreview(fonte: FonteFamilia) {
  if (fonte === "serif") return "font-serif";
  if (fonte === "mono") return "font-mono";
  if (fonte === "montserrat") return "font-[Montserrat,sans-serif]";
  return "font-sans";
}

function ToastContainer({
  toasts,
  remover,
}: {
  toasts: ToastItem[];
  remover: (id: number) => void;
}) {
  const estilos: Record<ToastItem["tipo"], string> = {
    sucesso: "border-emerald-500/25 text-emerald-300",
    erro: "border-red-400/25 text-red-300",
    info: "border-axon-gold/25 text-axon-gold",
  };

  return (
    <div className="fixed right-5 bottom-5 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border bg-[#111315]/95 px-4 py-3 shadow-2xl backdrop-blur ${estilos[toast.tipo]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-relaxed">{toast.mensagem}</p>
            <button
              onClick={() => remover(toast.id)}
              className="text-neutral-500 transition-colors hover:text-white"
              aria-label="Fechar aviso"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardStat({
  titulo,
  valor,
  detalhe,
  icon: Icon,
  destaque = "text-white",
}: {
  titulo: string;
  valor: string | number;
  detalhe: string;
  icon: typeof Clock;
  destaque?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-axon-border bg-axon-panel/90 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">{titulo}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-axon-gold">
          <Icon size={16} />
        </div>
      </div>
      <p className={`text-3xl font-semibold tracking-tight ${destaque}`}>{valor}</p>
      <p className="mt-1 text-sm text-neutral-500">{detalhe}</p>
    </div>
  );
}

function ModalPost({ open, onClose, onSaved }: ModalPostProps) {
  const supabase = createClient();

  const [legenda, setLegenda] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      setLegenda("");
      setDataHora("");
      setImagemUrl(null);
      setErro(null);
      setSalvando(false);
      setUploading(false);
    }
  }, [open]);

  async function salvar() {
    setErro(null);

    if (!legenda.trim()) {
      setErro("Legenda é obrigatória.");
      return;
    }

    if (!dataHora) {
      setErro("Data e hora são obrigatórias.");
      return;
    }

    const agendadoPara = new Date(dataHora);

    if (Number.isNaN(agendadoPara.getTime())) {
      setErro("Data inválida.");
      return;
    }

    if (agendadoPara <= new Date()) {
      setErro("A data precisa estar no futuro.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.from("posts_marketing").insert({
      legenda: legenda.trim(),
      imagem_url: imagemUrl,
      agendado_para: agendadoPara.toISOString(),
      status: "agendado",
      plataforma: "Instagram",
    });

    if (error) {
      setErro(error.message);
      setSalvando(false);
      return;
    }

    setSalvando(false);
    await onSaved();
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-axon-border bg-axon-panel shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-axon-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">Agendar nova postagem</h2>
            <p className="mt-1 text-xs text-neutral-500">Monte a arte, defina a data e deixe o conteúdo preparado para publicação.</p>
          </div>

          <button onClick={onClose} className="text-neutral-400 transition-colors hover:text-white" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">Legenda *</label>
            <textarea
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              rows={5}
              placeholder="Digite a legenda do post..."
              className="w-full resize-none rounded-xl border border-axon-border bg-axon-bg px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-axon-gold focus:outline-none"
            />
            <p className="text-right text-xs text-neutral-600">{legenda.length} caracteres</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">Data e hora *</label>
            <input
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              className="w-full rounded-xl border border-axon-border bg-axon-bg px-4 py-3 text-sm text-white focus:border-axon-gold focus:outline-none [color-scheme:dark]"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">Imagem do post</label>

            {imagemUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-axon-border bg-axon-bg">
                <img src={imagemUrl} alt="Preview do post" className="max-h-72 w-full object-cover" />
                <button
                  onClick={() => setImagemUrl(null)}
                  className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                  aria-label="Remover imagem"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-axon-border bg-axon-bg/70 p-5">
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-8 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-axon-gold">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Faça upload da arte do post</p>
                    <p className="mt-1 text-xs text-neutral-500">PNG, JPG ou WebP com qualidade de feed.</p>
                  </div>

                  <div className="pt-1">
                    <UploadButton
                      endpoint="imageUploader"
                      appearance={{
                        button:
                          "ut-ready:bg-[#d4af37] ut-ready:text-black ut-ready:hover:bg-[#caa22f] ut-uploading:bg-[#d4af37]/80 ut-uploading:text-black rounded-xl border-0 px-4 py-2 text-sm font-semibold",
                        allowedContent: "hidden",
                      }}
                      content={{
                        button({ ready }) {
                          if (uploading) return "Enviando imagem...";
                          return ready ? "Selecionar imagem" : "Preparando...";
                        },
                      }}
                      onUploadBegin={() => {
                        setErro(null);
                        setUploading(true);
                      }}
                      onClientUploadComplete={(res) => {
                        const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
                        if (url) setImagemUrl(url);
                        setUploading(false);
                      }}
                      onUploadError={(error: Error) => {
                        setErro(`Erro no upload da imagem: ${error.message}`);
                        setUploading(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {erro && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{erro}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-axon-border px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-axon-border px-4 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando || uploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-axon-gold px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {(salvando || uploading) && <Loader2 size={15} className="animate-spin" />}
            Agendar post
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [eventos, setEventos] = useState<EventoMarketing[]>([]);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState("");
  const [identidadeForm, setIdentidadeForm] = useState<IdentidadeEventoForm>({
    slug: "",
    cor_primaria: "#d4af37",
    cor_secundaria: "#2d3748",
    fonte_familia: "sans",
    logo_url: null,
    banner_url: null,
  });

  const [carregando, setCarregando] = useState(true);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [salvandoIdentidade, setSalvandoIdentidade] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtro, setFiltro] = useState<FiltroPosts>("todos");
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("posts");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [copiado, setCopiado] = useState(false);
  const [uploadLogoLoading, setUploadLogoLoading] = useState(false);
  const [uploadBannerLoading, setUploadBannerLoading] = useState(false);

  const addToast = useCallback((tipo: ToastItem["tipo"], mensagem: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, tipo, mensagem }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removerToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const carregarPosts = useCallback(async () => {
    setCarregando(true);
    const { data } = await supabase.from("posts_marketing").select("*").order("agendado_para", { ascending: true });
    setPosts(((data ?? []) as Post[]) ?? []);
    setCarregando(false);
  }, [supabase]);

  const carregarEventos = useCallback(async () => {
    setCarregandoEventos(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;

    if (!userId) {
      setEventos([]);
      setEventoSelecionadoId("");
      setCarregandoEventos(false);
      return;
    }

    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuarios")
      .select("produtora_id")
      .eq("id", userId)
      .single();

    if (usuarioError) {
      setEventos([]);
      setEventoSelecionadoId("");
      setCarregandoEventos(false);
      return;
    }

    const produtoraId = (usuarioData as { produtora_id: string | null } | null)?.produtora_id;

    if (!produtoraId) {
      setEventos([]);
      setEventoSelecionadoId("");
      setCarregandoEventos(false);
      return;
    }

    const { data: eventosData } = await supabase
      .from("eventos")
      .select("id, nome, slug, cor_primaria, cor_secundaria, fonte_familia, logo_url, banner_url")
      .eq("produtora_id", produtoraId)
      .order("nome", { ascending: true });

    const lista = ((eventosData ?? []) as EventoMarketing[]) ?? [];
    setEventos(lista);

    setEventoSelecionadoId((prev) => {
      if (prev && lista.some((evento) => evento.id === prev)) return prev;
      return lista[0]?.id ?? "";
    });

    setCarregandoEventos(false);
  }, [supabase]);

  useEffect(() => {
    void carregarPosts();
    void carregarEventos();
  }, [carregarPosts, carregarEventos]);

  const eventoSelecionado = useMemo(
    () => eventos.find((evento) => evento.id === eventoSelecionadoId) ?? null,
    [eventos, eventoSelecionadoId]
  );

  useEffect(() => {
    if (!eventoSelecionado) {
      setIdentidadeForm({
        slug: "",
        cor_primaria: "#d4af37",
        cor_secundaria: "#2d3748",
        fonte_familia: "sans",
        logo_url: null,
        banner_url: null,
      });
      return;
    }

    setIdentidadeForm({
      slug: eventoSelecionado.slug ?? "",
      cor_primaria: hexSeguro(eventoSelecionado.cor_primaria, "#d4af37"),
      cor_secundaria: hexSeguro(eventoSelecionado.cor_secundaria, "#2d3748"),
      fonte_familia: eventoSelecionado.fonte_familia ?? "sans",
      logo_url: eventoSelecionado.logo_url ?? null,
      banner_url: eventoSelecionado.banner_url ?? null,
    });
  }, [eventoSelecionado]);

  async function excluir(id: string) {
    if (!window.confirm("Excluir este post agendado?")) return;
    await supabase.from("posts_marketing").delete().eq("id", id);
    setPosts((prev) => prev.filter((x) => x.id !== id));
    addToast("sucesso", "Post excluído.");
  }

  async function marcarPublicado(id: string) {
    const publicadoEm = new Date().toISOString();

    await supabase
      .from("posts_marketing")
      .update({
        status: "publicado",
        publicado_em: publicadoEm,
      })
      .eq("id", id);

    setPosts((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "publicado", publicado_em: publicadoEm } : x))
    );

    addToast("sucesso", "Post marcado como publicado.");
  }

  async function salvarIdentidadeVisual() {
    if (!eventoSelecionadoId) return;

    setSalvandoIdentidade(true);

    const payload = {
      slug: slugifyEvento(identidadeForm.slug),
      cor_primaria: hexSeguro(identidadeForm.cor_primaria, "#d4af37"),
      cor_secundaria: hexSeguro(identidadeForm.cor_secundaria, "#2d3748"),
      fonte_familia: identidadeForm.fonte_familia,
      logo_url: identidadeForm.logo_url,
      banner_url: identidadeForm.banner_url,
    };

    const { error } = await supabase.from("eventos").update(payload).eq("id", eventoSelecionadoId);

    if (error) {
      addToast("erro", `Erro ao salvar identidade visual: ${error.message}`);
      setSalvandoIdentidade(false);
      return;
    }

    setEventos((prev) =>
      prev.map((evento) => (evento.id === eventoSelecionadoId ? { ...evento, ...payload } : evento))
    );

    setSalvandoIdentidade(false);
    addToast("sucesso", "Identidade visual salva com sucesso.");
  }

  async function copiarLinkFinal() {
    const slug = slugifyEvento(identidadeForm.slug);
    if (!slug) {
      addToast("info", "Defina um slug antes de copiar o link.");
      return;
    }

    const link = `https://arxum.csstudios.site/fest/e/${slug}`;
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
    addToast("sucesso", "Link copiado para a área de transferência.");
  }

  function aplicarPreset(prim: string, sec: string) {
    setIdentidadeForm((prev) => ({
      ...prev,
      cor_primaria: prim,
      cor_secundaria: sec,
    }));
  }

  const postsFiltrados = posts.filter((p) => (filtro === "todos" ? true : p.status === filtro));
  const totalAgendados = posts.filter((p) => p.status === "agendado").length;
  const totalPublicados = posts.filter((p) => p.status === "publicado").length;
  const proximoPost = posts.find((p) => p.status === "agendado");

  const urlFinal = `https://arxum.csstudios.site/fest/e/${slugifyEvento(identidadeForm.slug)}`;
  const previewFonteClass = classeFontePreview(identidadeForm.fonte_familia);

  function badgeStatus(status: Post["status"]) {
    if (status === "publicado") return "border-emerald-500/25 text-emerald-300 bg-emerald-500/10";
    if (status === "erro") return "border-red-400/25 text-red-300 bg-red-400/10";
    return "border-axon-gold/25 text-axon-gold bg-axon-gold/10";
  }

  function labelStatus(status: Post["status"]) {
    if (status === "publicado") return "Publicado";
    if (status === "erro") return "Com erro";
    return "Agendado";
  }

  return (
    <>
      <ToastContainer toasts={toasts} remover={removerToast} />

      <ModalPost open={modalAberto} onClose={() => setModalAberto(false)} onSaved={carregarPosts} />

      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div className="overflow-hidden rounded-3xl border border-axon-border bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-axon-gold/20 bg-axon-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-axon-gold">
                  <Sparkles size={12} />
                  Axon Marketing Suite
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  Marketing e identidade da página pública
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
                  Gerencie o calendário de publicações e personalize visualmente a landing page oficial do festival com preview em tempo real.
                </p>
              </div>

              <button
                onClick={() => setModalAberto(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-axon-gold px-4 py-3 text-sm font-semibold text-black transition-all hover:opacity-90"
              >
                <Plus size={16} />
                Agendar post
              </button>
            </div>

            <div className="rounded-2xl border border-axon-border bg-black/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Layers3 size={16} className="text-axon-gold" />
                <p className="text-sm font-medium text-white">Evento Ativo para Customização</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <select
                    value={eventoSelecionadoId}
                    onChange={(e) => setEventoSelecionadoId(e.target.value)}
                    disabled={carregandoEventos}
                    className="w-full rounded-xl border border-axon-border bg-axon-bg px-4 py-3 text-sm text-white focus:border-axon-gold focus:outline-none disabled:opacity-50"
                  >
                    <option value="">
                      {carregandoEventos ? "Carregando eventos..." : "Selecione um evento"}
                    </option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {eventoSelecionado && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-400">
                    <span className="text-neutral-500">Slug atual:</span>{" "}
                    <span className="font-medium text-white">{eventoSelecionado.slug || "não definido"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 rounded-2xl border border-axon-border bg-black/20 p-2">
              {[
                { id: "posts", label: "Agendador de Posts", icon: Megaphone },
                { id: "identidade", label: "Identidade da Página Pública", icon: Palette },
              ].map(({ id, label, icon: Icon }) => {
                const ativo = abaAtiva === id;
                return (
                  <button
                    key={id}
                    onClick={() => setAbaAtiva(id as AbaAtiva)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      ativo
                        ? "border border-axon-gold/30 bg-axon-gold/10 text-axon-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        : "border border-transparent text-neutral-500 hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {abaAtiva === "posts" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <CardStat
                titulo="Agendados"
                valor={totalAgendados}
                detalhe="Posts aguardando publicação"
                icon={Clock}
                destaque="text-axon-gold"
              />
              <CardStat
                titulo="Publicados"
                valor={totalPublicados}
                detalhe="Conteúdos já finalizados"
                icon={CheckCircle2}
                destaque="text-emerald-300"
              />
              <CardStat
                titulo="Próximo Post"
                valor={proximoPost ? formatarDataCurta(proximoPost.agendado_para) : "—"}
                detalhe={proximoPost ? formatarData(proximoPost.agendado_para) : "Nenhum post futuro"}
                icon={Calendar}
                destaque="text-white"
              />
            </div>

            <div className="rounded-3xl border border-axon-border bg-axon-panel p-5 shadow-[0_15px_40px_rgba(0,0,0,0.25)]">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Fila de publicações</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Visualize, filtre e acompanhe o status de cada publicação do calendário editorial.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["todos", "agendado", "publicado", "erro"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFiltro(f)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                        filtro === f
                          ? "border border-axon-gold/30 bg-axon-gold/10 text-axon-gold"
                          : "border border-axon-border bg-axon-bg text-neutral-400 hover:text-white"
                      }`}
                    >
                      {f === "todos" ? "Todos" : f === "agendado" ? "Agendados" : f === "publicado" ? "Publicados" : "Com erro"}
                    </button>
                  ))}
                </div>
              </div>

              {carregando ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-axon-gold" />
                </div>
              ) : postsFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-axon-border bg-axon-bg/50 px-6 py-20 text-center">
                  <Megaphone size={38} className="mb-4 text-neutral-700" />
                  <p className="text-base font-medium text-white">Nenhum post encontrado</p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                    Ajuste o filtro atual ou crie a primeira publicação agendada para começar a organizar sua comunicação.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {postsFiltrados.map((post) => (
                    <div
                      key={post.id}
                      className="overflow-hidden rounded-2xl border border-axon-border bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                    >
                      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
                        {post.imagem_url ? (
                          <img
                            src={post.imagem_url}
                            alt="Arte do post"
                            className="h-28 w-full rounded-xl border border-axon-border object-cover md:h-24 md:w-24"
                          />
                        ) : (
                          <div className="flex h-28 w-full items-center justify-center rounded-xl border border-axon-border bg-axon-bg md:h-24 md:w-24">
                            <ImageIcon size={20} className="text-neutral-700" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <p className="line-clamp-3 text-sm leading-relaxed text-neutral-300">{post.legenda}</p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              {post.status === "agendado" && (
                                <button
                                  onClick={() => marcarPublicado(post.id)}
                                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/15"
                                >
                                  Marcar publicado
                                </button>
                              )}

                              {post.status !== "publicado" && (
                                <button
                                  onClick={() => excluir(post.id)}
                                  className="rounded-lg border border-red-400/20 bg-red-400/10 p-2 text-red-300 transition-colors hover:bg-red-400/15"
                                  aria-label="Excluir post"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2.5">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeStatus(post.status)}`}>
                              {labelStatus(post.status)}
                            </span>

                            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                              <Calendar size={12} />
                              {formatarData(post.agendado_para)}
                            </span>

                            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
                              <ChevronRight size={12} />
                              {post.plataforma}
                            </span>
                          </div>

                          {post.status === "publicado" && post.publicado_em && (
                            <p className="mt-2 text-xs text-neutral-600">Publicado em {formatarData(post.publicado_em)}</p>
                          )}

                          {post.erro && (
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-300">
                              <AlertCircle size={12} className="mt-0.5 shrink-0" />
                              <span>{post.erro}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === "identidade" && (
          <>
            {!eventoSelecionadoId ? (
              <div className="rounded-3xl border border-dashed border-axon-border bg-axon-panel px-6 py-20 text-center shadow-[0_12px_35px_rgba(0,0,0,0.22)]">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-axon-gold">
                  <FolderOpen size={28} />
                </div>
                <h2 className="text-xl font-semibold text-white">Nenhum evento selecionado</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
                  Selecione um evento no seletor do topo para iniciar a customização da página pública.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-3xl border border-axon-border bg-axon-panel p-5 shadow-[0_15px_40px_rgba(0,0,0,0.25)] md:p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Editor da identidade visual</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Ajuste URL pública, tipografia, paleta e mídias do evento selecionado.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">Slug público</label>

                      <div className="overflow-hidden rounded-2xl border border-axon-border bg-axon-bg">
                        <div className="border-b border-axon-border px-4 py-2 text-xs text-neutral-600">
                          arxum.csstudios.site/fest/e/
                        </div>
                        <div className="flex flex-col gap-3 p-3 md:flex-row">
                          <input
                            type="text"
                            value={identidadeForm.slug}
                            onChange={(e) =>
                              setIdentidadeForm((prev) => ({
                                ...prev,
                                slug: slugifyEvento(e.target.value),
                              }))
                            }
                            placeholder="festival-de-danca-2026"
                            className="min-w-0 flex-1 rounded-xl border border-axon-border bg-black/20 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-axon-gold focus:outline-none"
                          />

                          <button
                            onClick={() => void copiarLinkFinal()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-axon-border px-4 py-3 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
                          >
                            {copiado ? <Check size={15} /> : <Copy size={15} />}
                            {copiado ? "Copiado" : "Copiar link"}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600">{urlFinal}</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">Tipografia</label>
                      <select
                        value={identidadeForm.fonte_familia}
                        onChange={(e) =>
                          setIdentidadeForm((prev) => ({
                            ...prev,
                            fonte_familia: e.target.value as FonteFamilia,
                          }))
                        }
                        className="w-full rounded-2xl border border-axon-border bg-axon-bg px-4 py-3 text-sm text-white focus:border-axon-gold focus:outline-none"
                      >
                        {FONT_OPTIONS.map((fonte) => (
                          <option key={fonte.value} value={fonte.value}>
                            {fonte.label}
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {FONT_OPTIONS.map((fonte) => (
                          <div
                            key={fonte.value}
                            className={`rounded-xl border px-4 py-3 ${
                              identidadeForm.fonte_familia === fonte.value
                                ? "border-axon-gold/30 bg-axon-gold/10"
                                : "border-axon-border bg-axon-bg"
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-2 text-axon-gold">
                              <Type size={14} />
                              <span className="text-xs font-medium uppercase tracking-[0.12em]">{fonte.value}</span>
                            </div>
                            <p className={`text-sm text-white ${fonte.className}`}>{fonte.label}</p>
                            <p className="mt-1 text-xs text-neutral-500">{fonte.helper}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Palette size={15} className="text-axon-gold" />
                        <label className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">Paleta de cores</label>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-white">Cor primária</p>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={hexSeguro(identidadeForm.cor_primaria, "#d4af37")}
                              onChange={(e) =>
                                setIdentidadeForm((prev) => ({ ...prev, cor_primaria: e.target.value }))
                              }
                              className="h-12 w-14 rounded-xl border border-axon-border bg-axon-bg p-1"
                            />
                            <input
                              type="text"
                              value={identidadeForm.cor_primaria}
                              onChange={(e) =>
                                setIdentidadeForm((prev) => ({ ...prev, cor_primaria: e.target.value }))
                              }
                              className="min-w-0 flex-1 rounded-xl border border-axon-border bg-axon-bg px-4 py-3 text-sm text-white focus:border-axon-gold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-white">Cor secundária</p>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={hexSeguro(identidadeForm.cor_secundaria, "#2d3748")}
                              onChange={(e) =>
                                setIdentidadeForm((prev) => ({ ...prev, cor_secundaria: e.target.value }))
                              }
                              className="h-12 w-14 rounded-xl border border-axon-border bg-axon-bg p-1"
                            />
                            <input
                              type="text"
                              value={identidadeForm.cor_secundaria}
                              onChange={(e) =>
                                setIdentidadeForm((prev) => ({ ...prev, cor_secundaria: e.target.value }))
                              }
                              className="min-w-0 flex-1 rounded-xl border border-axon-border bg-axon-bg px-4 py-3 text-sm text-white focus:border-axon-gold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {PALETA_PRESETS.map((preset) => (
                          <button
                            key={preset.nome}
                            onClick={() => aplicarPreset(preset.prim, preset.sec)}
                            className="inline-flex items-center gap-2 rounded-xl border border-axon-border bg-axon-bg px-3 py-2 text-xs font-medium text-neutral-300 transition-colors hover:text-white"
                          >
                            <Wand2 size={13} />
                            {preset.nome}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <div className="space-y-3 rounded-2xl border border-axon-border bg-axon-bg/60 p-4">
                        <div>
                          <p className="text-sm font-medium text-white">Logo do festival</p>
                          <p className="mt-1 text-xs text-neutral-500">Imagem principal para cabeçalho e assinatura da página.</p>
                        </div>

                        {identidadeForm.logo_url ? (
                          <div className="overflow-hidden rounded-xl border border-axon-border bg-black/20">
                            <img src={identidadeForm.logo_url} alt="Logo do festival" className="h-28 w-full object-contain bg-white/5 p-4" />
                          </div>
                        ) : (
                          <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-axon-border text-neutral-600">
                            <ImageIcon size={20} />
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <UploadButton
                            endpoint="imageUploader"
                            appearance={{
                              button:
                                "ut-ready:bg-[#d4af37] ut-ready:text-black ut-ready:hover:bg-[#caa22f] ut-uploading:bg-[#d4af37]/80 ut-uploading:text-black rounded-xl border-0 px-4 py-2 text-sm font-semibold",
                              allowedContent: "hidden",
                            }}
                            content={{
                              button() {
                                return uploadLogoLoading ? "Enviando logo..." : "Upload logo";
                              },
                            }}
                            onUploadBegin={() => setUploadLogoLoading(true)}
                            onClientUploadComplete={(res) => {
                              const url = res?.[0]?.ufsUrl ?? res?.[0]?.url ?? null;
                              setIdentidadeForm((prev) => ({ ...prev, logo_url: url }));
                              setUploadLogoLoading(false);
                              addToast("sucesso", "Logo enviada com sucesso.");
                            }}
                            onUploadError={(error: Error) => {
                              addToast("erro", `Erro no upload do logo: ${error.message}`);
                              setUploadLogoLoading(false);
                            }}
                          />

                          {identidadeForm.logo_url && (
                            <button
                              onClick={() =>
                                setIdentidadeForm((prev) => ({
                                  ...prev,
                                  logo_url: null,
                                }))
                              }
                              className="rounded-xl border border-axon-border px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-axon-border bg-axon-bg/60 p-4">
                        <div>
                          <p className="text-sm font-medium text-white">Banner do festival</p>
                          <p className="mt-1 text-xs text-neutral-500">Imagem de capa para hero e apresentação institucional.</p>
                        </div>

                        {identidadeForm.banner_url ? (
                          <div className="overflow-hidden rounded-xl border border-axon-border bg-black/20">
                            <img src={identidadeForm.banner_url} alt="Banner do festival" className="h-28 w-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-axon-border text-neutral-600">
                            <ImageIcon size={20} />
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <UploadButton
                            endpoint="imageUploader"
                            appearance={{
                              button:
                                "ut-ready:bg-[#d4af37] ut-ready:text-black ut-ready:hover:bg-[#caa22f] ut-uploading:bg-[#d4af37]/80 ut-uploading:text-black rounded-xl border-0 px-4 py-2 text-sm font-semibold",
                              allowedContent: "hidden",
                            }}
                            content={{
                              button() {
                                return uploadBannerLoading ? "Enviando banner..." : "Upload banner";
                              },
                            }}
                            onUploadBegin={() => setUploadBannerLoading(true)}
                            onClientUploadComplete={(res) => {
                              const url = res?.[0]?.ufsUrl ?? res?.[0]?.url ?? null;
                              setIdentidadeForm((prev) => ({ ...prev, banner_url: url }));
                              setUploadBannerLoading(false);
                              addToast("sucesso", "Banner enviado com sucesso.");
                            }}
                            onUploadError={(error: Error) => {
                              addToast("erro", `Erro no upload do banner: ${error.message}`);
                              setUploadBannerLoading(false);
                            }}
                          />

                          {identidadeForm.banner_url && (
                            <button
                              onClick={() =>
                                setIdentidadeForm((prev) => ({
                                  ...prev,
                                  banner_url: null,
                                }))
                              }
                              className="rounded-xl border border-axon-border px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => void salvarIdentidadeVisual()}
                        disabled={salvandoIdentidade}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-axon-gold px-5 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {salvandoIdentidade && <Loader2 size={16} className="animate-spin" />}
                        Salvar Identidade Visual
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-axon-border bg-axon-panel p-5 shadow-[0_15px_40px_rgba(0,0,0,0.25)] md:p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Live Preview Interativo</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Visualize em tempo real como a landing page pública do evento responderá às alterações do editor.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-axon-border bg-axon-bg/60 p-4">
                      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                        <Monitor size={14} className="text-axon-gold" />
                        Cabeçalho desktop
                      </div>

                      <div
                        className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0f1113] shadow-[0_20px_40px_rgba(0,0,0,0.35)] ${previewFonteClass}`}
                      >
                        <div
                          className="relative h-44 border-b border-white/10"
                          style={{
                            backgroundColor: hexSeguro(identidadeForm.cor_secundaria, "#2d3748"),
                          }}
                        >
                          {identidadeForm.banner_url ? (
                            <img src={identidadeForm.banner_url} alt="Banner preview" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                          ) : null}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

                          <div className="relative z-10 flex h-full flex-col justify-between p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {identidadeForm.logo_url ? (
                                  <img
                                    src={identidadeForm.logo_url}
                                    alt="Logo preview"
                                    className="h-11 w-11 rounded-xl border border-white/15 bg-white/10 object-cover"
                                  />
                                ) : (
                                  <div
                                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white"
                                    style={{ backgroundColor: `${hexSeguro(identidadeForm.cor_primaria, "#d4af37")}22` }}
                                  >
                                    <ImageIcon size={18} />
                                  </div>
                                )}

                                <div>
                                  <p className="text-sm font-semibold text-white">{eventoSelecionado?.nome}</p>
                                  <p className="text-xs text-white/65">{slugifyEvento(identidadeForm.slug) || "slug-do-evento"}</p>
                                </div>
                              </div>

                              <button
                                className="rounded-xl px-4 py-2 text-xs font-semibold text-black"
                                style={{ backgroundColor: hexSeguro(identidadeForm.cor_primaria, "#d4af37") }}
                              >
                                Inscreva-se
                              </button>
                            </div>

                            <div>
                              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/60">Landing Page Pública</p>
                              <h3 className="max-w-sm text-2xl font-semibold tracking-tight text-white">
                                Uma experiência visual alinhada ao posicionamento do seu festival.
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-axon-border bg-axon-bg/60 p-4">
                      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                        <Smartphone size={14} className="text-axon-gold" />
                        Mockup mobile
                      </div>

                      <div className="mx-auto w-full max-w-[320px] rounded-[2rem] border border-white/10 bg-[#0b0d0f] p-3 shadow-[0_25px_50px_rgba(0,0,0,0.45)]">
                        <div className={`overflow-hidden rounded-[1.45rem] bg-[#111315] ${previewFonteClass}`}>
                          <div
                            className="relative h-40"
                            style={{ backgroundColor: hexSeguro(identidadeForm.cor_secundaria, "#2d3748") }}
                          >
                            {identidadeForm.banner_url ? (
                              <img src={identidadeForm.banner_url} alt="Banner mobile preview" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

                            <div className="relative z-10 flex h-full flex-col justify-between p-4">
                              <div className="flex items-center justify-between">
                                <div className="h-1.5 w-16 rounded-full bg-white/25" />
                                <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] text-white/80">
                                  <Link2 size={10} />
                                  Ao vivo
                                </div>
                              </div>

                              <div>
                                <div className="mb-3 flex items-center gap-2">
                                  {identidadeForm.logo_url ? (
                                    <img src={identidadeForm.logo_url} alt="Logo preview" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10" />
                                  ) : (
                                    <div
                                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                                      style={{ backgroundColor: `${hexSeguro(identidadeForm.cor_primaria, "#d4af37")}22` }}
                                    >
                                      <ImageIcon size={16} />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-semibold text-white">{eventoSelecionado?.nome}</p>
                                    <p className="text-[11px] text-white/65">Página oficial do festival</p>
                                  </div>
                                </div>

                                <h4 className="text-xl font-semibold leading-tight text-white">
                                  Festival com identidade premium e comunicação forte.
                                </h4>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 p-4">
                            <div className="space-y-2">
                              <div className="h-2.5 w-24 rounded-full bg-white/10" />
                              <div className="h-3 w-full rounded-full bg-white/5" />
                              <div className="h-3 w-5/6 rounded-full bg-white/5" />
                            </div>

                            <button
                              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-black"
                              style={{ backgroundColor: hexSeguro(identidadeForm.cor_primaria, "#d4af37") }}
                            >
                              Quero me inscrever
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">Cor Primária</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span
                                    className="h-4 w-4 rounded-full border border-white/10"
                                    style={{ backgroundColor: hexSeguro(identidadeForm.cor_primaria, "#d4af37") }}
                                  />
                                  <span className="text-xs text-white">{hexSeguro(identidadeForm.cor_primaria, "#d4af37")}</span>
                                </div>
                              </div>

                              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">Fonte</p>
                                <p className="mt-2 text-xs text-white">
                                  {FONT_OPTIONS.find((font) => font.value === identidadeForm.fonte_familia)?.label ?? "Inter / Padrão"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-axon-border bg-axon-bg/60 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">URL final simulada</p>
                      <p className="mt-2 break-all text-sm text-white">{urlFinal}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}