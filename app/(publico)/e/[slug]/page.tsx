import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  MapPin,
  Calendar,
  Clock,
  Trophy,
  Users,
  FileText,
  ChevronDown,
  Star,
  Award,
  Ticket,
  Globe,
  ArrowRight,
  Building2,
  Info,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

type EventoStatus =
  | "rascunho"
  | "inscricoes_abertas"
  | "inscricoes_encerradas"
  | "em_andamento"
  | "finalizado"
  | "cancelado";

type EventoFormato = "competitivo" | "mostra" | "misto" | null;

type TipoPremiacao =
  | "sem_premiacao"
  | "com_premiacao_trofeú"
  | "com_premiacao_dinheiro"
  | null;

interface Evento {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  local: string | null;
  status: EventoStatus;
  logo_url: string | null;
  banner_url: string | null;
  formato: EventoFormato;
  tipo_premiacao: TipoPremiacao;
  multilocal: boolean | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  fonte_familia: string | null;
}

interface JuradoPublico {
  id: string;
  nome: string;
  foto_url: string | null;
  especialidade: string | null;
}

interface LocalEvento {
  id: string;
  nome: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
}

interface TermoDocumento {
  id: string;
  titulo: string;
  conteudo: string | null;
  tipo: string | null;
}

interface CategoriaPremiacao {
  id: string;
  nome: string;
  premio_dinheiro_1: number | null;
  premio_dinheiro_2: number | null;
  premio_dinheiro_3: number | null;
}

interface EventoRow {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  local: string | null;
  status: string;
  logo_url: string | null;
  banner_url: string | null;
  formato: string | null;
  tipo_premiacao: string | null;
  multilocal: boolean | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  fonte_familia: string | null;
}

interface EventoJuradoUsuarioRow {
  jurado_id: string;
  usuarios:
    | {
        id: string;
        nome: string;
        foto_url: string | null;
        especialidade: string | null;
      }
    | {
        id: string;
        nome: string;
        foto_url: string | null;
        especialidade: string | null;
      }[]
    | null;
}

interface LocalEventoRow {
  id: string;
  nome: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
}

interface TermoDocumentoRow {
  id: string;
  titulo: string;
  conteudo: string | null;
  tipo: string | null;
}

interface CategoriaPremiacaoRow {
  id: string;
  nome: string;
  premio_dinheiro_1: number | null;
  premio_dinheiro_2: number | null;
  premio_dinheiro_3: number | null;
}

interface DadosEventoPublico {
  evento: Evento;
  jurados: JuradoPublico[];
  locais: LocalEvento[];
  termos: TermoDocumento[];
  categoriasPremiacao: CategoriaPremiacao[];
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function formatarData(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function corTextoContraste(hex: string | null): string {
  if (!hex) return "#ffffff";
  const h = hex.replace("#", "");

  if (h.length !== 6) return "#ffffff";

  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) return "#ffffff";

  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.5 ? "#111111" : "#ffffff";
}

function normalizarStatus(status: string): EventoStatus {
  switch (status) {
    case "inscricoes_abertas":
    case "inscricoes_encerradas":
    case "em_andamento":
    case "finalizado":
    case "cancelado":
    case "rascunho":
      return status;
    default:
      return "rascunho";
  }
}

function normalizarFormato(formato: string | null): EventoFormato {
  switch (formato) {
    case "competitivo":
    case "mostra":
    case "misto":
      return formato;
    default:
      return null;
  }
}

function normalizarTipoPremiacao(tipo: string | null): TipoPremiacao {
  switch (tipo) {
    case "sem_premiacao":
    case "com_premiacao_trofeú":
    case "com_premiacao_dinheiro":
      return tipo;
    default:
      return null;
  }
}

function normalizarEvento(row: EventoRow): Evento {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    data_inicio: row.data_inicio,
    data_fim: row.data_fim,
    local: row.local,
    status: normalizarStatus(row.status),
    logo_url: row.logo_url,
    banner_url: row.banner_url,
    formato: normalizarFormato(row.formato),
    tipo_premiacao: normalizarTipoPremiacao(row.tipo_premiacao),
    multilocal: row.multilocal,
    cor_primaria: row.cor_primaria,
    cor_secundaria: row.cor_secundaria,
    fonte_familia: row.fonte_familia,
  };
}

