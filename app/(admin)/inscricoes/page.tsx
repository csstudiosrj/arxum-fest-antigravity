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

type StatusPagamento = "pago" | "pendente";

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
  email_contato: string | null;
  documento: string | null;
  tipo_documento: "cpf" | "cnpj" | null;
}

interface Participante {
  id: string;
  nome: string;
  documento: string | null; // CPF apenas, 11 dígitos
  data_nascimento: string;
  termo_assinado: boolean;
  email_contato: string | null;
  confirmado_vinculo: boolean;
  status_disponibilidade: string;
}

interface Apresentacao {
  id: string;
  nome: string;
  grupo_id: string | null;
  tipo: string;
  quantidade_bailarinos: number;
  valor_total: number;
  status_pagamento: StatusPagamento;
  created_at: string;
  evento_id: string;
}

interface GrupoComDados extends Grupo {
  apresentacoes: Apresentacao[];
  participantes: Participante[];
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

// Modal cadastrar GRUPO (com CPF/CNPJ)
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

    const dadosGrupo = {
      nome: nome.trim(),
      responsavel: responsavel.trim() || null,
      telefone: telefone.trim() || null,
      email: email.trim(),
      tipo_documento: tipoDocumento,
      documento: docLimpo,
    };

    if (grupo) {
      const { error } = await supabase
        .from("grupos")
        .update(dadosGrupo)
        .eq("id", grupo.id);
      if (error) {
        setErro(error.message);
        setSalvando(false);
        return;
      }
      onSaved();
      onClose();
      setSalvando(false);
      return;
    }

    const { error: grupoErr } = await supabase.from("grupos").insert(dadosGrupo);
    if (grupoErr) {
      setErro(grupoErr.message);
      setSalvando(false);
      return;
    }

    await fetch("/api/convite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        nome: responsavel.trim() || nome.trim(),
        role: "org_admin",
      }),
    }).catch(() => {});

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
          {/* Nome do Grupo */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome do {termo.grupo.toLowerCase()} *</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white" />
          </div>

          {/* Tipo de Documento do Grupo */}
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

          {/* Documento */}
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

// Modal cadastrar PARTICIPANTE (apenas CPF, obrigatório)
interface ModalCadastrarParticipanteProps {
  termo: Terminologia;
  grupoId: string;
  grupoNome: string;
  eventoId: string;
  onClose: () => void;
  onSaved: () => void;
}

function ModalCadastrarParticipante({
  termo,
  grupoId,
  grupoNome,
  eventoId,
  onClose,
  onSaved,
}: ModalCadastrarParticipanteProps) {
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

    let participanteId = participanteExistente?.id;
    if (!participanteExistente) {
      const { data: novo, error: insertErr } = await supabase
        .from("participantes")
        .insert({
          nome: nome.trim(),
          documento: cpfLimpo,
          data_nascimento: dataNascimento || null,
          email_contato: emailContato.trim(),
          termo_assinado: termoAssinado,
          confirmado_vinculo: false,
          status_disponibilidade: "disponivel",
        })
        .select()
        .single();
      if (insertErr) {
        setErro(insertErr.message);
        setSalvando(false);
        return;
      }
      participanteId = novo.id;
    }

    const { data: vinculo, error: vinculoErr } = await supabase
      .from("participacoes_participante_grupo_evento")
      .insert({
        participante_id: participanteId,
        grupo_id: grupoId,
        evento_id: eventoId,
        confirmado: false,
        status_disponibilidade: "disponivel",
      })
      .select()
      .single();

    if (vinculoErr) {
      setErro(vinculoErr.message);
      setSalvando(false);
      return;
    }

    const token = crypto.randomUUID();
    await supabase
      .from("participacoes_participante_grupo_evento")
      .update({ token_confirmacao: token })
      .eq("id", vinculo.id);

    try {
      await fetch("/api/enviar-confirmacao-participante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailContato.trim(),
          nome: nome.trim(),
          grupoNome: grupoNome,
          token: token,
        }),
      });
    } catch (err) {
      console.error("Erro ao enviar e-mail:", err);
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
            <p className="text-xs text-gray-500">Grupo: {grupoNome}</p>
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
              <label htmlFor="termo" className="text-sm text-gray-300">Termo de consentimento assinado *</label>
            </div>
          )}
          {erro && <p className="text-xs text-red-400">{erro}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-gray-400 hover:text-white">Cancelar</button>
          <button onClick={salvar} disabled={salvando}
            className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {salvando && <Loader2 size={14} className="animate-spin" />}
            {participanteExistente ? "Vincular" : "Cadastrar e vincular"}
          </button>
        </div>
      </div>
    </div>
  );
}

