"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, X, Loader2, AlertCircle, Users, CircleDollarSign,
  CheckCircle2, Clock3, QrCode, ChevronDown, ChevronRight,
  Copy, Check, MessageCircle, Info,
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

interface Apresentacao {
  id: string;
  nome: string;
  organizacao_id: string;
  observacoes: string | null;
}

interface Organizacao {
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
  apresentacao_id: string;
  jurado_id: string;
  criterio_id: string;
  nota: number;
}

interface EventoAtivo {
  id: string;
  nome: string;
}

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mascaraTelefone(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function Dica({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-axon-gold/5 border border-axon-gold/15 rounded-xl px-4 py-3">
      <Info size={14} className="text-axon-gold shrink-0 mt-0.5" />
      <p className="text-xs text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
}

async function descriptografarPayload(base64: string, chave: string): Promise<string> {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(chave.padEnd(32, "0").slice(0, 32)), { name: "AES-GCM" }, false, ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, keyMaterial, data);
  return new TextDecoder().decode(decrypted);
}

interface ModalJuradoProps {
  termo: Terminologia;
  onClose: () => void;
  onSaved: () => void;
}

function ModalJurado({ termo, onClose, onSaved }: ModalJuradoProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [cache, setCache] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<"formulario" | "confirmacao">("formulario");
  const [copiado, setCopiado] = useState(false);

  async function salvar() {
    const supabase = createClient();
    setErro(null);
    if (!nome.trim()) { setErro("Nome é obrigatório."); return; }
    if (!email.trim()) { setErro("E-mail é obrigatório para enviar o convite."); return; }
    setSalvando(true);

    const res = await fetch("/api/convite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), nome: nome.trim(), role: "jurado" }),
    });
    const json = await res.json();
    if (!res.ok) {
      setErro(json.error || "Erro ao enviar convite.");
      setSalvando(false);
      return;
    }

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email.trim())
      .single();

    if (usuario) {
      await supabase.from("usuarios").update({
        especialidade: especialidade.trim() || null,
        cache_valor: cache ? parseFloat(cache) : null,
        cache_status: "pendente",
      }).eq("id", usuario.id);
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
      `Olá, ${nome.trim()}! Você foi convidado para ser jurado em ${termo.organizacao}.\n\nAcesse o link para criar sua senha:\n\n${link}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
          <div>
            <h2 className="text-base font-semibold text-white">
              {etapa === "formulario" ? "Adicionar Jurado" : "Jurado adicionado"}
            </h2>
            {etapa === "formulario" && (
              <p className="text-xs text-gray-500 mt-0.5">Um convite por e-mail será enviado automaticamente.</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {etapa === "formulario" && (
          <>
            <div className="p-6 space-y-4">
              <Dica>
                Preencha os dados do jurado. Ele receberá um e-mail com o link para criar a senha e acessar o painel de avaliação.
              </Dica>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome completo *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do jurado"
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">E-mail *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Telefone / WhatsApp</label>
                <input type="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                  placeholder="(21) 99999-9999"
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Especialidade</label>
                <input type="text" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)}
                  placeholder="Ex: Ballet Clássico, Jazz"
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Cachê (R$)</label>
                <input type="number" min="0" step="0.01" value={cache} onChange={(e) => setCache(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors" />
                <p className="text-xs text-gray-600 mt-1">Valor a ser pago ao jurado pelo evento. Pode ser 0 se for voluntário.</p>
              </div>
              {erro && <p className="flex items-start gap-2 text-xs text-red-400"><AlertCircle size={14} className="shrink-0 mt-0.5" /> {erro}</p>}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
              <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-200">Cancelar</button>
              <button onClick={salvar} disabled={salvando}
                className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
                {salvando && <Loader2 size={14} className="animate-spin" />}
                Cadastrar e convidar
              </button>
            </div>
          </>
        )}

        {etapa === "confirmacao" && (
          <>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{nome} adicionado!</p>
                  <p className="text-xs text-gray-400 mt-0.5">Convite enviado para <span className="text-white">{email}</span></p>
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={copiarLink} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-all duration-200">
                  {copiado ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  {copiado ? "Link copiado!" : "Copiar link do portal do jurado"}
                </button>
                <button onClick={abrirWhatsApp} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-all duration-200">
                  <MessageCircle size={15} /> Enviar pelo WhatsApp
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-axon-border">
              <button onClick={onClose} className="w-full px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 active:scale-95 transition-all duration-200">Concluir</button>
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [status, setStatus] = useState<"aguardando" | "processando" | "sucesso" | "erro">("aguardando");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function iniciar() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          tick();
        }
      } catch {
        setStatus("erro");
        setMsg("Permissão de câmera negada.");
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
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) { tick(); return; }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { tick(); return; }
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        await processarQR(code.data);
      } else { tick(); }
    });
  }

  async function processarQR(raw: string) {
    const supabase = createClient();
    setStatus("processando");
    try {
      let payload: { evento_id: string; jurado_id: string; notas: { apresentacao_id: string; criterio_id: string; nota: number }[]; ts: number } | null = null;
      for (const j of jurados) {
        const chave = `${eventoId}-${j.id}`.replace(/-/g, "").slice(0, 32);
        try { const texto = await descriptografarPayload(raw, chave); payload = JSON.parse(texto); break; } catch {}
      }
      if (!payload) throw new Error("QR inválido ou jurado não cadastrado.");
      if (payload.evento_id !== eventoId) throw new Error("Este QR pertence a outro evento.");
      let importados = 0;
      for (const n of payload.notas) {
        const { error } = await supabase.from("avaliacoes").upsert(
          { evento_id: eventoId, apresentacao_id: n.apresentacao_id, jurado_id: payload.jurado_id, criterio_id: n.criterio_id, nota: n.nota, sincronizado: true },
          { onConflict: "evento_id,apresentacao_id,jurado_id,criterio_id" }
        );
        if (!error) importados++;
      }
      setStatus("sucesso");
      setMsg(`${importados} nota${importados !== 1 ? "s" : ""} importada${importados !== 1 ? "s" : ""} com sucesso.`);
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
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col items-center gap-5">
          {(status === "aguardando" || status === "processando") && (
            <>
              <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-axon-gold/60 rounded-xl" />
                </div>
              </div>
              {status === "processando" && <p className="flex items-center gap-2 text-sm text-axon-gold"><Loader2 size={16} className="animate-spin" /> Processando...</p>}
              {status === "aguardando" && <p className="text-xs text-gray-500 text-center">Aponte a câmera para o QR Code do tablet do jurado.</p>}
            </>
          )}
          {status === "sucesso" && <div className="flex flex-col items-center gap-4 py-4"><CheckCircle2 size={40} className="text-emerald-400" /><p className="text-sm text-white text-center">{msg}</p></div>}
          {status === "erro" && <div className="flex flex-col items-center gap-4 py-4"><AlertCircle size={40} className="text-red-400" /><p className="text-sm text-red-400 text-center">{msg}</p></div>}
          <button onClick={onClose} className="w-full px-4 py-2 rounded-lg border border-axon-border text-sm text-gray-400 hover:text-white transition-all duration-200">
            {status === "sucesso" || status === "erro" ? "Fechar" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JuradosPage() {
  const [termo, setTermo] = useState<Terminologia>({
    grupo: "Grupo", participante: "Participante",
    apresentacao: "Apresentação", organizacao: "Organização",
  });
  const [eventoAtivo, setEventoAtivo] = useState<EventoAtivo | null>(null);
  const [jurados, setJurados] = useState<Jurado[]>([]);
  const [apresentacoes, setApresentacoes] = useState<Apresentacao[]>([]);
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [modalJurado, setModalJurado] = useState(false);
  const [modalScanner, setModalScanner] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"jurados" | "notas" | "observacoes">("jurados");
  const [apresExpandida, setApresExpandida] = useState<string | null>(null);
  const [salvandoObs, setSalvandoObs] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    setCarregando(true);

    const { data: config } = await supabase
      .from("tenant_config")
      .select("termo_grupo, termo_participante, termo_apresentacao, nome_organizacao")
      .maybeSingle();

    if (config) {
      setTermo({
        grupo:        (config as Record<string, string>).termo_grupo        ?? "Grupo",
        participante: (config as Record<string, string>).termo_participante ?? "Participante",
        apresentacao: (config as Record<string, string>).termo_apresentacao ?? "Apresentação",
        organizacao:  (config as Record<string, string>).nome_organizacao   ?? "Organização",
      });
    }

    const { data: evento } = await supabase
      .from("eventos")
      .select("id, nome")
      .in("status", ["inscricoes_abertas", "em_andamento"])
      .order("data_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();

    setEventoAtivo(evento ?? null);

    const { data: juradosData } = await supabase
      .from("usuarios")
      .select("id, nome, email, especialidade, cache_valor, cache_status")
      .eq("role", "jurado")
      .order("nome");

    setJurados((juradosData as Jurado[]) ?? []);

    if (evento) {
      const [{ data: apres }, { data: crits }, { data: avals }, { data: orgs }] = await Promise.all([
        supabase.from("apresentacoes").select("id, nome, grupo_id, observacoes").eq("evento_id", evento.id).order("ordem_apresentacao"),
        supabase.from("criterios_avaliacao").select("id, nome, nota_min, nota_max").eq("evento_id", evento.id).order("ordem"),
        supabase.from("avaliacoes").select("apresentacao_id, jurado_id, criterio_id, nota").eq("evento_id", evento.id),
        supabase.from("organizacoes").select("id, nome"),
      ]);

      setApresentacoes((apres as Apresentacao[]) ?? []);
      setCriterios((crits as Criterio[]) ?? []);
      setAvaliacoes((avals as Avaliacao[]) ?? []);
      setOrganizacoes((orgs as Organizacao[]) ?? []);

      const obsInit: Record<string, string> = {};
      ((apres as Apresentacao[]) ?? []).forEach((a) => { obsInit[a.id] = a.observacoes ?? ""; });
      setObservacoes(obsInit);
    }

    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function salvarObservacao(apresId: string) {
    const supabase = createClient();
    setSalvandoObs(apresId);
    await supabase.from("apresentacoes").update({ observacoes: observacoes[apresId] }).eq("id", apresId);
    setSalvandoObs(null);
  }

  async function alterarCacheStatus(juradoId: string, status: "pago" | "pendente") {
    const supabase = createClient();
    await supabase.from("usuarios").update({ cache_status: status }).eq("id", juradoId);
    setJurados((prev) => prev.map((j) => (j.id === juradoId ? { ...j, cache_status: status } : j)));
  }

  const totalCache = jurados.reduce((a, j) => a + (j.cache_valor ?? 0), 0);
  const totalPago = jurados.filter((j) => j.cache_status === "pago").reduce((a, j) => a + (j.cache_valor ?? 0), 0);

  function mediaApres(apresId: string): string {
    const notas = avaliacoes.filter((a) => a.apresentacao_id === apresId);
    if (!notas.length) return "—";
    return (notas.reduce((s, a) => s + a.nota, 0) / notas.length).toFixed(2);
  }

  function notaJuradoCriterio(apresId: string, juradoId: string, criterioId: string): string {
    const av = avaliacoes.find((a) => a.apresentacao_id === apresId && a.jurado_id === juradoId && a.criterio_id === criterioId);
    return av ? String(av.nota) : "—";
  }

  return (
    <>
      {modalJurado && <ModalJurado termo={termo} onClose={() => setModalJurado(false)} onSaved={carregar} />}
      {modalScanner && eventoAtivo && (
        <ScannerQR eventoId={eventoAtivo.id} jurados={jurados} onImportado={() => carregar()} onClose={() => setModalScanner(false)} />
      )}

      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Jurados & Apuração</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie jurados, visualize notas e registre observações por {termo.apresentacao.toLowerCase()}.
            </p>
          </div>
          <button onClick={() => setModalJurado(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0">
            <Plus size={15} /> Adicionar Jurado
          </button>
        </div>

        <Dica>
          Jurados adicionados aqui recebem acesso ao <strong>portal do jurado</strong> onde avaliam as {termo.apresentacao.toLowerCase()}s em tempo real. O cachê é o valor combinado pela participação no evento.
        </Dica>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Jurados", valor: jurados.length, icon: Users, cor: "text-white" },
            { label: "Cache pago", valor: jurados.filter((j) => j.cache_status === "pago").length, icon: CheckCircle2, cor: "text-emerald-400" },
            { label: "Total cachê", valor: moeda(totalCache), icon: CircleDollarSign, cor: "text-white" },
            { label: "A pagar", valor: moeda(totalCache - totalPago), icon: Clock3, cor: "text-axon-gold" },
          ].map(({ label, valor, icon: Icon, cor }) => (
            <div key={label} className="bg-axon-panel border border-axon-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={cor} />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
              <p className={`text-lg font-semibold tabular-nums ${cor}`}>{valor}</p>
            </div>
          ))}
        </div>

        <div className="flex border-b border-axon-border">
          {[
            { id: "jurados", label: "Jurados" },
            { id: "notas", label: "Apuração de Notas" },
            { id: "observacoes", label: "Observações" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setAbaAtiva(tab.id as typeof abaAtiva)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                abaAtiva === tab.id ? "border-axon-gold text-axon-gold" : "border-transparent text-gray-500 hover:text-white hover:border-gray-600"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-600" /></div>
        ) : (
          <>
            {abaAtiva === "jurados" && (
              <div className="space-y-3">
                {jurados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-axon-border rounded-xl text-gray-600">
                    <Users size={36} className="mb-3 opacity-20 text-axon-gold" />
                    <p className="font-medium text-gray-300">Nenhum jurado cadastrado</p>
                    <p className="text-sm mt-1 text-gray-500">Clique em "Adicionar Jurado" para convidar o primeiro avaliador.</p>
                  </div>
                ) : (
                  jurados.map((j) => (
                    <div key={j.id} className="bg-axon-panel border border-axon-border rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap hover:border-gray-600 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{j.nome}</p>
                        <div className="flex flex-wrap gap-3 mt-0.5">
                          <p className="text-xs text-gray-500">{j.email}</p>
                          {j.especialidade && <p className="text-xs text-gray-600">· {j.especialidade}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {j.cache_valor != null && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Cachê</p>
                            <p className="text-sm font-semibold text-white tabular-nums">{moeda(j.cache_valor)}</p>
                          </div>
                        )}
                        <select value={j.cache_status} onChange={(e) => alterarCacheStatus(j.id, e.target.value as "pago" | "pendente")}
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border bg-transparent cursor-pointer focus:outline-none transition-colors ${
                            j.cache_status === "pago"
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : "border-axon-gold/30 text-axon-gold bg-axon-gold/10"
                          }`}>
                          <option value="pago" className="bg-axon-panel text-white">Pago</option>
                          <option value="pendente" className="bg-axon-panel text-white">Pendente</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {abaAtiva === "notas" && (
              <div className="space-y-5">
                {!eventoAtivo ? (
                  <div className="flex items-center gap-3 p-4 bg-axon-gold/10 border border-axon-gold/20 rounded-xl">
                    <AlertCircle size={16} className="text-axon-gold shrink-0" />
                    <p className="text-sm text-gray-400">Nenhum evento ativo. Mude o status de um evento para "Inscrições Abertas" ou "Em Andamento" para visualizar as notas.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{avaliacoes.length} avaliação{avaliacoes.length !== 1 ? "ões" : ""} registrada{avaliacoes.length !== 1 ? "s" : ""}</p>
                      <button onClick={() => setModalScanner(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-axon-gold text-black text-xs font-bold hover:bg-axon-gold/80 active:scale-95 transition-all duration-200">
                        <QrCode size={14} /> Sincronizar via QR Code
                      </button>
                    </div>

                    {apresentacoes.length === 0 ? (
                      <p className="text-sm text-gray-600 text-center py-8">Nenhuma {termo.apresentacao.toLowerCase()} neste evento ainda.</p>
                    ) : (
                      <div className="space-y-3">
                        {apresentacoes.map((a) => {
                          const org = organizacoes.find((o) => o.id === a.organizacao_id);
                          const expandida = apresExpandida === a.id;
                          return (
                            <div key={a.id} className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
                              <button onClick={() => setApresExpandida(expandida ? null : a.id)}
                                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white">{a.nome}</p>
                                  {org && <p className="text-xs text-gray-500 mt-0.5">{org.nome}</p>}
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">Média geral</p>
                                    <p className="text-sm font-bold text-white tabular-nums">{mediaApres(a.id)}</p>
                                  </div>
                                  {expandida ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                                </div>
                              </button>

                              {expandida && (
                                <div className="border-t border-axon-border overflow-x-auto">
                                  {criterios.length === 0 ? (
                                    <p className="text-xs text-gray-600 p-5">Nenhum critério configurado para este evento.</p>
                                  ) : (
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-axon-border">
                                          <th className="text-left text-gray-500 font-medium px-5 py-3">Jurado</th>
                                          {criterios.map((cr) => (
                                            <th key={cr.id} className="text-center text-gray-500 font-medium px-3 py-3 whitespace-nowrap">{cr.nome}</th>
                                          ))}
                                          <th className="text-center text-gray-500 font-medium px-4 py-3">Média</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {jurados.map((j) => {
                                          const notasJ = avaliacoes.filter((av) => av.apresentacao_id === a.id && av.jurado_id === j.id);
                                          const mediaJ = notasJ.length ? (notasJ.reduce((s, av) => s + av.nota, 0) / notasJ.length).toFixed(2) : "—";
                                          return (
                                            <tr key={j.id} className="border-b border-axon-border/50 last:border-0">
                                              <td className="px-5 py-3 text-gray-300 whitespace-nowrap">{j.nome}</td>
                                              {criterios.map((cr) => (
                                                <td key={cr.id} className="px-3 py-3 text-center tabular-nums text-white">{notaJuradoCriterio(a.id, j.id, cr.id)}</td>
                                              ))}
                                              <td className="px-4 py-3 text-center tabular-nums font-semibold text-axon-gold">{mediaJ}</td>
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
                  <div className="flex items-center gap-3 p-4 bg-axon-gold/10 border border-axon-gold/20 rounded-xl">
                    <AlertCircle size={16} className="text-axon-gold shrink-0" />
                    <p className="text-sm text-gray-400">Nenhum evento ativo.</p>
                  </div>
                ) : apresentacoes.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-8">Nenhuma {termo.apresentacao.toLowerCase()} neste evento ainda.</p>
                ) : (
                  apresentacoes.map((a) => {
                    const org = organizacoes.find((o) => o.id === a.organizacao_id);
                    return (
                      <div key={a.id} className="bg-axon-panel border border-axon-border rounded-xl p-5 space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{a.nome}</p>
                          {org && <p className="text-xs text-gray-500 mt-0.5">{org.nome}</p>}
                        </div>
                        <div className="flex gap-3">
                          <textarea value={observacoes[a.id] ?? ""}
                            onChange={(e) => setObservacoes((prev) => ({ ...prev, [a.id]: e.target.value }))}
                            placeholder={`Observações sobre esta ${termo.apresentacao.toLowerCase()}...`}
                            rows={3}
                            className="flex-1 bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors resize-none" />
                          <button onClick={() => salvarObservacao(a.id)} disabled={salvandoObs === a.id}
                            className="px-4 py-2 self-end rounded-lg bg-axon-gold text-black text-xs font-bold hover:bg-axon-gold/80 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center gap-1.5">
                            {salvandoObs === a.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
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