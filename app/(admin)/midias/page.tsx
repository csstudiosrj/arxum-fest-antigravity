"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import JSZip from "jszip";
import {
  Search,
  Download,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  FileAudio,
  Clock,
  X,
  FileText,
} from "lucide-react";

const supabase = createClient();

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Apresentacao {
  id: string;
  nome: string;
  grupo_id: string;
  ordem_apresentacao: number | null;
  arquivo_audio: string | null;
  audio_nome_original: string | null;
  audio_duracao: string | null;
  status_audio: "pendente" | "validado" | "erro";
  arquivo_mapa_luz: string | null;
}

interface Grupo {
  id: string;
  nome: string;
}

interface EventoAtivo {
  id: string;
  nome: string;
  produtora_id: string;
}

interface TenantConfig {
  termo_grupo: string | null;
  termo_grupo_plural: string | null;
  termo_apresentacao: string | null;
  termo_apresentacao_plural: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizarNomeArquivo(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

function nomeAutoRename(ordem: number | null, grupo: string, apresentacao: string): string {
  const ord = String(ordem ?? 0).padStart(3, "0");
  const grp = normalizarNomeArquivo(grupo.slice(0, 30));
  const apr = normalizarNomeArquivo(apresentacao.slice(0, 40));
  return `${ord}_${grp}_${apr}`;
}

function badgeStatus(status: Apresentacao["status_audio"]) {
  if (status === "validado") return "border-axon-green/30 text-axon-green bg-axon-green-dim";
  if (status === "erro") return "border-red-400/30 text-red-400 bg-red-400/10";
  return "border-axon-gold/30 text-axon-gold bg-axon-gold-dim";
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function MidiasPage() {
  const [eventoAtivo, setEventoAtivo] = useState<EventoAtivo | null>(null);
  const [apresentacoes, setApresentacoes] = useState<Apresentacao[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "validado" | "pendente" | "erro">("todas");
  const [exportando, setExportando] = useState(false);
  const [audioAtivo, setAudioAtivo] = useState<string | null>(null);
  const [tocando, setTocando] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);

    // Evento ativo
    const { data: evento } = await supabase
      .from("eventos")
      .select("id, nome, produtora_id")
      .eq("status", "ativo")
      .order("data_inicio", { ascending: false })
      .limit(1)
      .single();

    setEventoAtivo(evento as EventoAtivo ?? null);

    if (evento) {
      // Carregar configuração de termos (tenant_config)
      if (evento.produtora_id) {
        const { data: cfg } = await supabase
          .from("tenant_config")
          .select("termo_grupo, termo_grupo_plural, termo_apresentacao, termo_apresentacao_plural")
          .eq("produtora_id", evento.produtora_id)
          .maybeSingle();
        setConfig(cfg as TenantConfig ?? null);
      } else {
        setConfig(null);
      }

      // Apresentações e grupos
      const [{ data: coreos }, { data: grps }] = await Promise.all([
        supabase
          .from("apresentacoes")
          .select("id, nome, grupo_id, ordem_apresentacao, arquivo_audio, audio_nome_original, audio_duracao, status_audio, arquivo_mapa_luz")
          .eq("evento_id", evento.id)
          .order("ordem_apresentacao", { ascending: true }),
        supabase.from("grupos").select("id, nome"),
      ]);

      setApresentacoes((coreos as Apresentacao[]) ?? []);
      setGrupos((grps as Grupo[]) ?? []);
    }

    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function nomeGrupo(grupo_id: string): string {
    return grupos.find((g) => g.id === grupo_id)?.nome ?? config?.termo_grupo ?? "Grupo";
  }

  function togglePlay(url: string) {
    if (audioAtivo === url) {
      if (tocando) {
        audioRef.current?.pause();
        setTocando(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setTocando(true);
      }
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      setTocando(false);
      setAudioAtivo(null);
    };
    audio.play().catch(() => {});
    setAudioAtivo(url);
    setTocando(true);
  }

  async function alterarStatus(id: string, status: Apresentacao["status_audio"]) {
    await supabase.from("apresentacoes").update({ status_audio: status }).eq("id", id);
    setApresentacoes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status_audio: status } : c))
    );
  }