function statusLabel(status: Evento["status"]): {
  texto: string;
  cor: string;
  icone: ReactNode;
} {
  switch (status) {
    case "inscricoes_abertas":
      return {
        texto: "Inscrições Abertas",
        cor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        icone: <CheckCircle2 size={13} />,
      };
    case "em_andamento":
      return {
        texto: "Em Andamento",
        cor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
        icone: <Clock size={13} />,
      };
    case "inscricoes_encerradas":
      return {
        texto: "Inscrições Encerradas",
        cor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        icone: <Lock size={13} />,
      };
    case "finalizado":
      return {
        texto: "Finalizado",
        cor: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        icone: <CheckCircle2 size={13} />,
      };
    case "cancelado":
      return {
        texto: "Cancelado",
        cor: "bg-red-500/20 text-red-400 border-red-500/30",
        icone: <Info size={13} />,
      };
    default:
      return {
        texto: "Em Breve",
        cor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        icone: <Clock size={13} />,
      };
  }
}

/* ─────────────────────────────────────────────
   COMPONENTES
───────────────────────────────────────────── */

function AccordionItem({
  titulo,
  conteudo,
  corPrimaria,
}: {
  titulo: string;
  conteudo: string;
  corPrimaria: string | null;
}) {
  const cor = corPrimaria ?? "#d4af37";

  return (
    <details className="group border border-white/10 rounded-xl overflow-hidden bg-white/[0.03] backdrop-blur-sm">
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none select-none hover:bg-white/[0.04] transition-colors">
        <span className="text-sm font-semibold text-white">{titulo}</span>
        <ChevronDown
          size={16}
          className="text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0"
        />
      </summary>
      <div
        className="px-6 pb-5 pt-2 text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none"
        style={{ borderTop: `1px solid ${cor}22` }}
        dangerouslySetInnerHTML={{ __html: conteudo.replace(/\n/g, "<br/>") }}
      />
    </details>
  );
}

