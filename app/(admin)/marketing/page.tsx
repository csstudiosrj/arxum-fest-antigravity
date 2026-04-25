"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
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
  Upload,
} from "lucide-react";

interface Post {
  id: string;
  legenda: string;
  imagem_url: string | null;
  agendado_para: string;
  status: "agendado" | "publicado" | "erro";
  plataforma: string;
  publicado_em: string | null;
  erro: string | null;
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ModalPostProps {
  onClose: () => void;
  onSaved: () => void;
}

function ModalPost({ onClose, onSaved }: ModalPostProps) {
  const supabase = createClient();

  const [legenda, setLegenda] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  function selecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setArquivo(f);
    setPreview(URL.createObjectURL(f));
  }

  async function salvar() {
    setErro(null);
    if (!legenda.trim()) { setErro("Legenda e obrigatoria."); return; }
    if (!dataHora) { setErro("Data e hora sao obrigatorias."); return; }
    const agendadoPara = new Date(dataHora);
    if (isNaN(agendadoPara.getTime())) { setErro("Data invalida."); return; }
    if (agendadoPara <= new Date()) { setErro("A data deve ser no futuro."); return; }

    setSalvando(true);

    let imagem_url: string | null = null;

    if (arquivo) {
      const ext = arquivo.name.split(".").pop();
      const path = `posts/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("marketing")
        .upload(path, arquivo, { upsert: true });

      if (uploadErr) {
        setErro("Erro ao fazer upload da imagem: " + uploadErr.message);
        setSalvando(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("marketing").getPublicUrl(path);
      imagem_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("posts_marketing").insert({
      legenda: legenda.trim(),
      imagem_url,
      agendado_para: agendadoPara.toISOString(),
      status: "agendado",
      plataforma: "Instagram",
    });

    if (error) { setErro(error.message); setSalvando(false); return; }

    setSalvando(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border shrink-0">
          <h2 className="text-base font-semibold text-white">Agendar Postagem</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Legenda *</label>
            <textarea
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              rows={4}
              placeholder="Digite a legenda do post..."
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors resize-none"
            />
            <p className="text-xs text-neutral-600 mt-1 text-right">{legenda.length} caracteres</p>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Data e hora *</label>
            <input
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold transition-colors [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-2">Imagem (opcional)</label>
            <input ref={inputFileRef} type="file" accept="image/*" onChange={selecionarArquivo} className="hidden" />

            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-axon-border">
                <img src={preview} alt="Preview" className="w-full object-cover max-h-48" />
                <button
                  onClick={() => { setArquivo(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition-colors"
                  aria-label="Remover imagem"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => inputFileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 border border-dashed border-axon-border rounded-xl py-8 text-neutral-600 hover:text-neutral-400 hover:border-neutral-500 transition-colors"
              >
                <Upload size={22} />
                <span className="text-xs">Clique para selecionar uma imagem</span>
              </button>
            )}
          </div>

          {erro && (
            <p className="flex items-start gap-2 text-xs text-red-400">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {erro}
            </p>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-axon-border shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-neutral-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {salvando && <Loader2 size={14} className="animate-spin" />}
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
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtro, setFiltro] = useState<"todos" | "agendado" | "publicado" | "erro">("todos");

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("posts_marketing")
      .select("*")
      .order("agendado_para", { ascending: true });
    setPosts((data as Post[]) ?? []);
    setCarregando(false);
  }, [supabase]);

  useEffect(() => { carregar(); }, [carregar]);

  async function excluir(id: string) {
    if (!confirm("Excluir este post agendado?")) return;
    await supabase.from("posts_marketing").delete().eq("id", id);
    setPosts((p) => p.filter((x) => x.id !== id));
  }

  async function marcarPublicado(id: string) {
    await supabase.from("posts_marketing").update({
      status: "publicado",
      publicado_em: new Date().toISOString(),
    }).eq("id", id);
    setPosts((p) => p.map((x) => x.id === id ? { ...x, status: "publicado" as const, publicado_em: new Date().toISOString() } : x));
  }

  const postsFiltrados = posts.filter((p) =>
    filtro === "todos" ? true : p.status === filtro
  );

  const totalAgendados = posts.filter((p) => p.status === "agendado").length;
  const totalPublicados = posts.filter((p) => p.status === "publicado").length;
  const proximoPost = posts.find((p) => p.status === "agendado");

  function badgeStatus(status: Post["status"]) {
    if (status === "publicado") return "border-axon-green/30 text-axon-green bg-axon-green-dim";
    if (status === "erro") return "border-red-400/30 text-red-400 bg-red-400/10";
    return "border-axon-gold/30 text-axon-gold bg-axon-gold-dim";
  }

  function labelStatus(status: Post["status"]) {
    if (status === "publicado") return "Publicado";
    if (status === "erro") return "Erro";
    return "Agendado";
  }

  return (
    <>
      {modalAberto && (
        <ModalPost onClose={() => setModalAberto(false)} onSaved={carregar} />
      )}

      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Marketing e Redes Sociais</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Agende posts e acompanhe o calendario de publicacoes.
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-axon-border text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus size={14} /> Agendar Post
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-axon-gold" />
              <p className="text-xs text-neutral-500">Agendados</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-axon-gold">{totalAgendados}</p>
          </div>

          <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-axon-green" />
              <p className="text-xs text-neutral-500">Publicados</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-axon-green">{totalPublicados}</p>
          </div>

          <div className="bg-axon-panel border border-axon-border rounded-xl p-4 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-neutral-500" />
              <p className="text-xs text-neutral-500">Proximo post</p>
            </div>
            <p className="text-sm font-medium text-white truncate">
              {proximoPost ? formatarData(proximoPost.agendado_para) : "—"}
            </p>
          </div>
        </div>

        <div className="bg-axon-panel border border-axon-border rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center shrink-0">
              <ImageIcon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Integracao Meta API</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Publicacao automatica disponivel em breve. Os posts ficam salvos e prontos para integracao.
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full border border-axon-gold/20 text-axon-gold bg-axon-gold-dim whitespace-nowrap shrink-0">
            Em breve
          </span>
        </div>

        <div className="flex gap-2">
          {(["todos", "agendado", "publicado", "erro"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filtro === f
                  ? "border-axon-gold bg-axon-gold-dim text-axon-gold"
                  : "border-axon-border text-neutral-500 hover:text-white"
              }`}
            >
              {f === "todos" ? "Todos" : f === "agendado" ? "Agendados" : f === "publicado" ? "Publicados" : "Com erro"}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-neutral-600" />
          </div>
        ) : postsFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
            <Megaphone size={36} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhum post encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {postsFiltrados.map((post) => (
              <div key={post.id} className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
                <div className="flex gap-4 p-4">
                  {post.imagem_url ? (
                    <img
                      src={post.imagem_url}
                      alt="Arte do post"
                      className="w-20 h-20 rounded-lg object-cover shrink-0 border border-axon-border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-axon-bg border border-axon-border flex items-center justify-center shrink-0">
                      <ImageIcon size={20} className="text-neutral-700" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-neutral-300 line-clamp-2 leading-relaxed">
                        {post.legenda}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {post.status === "agendado" && (
                          <button
                            onClick={() => marcarPublicado(post.id)}
                            className="text-xs text-neutral-500 hover:text-axon-green transition-colors whitespace-nowrap"
                          >
                            Marcar publicado
                          </button>
                        )}
                        {post.status !== "publicado" && (
                          <button
                            onClick={() => excluir(post.id)}
                            className="text-neutral-600 hover:text-red-400 transition-colors"
                            aria-label="Excluir post"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badgeStatus(post.status)}`}>
                        {labelStatus(post.status)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Calendar size={12} /> {formatarData(post.agendado_para)}
                      </span>
                      <span className="text-xs text-neutral-600">{post.plataforma}</span>
                    </div>

                    {post.status === "publicado" && post.publicado_em && (
                      <p className="text-xs text-neutral-600 mt-1">
                        Publicado em {formatarData(post.publicado_em)}
                      </p>
                    )}

                    {post.erro && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {post.erro}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}