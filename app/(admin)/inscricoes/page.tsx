"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Users,
  Music4,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  Copy,
  Check,
  MessageCircle,
  Pencil,
  Trash2,
  Info,
  UserPlus,
  MailCheck,
} from "lucide-react";

interface Terminologia {
  grupo: string;
  participante: string;
  apresentacao: string;
  inscricao: string;
  organizacao: string;
}

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
  created_at: string;
}

function formatMoeda(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mascaraTelefone(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10)
    return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function mascaraCPF(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function mascaraCNPJ(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 14);
  return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function Dica({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-axon-gold/5 border border-axon-gold/15 rounded-xl px-4 py-3">
      <Info size={14} className="text-axon-gold shrink-0 mt-0.5" />
      <p className="text-xs text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
}

// Modal cadastrar GRUPO (global, sem evento)
interface ModalCadastrarGrupoProps {
  termo: Terminologia;
  grupo?: Grupo | null;
  onClose: () => void;
  onSaved: () => void;
}

function ModalCadastrarGrupo({ termo, grupo, onClose, onSaved }: ModalCadastrarGrupoProps) {
  const [nome, setNome] = useState(grupo?.nome ?? "");
  const [responsavel, setResponsavel] = useState(grupo?.responsavel ?? "");
  const [telefone, setTelefone] = useState(grupo?.telefone ?? "");
  const [email, setEmail] = useState(grupo?.email ?? "");
  const [tipoDocumento, setTipoDocumento] = useState<"cpf" | "cnpj">(grupo?.tipo_documento || "cnpj");
  const [documento, setDocumento] = useState(grupo?.documento ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    const supabase = createClient();
    setErro(null);

    if (!nome.trim()) {
      setErro(`Nome do ${termo.grupo.toLowerCase()} é obrigatório.`);
      return;
    }
    if (!email.trim()) {
      setErro("E-mail do responsável é obrigatório.");
      return;
    }
    const docLimpo = documento.replace(/\D/g, "");
    if (!docLimpo) {
      setErro(`${tipoDocumento === "cpf" ? "CPF" : "CNPJ"} é obrigatório.`);
      return;
    }
    if (tipoDocumento === "cpf" && docLimpo.length !== 11) {
      setErro("CPF deve ter 11 dígitos.");
      return;
    }
    if (tipoDocumento === "cnpj" && docLimpo.length !== 14) {
      setErro("CNPJ deve ter 14 dígitos.");
      return;
    }

    setSalvando(true);

    // Verificar se já existe grupo com este e-mail ou documento
    let grupoExistente: Grupo | null = null;
    if (email.trim()) {
      const { data } = await supabase
        .from("grupos")
        .select("*")
        .eq("email", email.trim())
        .maybeSingle();
      if (data) grupoExistente = data;
    }
    if (!grupoExistente && docLimpo) {
      const { data } = await supabase
        .from("grupos")
        .select("*")
        .eq("documento", docLimpo)
        .maybeSingle();
      if (data) grupoExistente = data;
    }

    if (grupoExistente) {
      // Atualizar dados do grupo existente
      const { error: updateErr } = await supabase
        .from("grupos")
        .update({
          nome: nome.trim(),
          responsavel: responsavel.trim() || null,
          telefone: telefone.trim() || null,
          tipo_documento: tipoDocumento,
          documento: docLimpo,
        })
        .eq("id", grupoExistente.id);
      if (updateErr) {
        setErro(updateErr.message);
        setSalvando(false);
        return;
      }
    } else {
      // Criar novo grupo global
      const { error: insertErr } = await supabase.from("grupos").insert({
        nome: nome.trim(),
        responsavel: responsavel.trim() || null,
        telefone: telefone.trim() || null,
        email: email.trim(),
        tipo_documento: tipoDocumento,
        documento: docLimpo,
      });
      if (insertErr) {
        setErro(insertErr.message);
        setSalvando(false);
        return;
      }
    }

    onSaved();
    onClose();
    setSalvando(false);
  }

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setDocumento(raw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
          <h2 className="text-base font-semibold text-white">Cadastrar {termo.grupo}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome do {termo.grupo.toLowerCase()} *</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tipo de documento *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="cpf" checked={tipoDocumento === "cpf"}
                  onChange={() => setTipoDocumento("cpf")} className="w-4 h-4 text-axon-gold" />
                <span className="text-sm text-white">CPF (diretor individual)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="cnpj" checked={tipoDocumento === "cnpj"}
                  onChange={() => setTipoDocumento("cnpj")} className="w-4 h-4 text-axon-gold" />
                <span className="text-sm text-white">CNPJ (grupo formal)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{tipoDocumento === "cpf" ? "CPF *" : "CNPJ *"}</label>
            <input type="text"
              value={tipoDocumento === "cpf" ? mascaraCPF(documento) : mascaraCNPJ(documento)}
              onChange={handleDocumentoChange}
              placeholder={tipoDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome do responsável</label>
            <input type="text" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Telefone</label>
            <input type="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">E-mail *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          {erro && <p className="text-xs text-red-400">{erro}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-gray-400 hover:text-white">Cancelar</button>
          <button onClick={salvar} disabled={salvando}
            className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {salvando && <Loader2 size={14} className="animate-spin" />}
            {grupo ? "Atualizar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal cadastrar PARTICIPANTE (global, sem vínculo com grupo/evento)
interface ModalCadastrarParticipanteProps {
  termo: Terminologia;
  onClose: () => void;
  onSaved: () => void;
}

function ModalCadastrarParticipante({ termo, onClose, onSaved }: ModalCadastrarParticipanteProps) {
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [emailContato, setEmailContato] = useState("");
  const [termoAssinado, setTermoAssinado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [participanteExistente, setParticipanteExistente] = useState<Participante | null>(null);

  async function buscarPorCpf() {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setErro("CPF deve ter 11 dígitos.");
      return;
    }
    setBuscando(true);
    setErro(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("participantes")
      .select("*")
      .eq("documento", cpfLimpo)
      .maybeSingle();
    if (error) {
      setErro("Erro ao buscar participante.");
      setBuscando(false);
      return;
    }
    if (data) {
      setParticipanteExistente(data as Participante);
      setNome(data.nome || "");
      setDataNascimento(data.data_nascimento || "");
      setEmailContato(data.email_contato || "");
    } else {
      setParticipanteExistente(null);
      setNome("");
      setDataNascimento("");
      setEmailContato("");
    }
    setBuscando(false);
  }

  async function salvar() {
    setErro(null);
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!nome.trim()) {
      setErro(`Nome do ${termo.participante.toLowerCase()} é obrigatório.`);
      return;
    }
    if (cpfLimpo.length !== 11) {
      setErro("CPF inválido (11 dígitos).");
      return;
    }
    if (!emailContato.trim()) {
      setErro("E-mail de contato é obrigatório.");
      return;
    }
    setSalvando(true);
    const supabase = createClient();

    if (!participanteExistente) {
      const { error: insertErr } = await supabase.from("participantes").insert({
        nome: nome.trim(),
        documento: cpfLimpo,
        data_nascimento: dataNascimento || null,
        email_contato: emailContato.trim(),
        termo_assinado: termoAssinado,
      });
      if (insertErr) {
        setErro(insertErr.message);
        setSalvando(false);
        return;
      }
      // Aqui poderíamos enviar e-mail de boas-vindas, mas sem vínculo com grupo/evento.
    } else {
      setErro("Participante já existe. Atualização ainda não implementada.");
      setSalvando(false);
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-auto py-8">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
          <div>
            <h2 className="text-base font-semibold text-white">Cadastrar {termo.participante}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">CPF *</label>
            <div className="flex gap-2">
              <input type="text" value={mascaraCPF(cpf)} onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
                placeholder="000.000.000-00" maxLength={14}
                className="flex-1 bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
              <button onClick={buscarPorCpf} disabled={buscando}
                className="px-3 py-2 rounded-lg border border-axon-border text-axon-gold hover:border-axon-gold disabled:opacity-50">
                {buscando ? <Loader2 size={16} className="animate-spin" /> : "Buscar"}
              </button>
            </div>
          </div>

          {participanteExistente && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Participante já cadastrado</p>
              <p className="text-sm text-white mt-1">{participanteExistente.nome}</p>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome completo *</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} readOnly={!!participanteExistente}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Data de nascimento *</label>
            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} readOnly={!!participanteExistente}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">E-mail de contato *</label>
            <input type="email" value={emailContato} onChange={(e) => setEmailContato(e.target.value)} readOnly={!!participanteExistente}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          {!participanteExistente && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="termo" checked={termoAssinado} onChange={(e) => setTermoAssinado(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="termo" className="text-sm text-gray-300">Termo de consentimento assinado</label>
            </div>
          )}
          {erro && <p className="text-xs text-red-400">{erro}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-gray-400 hover:text-white">Cancelar</button>
          <button onClick={salvar} disabled={salvando}
            className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {salvando && <Loader2 size={14} className="animate-spin" />}
            {participanteExistente ? "Participante já existe" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente principal – página de inscrições (listagem global de grupos e participantes)
export default function InscricoesPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [termo, setTermo] = useState<Terminologia>({
    grupo: "Grupo",
    participante: "Participante",
    apresentacao: "Apresentação",
    inscricao: "Inscrição",
    organizacao: "Organização",
  });
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalGrupo, setModalGrupo] = useState(false);
  const [editarGrupo, setEditarGrupo] = useState<Grupo | null>(null);
  const [modalParticipante, setModalParticipante] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);

  const mostrarToast = useCallback((msg: string, tipo: "ok" | "erro" = "ok") => {
    setToastMsg({ msg, tipo });
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    setCarregando(true);

    const [{ data: config }, { data: gruposData }, { data: participantesData }] = await Promise.all([
      supabase.from("tenant_config").select("termo_grupo, termo_participante, termo_apresentacao, termo_inscricao, nome_organizacao").maybeSingle(),
      supabase.from("grupos").select("*").order("nome"),
      supabase.from("participantes").select("*").order("nome"),
    ]);

    if (config) {
      setTermo({
        grupo: (config as any).termo_grupo || "Grupo",
        participante: (config as any).termo_participante || "Participante",
        apresentacao: (config as any).termo_apresentacao || "Apresentação",
        inscricao: (config as any).termo_inscricao || "Inscrição",
        organizacao: (config as any).nome_organizacao || "Organização",
      });
    }

    setGrupos(gruposData ?? []);
    setParticipantes(participantesData ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const gruposFiltrados = grupos.filter(g =>
    g.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (g.responsavel ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  const participantesFiltrados = participantes.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.documento ?? "").includes(busca.replace(/\D/g, ""))
  );

  async function excluirGrupo(id: string) {
    if (!confirm("Tem certeza que deseja excluir este grupo?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("grupos").delete().eq("id", id);
    if (error) {
      mostrarToast("Erro ao excluir grupo: " + error.message, "erro");
    } else {
      mostrarToast("Grupo excluído com sucesso.");
      carregar();
    }
  }

  async function excluirParticipante(id: string) {
    if (!confirm("Tem certeza que deseja excluir este participante?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("participantes").delete().eq("id", id);
    if (error) {
      mostrarToast("Erro ao excluir participante: " + error.message, "erro");
    } else {
      mostrarToast("Participante excluído com sucesso.");
      carregar();
    }
  }

  return (
    <>
      {modalGrupo && (
        <ModalCadastrarGrupo
          termo={termo}
          grupo={editarGrupo}
          onClose={() => { setModalGrupo(false); setEditarGrupo(null); }}
          onSaved={() => { setEditarGrupo(null); carregar(); }}
        />
      )}
      {modalParticipante && (
        <ModalCadastrarParticipante
          termo={termo}
          onClose={() => setModalParticipante(false)}
          onSaved={() => { carregar(); mostrarToast(`${termo.participante} cadastrado com sucesso!`); }}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold text-white">Base de Dados</h1>
            <p className="text-sm text-gray-500">
              Gerencie grupos e participantes. Esta é a sua base global, independente de eventos.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalGrupo(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-axon-gold text-black font-bold"
            >
              <Plus size={15} /> Cadastrar {termo.grupo}
            </button>
            <button
              onClick={() => setModalParticipante(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-axon-gold text-axon-gold font-bold hover:bg-axon-gold/10"
            >
              <UserPlus size={15} /> Cadastrar {termo.participante}
            </button>
          </div>
        </div>

        <Dica>
          Cadastre grupos e participantes independentemente de eventos. Depois, ao criar um festival, você poderá inscrever grupos e vincular participantes.
        </Dica>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar ${termo.grupo.toLowerCase()} ou ${termo.participante.toLowerCase()}...`}
            className="w-full bg-axon-panel border border-axon-border rounded-lg pl-9 pr-3 py-2 text-sm text-white"
          />
        </div>

        {carregando ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-axon-panel border border-axon-border rounded-xl p-5 h-20 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Grupos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">{termo.grupo}s</h2>
                <span className="text-xs text-gray-500">{grupos.length} registros</span>
              </div>
              <div className="space-y-2">
                {gruposFiltrados.length === 0 ? (
                  <p className="text-gray-600 text-center py-8 border border-dashed rounded-xl">
                    Nenhum {termo.grupo.toLowerCase()} cadastrado.
                  </p>
                ) : (
                  gruposFiltrados.map(g => (
                    <div key={g.id} className="bg-axon-panel border border-axon-border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{g.nome}</p>
                        <p className="text-xs text-gray-500">{g.responsavel || "Sem responsável"} • {g.email}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {g.tipo_documento === "cpf" ? "CPF" : "CNPJ"}: {g.tipo_documento === "cpf" ? mascaraCPF(g.documento || "") : mascaraCNPJ(g.documento || "")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditarGrupo(g); setModalGrupo(true); }} className="p-1.5 text-gray-400 hover:text-axon-gold">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => excluirGrupo(g.id)} className="p-1.5 text-gray-400 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Lista de Participantes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">{termo.participante}s</h2>
                <span className="text-xs text-gray-500">{participantes.length} registros</span>
              </div>
              <div className="space-y-2">
                {participantesFiltrados.length === 0 ? (
                  <p className="text-gray-600 text-center py-8 border border-dashed rounded-xl">
                    Nenhum {termo.participante.toLowerCase()} cadastrado.
                  </p>
                ) : (
                  participantesFiltrados.map(p => (
                    <div key={p.id} className="bg-axon-panel border border-axon-border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{p.nome}</p>
                        <p className="text-xs text-gray-500">CPF: {mascaraCPF(p.documento || "")}</p>
                        <p className="text-xs text-gray-500">{p.email_contato}</p>
                      </div>
                      <button onClick={() => excluirParticipante(p.id)} className="p-1.5 text-gray-400 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {toastMsg && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full text-sm font-semibold shadow-xl ${toastMsg.tipo === "ok" ? "bg-axon-gold text-black" : "bg-red-500/90 text-white"}`}>
          <CheckCircle2 size={16} />
          {toastMsg.msg}
        </div>
      )}
    </>
  );
}