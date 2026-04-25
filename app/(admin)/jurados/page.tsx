"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  Users,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  QrCode,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import jsQR from "jsqr";

interface Terminologia {
  grupo: string;
  participante: string;
  apresentacao: string;
  organizacao: string;
}

interface Jurado {
  id: string;
  nome: string;
  email: string;
  especialidade: string | null;
  cache_valor: number | null;
  cache_status: "pago" | "pendente";
}

interface Coreografia {
  id: string;
  nome: string;
  escola_id: string;
  observacoes: string | null;
}

interface Escola {
  id: string;
  nome: string;
}

interface Criterio {
  id: string;
  nome: string;
  nota_min: number;
  nota_max: number;
}

interface Avaliacao {
  coreografia_id: string;
  jurado_id: string;
  criterio_id: string;
  nota: number;
}

interface EventoAtivo {
  id: string;
  nome: string;
}

function moeda(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function descriptografarPayload(base64: string, chave: string): Promise<string> {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);

  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }

  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(chave.padEnd(32, "0").slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    data
  );

  return new TextDecoder().decode(decrypted);
}

interface ModalJuradoProps {
  termo: Terminologia;
  onClose: () => void;
  onSaved: () => void;
}

type EtapaJurado = "formulario" | "confirmacao";

function ModalJurado({ termo, onClose, onSaved }: ModalJuradoProps) {
  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [cache, setCache] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<EtapaJurado>("formulario");
  const [copiado, setCopiado] = useState(false);

  async function salvar() {
    setErro(null);

    if (!nome.trim()) {
      setErro("Nome e obrigatorio.");
      return;
    }

    if (!email.trim()) {
      setErro("E-mail e obrigatorio para enviar o convite.");
      return;
    }

    setSalvando(true);

    const { error: fnErr } = await supabase.functions.invoke("bright-handler", {
      body: {
        email: email.trim(),
        escola_id: null,
        nome: nome.trim(),
        role: "jurado",
      },
    });

    if (fnErr) {
      setErro(fnErr.message);
      setSalvando(false);
      return;
    }

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email.trim())
      .single();

    if (usuario) {
      await supabase
        .from("usuarios")
        .update({
          especialidade: especialidade.trim() || null,
          cache_valor: cache ? parseFloat(cache) : null,
          cache_status: "pendente",
        })
        .eq("id", usuario.id);
    }

    setSalvando(false);
    setEtapa("confirmacao");
    onSaved();
  }

  function copiarLink() {
    navigator.clipboard.writeText(`${window.location.origin}/jurado`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function abrirWhatsApp() {
    const link = `${window.location.origin}/jurado`;
    const msg = encodeURIComponent(
      `Ola, ${nome.trim()}! Voce foi convidado para ser jurado em ${termo.organizacao}.\n\nAcesse o link para criar sua senha e baixar o roteiro do evento:\n\n${link}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
          <h2 className="text-base font-semibold text-white">
            {etapa === "formulario" ? "Adicionar Jurado" : "Jurado adicionado"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {etapa === "formulario" && (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Nome *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">E-mail *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Especialidade</label>
                <input
                  type="text"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  placeholder="Ex: Ballet Classico, Jazz"
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Cache (R$)</label>
                <input
                  type="number"
                  value={cache}
                  onChange={(e) => setCache(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                />
              </div>

              {erro && (
                <p className="flex items-start gap-2 text-xs text-red-400">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {erro}
                </p>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {salvando && <Loader2 size={14} className="animate-spin" />}
                Cadastrar e convidar
              </button>
            </div>
          </>
        )}

        {etapa === "confirmacao" && (
          <>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-4 bg-axon-green-dim border border-axon-green/20 rounded-lg">
                <CheckCircle2 size={18} className="text-axon-green shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{nome} adicionado</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Convite enviado para <span className="text-white">{email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={copiarLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  {copiado ? <Check size={15} className="text-axon-green" /> : <Copy size={15} />}
                  {copiado ? "Link copiado" : "Copiar link do portal do jurado"}
                </button>

                <button
                  onClick={abrirWhatsApp}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  <MessageCircle size={15} /> Enviar pelo WhatsApp
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-axon-border">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Concluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface ScannerQRProps {
  eventoId: string;
  jurados: Jurado[];
  onImportado: (count: number) => void;
  onClose: () => void;
}

function ScannerQR({ eventoId, jurados, onImportado, onClose }: ScannerQRProps) {
  const supabase = createClient();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const [status, setStatus] = useState<"aguardando" | "processando" | "sucesso" | "erro">("aguardando");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function iniciar() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          tick();
        }
      } catch {
        setStatus("erro");
        setMsg("Permissao de camera negada.");
      }
    }

    iniciar();

    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function tick() {
    rafRef.current = requestAnimationFrame(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        tick();
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        tick();
        return;
      }

      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        await processarQR(code.data);
      } else {
        tick();
      }
    });
  }

  async function processarQR(raw: string) {
    setStatus("processando");

    try {
      let payload: {
        evento_id: string;
        jurado_id: string;
        notas: { coreografia_id: string; criterio_id: string; nota: number }[];
        ts: number;
      } | null = null;

      for (const j of jurados) {
        const chave = `${eventoId}-${j.id}`.replace(/-/g, "").slice(0, 32);

        try {
          const texto = await descriptografarPayload(raw, chave);
          payload = JSON.parse(texto);
          break;
        } catch {}
      }

      if (!payload) {
        throw new Error("Nao foi possivel descriptografar. QR invalido ou jurado nao cadastrado.");
      }

      if (payload.evento_id !== eventoId) {
        throw new Error("Este QR pertence a outro evento.");
      }

      let importados = 0;

      for (const n of payload.notas) {
        const { error } = await supabase.from("avaliacoes").upsert(
          {
            evento_id: eventoId,
            coreografia_id: n.coreografia_id,
            jurado_id: payload.jurado_id,
            criterio_id: n.criterio_id,
            nota: n.nota,
            sincronizado: true,
          },
          {
            onConflict: "evento_id,coreografia_id,jurado_id,criterio_id",
          }
        );

        if (!error) {
          importados++;
        }
      }

      setStatus("sucesso");
      setMsg(
        `${importados} nota${importados !== 1 ? "s" : ""} importada${importados !== 1 ? "s" : ""} com sucesso.`
      );
      onImportado(importados);
    } catch (e: unknown) {
      setStatus("erro");
      setMsg(e instanceof Error ? e.message : "Erro desconhecido.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
          <h2 className="text-base font-semibold text-white">Sincronizar via QR Code</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">
          {(status === "aguardando" || status === "processando") && (
            <>
              <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-axon-gold/60 rounded-xl" />
                </div>
              </div>

              {status === "processando" && (
                <p className="flex items-center gap-2 text-sm text-axon-gold">
                  <Loader2 size={16} className="animate-spin" /> Processando...
                </p>
              )}

              {status === "aguardando" && (
                <p className="text-xs text-neutral-500 text-center">
                  Aponte a camera para o QR Code do tablet do jurado.
                </p>
              )}
            </>
          )}

          {status === "sucesso" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle2 size={40} className="text-axon-green" />
              <p className="text-sm text-white text-center">{msg}</p>
            </div>
          )}

          {status === "erro" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-sm text-red-400 text-center">{msg}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-axon-border text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {status === "sucesso" || status === "erro" ? "Fechar" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JuradosPage() {
  const supabase = createClient();

  const [termo, setTermo] = useState<Terminologia>({
    grupo: "Escola",
    participante: "Bailarino",
    apresentacao: "Coreografia",
    organizacao: "Organizacao",
  });

  const [eventoAtivo, setEventoAtivo] = useState<EventoAtivo | null>(null);
  const [jurados, setJurados] = useState<Jurado[]>([]);
  const [coreografias, setCoreografias] = useState<Coreografia[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [modalJurado, setModalJurado] = useState(false);
  const [modalScanner, setModalScanner] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"jurados" | "notas" | "observacoes">("jurados");
  const [coreoExpandida, setCoreoExpandida] = useState<string | null>(null);
  const [salvandoObs, setSalvandoObs] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);

    const { data: config } = await supabase
      .from("tenant_config")
      .select("termo_grupo, termo_participante, termo_apresentacao, nome_organizacao")
      .single();

    if (config) {
      setTermo({
        grupo: (config as Record<string, string>).termo_grupo ?? "Escola",
        participante: (config as Record<string, string>).termo_participante ?? "Bailarino",
        apresentacao: (config as Record<string, string>).termo_apresentacao ?? "Coreografia",
        organizacao: (config as Record<string, string>).nome_organizacao ?? "Organizacao",
      });
    }

    const { data: evento } = await supabase
      .from("eventos")
      .select("id, nome")
      .eq("status", "ativo")
      .order("data_inicio", { ascending: false })
      .limit(1)
      .single();

    setEventoAtivo((evento as EventoAtivo) ?? null);

    const { data: juradosData } = await supabase
      .from("usuarios")
      .select("id, nome, email, especialidade, cache_valor, cache_status")
      .eq("role", "jurado")
      .order("nome");

    setJurados((juradosData as Jurado[]) ?? []);

    if (evento) {
      const [{ data: coreos }, { data: crits }, { data: avals }, { data: escs }] =
        await Promise.all([
          supabase
            .from("coreografias")
            .select("id, nome, escola_id, observacoes")
            .eq("evento_id", evento.id)
            .order("ordem_apresentacao"),
          supabase
            .from("criterios_avaliacao")
            .select("id, nome, nota_min, nota_max")
            .eq("evento_id", evento.id)
            .order("ordem"),
          supabase
            .from("avaliacoes")
            .select("coreografia_id, jurado_id, criterio_id, nota")
            .eq("evento_id", evento.id),
          supabase.from("escolas").select("id, nome"),
        ]);

      setCoreografias((coreos as Coreografia[]) ?? []);
      setCriterios((crits as Criterio[]) ?? []);
      setAvaliacoes((avals as Avaliacao[]) ?? []);
      setEscolas((escs as Escola[]) ?? []);

      const obsInit: Record<string, string> = {};
      ((coreos as Coreografia[]) ?? []).forEach((c) => {
        obsInit[c.id] = c.observacoes ?? "";
      });
      setObservacoes(obsInit);
    }

    setCarregando(false);
  }, [supabase]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarObservacao(coreoId: string) {
    setSalvandoObs(coreoId);

    await supabase
      .from("coreografias")
      .update({ observacoes: observacoes[coreoId] })
      .eq("id", coreoId);

    setSalvandoObs(null);
  }

  async function alterarCacheStatus(juradoId: string, status: "pago" | "pendente") {
    await supabase.from("usuarios").update({ cache_status: status }).eq("id", juradoId);

    setJurados((prev) =>
      prev.map((j) => (j.id === juradoId ? { ...j, cache_status: status } : j))
    );
  }

  const totalCache = jurados.reduce((a, j) => a + (j.cache_valor ?? 0), 0);
  const totalPago = jurados
    .filter((j) => j.cache_status === "pago")
    .reduce((a, j) => a + (j.cache_valor ?? 0), 0);

  function mediaCoreo(coreoId: string): string {
    const notas = avaliacoes.filter((a) => a.coreografia_id === coreoId);
    if (!notas.length) return "—";
    const media = notas.reduce((s, a) => s + a.nota, 0) / notas.length;
    return media.toFixed(2);
  }

  function notaJuradoCriterio(coreoId: string, juradoId: string, criterioId: string): string {
    const av = avaliacoes.find(
      (a) =>
        a.coreografia_id === coreoId &&
        a.jurado_id === juradoId &&
        a.criterio_id === criterioId
    );

    return av ? String(av.nota) : "—";
  }

  return (
    <>
      {modalJurado && (
        <ModalJurado
          termo={termo}
          onClose={() => setModalJurado(false)}
          onSaved={carregar}
        />
      )}

      {modalScanner && eventoAtivo && (
        <ScannerQR
          eventoId={eventoAtivo.id}
          jurados={jurados}
          onImportado={() => {
            carregar();
          }}
          onClose={() => setModalScanner(false)}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Jurados e Apuracao</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Gerencie jurados, visualize notas e registre observacoes por{" "}
              {termo.apresentacao.toLowerCase()}.
            </p>
          </div>

          <button
            onClick={() => setModalJurado(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-axon-border text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus size={14} /> Adicionar Jurado
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-neutral-500" />
              <p className="text-xs text-neutral-500">Jurados</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-white">{jurados.length}</p>
          </div>

          <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-axon-green" />
              <p className="text-xs text-neutral-500">Confirmados</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-axon-green">
              {jurados.filter((j) => j.cache_status === "pago").length}
            </p>
          </div>

          <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDollarSign size={14} className="text-neutral-500" />
              <p className="text-xs text-neutral-500">Total cache</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-white">{moeda(totalCache)}</p>
          </div>

          <div className="bg-axon-panel border border-axon-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock3 size={14} className="text-axon-gold" />
              <p className="text-xs text-neutral-500">A pagar</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-axon-gold">
              {moeda(totalCache - totalPago)}
            </p>
          </div>
        </div>

        <div className="flex border-b border-axon-border">
          {[
            { id: "jurados", label: "Jurados" },
            { id: "notas", label: "Apuracao de Notas" },
            { id: "observacoes", label: "Observacoes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id as "jurados" | "notas" | "observacoes")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                abaAtiva === tab.id
                  ? "border-axon-gold text-axon-gold"
                  : "border-transparent text-neutral-500 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-neutral-600" />
          </div>
        ) : (
          <>
            {abaAtiva === "jurados" && (
              <div className="space-y-3">
                {jurados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
                    <Users size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">Nenhum jurado cadastrado.</p>
                  </div>
                ) : (
                  jurados.map((j) => (
                    <div
                      key={j.id}
                      className="bg-axon-panel border border-axon-border rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{j.nome}</p>
                        <div className="flex flex-wrap gap-3 mt-0.5">
                          <p className="text-xs text-neutral-500">{j.email}</p>
                          {j.especialidade && (
                            <p className="text-xs text-neutral-600">{j.especialidade}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {j.cache_valor != null && (
                          <div className="text-right">
                            <p className="text-xs text-neutral-500">Cache</p>
                            <p className="text-sm font-semibold text-white tabular-nums">
                              {moeda(j.cache_valor)}
                            </p>
                          </div>
                        )}

                        <select
                          value={j.cache_status}
                          onChange={(e) =>
                            alterarCacheStatus(
                              j.id,
                              e.target.value as "pago" | "pendente"
                            )
                          }
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border bg-transparent cursor-pointer focus:outline-none transition-colors ${
                            j.cache_status === "pago"
                              ? "border-axon-green/30 text-axon-green bg-axon-green-dim"
                              : "border-axon-gold/30 text-axon-gold bg-axon-gold-dim"
                          }`}
                        >
                          <option value="pago" className="bg-axon-panel text-white">
                            Pago
                          </option>
                          <option value="pendente" className="bg-axon-panel text-white">
                            Pendente
                          </option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {abaAtiva === "notas" && (
              <div className="space-y-5">
                {!eventoAtivo && (
                  <div className="flex items-center gap-3 p-4 bg-axon-gold-dim border border-axon-gold/20 rounded-xl">
                    <AlertCircle size={16} className="text-axon-gold shrink-0" />
                    <p className="text-sm text-neutral-400">
                      Nenhum evento ativo. Ative um evento para visualizar as notas.
                    </p>
                  </div>
                )}

                {eventoAtivo && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-500">
                        {avaliacoes.length} avaliacao{avaliacoes.length !== 1 ? "oes" : ""} registrada
                        {avaliacoes.length !== 1 ? "s" : ""}
                      </p>

                      <button
                        onClick={() => setModalScanner(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-axon-gold text-black text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        <QrCode size={14} /> Sincronizar via QR Code
                      </button>
                    </div>

                    {coreografias.length === 0 ? (
                      <p className="text-sm text-neutral-600 text-center py-8">
                        Nenhuma {termo.apresentacao.toLowerCase()} no evento ativo.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {coreografias.map((c) => {
                          const escola = escolas.find((e) => e.id === c.escola_id);
                          const expandida = coreoExpandida === c.id;

                          return (
                            <div
                              key={c.id}
                              className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden"
                            >
                              <button
                                onClick={() =>
                                  setCoreoExpandida(expandida ? null : c.id)
                                }
                                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white">{c.nome}</p>
                                  {escola && (
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                      {escola.nome}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                  <div className="text-right">
                                    <p className="text-xs text-neutral-500">Media geral</p>
                                    <p className="text-sm font-bold text-white tabular-nums">
                                      {mediaCoreo(c.id)}
                                    </p>
                                  </div>

                                  {expandida ? (
                                    <ChevronDown size={16} className="text-neutral-500" />
                                  ) : (
                                    <ChevronRight size={16} className="text-neutral-500" />
                                  )}
                                </div>
                              </button>

                              {expandida && (
                                <div className="border-t border-axon-border overflow-x-auto">
                                  {criterios.length === 0 ? (
                                    <p className="text-xs text-neutral-600 p-5">
                                      Nenhum criterio configurado para este evento.
                                    </p>
                                  ) : (
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-axon-border">
                                          <th className="text-left text-neutral-500 font-medium px-5 py-3">
                                            Jurado
                                          </th>
                                          {criterios.map((cr) => (
                                            <th
                                              key={cr.id}
                                              className="text-center text-neutral-500 font-medium px-3 py-3 whitespace-nowrap"
                                            >
                                              {cr.nome}
                                            </th>
                                          ))}
                                          <th className="text-center text-neutral-500 font-medium px-4 py-3">
                                            Media
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {jurados.map((j) => {
                                          const notasJ = avaliacoes.filter(
                                            (a) =>
                                              a.coreografia_id === c.id &&
                                              a.jurado_id === j.id
                                          );

                                          const mediaJ = notasJ.length
                                            ? (
                                                notasJ.reduce((s, a) => s + a.nota, 0) /
                                                notasJ.length
                                              ).toFixed(2)
                                            : "—";

                                          return (
                                            <tr
                                              key={j.id}
                                              className="border-b border-axon-border/50 last:border-0"
                                            >
                                              <td className="px-5 py-3 text-neutral-300 whitespace-nowrap">
                                                {j.nome}
                                              </td>

                                              {criterios.map((cr) => (
                                                <td
                                                  key={cr.id}
                                                  className="px-3 py-3 text-center tabular-nums text-white"
                                                >
                                                  {notaJuradoCriterio(c.id, j.id, cr.id)}
                                                </td>
                                              ))}

                                              <td className="px-4 py-3 text-center tabular-nums font-semibold text-axon-gold">
                                                {mediaJ}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {abaAtiva === "observacoes" && (
              <div className="space-y-3">
                {!eventoAtivo ? (
                  <div className="flex items-center gap-3 p-4 bg-axon-gold-dim border border-axon-gold/20 rounded-xl">
                    <AlertCircle size={16} className="text-axon-gold shrink-0" />
                    <p className="text-sm text-neutral-400">Nenhum evento ativo.</p>
                  </div>
                ) : coreografias.length === 0 ? (
                  <p className="text-sm text-neutral-600 text-center py-8">
                    Nenhuma {termo.apresentacao.toLowerCase()} no evento ativo.
                  </p>
                ) : (
                  coreografias.map((c) => {
                    const escola = escolas.find((e) => e.id === c.escola_id);

                    return (
                      <div
                        key={c.id}
                        className="bg-axon-panel border border-axon-border rounded-xl p-5 space-y-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{c.nome}</p>
                          {escola && (
                            <p className="text-xs text-neutral-500 mt-0.5">{escola.nome}</p>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <textarea
                            value={observacoes[c.id] ?? ""}
                            onChange={(e) =>
                              setObservacoes((prev) => ({
                                ...prev,
                                [c.id]: e.target.value,
                              }))
                            }
                            placeholder={`Observacoes sobre esta ${termo.apresentacao.toLowerCase()}...`}
                            rows={3}
                            className="flex-1 bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors resize-none"
                          />

                          <button
                            onClick={() => salvarObservacao(c.id)}
                            disabled={salvandoObs === c.id}
                            className="px-4 py-2 self-end rounded-lg bg-axon-gold text-black text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
                          >
                            {salvandoObs === c.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                            Salvar
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