// CardGrupo (sem alterações, apenas ajuste para exibir CPF/CNPJ se desejar – não necessário)
interface CardGrupoProps {
  grupo: GrupoComDados;
  termo: Terminologia;
  onEdit: (grupo: GrupoComDados) => void;
  onDelete: (grupo: GrupoComDados) => void;
  onAddParticipante: (groupId: string, groupName: string, eventoId: string) => void;
  eventoId: string;
}

function CardGrupo({ grupo, termo, onEdit, onDelete, onAddParticipante, eventoId }: CardGrupoProps) {
  const [expandido, setExpandido] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"apresentacoes" | "participantes">("apresentacoes");

  const totalApres = grupo.apresentacoes.length;
  const totalParticipantes = grupo.participantes.length;
  const totalValor = grupo.apresentacoes.reduce((acc, c) => acc + (c.valor_total ?? 0), 0);
  const totalPago = grupo.apresentacoes.filter(c => c.status_pagamento === "pago").reduce((acc, c) => acc + (c.valor_total ?? 0), 0);
  const totalPendente = totalValor - totalPago;
  const tudoPago = totalPendente === 0 && totalApres > 0;

  return (
    <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
      <div role="button" onClick={() => setExpandido(!expandido)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] cursor-pointer">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-white truncate">{grupo.nome}</span>
            {tudoPago ? <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Quitado</span> :
              totalPendente > 0 && <span className="text-xs bg-axon-gold/10 text-axon-gold px-2 py-0.5 rounded-full">Pendente</span>}
          </div>
          {grupo.responsavel && <p className="text-xs text-gray-500 mt-0.5">{grupo.responsavel}</p>}
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <div className="text-center"><p className="text-xs text-gray-500">{termo.apresentacao}s</p><p className="text-sm font-semibold text-white">{totalApres}</p></div>
          <div className="text-center"><p className="text-xs text-gray-500">{termo.participante}s</p><p className="text-sm font-semibold text-white">{totalParticipantes}</p></div>
          <div className="text-center"><p className="text-xs text-gray-500">Total</p><p className="text-sm font-semibold text-white">{formatMoeda(totalValor)}</p></div>
          {totalPendente > 0 && <div className="text-center"><p className="text-xs text-gray-500">A receber</p><p className="text-sm font-semibold text-axon-gold">{formatMoeda(totalPendente)}</p></div>}
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit(grupo)} className="p-2 text-gray-400 hover:text-axon-gold"><Pencil size={15} /></button>
          <button onClick={() => onDelete(grupo)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={15} /></button>
          <div className="text-gray-500">{expandido ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
        </div>
      </div>
      {expandido && (
        <div className="border-t border-axon-border">
          <div className="flex border-b border-axon-border px-5">
            {(["apresentacoes", "participantes"] as const).map(aba => (
              <button key={aba} onClick={() => setAbaAtiva(aba)}
                className={`px-4 py-3 text-xs font-medium border-b-2 ${abaAtiva === aba ? "border-axon-gold text-axon-gold" : "border-transparent text-gray-500 hover:text-white"}`}>
                {aba === "apresentacoes" ? `${termo.apresentacao}s` : `${termo.participante}s`}
              </button>
            ))}
          </div>
          <div className="p-5">
            {abaAtiva === "apresentacoes" && (grupo.apresentacoes.length === 0 ? <p className="text-gray-600 text-center py-6">Nenhuma {termo.apresentacao.toLowerCase()} inscrita.</p> :
              grupo.apresentacoes.map(c => (
                <div key={c.id} className="bg-axon-bg border border-axon-border rounded-lg p-4 mb-3">
                  <div className="flex justify-between">
                    <div><p className="text-sm font-semibold text-white">{c.nome}</p><p className="text-xs text-gray-500">{c.tipo} · {c.quantidade_bailarinos} participantes</p></div>
                    <div className="text-right"><p className="text-sm font-semibold text-white">{formatMoeda(c.valor_total)}</p><span className={`text-xs ${c.status_pagamento === "pago" ? "text-emerald-400" : "text-axon-gold"}`}>{c.status_pagamento === "pago" ? "Pago" : "Pendente"}</span></div>
                  </div>
                </div>
              ))
            )}
            {abaAtiva === "participantes" && (
              <div>
                <div className="flex justify-end mb-3">
                  <button onClick={() => onAddParticipante(grupo.id, grupo.nome, eventoId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-axon-gold/10 border border-axon-gold/30 text-axon-gold text-xs font-medium">
                    <UserPlus size={14} /> Cadastrar {termo.participante.toLowerCase()}
                  </button>
                </div>
                {grupo.participantes.length === 0 ? <p className="text-gray-600 text-center py-6">Nenhum participante vinculado.</p> :
                  grupo.participantes.map(p => (
                    <div key={p.id} className="bg-axon-bg border border-axon-border rounded-lg px-4 py-3 mb-2">
                      <div className="flex justify-between">
                        <div><p className="text-sm font-medium text-white">{p.nome}</p><p className="text-xs text-gray-500 tabular-nums">{mascaraCPF(p.documento || "")}</p></div>
                        <div className="flex items-center gap-2">
                          {p.confirmado_vinculo ? <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> Confirmado</span> :
                            <span className="text-xs text-amber-400 flex items-center gap-1"><MailCheck size={11} /> Pendente</span>}
                          {p.status_disponibilidade === "indisponivel" && <span className="text-xs text-red-400">Indisponível</span>}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ModalConfirmarExclusao({ grupo, onConfirmar, onCancelar, excluindo, erro }: any) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-axon-panel border border-red-500/30 rounded-2xl w-full max-w-sm p-6">
        <div className="text-center"><div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-400" /></div>
          <h2 className="text-lg font-semibold text-white">Excluir {grupo.nome}?</h2><p className="text-sm text-gray-400 mt-1">Remove a inscrição e todos os dados deste festival.</p></div>
        {erro && <div className="bg-red-500/10 p-3 rounded text-sm text-red-300 my-4">{erro}</div>}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancelar} className="py-3 rounded-xl border border-axon-border text-gray-400">Cancelar</button>
          <button onClick={onConfirmar} disabled={excluindo} className="py-3 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center gap-2">
            {excluindo ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {excluindo ? "Excluindo..." : "Sim, excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InscricoesPage() {
  const [gruposComDados, setGruposComDados] = useState<GrupoComDados[]>([]);
  const [termo, setTermo] = useState<Terminologia>({ grupo: "Grupo", participante: "Participante", apresentacao: "Apresentação", inscricao: "Inscrição", organizacao: "Organização" });
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalGrupo, setModalGrupo] = useState(false);
  const [editarGrupo, setEditarGrupo] = useState<Grupo | null>(null);
  const [grupoExcluir, setGrupoExcluir] = useState<GrupoComDados | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);
  const [kpis, setKpis] = useState({ grupos: 0, apresentacoes: 0, participantes: 0, totalPago: 0, totalPendente: 0 });
  const [modalParticipante, setModalParticipante] = useState<{ groupId: string; groupName: string; eventoId: string } | null>(null);
  const [eventoAtualId, setEventoAtualId] = useState("");

  const mostrarToast = useCallback((msg: string, tipo: "ok" | "erro" = "ok") => {
    setToastMsg({ msg, tipo });
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    setCarregando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCarregando(false); return; }
    const { data: userData } = await supabase.from("usuarios").select("produtora_id").eq("id", user.id).single();
    const produtoraId = userData?.produtora_id;
    if (!produtoraId) { setCarregando(false); return; }
    const { data: eventoAtual } = await supabase.from("eventos").select("id").eq("produtora_id", produtoraId).limit(1).single();
    if (!eventoAtual) { setCarregando(false); return; }
    setEventoAtualId(eventoAtual.id);

    const [{ data: config }, { data: grupos }, { data: inscricoesGrupo }, { data: apres }, { data: participacoes }, { data: participantesAll }] = await Promise.all([
      supabase.from("tenant_config").select("termo_grupo, termo_participante, termo_apresentacao, termo_inscricao, nome_organizacao").maybeSingle(),
      supabase.from("grupos").select("*").order("nome"),
      supabase.from("inscricoes_grupo_evento").select("*").eq("evento_id", eventoAtual.id),
      supabase.from("apresentacoes").select("*").eq("evento_id", eventoAtual.id),
      supabase.from("participacoes_participante_grupo_evento").select("*").eq("evento_id", eventoAtual.id),
      supabase.from("participantes").select("*"),
    ]);

    if (config) setTermo({ ...termo, grupo: config.termo_grupo || "Grupo", participante: config.termo_participante || "Participante", apresentacao: config.termo_apresentacao || "Apresentação", inscricao: config.termo_inscricao || "Inscrição", organizacao: config.nome_organizacao || "Organização" });

    const gruposArr = grupos ?? [];
    const inscricoesArr = inscricoesGrupo ?? [];
    const apresArr = apres ?? [];
    const participacoesArr = participacoes ?? [];
    const participantesAllArr = participantesAll ?? [];

    const gruposInscritos = gruposArr.filter(g => inscricoesArr.some(i => i.grupo_id === g.id));
    const compostos = gruposInscritos.map(g => ({
      ...g,
      apresentacoes: apresArr.filter(a => a.grupo_id === g.id),
      participantes: participantesAllArr.filter(p => participacoesArr.some(pp => pp.participante_id === p.id && pp.grupo_id === g.id)),
    }));
    setGruposComDados(compostos);
    const totalPago = apresArr.filter(a => a.status_pagamento === "pago").reduce((s, a) => s + (a.valor_total ?? 0), 0);
    const totalPendente = apresArr.filter(a => a.status_pagamento === "pendente").reduce((s, a) => s + (a.valor_total ?? 0), 0);
    setKpis({ grupos: gruposInscritos.length, apresentacoes: apresArr.length, participantes: participacoesArr.length, totalPago, totalPendente });
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrados = gruposComDados.filter(g => g.nome.toLowerCase().includes(busca.toLowerCase()) || (g.responsavel ?? "").toLowerCase().includes(busca.toLowerCase()));

  async function confirmarExcluir() {
    const supabase = createClient();
    if (!grupoExcluir) return;
    setErroExcluir(null);
    setExcluindo(true);
    await supabase.from("inscricoes_grupo_evento").delete().eq("grupo_id", grupoExcluir.id).eq("evento_id", eventoAtualId);
    await supabase.from("apresentacoes").delete().eq("grupo_id", grupoExcluir.id).eq("evento_id", eventoAtualId);
    await supabase.from("participacoes_participante_grupo_evento").delete().eq("grupo_id", grupoExcluir.id).eq("evento_id", eventoAtualId);
    setGrupoExcluir(null);
    setExcluindo(false);
    mostrarToast("Grupo removido do festival.");
    carregar();
  }

  return (
    <>
      {modalGrupo && <ModalCadastrarGrupo termo={termo} grupo={editarGrupo} onClose={() => { setModalGrupo(false); setEditarGrupo(null); }} onSaved={() => { setEditarGrupo(null); carregar(); }} />}
      {modalParticipante && <ModalCadastrarParticipante termo={termo} grupoId={modalParticipante.groupId} grupoNome={modalParticipante.groupName} eventoId={eventoAtualId} onClose={() => setModalParticipante(null)} onSaved={() => { carregar(); mostrarToast(`${termo.participante} cadastrado com sucesso!`); }} />}
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex justify-between items-start">
          <div><h1 className="text-xl font-semibold text-white">{termo.inscricao}s e Elenco</h1><p className="text-sm text-gray-500">Gerencie grupos, apresentações e participantes.</p></div>
          <button onClick={() => setModalGrupo(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-axon-gold text-black font-bold"><Plus size={15} /> Cadastrar {termo.grupo}</button>
        </div>
        <Dica>Cadastre grupos e envie convite. Use o botão "Cadastrar participante" dentro de cada grupo para inclusão emergencial.</Dica>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[{ label: `${termo.grupo}s`, value: kpis.grupos, icon: Users }, { label: `${termo.apresentacao}s`, value: kpis.apresentacoes, icon: Music4 }, { label: `${termo.participante}s`, value: kpis.participantes, icon: Users }, { label: "Total pago", value: formatMoeda(kpis.totalPago), icon: CircleDollarSign, cor: "green" }, { label: "A receber", value: formatMoeda(kpis.totalPendente), icon: CircleDollarSign, cor: "gold" }].map(({ label, value, icon: Icon, cor }) => (
            <div key={label} className="bg-axon-panel border border-axon-border rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><Icon size={14} className={cor === "green" ? "text-emerald-400" : cor === "gold" ? "text-axon-gold" : "text-gray-500"} /><p className="text-xs text-gray-500">{label}</p></div><p className={`text-lg font-semibold ${cor === "green" ? "text-emerald-400" : cor === "gold" ? "text-axon-gold" : "text-white"}`}>{value}</p></div>
          ))}
        </div>
        <div className="relative max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder={`Buscar ${termo.grupo.toLowerCase()}...`} className="w-full bg-axon-panel border border-axon-border rounded-lg pl-9 pr-3 py-2 text-sm text-white" /></div>
        {carregando ? <div className="space-y-3">{Array(3).fill(0).map((_,i)=><div key={i} className="bg-axon-panel border border-axon-border rounded-xl p-5 h-20 animate-pulse"></div>)}</div> : filtrados.length === 0 ? <div className="text-center py-16 border border-dashed rounded-xl text-gray-600"><Users size={36} className="mx-auto mb-3 opacity-20" /><p className="font-medium">Nenhum grupo encontrado</p></div> : <div className="space-y-3">{filtrados.map(g => <CardGrupo key={g.id} grupo={g} termo={termo} onEdit={(g)=>{setEditarGrupo(g); setModalGrupo(true);}} onDelete={setGrupoExcluir} onAddParticipante={(id,name)=>setModalParticipante({groupId:id, groupName:name, eventoId:eventoAtualId})} eventoId={eventoAtualId} />)}</div>}
      </div>
      {grupoExcluir && <ModalConfirmarExclusao grupo={grupoExcluir} onConfirmar={confirmarExcluir} onCancelar={()=>{setGrupoExcluir(null); setErroExcluir(null);}} excluindo={excluindo} erro={erroExcluir} />}
      {toastMsg && <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full text-sm font-semibold shadow-xl ${toastMsg.tipo === "ok" ? "bg-axon-gold text-black" : "bg-red-500/90 text-white"}`}><CheckCircle2 size={16} />{toastMsg.msg}</div>}
    </>
  );
}