function AvatarJurado({
  jurado,
  corPrimaria,
}: {
  jurado: JuradoPublico;
  corPrimaria: string | null;
}) {
  const cor = corPrimaria ?? "#d4af37";
  const iniciais = jurado.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3 text-center group">
      <div
        className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 ring-2 ring-offset-2 ring-offset-transparent transition-all duration-300"
        style={{ borderColor: `${cor}44` }}
      >
        {jurado.foto_url ? (
          <img
            src={jurado.foto_url}
            alt={jurado.nome}
            className="w-full h-full object-cover"
            loading="lazy"
            width={80}
            height={80}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-lg font-bold"
            style={{
              background: `linear-gradient(135deg, ${cor}33, ${cor}11)`,
              color: cor,
              border: `1.5px solid ${cor}44`,
            }}
          >
            {iniciais}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-tight">{jurado.nome}</p>
        {jurado.especialidade && (
          <p className="text-xs text-gray-400 mt-0.5 max-w-[140px] mx-auto leading-snug">
            {jurado.especialidade}
          </p>
        )}
      </div>
    </div>
  );
}

function CardLocal({ local }: { local: LocalEvento }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white/[0.04] border border-white/10 rounded-xl backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
      <div className="p-2 rounded-lg bg-white/[0.06] shrink-0">
        <Building2 size={16} className="text-gray-300" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{local.nome}</p>
        {local.endereco && <p className="text-xs text-gray-400 mt-0.5">{local.endereco}</p>}
        {(local.cidade || local.estado) && (
          <p className="text-xs text-gray-500 mt-0.5">
            {[local.cidade, local.estado].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

function CardPremiacao({
  categorias,
  corPrimaria,
  corSecundaria,
}: {
  categorias: CategoriaPremiacao[];
  corPrimaria: string | null;
  corSecundaria: string | null;
}) {
  const cor = corPrimaria ?? "#d4af37";
  const corSec = corSecundaria ?? "#b8860b";
  const maiorPremio = Math.max(
    0,
    ...categorias.flatMap((categoria) => [
      categoria.premio_dinheiro_1 ?? 0,
      categoria.premio_dinheiro_2 ?? 0,
      categoria.premio_dinheiro_3 ?? 0,
    ])
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 border"
      style={{
        background: `linear-gradient(135deg, ${cor}18 0%, ${corSec}0d 100%)`,
        borderColor: `${cor}44`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, ${cor}, transparent 60%)`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: `${cor}22`, border: `1px solid ${cor}33` }}
          >
            <Trophy size={20} style={{ color: cor }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: cor }}>
              Premiação em Destaque
            </p>
            <p className="text-white font-bold text-lg leading-tight">
              Prêmio de até <span style={{ color: cor }}>{formatarMoeda(maiorPremio)}</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categorias.map((cat) => {
            const maxCat = Math.max(
              cat.premio_dinheiro_1 ?? 0,
              cat.premio_dinheiro_2 ?? 0,
              cat.premio_dinheiro_3 ?? 0
            );

            if (maxCat === 0) return null;

            return (
              <div
                key={cat.id}
                className="p-3 rounded-xl border"
                style={{
                  background: `${cor}0d`,
                  borderColor: `${cor}22`,
                }}
              >
                <p className="text-xs font-medium text-gray-300 mb-2">{cat.nome}</p>
                <div className="space-y-1">
                  {cat.premio_dinheiro_1 != null && cat.premio_dinheiro_1 > 0 && (
                    <div className="flex items-center gap-2">
                      <Award size={11} style={{ color: cor }} />
                      <span className="text-xs font-bold text-white">
                        {formatarMoeda(cat.premio_dinheiro_1)}
                      </span>
                      <span className="text-xs text-gray-500">1 lugar</span>
                    </div>
                  )}
                  {cat.premio_dinheiro_2 != null && cat.premio_dinheiro_2 > 0 && (
                    <div className="flex items-center gap-2">
                      <Award size={11} className="text-gray-400" />
                      <span className="text-xs font-bold text-white">
                        {formatarMoeda(cat.premio_dinheiro_2)}
                      </span>
                      <span className="text-xs text-gray-500">2 lugar</span>
                    </div>
                  )}
                  {cat.premio_dinheiro_3 != null && cat.premio_dinheiro_3 > 0 && (
                    <div className="flex items-center gap-2">
                      <Award size={11} className="text-gray-500" />
                      <span className="text-xs font-bold text-white">
                        {formatarMoeda(cat.premio_dinheiro_3)}
                      </span>
                      <span className="text-xs text-gray-500">3 lugar</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BotaoInscricao({
  status,
  eventoId,
  corPrimaria,
}: {
  status: Evento["status"];
  eventoId: string;
  corPrimaria: string | null;
}) {
  const cor = corPrimaria ?? "#d4af37";
  const textoCor = corTextoContraste(corPrimaria);
  const aberto = status === "inscricoes_abertas";

  if (aberto) {
    return (
      <Link
        href={`/inscricao/${eventoId}`}
        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-lg"
        style={{
          background: cor,
          color: textoCor,
          boxShadow: `0 4px 24px ${cor}44`,
        }}
      >
        <Ticket size={17} />
        Realizar Inscrição
        <ArrowRight size={15} />
      </Link>
    );
  }

  const labelBloqueio =
    status === "inscricoes_encerradas" || status === "finalizado"
      ? "Inscrições Encerradas"
      : "Inscrições Bloqueadas";

  return (
    <button
      disabled
      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm bg-white/10 text-gray-500 border border-white/10 cursor-not-allowed select-none"
    >
      <Lock size={15} />
      {labelBloqueio}
    </button>
  );
}

/* ─────────────────────────────────────────────
   DATA FETCHING
───────────────────────────────────────────── */

async function fetchDadosEvento(slug: string): Promise<DadosEventoPublico | null> {
  const supabase = await createClient();

  const { data: eventoData, error } = await supabase
    .from("eventos")
    .select(
      "id, nome, descricao, data_inicio, data_fim, local, status, logo_url, banner_url, formato, tipo_premiacao, multilocal, cor_primaria, cor_secundaria, fonte_familia"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !eventoData) return null;

  const ev = normalizarEvento(eventoData as EventoRow);
  const competitivo = ev.formato === "competitivo" || ev.formato === "misto";

  const [juradosRes, locaisRes, termosRes, categoriasRes] = await Promise.all([
    competitivo
      ? supabase
          .from("evento_jurados")
          .select("jurado_id, usuarios!inner(id, nome, foto_url, especialidade)")
          .eq("evento_id", ev.id)
      : Promise.resolve({ data: null, error: null }),
    ev.multilocal
      ? supabase
          .from("locais_evento")
          .select("id, nome, endereco, cidade, estado")
          .eq("evento_id", ev.id)
          .order("nome")
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("termos_documentos")
      .select("id, titulo, conteudo, tipo")
      .eq("evento_id", ev.id)
      .order("created_at"),
    ev.tipo_premiacao === "com_premiacao_dinheiro"
      ? supabase
          .from("categorias")
          .select("id, nome, premio_dinheiro_1, premio_dinheiro_2, premio_dinheiro_3")
          .eq("evento_id", ev.id)
          .or("premio_dinheiro_1.gt.0,premio_dinheiro_2.gt.0,premio_dinheiro_3.gt.0")
      : Promise.resolve({ data: null, error: null }),
  ]);

  const juradosRows = (juradosRes.data ?? []) as EventoJuradoUsuarioRow[];
  const jurados: JuradoPublico[] = competitivo
    ? juradosRows
        .map((row) => {
          const usuario = Array.isArray(row.usuarios) ? row.usuarios[0] : row.usuarios;
          if (!usuario) return null;

          return {
            id: usuario.id,
            nome: usuario.nome,
            foto_url: usuario.foto_url,
            especialidade: usuario.especialidade,
          } satisfies JuradoPublico;
        })
        .filter((item): item is JuradoPublico => item !== null)
    : [];

  const locais: LocalEvento[] = ev.multilocal
    ? ((locaisRes.data ?? []) as LocalEventoRow[]).map(
        (local) =>
          ({
            id: local.id,
            nome: local.nome,
            endereco: local.endereco,
            cidade: local.cidade,
            estado: local.estado,
          }) satisfies LocalEvento
      )
    : [];

  const termos: TermoDocumento[] = ((termosRes.data ?? []) as TermoDocumentoRow[]).map(
    (termo) =>
      ({
        id: termo.id,
        titulo: termo.titulo,
        conteudo: termo.conteudo,
        tipo: termo.tipo,
      }) satisfies TermoDocumento
  );

  const categoriasPremiacao: CategoriaPremiacao[] =
    ev.tipo_premiacao === "com_premiacao_dinheiro"
      ? ((categoriasRes.data ?? []) as CategoriaPremiacaoRow[]).map(
          (categoria) =>
            ({
              id: categoria.id,
              nome: categoria.nome,
              premio_dinheiro_1: categoria.premio_dinheiro_1,
              premio_dinheiro_2: categoria.premio_dinheiro_2,
              premio_dinheiro_3: categoria.premio_dinheiro_3,
            }) satisfies CategoriaPremiacao
        )
      : [];

  return { evento: ev, jurados, locais, termos, categoriasPremiacao };
}

/* ─────────────────────────────────────────────
   PAGE (SERVER COMPONENT)
───────────────────────────────────────────── */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dados = await fetchDadosEvento(slug);

  if (!dados) {
    return {
      title: "Festival não encontrado",
      description: "Nenhum festival ativo foi encontrado neste endereço.",
    };
  }

  return {
    title: dados.evento.nome,
    description:
      dados.evento.descricao?.slice(0, 160) ??
      `Inscrições abertas para ${dados.evento.nome}.`,
    openGraph: {
      title: dados.evento.nome,
      description:
        dados.evento.descricao?.slice(0, 160) ??
        `Inscrições abertas para ${dados.evento.nome}.`,
      images: dados.evento.banner_url ? [{ url: dados.evento.banner_url }] : [],
    },
  };
}

export default async function PaginaPublicaFestivalPage({ params }: PageProps) {
  const { slug } = await params;
  const dados = await fetchDadosEvento(slug);

  if (!dados) {
    notFound();
  }

  const { evento, jurados, locais, termos, categoriasPremiacao } = dados;
  const corPrimaria = evento.cor_primaria ?? "#d4af37";
  const corSecundaria = evento.cor_secundaria ?? "#b8860b";
  const fonteFamilia = evento.fonte_familia;
  const statusInfo = statusLabel(evento.status);
  const competitivo = evento.formato === "competitivo" || evento.formato === "misto";
  const temPremiacao =
    evento.tipo_premiacao === "com_premiacao_dinheiro" && categoriasPremiacao.length > 0;

  const fontStyle: CSSProperties = fonteFamilia
    ? { fontFamily: `'${fonteFamilia}', system-ui, sans-serif` }
    : {};

  return (
    <main
      className="min-h-screen bg-[#0e0d0b] text-white antialiased"
      style={
        {
          ...fontStyle,
          "--cor-primaria": corPrimaria,
          "--cor-secundaria": corSecundaria,
        } as CSSProperties
      }
    >
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[480px]">
          {evento.banner_url ? (
            <img
              src={evento.banner_url}
              alt={`Banner de ${evento.nome}`}
              className="absolute inset-0 w-full h-full object-cover"
              width={1440}
              height={480}
              loading="eager"
            />
          ) : (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${corPrimaria}22 0%, #0e0d0b 60%, ${corSecundaria}11 100%)`,
              }}
            />
          )}

          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, ${corPrimaria}11 40%, #0e0d0b 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#0e0d0b]" />

          <div className="absolute top-5 left-5 sm:top-6 sm:left-8">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${statusInfo.cor}`}
            >
              {statusInfo.icone}
              {statusInfo.texto}
            </span>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 -mt-20 sm:-mt-28 pb-0 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div
              className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 overflow-hidden shadow-2xl"
              style={{ borderColor: `${corPrimaria}55` }}
            >
              {evento.logo_url ? (
                <img
                  src={evento.logo_url}
                  alt={`Logo de ${evento.nome}`}
                  className="w-full h-full object-cover"
                  width={112}
                  height={112}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${corPrimaria}33, ${corSecundaria}22)`,
                  }}
                >
                  <Star size={32} style={{ color: corPrimaria }} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                {evento.nome}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                {(evento.data_inicio || evento.data_fim) && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={13} style={{ color: corPrimaria }} />
                    {evento.data_inicio && formatarData(evento.data_inicio)}
                    {evento.data_fim &&
                      evento.data_fim !== evento.data_inicio &&
                      ` até ${formatarData(evento.data_fim)}`}
                  </span>
                )}
                {evento.local && !evento.multilocal && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin size={13} style={{ color: corPrimaria }} />
                    {evento.local}
                  </span>
                )}
                {evento.multilocal && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <Globe size={13} style={{ color: corPrimaria }} />
                    Multilocal
                  </span>
                )}
                {competitivo && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <Trophy size={13} style={{ color: corPrimaria }} />
                    {evento.formato === "misto" ? "Festival Misto" : "Festival Competitivo"}
                  </span>
                )}
                {evento.formato === "mostra" && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <FileText size={13} style={{ color: corPrimaria }} />
                    Mostra
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-14">
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${corPrimaria}11 0%, ${corSecundaria}08 100%)`,
            borderColor: `${corPrimaria}33`,
          }}
        >
          <div>
            <h2 className="text-base font-bold mb-0.5" style={{ color: corPrimaria }}>
              {evento.status === "inscricoes_abertas"
                ? "Inscrições abertas"
                : "Acompanhe este festival"}
            </h2>
            <p className="text-sm text-gray-400">
              {evento.status === "inscricoes_abertas"
                ? "Garanta sua participação agora mesmo. Vagas limitadas por categoria."
                : "As inscrições para este festival estão indisponíveis no momento."}
            </p>
          </div>
          <BotaoInscricao
            status={evento.status}
            eventoId={evento.id}
            corPrimaria={evento.cor_primaria}
          />
        </div>

        {evento.descricao && (
          <section aria-labelledby="secao-sobre">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: corPrimaria }} />
              <h2 id="secao-sobre" className="text-lg font-bold text-white">
                Sobre o Festival
              </h2>
            </div>
            <div
              className="p-6 rounded-2xl border bg-white/[0.03] backdrop-blur-sm"
              style={{ borderColor: `${corPrimaria}22` }}
            >
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {evento.descricao}
              </p>
            </div>
          </section>
        )}

        {temPremiacao && (
          <section aria-labelledby="secao-premiacao">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: corPrimaria }} />
              <h2 id="secao-premiacao" className="text-lg font-bold text-white">
                Premiação
              </h2>
            </div>
            <CardPremiacao
              categorias={categoriasPremiacao}
              corPrimaria={evento.cor_primaria}
              corSecundaria={evento.cor_secundaria}
            />
          </section>
        )}

        {competitivo && jurados.length > 0 && (
          <section aria-labelledby="secao-jurados">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: corPrimaria }} />
              <h2 id="secao-jurados" className="text-lg font-bold text-white">
                Corpo de Jurados
              </h2>
            </div>
            <div
              className="p-6 rounded-2xl border bg-white/[0.03]"
              style={{ borderColor: `${corPrimaria}22` }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Users size={15} style={{ color: corPrimaria }} />
                <span className="text-xs text-gray-400">
                  {jurados.length} jurado{jurados.length !== 1 ? "s" : ""} escalado
                  {jurados.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {jurados.map((jurado) => (
                  <AvatarJurado
                    key={jurado.id}
                    jurado={jurado}
                    corPrimaria={evento.cor_primaria}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {evento.multilocal && locais.length > 0 && (
          <section aria-labelledby="secao-locais">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: corPrimaria }} />
              <h2 id="secao-locais" className="text-lg font-bold text-white">
                Locais do Festival
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {locais.map((local) => (
                <CardLocal key={local.id} local={local} />
              ))}
            </div>
          </section>
        )}

        {termos.length > 0 && (
          <section aria-labelledby="secao-regulamento">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: corPrimaria }} />
              <h2 id="secao-regulamento" className="text-lg font-bold text-white">
                Regulamento e Diretrizes
              </h2>
            </div>
            <div className="space-y-2">
              {termos.map((termo) => (
                <AccordionItem
                  key={termo.id}
                  titulo={termo.titulo}
                  conteudo={termo.conteudo ?? "Conteúdo não disponível."}
                  corPrimaria={evento.cor_primaria}
                />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="secao-info">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full" style={{ background: corPrimaria }} />
            <h2 id="secao-info" className="text-lg font-bold text-white">
              Informações do Evento
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evento.data_inicio && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl border bg-white/[0.03]"
                style={{ borderColor: `${corPrimaria}22` }}
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${corPrimaria}18` }}>
                  <Calendar size={16} style={{ color: corPrimaria }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                    Data de Início
                  </p>
                  <p className="text-sm font-medium text-white">
                    {formatarData(evento.data_inicio)}
                  </p>
                </div>
              </div>
            )}

            {evento.data_fim && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl border bg-white/[0.03]"
                style={{ borderColor: `${corPrimaria}22` }}
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${corPrimaria}18` }}>
                  <Clock size={16} style={{ color: corPrimaria }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                    Data de Encerramento
                  </p>
                  <p className="text-sm font-medium text-white">
                    {formatarData(evento.data_fim)}
                  </p>
                </div>
              </div>
            )}

            {evento.local && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl border bg-white/[0.03]"
                style={{ borderColor: `${corPrimaria}22` }}
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${corPrimaria}18` }}>
                  <MapPin size={16} style={{ color: corPrimaria }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                    Local
                  </p>
                  <p className="text-sm font-medium text-white">{evento.local}</p>
                </div>
              </div>
            )}

            {evento.formato && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl border bg-white/[0.03]"
                style={{ borderColor: `${corPrimaria}22` }}
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${corPrimaria}18` }}>
                  <FileText size={16} style={{ color: corPrimaria }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                    Formato
                  </p>
                  <p className="text-sm font-medium text-white capitalize">
                    {evento.formato === "competitivo"
                      ? "Competitivo"
                      : evento.formato === "mostra"
                        ? "Mostra"
                        : "Misto"}
                  </p>
                </div>
              </div>
            )}

            {evento.tipo_premiacao && evento.tipo_premiacao !== "sem_premiacao" && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl border bg-white/[0.03]"
                style={{ borderColor: `${corPrimaria}22` }}
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${corPrimaria}18` }}>
                  <Trophy size={16} style={{ color: corPrimaria }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                    Premiação
                  </p>
                  <p className="text-sm font-medium text-white">
                    {evento.tipo_premiacao === "com_premiacao_dinheiro"
                      ? "Prêmio em Dinheiro"
                      : "Troféu e Certificado"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div
          className="flex flex-col items-center text-center py-12 px-6 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${corPrimaria}0d 0%, transparent 60%)`,
            borderColor: `${corPrimaria}22`,
          }}
        >
          <div className="p-4 rounded-2xl mb-4" style={{ background: `${corPrimaria}18` }}>
            <Ticket size={28} style={{ color: corPrimaria }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pronto para participar?</h2>
          <p className="text-sm text-gray-400 max-w-md mb-7">
            Faça sua inscrição agora, selecione as categorias que deseja concorrer e aguarde a
            confirmação da equipe organizadora.
          </p>
          <BotaoInscricao
            status={evento.status}
            eventoId={evento.id}
            corPrimaria={evento.cor_primaria}
          />
        </div>

        <footer className="pt-6 border-t border-white/[0.07] text-center">
          <p className="text-xs text-gray-600">
            Portal de inscrições operado pela plataforma de gestão de festivais.
          </p>
        </footer>
      </div>
    </main>
  );
}