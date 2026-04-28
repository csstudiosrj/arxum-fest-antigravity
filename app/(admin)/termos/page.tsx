"use client";

import { useState, useEffect } from "react";
import {
  FileSignature, FileText, Users, Save,
  CheckCircle, Clock, XCircle, Copy,
  Send, ChevronDown, ChevronUp, Shield,
  Check, AlertTriangle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Documento {
  id: string;
  tipo: "regulamento" | "uso_imagem" | "responsabilidade_medica";
  titulo: string;
  conteudo: string;
  versao: number;
  ativo: boolean;
  atualizado_em: string;
}

interface AceiteStatus {
  participante_id: string;
  participante_nome: string;
  escola_nome: string;
  escola_aceite: boolean;
  imagem_aceite: boolean;
  imagem_aceito_em: string | null;
  imagem_assinante: string | null;
}

// ─── Badge de Status ──────────────────────────────────────────────────────────

function BadgeStatus({ aceito, label }: { aceito: boolean; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        aceito
          ? "bg-axon-green/10 text-axon-green border border-axon-green/30"
          : "bg-red-500/10 text-red-400 border border-red-500/30"
      }`}
    >
      {aceito ? <CheckCircle size={12} /> : <Clock size={12} />}
      {label ?? (aceito ? "Assinado" : "Pendente")}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, visivel }: { msg: string; visivel: boolean }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-axon-green text-black px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg z-50 transition-all duration-300 ${
        visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <Check size={16} />
      {msg}
    </div>
  );
}

// ─── Aba: Regulamento ─────────────────────────────────────────────────────────

function AbaRegulamento({
  documento,
  onSalvar,
  salvando,
}: {
  documento: Documento | null;
  onSalvar: (conteudo: string) => void;
  salvando: boolean;
}) {
  const [conteudo, setConteudo] = useState(documento?.conteudo ?? "");

  useEffect(() => {
    if (documento) setConteudo(documento.conteudo);
  }, [documento]);

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-axon-bg border border-axon-border rounded-xl p-4 flex items-start gap-3">
        <Shield size={20} className="text-axon-green mt-0.5 shrink-0" />
        <div>
          <p className="text-white font-medium text-sm">Aceite Obrigatório com Registro</p>
          <p className="text-gray-400 text-sm mt-0.5">
            O coordenador da escola deverá marcar "Li e concordo" antes de finalizar
            qualquer inscrição. O sistema registra IP, data e hora como prova legal.
          </p>
        </div>
      </div>

      {documento && (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Versão {documento.versao}</span>
          <span>·</span>
          <span>Última atualização: {new Date(documento.atualizado_em).toLocaleDateString("pt-BR")}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Texto do Regulamento Oficial
        </label>
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          className="w-full h-96 bg-axon-bg border border-axon-border rounded-xl p-4 text-gray-300 focus:outline-none focus:border-axon-green resize-none font-mono text-sm leading-relaxed"
          placeholder="Cole aqui o texto completo do regulamento do festival..."
        />
      </div>

      <button
        onClick={() => onSalvar(conteudo)}
        disabled={salvando || !conteudo.trim()}
        className="flex items-center gap-2 bg-axon-green text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#00c866] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Save size={16} />
        {salvando ? "Salvando..." : "Salvar Regulamento"}
      </button>
    </div>
  );
}

// ─── Aba: Uso de Imagem ───────────────────────────────────────────────────────

function AbaUsoImagem({
  documento,
  onSalvar,
  salvando,
}: {
  documento: Documento | null;
  onSalvar: (conteudo: string) => void;
  salvando: boolean;
}) {
  const [conteudo, setConteudo] = useState(documento?.conteudo ?? "");
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    if (documento) setConteudo(documento.conteudo);
  }, [documento]);

  const linkPublico = typeof window !== "undefined"
    ? `${window.location.origin}/assinar/imagem`
    : "/assinar/imagem";

  const copiarLink = () => {
    navigator.clipboard.writeText(linkPublico);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Fluxo de assinatura */}
      <div className="bg-axon-bg border border-axon-border rounded-xl p-5 space-y-4">
        <p className="text-white font-medium text-sm">Como funciona a assinatura dos responsáveis</p>
        <div className="flex items-start gap-3">
          {[
            { n: "1", txt: "O coreógrafo copia o link abaixo e envia no WhatsApp dos pais." },
            { n: "2", txt: "O pai/responsável clica, lê o termo e assina digitalmente." },
            { n: "3", txt: "O sistema registra nome, e-mail, IP e data/hora automaticamente." },
          ].map(({ n, txt }) => (
            <div key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-axon-green/20 text-axon-green text-xs font-bold flex items-center justify-center shrink-0">
                {n}
              </span>
              <p className="text-gray-400 text-sm">{txt}</p>
            </div>
          ))}
        </div>

        {/* Link público */}
        <div className="flex items-center gap-2 bg-axon-panel border border-axon-border rounded-lg p-3">
          <span className="flex-1 text-xs text-axon-green font-mono truncate">{linkPublico}</span>
          <button
            onClick={copiarLink}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded border border-axon-border"
          >
            {linkCopiado ? <Check size={12} className="text-axon-green" /> : <Copy size={12} />}
            {linkCopiado ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Texto do Termo de Uso de Imagem e Responsabilidade Médica
        </label>
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          className="w-full h-72 bg-axon-bg border border-axon-border rounded-xl p-4 text-gray-300 focus:outline-none focus:border-axon-green resize-none font-mono text-sm leading-relaxed"
          placeholder="Cole aqui o texto completo do Termo de Uso de Imagem e Responsabilidade Médica..."
        />
      </div>

      <button
        onClick={() => onSalvar(conteudo)}
        disabled={salvando || !conteudo.trim()}
        className="flex items-center gap-2 bg-axon-green text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#00c866] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Save size={16} />
        {salvando ? "Salvando..." : "Salvar Termo"}
      </button>
    </div>
  );
}

// ─── Aba: Status de Assinaturas ───────────────────────────────────────────────

function AbaStatus({ aceites }: { aceites: AceiteStatus[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "pendentes" | "assinados">("todos");

  const filtrados = aceites.filter((a) => {
    const matchBusca =
      a.participante_nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.escola_nome.toLowerCase().includes(busca.toLowerCase());
    if (filtro === "pendentes") return matchBusca && !a.imagem_aceite;
    if (filtro === "assinados") return matchBusca && a.imagem_aceite;
    return matchBusca;
  });

  const pendentes = aceites.filter((a) => !a.imagem_aceite).length;
  const assinados = aceites.filter((a) => a.imagem_aceite).length;

  return (
    <div className="space-y-5">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", valor: aceites.length, cor: "text-white" },
          { label: "Assinados", valor: assinados, cor: "text-axon-green" },
          { label: "Pendentes", valor: pendentes, cor: "text-red-400" },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="bg-axon-bg border border-axon-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros + Busca */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar participante ou escola..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-green placeholder:text-gray-600"
        />
        <div className="flex bg-axon-bg border border-axon-border rounded-lg overflow-hidden">
          {(["todos", "pendentes", "assinados"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
                filtro === f ? "bg-axon-panel text-white" : "text-gray-500 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600 gap-3">
          <Users size={36} className="opacity-30" />
          <p className="text-sm">
            {aceites.length === 0
              ? "Nenhum participante inscrito ainda."
              : "Nenhum resultado para esta busca."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((a) => (
            <div
              key={a.participante_id}
              className="flex items-center justify-between bg-axon-bg border border-axon-border rounded-xl px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{a.participante_nome}</p>
                <p className="text-xs text-gray-500">{a.escola_nome}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* Regulamento (escola) */}
                <div className="text-center hidden sm:block">
                  <p className="text-xs text-gray-600 mb-1">Regulamento</p>
                  <BadgeStatus aceito={a.escola_aceite} />
                </div>

                {/* Termo de Imagem */}
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Uso de Imagem</p>
                  <BadgeStatus aceito={a.imagem_aceite} />
                </div>

                {/* Credencial */}
                <div className="text-center hidden md:block">
                  <p className="text-xs text-gray-600 mb-1">Credencial</p>
                  {a.escola_aceite && a.imagem_aceite ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-axon-green/10 text-axon-green border border-axon-green/30">
                      <CheckCircle size={12} /> Liberar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                      <XCircle size={12} /> Barrar
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendentes > 0 && (
        <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-500/80">
            <strong className="text-yellow-400">{pendentes} participante{pendentes > 1 ? "s" : ""}</strong>{" "}
            com termos pendentes. O organizador pode barrar a entrega de credencial na porta.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function TermosPage() {
  const supabase = createClient();

  const [abaAtiva, setAbaAtiva] = useState<"regulamento" | "imagem" | "status">("regulamento");
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [aceites, setAceites] = useState<AceiteStatus[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisivel, setToastVisivel] = useState(false);

  // ── Carregar documentos ──
  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("termos_documentos")
        .select("*")
        .eq("ativo", true)
        .order("criado_em");
      if (data) setDocumentos(data as Documento[]);
    }
    carregar();
  }, []);

  // ── Carregar aceites (JOIN via view ou query manual) ──
  useEffect(() => {
    async function carregarAceites() {
      // Busca todos os participantes com status de aceites
      const { data: participantes } = await supabase
        .from("participantes")
        .select(`
          id,
          nome_completo,
          escola:escolas(nome),
          aceites:termos_aceites(tipo_assinante, documento_id, aceito_em, nome_assinante)
        `);

      if (!participantes) return;

      const docRegulamento = documentos.find((d) => d.tipo === "regulamento");
      const docImagem = documentos.find((d) => d.tipo === "uso_imagem");

      const status: AceiteStatus[] = participantes.map((b: any) => {
        const aceiteEscola = b.aceites?.some(
          (a: any) =>
            a.tipo_assinante === "escola" &&
            a.documento_id === docRegulamento?.id
        );
        const aceiteImagem = b.aceites?.find(
          (a: any) =>
            (a.tipo_assinante === "responsavel" ||
              a.tipo_assinante === "maior_de_idade") &&
            a.documento_id === docImagem?.id
        );

        return {
          participante_id: b.id,
          participante_nome: b.nome_completo,
          escola_nome: b.escola?.nome ?? "—",
          escola_aceite: !!aceiteEscola,
          imagem_aceite: !!aceiteImagem,
          imagem_aceito_em: aceiteImagem?.aceito_em ?? null,
          imagem_assinante: aceiteImagem?.nome_assinante ?? null,
        };
      });

      setAceites(status);
    }

    if (documentos.length > 0) carregarAceites();
  }, [documentos]);

  // ── Salvar documento ──
  const salvarDocumento = async (
    tipo: Documento["tipo"],
    conteudo: string
  ) => {
    setSalvando(true);
    const existente = documentos.find((d) => d.tipo === tipo);

    if (existente) {
      await supabase
        .from("termos_documentos")
        .update({
          conteudo,
          versao: existente.versao + 1,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", existente.id);

      setDocumentos((prev) =>
        prev.map((d) =>
          d.id === existente.id
            ? { ...d, conteudo, versao: d.versao + 1, atualizado_em: new Date().toISOString() }
            : d
        )
      );
    } else {
      const titulo =
        tipo === "regulamento"
          ? "Regulamento do Festival"
          : tipo === "uso_imagem"
          ? "Termo de Uso de Imagem"
          : "Termo de Responsabilidade Médica";

      const { data } = await supabase
        .from("termos_documentos")
        .insert({ tipo, titulo, conteudo })
        .select()
        .single();

      if (data) setDocumentos((prev) => [...prev, data as Documento]);
    }

    setSalvando(false);
    mostrarToast("Documento salvo com sucesso!");
  };

  const mostrarToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisivel(true);
    setTimeout(() => setToastVisivel(false), 2500);
  };

  const docRegulamento = documentos.find((d) => d.tipo === "regulamento") ?? null;
  const docImagem = documentos.find((d) => d.tipo === "uso_imagem") ?? null;

  const abas = [
    { id: "regulamento" as const, label: "Regulamento", icon: FileText },
    { id: "imagem" as const, label: "Uso de Imagem", icon: FileSignature },
    { id: "status" as const, label: "Status de Assinaturas", icon: Users },
  ];

  return (
    <>
      <Toast msg={toastMsg} visivel={toastVisivel} />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Termos & Contratos</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Gestão do edital e termos de responsabilidade — blindagem jurídica do festival.
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-axon-panel border border-axon-border rounded-2xl overflow-hidden">
          {/* Abas */}
          <div className="flex border-b border-axon-border px-4 overflow-x-auto">
            {abas.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAbaAtiva(id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  abaAtiva === id
                    ? "border-axon-green text-axon-green"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
                {id === "status" && aceites.filter((a) => !a.imagem_aceite).length > 0 && (
                  <span className="ml-1 bg-red-500/20 text-red-400 text-xs font-bold px-1.5 py-0.5 rounded-full border border-red-500/30">
                    {aceites.filter((a) => !a.imagem_aceite).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {abaAtiva === "regulamento" && (
              <AbaRegulamento
                documento={docRegulamento}
                onSalvar={(c) => salvarDocumento("regulamento", c)}
                salvando={salvando}
              />
            )}
            {abaAtiva === "imagem" && (
              <AbaUsoImagem
                documento={docImagem}
                onSalvar={(c) => salvarDocumento("uso_imagem", c)}
                salvando={salvando}
              />
            )}
            {abaAtiva === "status" && <AbaStatus aceites={aceites} />}
          </div>
        </div>
      </div>
    </>
  );
}