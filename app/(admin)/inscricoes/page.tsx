"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle2,
  Pencil,
  Trash2,
  Info,
  UserPlus,
  MailCheck,
  Link2,
  Unlink,
  ChevronDown,
  ChevronRight,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

// ============================================================
// TIPOS
// ============================================================
interface Grupo {
  id: string;
  nome: string;
  responsavel: string | null;
  telefone: string | null;
  email: string;
  documento: string | null;
  tipo_documento: "cpf" | "cnpj" | null;
  created_at: string;
}

interface Participante {
  id: string;
  nome: string;
  documento: string | null;
  data_nascimento: string;
  email_contato: string | null;
  termo_assinado: boolean;
  credencial: string;
  created_at: string;
}

interface Vinculo {
  id: string;
  grupo_id: string;
  participante_id: string;
  funcao: string;
  confirmado: boolean;
  token_confirmacao: string | null;
  data_vinculo: string;
}

interface ParticipacaoEvento {
  evento_id: string;
  evento_nome: string;
  evento_data: string;
  status: string;
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function mascaraCPF(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return numeros.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  if (numeros.length <= 9) return numeros.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function mascaraCNPJ(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 14);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 5) return numeros.replace(/(\d{2})(\d{0,3})/, "$1.$2");
  if (numeros.length <= 8) return numeros.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
  if (numeros.length <= 12) return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4");
  return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function mascaraTelefone(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return n.replace(/(\d{2})(\d{0,4})/, "($1) $2");
  if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

const CREDENCIAIS = [
  { value: "bailarino", label: "Bailarino(a)" },
  { value: "cantor", label: "Cantor(a)" },
  { value: "musico", label: "Músico(a)" },
  { value: "ator", label: "Ator/Atriz" },
  { value: "tecnico", label: "Técnico(a)" },
  { value: "producao", label: "Produção" },
  { value: "coreografo", label: "Coreógrafo(a)" },
  { value: "outro", label: "Outro" },
];

const FUNCOES_VINCULO = CREDENCIAIS; // mesma lista para função no grupo

function formatarData(data: string) {
  if (!data) return "";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}

function formatarCredencial(credencial: string) {
  const found = CREDENCIAIS.find(c => c.value === credencial);
  return found ? found.label : credencial;
}

// ============================================================
// MODAL CADASTRAR/EDITAR GRUPO
// ============================================================
interface ModalGrupoProps {
  open: boolean;
  grupo?: Grupo | null;
  onClose: () => void;
  onSaved: () => void;
}

function ModalGrupo({ open, grupo, onClose, onSaved }: ModalGrupoProps) {
  const [nome, setNome] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<"cpf" | "cnpj">("cnpj");
  const [documento, setDocumento] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (grupo) {
      setNome(grupo.nome);
      setResponsavel(grupo.responsavel || "");
      setTelefone(grupo.telefone || "");
      setEmail(grupo.email);
      setTipoDocumento(grupo.tipo_documento || "cnpj");
      setDocumento(grupo.documento || "");
    } else {
      setNome("");
      setResponsavel("");
      setTelefone("");
      setEmail("");
      setTipoDocumento("cnpj");
      setDocumento("");
    }
  }, [grupo, open]);

  if (!open) return null;