  async function exportarZip() {
    const validadas = apresentacoes.filter(
      (c) => c.arquivo_audio && c.status_audio === "validado"
    );
    if (!validadas.length) {
      alert("Nenhuma mídia validada para exportar.");
      return;
    }

    setExportando(true);
    const zip = new JSZip();

    // Subpastas
    const pastaAudio = zip.folder("01_Trilhas_Sonoras")!;
    const pastaLuz = zip.folder("02_Mapas_de_Luz")!;

    // Loop sequencial para evitar sobrecarga de memória
    for (const c of validadas) {
      const grupoNome = nomeGrupo(c.grupo_id);
      const nomeBase = nomeAutoRename(c.ordem_apresentacao, grupoNome, c.nome);

      // Áudio
      if (c.arquivo_audio) {
        try {
          const resp = await fetch(c.arquivo_audio);
          if (!resp.ok) continue;
          const blob = await resp.blob();
          const ext = c.audio_nome_original?.split(".").pop() ?? "mp3";
          pastaAudio.file(`${nomeBase}.${ext}`, blob);
        } catch {
          // ignora falha de download e continua
        }
      }

      // Mapa de Luz (PDF)
      if (c.arquivo_mapa_luz) {
        try {
          const resp = await fetch(c.arquivo_mapa_luz);
          if (!resp.ok) continue;
          const blob = await resp.blob();
          pastaLuz.file(`${nomeBase}_Luz.pdf`, blob);
        } catch {
          // ignora
        }
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `lineup_midias_${eventoAtivo?.nome?.replace(/\s+/g, "_") ?? "evento"}.zip`;
    a.click();
    setExportando(false);
  }

  const termoGrupo = config?.termo_grupo ?? "Grupo";
  const termoApresentacao = config?.termo_apresentacao ?? "Apresentação";
  const termoGrupoPlural = config?.termo_grupo_plural ?? "Grupos";
  const termoApresentacaoPlural = config?.termo_apresentacao_plural ?? "Apresentações";

  const apresentacoesFiltradas = apresentacoes.filter((c) => {
    const grupo = nomeGrupo(c.grupo_id).toLowerCase();
    const q = busca.toLowerCase();
    const matchBusca = !q || c.nome.toLowerCase().includes(q) || grupo.includes(q);
    const matchFiltro = filtro === "todas" || c.status_audio === filtro;
    return matchBusca && matchFiltro;
  });

  const totalValidados = apresentacoes.filter((c) => c.status_audio === "validado").length;
  const totalPendentes = apresentacoes.filter((c) => c.status_audio === "pendente").length;
  const totalErros = apresentacoes.filter((c) => c.status_audio === "erro").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Mídias e Áudio</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Validação de trilhas e exportação renomeada para o operador de som.
          </p>
        </div>
        <button
          onClick={exportarZip}
          disabled={exportando}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-axon-green text-black text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap shrink-0"
        >
          {exportando ? (
            <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
          ) : (
            <Download size={14} />
          )}
          Exportar ZIP
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileAudio size={14} className="text-neutral-500" />
            <p className="text-xs text-neutral-500">Total</p>
          </div>
          <p className="text-lg font-semibold tabular-nums text-white">{apresentacoes.length}</p>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-axon-green" />
            <p className="text-xs text-neutral-500">Validados</p>
          </div>
          <p className="text-lg font-semibold tabular-nums text-axon-green">{totalValidados}</p>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-axon-gold" />
            <p className="text-xs text-neutral-500">Pendentes</p>
          </div>
          <p className="text-lg font-semibold tabular-nums text-axon-gold">{totalPendentes}</p>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-red-400" />
            <p className="text-xs text-neutral-500">Com erro</p>
          </div>
          <p className="text-lg font-semibold tabular-nums text-red-400">{totalErros}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar por ${termoApresentacao.toLowerCase()} ou ${termoGrupo.toLowerCase()}...`}
            className="w-full bg-axon-panel border border-axon-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(["todas", "validado", "pendente", "erro"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                filtro === f
                  ? "border-axon-gold bg-axon-gold-dim text-axon-gold"
                  : "border-axon-border text-neutral-500 hover:text-white"
              }`}
            >
              {f === "todas"
                ? "Todas"
                : f === "validado"
                ? "Validadas"
                : f === "pendente"
                ? "Pendentes"
                : "Erros"}
            </button>
          ))}
        </div>
      </div>

      {!eventoAtivo && (
        <div className="flex items-center gap-3 p-4 bg-axon-gold-dim border border-axon-gold/20 rounded-xl">
          <AlertCircle size={16} className="text-axon-gold shrink-0" />
          <p className="text-sm text-neutral-400">
            Nenhum evento ativo. Ative um evento para visualizar as mídias.
          </p>
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin" />
        </div>
      ) : apresentacoesFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
          <FileAudio size={36} className="mb-3 opacity-30" />
          <p className="text-sm">Nenhuma mídia encontrada.</p>
        </div>
      ) : (
        <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-axon-border">
              <tr>
                <th className="text-left text-xs text-neutral-500 font-medium px-5 py-3">Ordem</th>
                <th className="text-left text-xs text-neutral-500 font-medium px-5 py-3">
                  {termoApresentacao} / {termoGrupo}
                </th>
                <th className="text-left text-xs text-neutral-500 font-medium px-5 py-3 hidden md:table-cell">
                  Nome exportado
                </th>
                <th className="text-center text-xs text-neutral-500 font-medium px-4 py-3 hidden sm:table-cell">
                  Dur.
                </th>
                <th className="text-center text-xs text-neutral-500 font-medium px-4 py-3">
                  Mapa de Luz
                </th>
                <th className="text-left text-xs text-neutral-500 font-medium px-4 py-3">Status</th>
                <th className="text-right text-xs text-neutral-500 font-medium px-5 py-3">Play</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axon-border/60">
              {apresentacoesFiltradas.map((c) => {
                const grupo = nomeGrupo(c.grupo_id);
                const nomeExp = nomeAutoRename(c.ordem_apresentacao, grupo, c.nome);
                const extAudio = c.audio_nome_original?.split(".").pop() ?? "mp3";
                const isAtivo = audioAtivo === c.arquivo_audio;

                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-neutral-500 font-mono text-xs">
                      {String(c.ordem_apresentacao ?? 0).padStart(3, "0")}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white">{c.nome}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{grupo}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {c.arquivo_audio ? (
                        <span className="font-mono text-xs text-neutral-400 bg-axon-bg px-2 py-1 rounded border border-axon-border">
                          {nomeExp}.{extAudio}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-600">Sem arquivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs text-neutral-500 hidden sm:table-cell tabular-nums">
                      {c.audio_duracao ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {c.arquivo_mapa_luz ? (
                        <a
                          href={c.arquivo_mapa_luz}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-axon-gold hover:text-white transition-colors"
                          title="Abrir mapa de luz (PDF)"
                        >
                          <FileText size={14} />
                          <span className="hidden xl:inline">PDF</span>
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={c.status_audio}
                        onChange={(e) =>
                          alterarStatus(c.id, e.target.value as Apresentacao["status_audio"])
                        }
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border bg-transparent cursor-pointer focus:outline-none transition-colors ${badgeStatus(c.status_audio)}`}
                      >
                        <option value="validado" className="bg-axon-panel text-white">
                          Validado
                        </option>
                        <option value="pendente" className="bg-axon-panel text-white">
                          Pendente
                        </option>
                        <option value="erro" className="bg-axon-panel text-white">
                          Erro
                        </option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {c.arquivo_audio ? (
                        <button
                          onClick={() => togglePlay(c.arquivo_audio!)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ml-auto ${
                            isAtivo && tocando
                              ? "bg-axon-gold text-black"
                              : "bg-axon-bg border border-axon-border text-neutral-400 hover:text-white"
                          }`}
                          aria-label={isAtivo && tocando ? "Pausar" : "Tocar"}
                        >
                          {isAtivo && tocando ? (
                            <Pause size={13} />
                          ) : (
                            <Play size={13} className="ml-0.5" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-700">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {audioAtivo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-axon-panel border border-axon-border rounded-xl px-5 py-3 flex items-center gap-4 shadow-2xl z-40">
          <div className="w-2 h-2 rounded-full bg-axon-gold animate-pulse shrink-0" />
          <p className="text-xs text-neutral-400 max-w-xs truncate">
            {(() => {
              const c = apresentacoes.find((x) => x.arquivo_audio === audioAtivo);
              return c
                ? `${c.nome} — ${nomeGrupo(c.grupo_id)}`
                : "Tocando...";
            })()}
          </p>
          <button
            onClick={() => {
              audioRef.current?.pause();
              setTocando(false);
              setAudioAtivo(null);
            }}
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Parar áudio"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}