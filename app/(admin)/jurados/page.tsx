"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Info,
  Pencil,
  Trash2,
  Mail,
  ShieldCheck,
  Phone,
} from "lucide-react";

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
  telefone: string | null;
}

interface UsuarioExistente {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  role?: string | null;
  produtora_id?: string | null;
}

function mascaraTelefone(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (!n) return "";
  if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function mascararNome(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) => {
      const letras = Array.from(parte);
      if (letras.length <= 1) return `${parte[0] ?? "*"}***`;
      return `${letras[0]}***`;
    })
    .join(" ");
}

function Dica({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-axon-gold/5 border border-axon-gold/15 rounded-xl px-4 py-3">
      <Info size={14} className="text-axon-gold shrink-0 mt-0.5" />
      <p className="text-xs text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
}

interface ModalJuradoProps {
  termo: Terminologia;
  produtoraId: string;
  jurado?: Jurado | null;
  onClose: () => void;
  onSaved: () => void;
}

function ModalJurado({ termo, produtoraId, jurado, onClose, onSaved }: ModalJuradoProps) {
  const editando = !!jurado;

  const [nome, setNome] = useState(jurado?.nome ?? "");
  const [email, setEmail] = useState(jurado?.email ?? "");
  const [telefone, setTelefone] = useState(jurado?.telefone ? mascaraTelefone(jurado.telefone) : "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<"formulario" | "confirmacao">("formulario");
  const [copiado, setCopiado] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [usuarioExistente, setUsuarioExistente] = useState<UsuarioExistente | null>(null);
  const emailCheckRef = useRef(0);

  const colisaoEmailOutroUsuario = !!usuarioExistente && usuarioExistente.id !== jurado?.id;
  const colisaoOutroRole = colisaoEmailOutroUsuario && usuarioExistente?.role !== "jurado";
  const colisaoOutroCadastroJurado = colisaoEmailOutroUsuario && usuarioExistente?.role === "jurado";
  const camposPrivadosBloqueados = colisaoOutroRole || colisaoOutroCadastroJurado;
  const nomeExibidoContaExistente = usuarioExistente ? mascararNome(usuarioExistente.nome) : "";

  useEffect(() => {
    setNome(jurado?.nome ?? "");
    setEmail(jurado?.email ?? "");
    setTelefone(jurado?.telefone ? mascaraTelefone(jurado.telefone) : "");
    setErro(null);
    setEtapa("formulario");
    setCopiado(false);
    setUsuarioExistente(null);
    setVerificandoEmail(false);
  }, [jurado]);

  useEffect(() => {
    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !produtoraId) {
      setUsuarioExistente(null);
      setVerificandoEmail(false);
      return;
    }

    if (editando && jurado?.email?.trim().toLowerCase() === emailNormalizado) {
      setUsuarioExistente(null);
      setVerificandoEmail(false);
      return;
    }

    const currentRequest = ++emailCheckRef.current;
    setVerificandoEmail(true);

    const timer = window.setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome, email, telefone, role, produtora_id")
        .eq("email", emailNormalizado)
        .eq("produtora_id", produtoraId)
        .limit(1)
        .maybeSingle();

      if (currentRequest !== emailCheckRef.current) return;

      const existente = (data as UsuarioExistente | null) ?? null;
      setUsuarioExistente(existente);
      setVerificandoEmail(false);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [email, editando, jurado?.email, produtoraId]);

  async function salvar() {
    const supabase = createClient();
    setErro(null);

    if (!produtoraId) {
      setErro("Não foi possível identificar a produtora responsável por este cadastro.");
      return;
    }

    if (!nome.trim()) {
      setErro("Nome é obrigatório.");
      return;
    }

    if (!email.trim()) {
      setErro("E-mail é obrigatório para enviar o convite.");
      return;
    }

    if (camposPrivadosBloqueados) {
      if (colisaoOutroRole) {
        setErro("Este e-mail já pertence a outra conta com perfil diferente. Para proteger os dados, use outro e-mail.");
      } else {
        setErro("Já existe um jurado com este e-mail no cadastro central da produtora. Use o cadastro existente.");
      }
      return;
    }

    setSalvando(true);

    if (editando && jurado) {
      const payloadAtualizacao: { nome: string; email: string; telefone: string | null } = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.replace(/\D/g, "") || null,
      };

      const { error } = await supabase
        .from("usuarios")
        .update(payloadAtualizacao)
        .eq("id", jurado.id)
        .eq("produtora_id", produtoraId)
        .eq("role", "jurado");

      if (error) {
        setErro("Erro ao atualizar o cadastro do jurado.");
        setSalvando(false);
        return;
      }

      setSalvando(false);
      onSaved();
      onClose();
      return;
    }

    const isFest = typeof window !== "undefined" && window.location.pathname.startsWith("/fest");
    const urlConvite = isFest ? "/fest/api/convite" : "/api/convite";

    const res = await fetch(urlConvite, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, "") || null,
        role: "jurado",
        produtora_id: produtoraId,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setErro(json.error || "Erro ao enviar convite.");
      setSalvando(false);
      return;
    }

    const { data: usuarioCriado, error: usuarioError } = await supabase
      .from("usuarios")
      .select("id, produtora_id")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (usuarioError || !usuarioCriado) {
      setErro("Usuário convidado, mas não foi possível localizar o cadastro criado.");
      setSalvando(false);
      return;
    }

    // Se o usuário foi criado no Auth mas o banco ainda não vinculou a produtora, vinculamos aqui
    if (!usuarioCriado.produtora_id) {
      await supabase
        .from("usuarios")
        .update({ produtora_id: produtoraId })
        .eq("id", usuarioCriado.id);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
          <div>
            <h2 className="text-base font-semibold text-white">
              {etapa === "formulario" ? (editando ? "Editar Jurado" : "Adicionar Jurado") : "Jurado cadastrado"}
            </h2>
            {etapa === "formulario" && (
              <p className="text-xs text-gray-500 mt-0.5">
                {editando
                  ? "Atualize os dados centrais do jurado cadastrados na produtora."
                  : "Um convite por e-mail será enviado automaticamente e o jurado será cadastrado no cadastro central da produtora."}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Fechar modal">
            <X size={18} />
          </button>
        </div>

        {etapa === "formulario" && (
          <>
            <div className="p-6 space-y-4">
              <Dica>
                {editando
                  ? "Edite os dados globais do jurado. Os campos privados só serão bloqueados se o e-mail informado colidir com outro cadastro protegido."
                  : "Preencha os dados do jurado. Ele receberá um e-mail com o link para criar a senha e entrar no portal do jurado."}
              </Dica>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do jurado"
                  disabled={camposPrivadosBloqueados}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">E-mail *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    disabled={camposPrivadosBloqueados}
                    className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {verificandoEmail && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />}
                  {!verificandoEmail && usuarioExistente && (
                    <ShieldCheck size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-axon-gold" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                  placeholder="(21) 99999-9999"
                  disabled={camposPrivadosBloqueados}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {usuarioExistente && usuarioExistente.id !== jurado?.id && (
                <div className="flex items-start gap-3 p-4 bg-axon-gold/10 border border-axon-gold/20 rounded-lg">
                  <Mail size={16} className="text-axon-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium">
                      {colisaoOutroRole ? "Conta protegida encontrada" : "Cadastro existente encontrado"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {colisaoOutroRole
                        ? "Este e-mail já está associado a uma conta com papel diferente dentro da mesma produtora. Para proteger dados privados, esse formulário não pode sobrescrever esse cadastro."
                        : "Já existe um jurado com este e-mail no cadastro central da produtora. Os dados privados desse cadastro não podem ser sobrescritos por este formulário."}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Cadastro identificado: <span className="text-gray-300">{nomeExibidoContaExistente}</span>
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-600 -mt-1">
                Este cadastro é centralizado por produtora e será reutilizado em outros fluxos internos do sistema.
              </p>

              {erro && (
                <p className="flex items-start gap-2 text-xs text-red-400">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /> {erro}
                </p>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando || verificandoEmail}
                className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {salvando && <Loader2 size={14} className="animate-spin" />}
                {editando ? "Salvar alterações" : "Cadastrar Jurado"}
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
                  <p className="text-sm font-medium text-white">{nome} cadastrado com sucesso</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Convite enviado para <span className="text-white">{email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={copiarLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-all duration-200"
                >
                  {copiado ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  {copiado ? "Link copiado" : "Copiar link do portal do jurado"}
                </button>

                <button
                  onClick={abrirWhatsApp}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-all duration-200"
                >
                  <MessageCircle size={15} />
                  Enviar pelo WhatsApp
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-axon-border">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 active:scale-95 transition-all duration-200"
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

interface ConfirmarExclusaoJuradoProps {
  jurado: Jurado;
  onClose: () => void;
  onConfirmar: () => Promise<void>;
}

function ConfirmarExclusaoJurado({ jurado, onClose, onConfirmar }: ConfirmarExclusaoJuradoProps) {
  const [excluindo, setExcluindo] = useState(false);

  async function handleConfirmar() {
    setExcluindo(true);
    await onConfirmar();
    setExcluindo(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-axon-panel border border-red-500/20 rounded-xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
          <h2 className="text-base font-semibold text-white">Excluir jurado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Fechar modal">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <Trash2 size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Excluir {jurado.nome} do cadastro de jurados</p>
              <p className="text-xs text-gray-400 mt-1">
                Esta ação remove definitivamente o jurado do cadastro centralizado da produtora.
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Use esta ação apenas quando o cadastro realmente não precisar mais existir na base central de jurados.
          </p>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
          <button
            onClick={onClose}
            disabled={excluindo}
            className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={excluindo}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-400 active:scale-95 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {excluindo && <Loader2 size={14} className="animate-spin" />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JuradosPage() {
  const [termo, setTermo] = useState<Terminologia>({
    grupo: "Grupo",
    participante: "Participante",
    apresentacao: "Apresentação",
    organizacao: "Organização",
  });
  const [produtoraId, setProdutoraId] = useState("");
  const [jurados, setJurados] = useState<Jurado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalJuradoAberta, setModalJuradoAberta] = useState(false);
  const [juradoEmEdicao, setJuradoEmEdicao] = useState<Jurado | null>(null);
  const [juradoExclusao, setJuradoExclusao] = useState<Jurado | null>(null);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let produtoraIdAtual = "";

    if (user) {
      const { data: usuarioAuth } = await supabase
        .from("usuarios")
        .select("produtora_id")
        .eq("id", user.id)
        .maybeSingle();

      produtoraIdAtual = (usuarioAuth as { produtora_id?: string | null } | null)?.produtora_id ?? "";
      setProdutoraId(produtoraIdAtual);
    } else {
      setProdutoraId("");
    }

    const { data: config } = await supabase
      .from("tenant_config")
      .select("termo_grupo, termo_participante, termo_apresentacao, nome_organizacao")
      .maybeSingle();

    if (config) {
      setTermo({
        grupo: (config as Record<string, string>).termo_grupo ?? "Grupo",
        participante: (config as Record<string, string>).termo_participante ?? "Participante",
        apresentacao: (config as Record<string, string>).termo_apresentacao ?? "Apresentação",
        organizacao: (config as Record<string, string>).nome_organizacao ?? "Organização",
      });
    }

    if (!produtoraIdAtual) {
      setJurados([]);
      setCarregando(false);
      return;
    }

    const { data: usuariosData } = await supabase
      .from("usuarios")
      .select("id, nome, email, telefone")
      .eq("role", "jurado")
      .eq("produtora_id", produtoraIdAtual)
      .order("nome");

    setJurados(
      (((usuariosData as UsuarioExistente[] | null) ?? []).map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone ?? null,
      })) as Jurado[])
    );

    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluirJurado(jurado: Jurado | null) {
    if (!jurado || !produtoraId) return;

    const supabase = createClient();

    await supabase
      .from("usuarios")
      .delete()
      .eq("id", jurado.id)
      .eq("produtora_id", produtoraId)
      .eq("role", "jurado");

    setJuradoExclusao(null);
    await carregar();
  }

  return (
    <>
      {modalJuradoAberta && (
        <ModalJurado
          termo={termo}
          produtoraId={produtoraId}
          jurado={juradoEmEdicao}
          onClose={() => {
            setModalJuradoAberta(false);
            setJuradoEmEdicao(null);
          }}
          onSaved={carregar}
        />
      )}

      {juradoExclusao && (
        <ConfirmarExclusaoJurado
          jurado={juradoExclusao}
          onClose={() => setJuradoExclusao(null)}
          onConfirmar={() => excluirJurado(juradoExclusao)}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-white">Cadastro de Jurados</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie os jurados cadastrados centralmente na produtora.
            </p>
          </div>

          <button
            onClick={() => {
              setJuradoEmEdicao(null);
              setModalJuradoAberta(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0"
          >
            <Plus size={15} />
            Adicionar Jurado
          </button>
        </div>

        <Dica>
          Jurados cadastrados aqui compõem o <strong>cadastro central</strong> da produtora e poderão ser reutilizados em outros fluxos do sistema sem depender desta página de eventos.
        </Dica>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Jurados cadastrados", valor: jurados.length, icon: Users, cor: "text-white" },
            {
              label: "Com e-mail",
              valor: jurados.filter((j) => Boolean(j.email)).length,
              icon: Mail,
              cor: "text-axon-gold",
            },
            {
              label: "Com telefone",
              valor: jurados.filter((j) => Boolean(j.telefone)).length,
              icon: Phone,
              cor: "text-emerald-400",
            },
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

        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-600" />
          </div>
        ) : jurados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-axon-border rounded-xl text-gray-600 px-6 text-center">
            <Users size={36} className="mb-3 opacity-20 text-axon-gold" />
            <p className="font-medium text-gray-300">Nenhum jurado cadastrado</p>
            <p className="text-sm mt-1 text-gray-500 max-w-lg">
              Ainda não há jurados no cadastro central da produtora. Cadastre o primeiro jurado agora.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
              <button
                onClick={() => {
                  setJuradoEmEdicao(null);
                  setModalJuradoAberta(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-axon-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-all duration-200"
              >
                <Plus size={15} />
                Cadastrar Novo Jurado
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {jurados.map((j) => (
              <div
                key={j.id}
                className="bg-axon-panel border border-axon-border rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap hover:border-gray-600 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{j.nome}</p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 mt-1">
                    <p className="text-xs text-gray-500 break-all">{j.email}</p>
                    {j.telefone && <p className="text-xs text-gray-600">{mascaraTelefone(j.telefone)}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setJuradoEmEdicao(j);
                      setModalJuradoAberta(true);
                    }}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                    title="Editar jurado"
                    aria-label={`Editar ${j.nome}`}
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => setJuradoExclusao(j)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                    title="Excluir jurado"
                    aria-label={`Excluir ${j.nome}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}