  async function salvar() {
    setErro("");
    const docLimpo = documento.replace(/\D/g, "");
    if (!nome.trim()) return setErro("Nome do grupo é obrigatório.");
    if (!email.trim()) return setErro("E-mail é obrigatório.");
    if (!docLimpo) return setErro(`${tipoDocumento === "cpf" ? "CPF" : "CNPJ"} é obrigatório.`);
    if (tipoDocumento === "cpf" && docLimpo.length !== 11) return setErro("CPF deve ter 11 dígitos.");
    if (tipoDocumento === "cnpj" && docLimpo.length !== 14) return setErro("CNPJ deve ter 14 dígitos.");
    setSalvando(true);
    const supabase = createClient();

    if (grupo) {
      const { error } = await supabase
        .from("grupos")
        .update({
          nome: nome.trim(),
          responsavel: responsavel.trim() || null,
          telefone: telefone.trim() || null,
          email: email.trim(),
          tipo_documento: tipoDocumento,
          documento: docLimpo,
        })
        .eq("id", grupo.id);
      if (error) setErro(error.message);
      else onSaved();
    } else {
      const { error } = await supabase.from("grupos").insert({
        nome: nome.trim(),
        responsavel: responsavel.trim() || null,
        telefone: telefone.trim() || null,
        email: email.trim(),
        tipo_documento: tipoDocumento,
        documento: docLimpo,
      });
      if (error) setErro(error.message);
      else onSaved();
    }
    setSalvando(false);
  }

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setDocumento(raw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-axon-border">
          <h2 className="text-lg font-semibold text-white">{grupo ? "Editar" : "Novo"} Grupo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome do grupo *</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tipo de documento *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="radio" value="cpf" checked={tipoDocumento === "cpf"} onChange={() => setTipoDocumento("cpf")} /> CPF (diretor)</label>
              <label className="flex items-center gap-2"><input type="radio" value="cnpj" checked={tipoDocumento === "cnpj"} onChange={() => setTipoDocumento("cnpj")} /> CNPJ (grupo)</label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{tipoDocumento === "cpf" ? "CPF" : "CNPJ"} *</label>
            <input type="text" value={tipoDocumento === "cpf" ? mascaraCPF(documento) : mascaraCNPJ(documento)} onChange={handleDocumentoChange} placeholder={tipoDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">E-mail *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Responsável</label>
            <input type="text" value={responsavel} onChange={e => setResponsavel(e.target.value)} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Telefone</label>
            <input type="tel" value={mascaraTelefone(telefone)} onChange={e => setTelefone(e.target.value.replace(/\D/g, ""))} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          {erro && <p className="text-xs text-red-400">{erro}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-axon-border text-gray-400 hover:text-white">Cancelar</button>
          <button onClick={salvar} disabled={salvando} className="flex-1 py-2 rounded-lg bg-axon-gold text-black font-bold flex items-center justify-center gap-2">
            {salvando && <Loader2 size={16} className="animate-spin" />}
            {grupo ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODAL CADASTRAR/EDITAR PARTICIPANTE
// ============================================================
interface ModalParticipanteProps {
  open: boolean;
  participante?: Participante | null;
  onClose: () => void;
  onSaved: () => void;
}

function ModalParticipante({ open, participante, onClose, onSaved }: ModalParticipanteProps) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [emailContato, setEmailContato] = useState("");
  const [termoAssinado, setTermoAssinado] = useState(false);
  const [credencial, setCredencial] = useState("outro");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (participante) {
      setNome(participante.nome);
      setCpf(participante.documento || "");
      setDataNascimento(participante.data_nascimento || "");
      setEmailContato(participante.email_contato || "");
      setTermoAssinado(participante.termo_assinado);
      setCredencial(participante.credencial || "outro");
    } else {
      setNome("");
      setCpf("");
      setDataNascimento("");
      setEmailContato("");
      setTermoAssinado(false);
      setCredencial("outro");
    }
  }, [participante, open]);

  if (!open) return null;

  async function salvar() {
    setErro("");
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!nome.trim()) return setErro("Nome é obrigatório.");
    if (cpfLimpo.length !== 11) return setErro("CPF deve ter 11 dígitos.");
    if (!emailContato.trim()) return setErro("E-mail de contato é obrigatório.");
    if (!credencial) return setErro("Selecione a credencial profissional.");
    setSalvando(true);
    const supabase = createClient();

    if (participante) {
      const { error } = await supabase
        .from("participantes")
        .update({
          nome: nome.trim(),
          documento: cpfLimpo,
          data_nascimento: dataNascimento || null,
          email_contato: emailContato.trim(),
          termo_assinado: termoAssinado,
          credencial: credencial,
        })
        .eq("id", participante.id);
      if (error) setErro(error.message);
      else onSaved();
    } else {
      const { error } = await supabase.from("participantes").insert({
        nome: nome.trim(),
        documento: cpfLimpo,
        data_nascimento: dataNascimento || null,
        email_contato: emailContato.trim(),
        termo_assinado: termoAssinado,
        credencial: credencial,
      });
      if (error) setErro(error.message);
      else onSaved();
    }
    setSalvando(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto py-8">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-axon-border">
          <h2 className="text-lg font-semibold text-white">{participante ? "Editar" : "Novo"} Participante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome completo *</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">CPF *</label>
            <input type="text" value={mascaraCPF(cpf)} onChange={e => setCpf(e.target.value)} maxLength={14} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Data de nascimento *</label>
            <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">E-mail de contato *</label>
            <input type="email" value={emailContato} onChange={e => setEmailContato(e.target.value)} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Credencial profissional *</label>
            <select value={credencial} onChange={e => setCredencial(e.target.value)} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white">
              {CREDENCIAIS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="termo" checked={termoAssinado} onChange={e => setTermoAssinado(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="termo" className="text-sm text-gray-300">Termo de consentimento assinado</label>
          </div>
          {erro && <p className="text-xs text-red-400">{erro}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-axon-border text-gray-400 hover:text-white">Cancelar</button>
          <button onClick={salvar} disabled={salvando} className="flex-1 py-2 rounded-lg bg-axon-gold text-black font-bold flex items-center justify-center gap-2">
            {salvando && <Loader2 size={16} className="animate-spin" />}
            {participante ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODAL VINCULAR PARTICIPANTE AO GRUPO
// ============================================================
interface ModalVincularProps {
  open: boolean;
  grupoId: string;
  grupoNome: string;
  onClose: () => void;
  onVinculado: () => void;
}

function ModalVincular({ open, grupoId, grupoNome, onClose, onVinculado }: ModalVincularProps) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Participante[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [selecionado, setSelecionado] = useState<Participante | null>(null);
  const [funcao, setFuncao] = useState("bailarino");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open) {
      setBusca("");
      setResultados([]);
      setSelecionado(null);
      setFuncao("bailarino");
      setErro("");
    }
  }, [open]);

  async function buscar() {
    const termo = busca.trim();
    if (!termo) return;
    setBuscando(true);
    setErro("");
    const supabase = createClient();
    let query = supabase.from("participantes").select("*");
    if (termo.length === 11 || /^\d+$/.test(termo)) {
      query = query.eq("documento", termo.replace(/\D/g, ""));
    } else {
      query = query.ilike("nome", `%${termo}%`);
    }
    const { data, error } = await query.limit(10);
    if (error) setErro(error.message);
    else setResultados(data || []);
    setBuscando(false);
  }

  async function vincular() {
    if (!selecionado) return setErro("Selecione um participante.");
    setSalvando(true);
    const supabase = createClient();

    // Verificar se já existe vínculo
    const { data: existente } = await supabase
      .from("grupo_participante")
      .select("id")
      .eq("grupo_id", grupoId)
      .eq("participante_id", selecionado.id)
      .maybeSingle();
    if (existente) {
      setErro("Este participante já está vinculado a este grupo.");
      setSalvando(false);
      return;
    }

    const token = crypto.randomUUID();
    const { error: insertErr } = await supabase.from("grupo_participante").insert({
      grupo_id: grupoId,
      participante_id: selecionado.id,
      funcao: funcao,
      token_confirmacao: token,
      confirmado: false,
    });
    if (insertErr) {
      setErro(insertErr.message);
      setSalvando(false);
      return;
    }

    // Enviar e-mail de confirmação
    await fetch("/api/enviar-confirmacao-vinculo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: selecionado.email_contato,
        nome: selecionado.nome,
        grupoNome: grupoNome,
        funcao: funcao,
        token: token,
      }),
    }).catch(console.error);

    onVinculado();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-axon-border">
          <h2 className="text-lg font-semibold text-white">Vincular Participante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Buscar participante (CPF ou nome)</label>
            <div className="flex gap-2">
              <input type="text" value={busca} onChange={e => setBusca(e.target.value)} className="flex-1 bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
              <button onClick={buscar} disabled={buscando} className="px-3 py-2 rounded-lg border border-axon-border text-axon-gold">Buscar</button>
            </div>
            {buscando && <Loader2 size={16} className="animate-spin mt-2" />}
            {resultados.length > 0 && (
              <div className="mt-2 border border-axon-border rounded-lg overflow-hidden">
                {resultados.map(p => (
                  <div key={p.id} onClick={() => setSelecionado(p)} className={`p-2 cursor-pointer hover:bg-axon-gold/10 ${selecionado?.id === p.id ? "bg-axon-gold/20" : ""}`}>
                    <p className="text-sm text-white">{p.nome}</p>
                    <p className="text-xs text-gray-500">{mascaraCPF(p.documento || "")} • {formatarCredencial(p.credencial)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selecionado && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Função do participante neste grupo *</label>
              <select value={funcao} onChange={e => setFuncao(e.target.value)} className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white">
                {FUNCOES_VINCULO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          )}
          {erro && <p className="text-xs text-red-400">{erro}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-axon-border text-gray-400">Cancelar</button>
          <button onClick={vincular} disabled={salvando || !selecionado} className="flex-1 py-2 rounded-lg bg-axon-gold text-black font-bold flex items-center justify-center gap-2">
            {salvando && <Loader2 size={16} className="animate-spin" />}
            Vincular
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DRAWER DE DETALHES DO GRUPO
// ============================================================
interface DrawerGrupoProps {
  open: boolean;
  grupo: Grupo | null;
  onClose: () => void;
  onRefresh: () => void;
}

function DrawerGrupo({ open, grupo, onClose, onRefresh }: DrawerGrupoProps) {
  const [participantes, setParticipantes] = useState<Array<Participante & { funcao: string; confirmado: boolean; vinculoId: string }>>([]);
  const [historico, setHistorico] = useState<ParticipacaoEvento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modalVincular, setModalVincular] = useState(false);

  const carregarDados = useCallback(async () => {
    if (!grupo) return;
    setCarregando(true);
    const supabase = createClient();

    // Buscar participantes vinculados com função e status
    const { data: vinculos, error: vErr } = await supabase
      .from("grupo_participante")
      .select("id, participante_id, funcao, confirmado, token_confirmacao")
      .eq("grupo_id", grupo.id)
      .eq("status", "ativo");
    if (!vErr && vinculos) {
      const participantesIds = vinculos.map(v => v.participante_id);
      const { data: parts } = await supabase.from("participantes").select("*").in("id", participantesIds);
      if (parts) {
        const combined = vinculos.map(v => ({
          ...(parts.find(p => p.id === v.participante_id)!),
          funcao: v.funcao,
          confirmado: v.confirmado,
          vinculoId: v.id,
        }));
        setParticipantes(combined);
      }
    }

    // Buscar histórico de participações em eventos (via inscricoes_grupo_evento)
    const { data: inscricoes } = await supabase
      .from("inscricoes_grupo_evento")
      .select("evento_id, status, created_at")
      .eq("grupo_id", grupo.id);
    if (inscricoes && inscricoes.length > 0) {
      const eventosIds = inscricoes.map(i => i.evento_id);
      const { data: eventos } = await supabase.from("eventos").select("id, nome, data_inicio").in("id", eventosIds);
      if (eventos) {
        const hist = inscricoes.map(i => ({
          evento_id: i.evento_id,
          evento_nome: eventos.find(e => e.id === i.evento_id)?.nome || "Evento",
          evento_data: eventos.find(e => e.id === i.evento_id)?.data_inicio || "",
          status: i.status,
        }));
        setHistorico(hist);
      }
    }
    setCarregando(false);
  }, [grupo]);

  useEffect(() => {
    if (open && grupo) carregarDados();
  }, [open, grupo, carregarDados]);

  async function removerVinculo(vinculoId: string) {
    if (!confirm("Remover este participante do grupo?")) return;
    const supabase = createClient();
    await supabase.from("grupo_participante").delete().eq("id", vinculoId);
    onRefresh();
    carregarDados();
  }

  if (!open || !grupo) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-axon-panel border-l border-axon-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-6 border-b border-axon-border">
          <h2 className="text-xl font-semibold text-white">{grupo.nome}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Detalhes do grupo */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-axon-gold">Informações</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-400">Responsável:</div><div className="text-white">{grupo.responsavel || "—"}</div>
              <div className="text-gray-400">E-mail:</div><div className="text-white">{grupo.email}</div>
              <div className="text-gray-400">Telefone:</div><div className="text-white">{mascaraTelefone(grupo.telefone || "") || "—"}</div>
              <div className="text-gray-400">Documento:</div><div className="text-white">{grupo.tipo_documento === "cpf" ? mascaraCPF(grupo.documento || "") : mascaraCNPJ(grupo.documento || "")}</div>
            </div>
          </div>

          {/* Participantes vinculados */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-axon-gold">Participantes vinculados</h3>
              <button onClick={() => setModalVincular(true)} className="text-xs bg-axon-gold/10 text-axon-gold px-2 py-1 rounded flex items-center gap-1"><UserPlus size={12} /> Vincular</button>
            </div>
            {carregando ? <Loader2 className="animate-spin" /> : participantes.length === 0 ? <p className="text-gray-500 text-sm">Nenhum participante vinculado.</p> : (
              <div className="space-y-2">
                {participantes.map(p => (
                  <div key={p.id} className="bg-axon-bg border border-axon-border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">{p.nome}</p>
                      <div className="flex gap-3 text-xs text-gray-400 mt-1">
                        <span>{formatarCredencial(p.credencial)}</span>
                        <span>•</span>
                        <span>Função: {formatarCredencial(p.funcao)}</span>
                        <span>•</span>
                        {p.confirmado ? <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={10} /> Confirmado</span> : <span className="text-amber-400 flex items-center gap-1"><MailCheck size={10} /> Pendente</span>}
                      </div>
                    </div>
                    <button onClick={() => removerVinculo(p.vinculoId)} className="text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de participações */}
          <div>
            <h3 className="text-sm font-semibold text-axon-gold mb-3">Histórico de participações</h3>
            {historico.length === 0 ? <p className="text-gray-500 text-sm">Nenhuma participação em eventos ainda.</p> : (
              <div className="space-y-2">
                {historico.map((h, idx) => (
                  <div key={idx} className="bg-axon-bg border border-axon-border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-white">{h.evento_nome}</p>
                      <p className="text-xs text-gray-500">{formatarData(h.evento_data)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${h.status === "confirmado" ? "bg-emerald-500/10 text-emerald-400" : h.status === "pendente" ? "bg-axon-gold/10 text-axon-gold" : "bg-red-500/10 text-red-400"}`}>
                      {h.status === "confirmado" ? "Confirmado" : h.status === "pendente" ? "Pendente" : "Cancelado"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ModalVincular open={modalVincular} grupoId={grupo.id} grupoNome={grupo.nome} onClose={() => setModalVincular(false)} onVinculado={() => { carregarDados(); onRefresh(); }} />
    </>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function InscricoesPage() {
  const [aba, setAba] = useState<"grupos" | "participantes">("grupos");
  const [busca, setBusca] = useState("");
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [vinculosMap, setVinculosMap] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [modalGrupoOpen, setModalGrupoOpen] = useState(false);
  const [modalParticipanteOpen, setModalParticipanteOpen] = useState(false);
  const [editandoGrupo, setEditandoGrupo] = useState<Grupo | null>(null);
  const [editandoParticipante, setEditandoParticipante] = useState<Participante | null>(null);
  const [drawerGrupo, setDrawerGrupo] = useState<Grupo | null>(null);
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);

  const mostrarToast = (msg: string, tipo: "ok" | "erro" = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    const supabase = createClient();
    const [gruposRes, participantesRes, vinculosRes] = await Promise.all([
      supabase.from("grupos").select("*").order("nome"),
      supabase.from("participantes").select("*").order("nome"),
      supabase.from("grupo_participante").select("grupo_id"),
    ]);
    if (gruposRes.data) setGrupos(gruposRes.data);
    if (participantesRes.data) setParticipantes(participantesRes.data);
    if (vinculosRes.data) {
      const counts: Record<string, number> = {};
      vinculosRes.data.forEach(v => { counts[v.grupo_id] = (counts[v.grupo_id] || 0) + 1; });
      setVinculosMap(counts);
    }
    setCarregando(false);
  }, []);

  useEffect(() => { carregarDados(); }, []);

  const gruposFiltrados = grupos.filter(g => g.nome.toLowerCase().includes(busca.toLowerCase()) || (g.responsavel || "").toLowerCase().includes(busca.toLowerCase()));
  const participantesFiltrados = participantes.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.documento || "").includes(busca.replace(/\D/g, "")));

  async function excluirGrupo(id: string) {
    if (!confirm("Excluir grupo? Isso removerá todos os vínculos e históricos.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("grupos").delete().eq("id", id);
    if (error) mostrarToast(error.message, "erro");
    else { mostrarToast("Grupo excluído."); carregarDados(); }
  }

  async function excluirParticipante(id: string) {
    if (!confirm("Excluir participante? Isso removerá vínculos com grupos.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("participantes").delete().eq("id", id);
    if (error) mostrarToast(error.message, "erro");
    else { mostrarToast("Participante excluído."); carregarDados(); }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-white">Base de Grupos & Participantes</h1>
            <p className="text-sm text-gray-500">Cadastre grupos e participantes globalmente, gerencie vínculos e histórico.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditandoGrupo(null); setModalGrupoOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-axon-gold text-black font-bold"><Plus size={16} /> Novo Grupo</button>
            <button onClick={() => { setEditandoParticipante(null); setModalParticipanteOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-axon-gold text-axon-gold font-bold"><UserPlus size={16} /> Novo Participante</button>
          </div>
        </div>

        {/* Busca global */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, responsável ou CPF/CNPJ..." className="w-full bg-axon-panel border border-axon-border rounded-lg pl-10 pr-3 py-2 text-sm text-white" />
        </div>

        {/* Abas */}
        <div className="flex border-b border-axon-border">
          <button onClick={() => setAba("grupos")} className={`px-4 py-2 text-sm font-medium ${aba === "grupos" ? "border-b-2 border-axon-gold text-axon-gold" : "text-gray-400"}`}>Grupos ({grupos.length})</button>
          <button onClick={() => setAba("participantes")} className={`px-4 py-2 text-sm font-medium ${aba === "participantes" ? "border-b-2 border-axon-gold text-axon-gold" : "text-gray-400"}`}>Participantes ({participantes.length})</button>
        </div>

        {/* Conteúdo Aba Grupos */}
        {aba === "grupos" && (
          carregando ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-axon-gold" size={32} /></div> :
          gruposFiltrados.length === 0 ? <div className="text-center py-12 text-gray-500">Nenhum grupo encontrado.</div> :
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gruposFiltrados.map(g => (
              <div key={g.id} className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
                <div className="p-4 cursor-pointer" onClick={() => setDrawerGrupo(g)}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white">{g.nome}</h3>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditandoGrupo(g); setModalGrupoOpen(true); }} className="p-1 text-gray-400 hover:text-axon-gold"><Pencil size={14} /></button>
                      <button onClick={() => excluirGrupo(g.id)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {g.responsavel && <p className="text-xs text-gray-500 mt-1">{g.responsavel}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users size={12} /> {vinculosMap[g.id] || 0} participantes</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatarData(g.created_at)}</span>
                  </div>
                </div>
                <div className="border-t border-axon-border px-4 py-2 text-xs text-right">
                  <span className="text-axon-gold">Clique para detalhes</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Conteúdo Aba Participantes */}
        {aba === "participantes" && (
          carregando ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-axon-gold" size={32} /></div> :
          participantesFiltrados.length === 0 ? <div className="text-center py-12 text-gray-500">Nenhum participante encontrado.</div> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-axon-border">
                <tr className="text-left text-gray-400">
                  <th className="pb-2">Nome</th>
                  <th className="pb-2">Credencial</th>
                  <th className="pb-2">CPF</th>
                  <th className="pb-2">E-mail</th>
                  <th className="pb-2">Cadastro</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {participantesFiltrados.map(p => (
                  <tr key={p.id} className="border-b border-axon-border/50 hover:bg-white/5">
                    <td className="py-3 font-medium text-white">{p.nome}</td>
                    <td className="py-3 text-gray-300">{formatarCredencial(p.credencial)}</td>
                    <td className="py-3 text-gray-300">{mascaraCPF(p.documento || "")}</td>
                    <td className="py-3 text-gray-300">{p.email_contato}</td>
                    <td className="py-3 text-gray-500 text-xs">{formatarData(p.created_at)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditandoParticipante(p); setModalParticipanteOpen(true); }} className="text-gray-400 hover:text-axon-gold"><Pencil size={14} /></button>
                        <button onClick={() => excluirParticipante(p.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      <ModalGrupo open={modalGrupoOpen} grupo={editandoGrupo} onClose={() => { setModalGrupoOpen(false); setEditandoGrupo(null); }} onSaved={() => { carregarDados(); mostrarToast("Grupo salvo."); setModalGrupoOpen(false); }} />
      <ModalParticipante open={modalParticipanteOpen} participante={editandoParticipante} onClose={() => { setModalParticipanteOpen(false); setEditandoParticipante(null); }} onSaved={() => { carregarDados(); mostrarToast("Participante salvo."); setModalParticipanteOpen(false); }} />
      <DrawerGrupo open={!!drawerGrupo} grupo={drawerGrupo} onClose={() => setDrawerGrupo(null)} onRefresh={carregarDados} />
      {toast && <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${toast.tipo === "ok" ? "bg-axon-gold text-black" : "bg-red-500 text-white"}`}><CheckCircle2 size={16} />{toast.msg}</div>}
    </>
  );
}