"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  CalendarDays, MapPin, Users, Plus,
  MoreHorizontal, Loader2, Trash2, Settings, X,
} from "lucide-react";

type Evento = {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  status: string;
  inscritos_count: number;
};

const STATUS_CONFIG: Record<string, { label: string; cor: string }> = {
  inscricoes_abertas: { label: "Inscrições Abertas", cor: "text-axon-green bg-axon-green/10 border-axon-green/20" },
  em_andamento:       { label: "Em Andamento",       cor: "text-axon-gold bg-axon-gold/10 border-axon-gold/20" },
  encerrado:          { label: "Encerrado",           cor: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  rascunho:           { label: "Rascunho",            cor: "text-gray-500 bg-white/5 border-white/10" },
};

function formatarPeriodo(inicio: string, fim: string) {
  const i = new Date(inicio);
  const f = new Date(fim);
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  if (i.getFullYear() === f.getFullYear() && i.getMonth() === f.getMonth()) {
    return `${i.getDate()} a ${f.toLocaleDateString("pt-BR", opts)}`;
  }
  return `${i.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} a ${f.toLocaleDateString("pt-BR", opts)}`;
}

export default function EventosPage() {
  const router = useRouter();
  const [eventos, setEventos]       = useState<Evento[]>([]);
  const [loading, setLoading]       = useState(true);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [modalNovo, setModalNovo]   = useState(false);
  const [criando, setCriando]       = useState(false);
  const [excluindo, setExcluindo]   = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", data_inicio: "", data_fim: "" });

  const supabase = createClient();

  useEffect(() => { carregarEventos(); }, []);

  async function carregarEventos() {
    setLoading(true);
    const { data } = await supabase
      .from("eventos")
      .select("id, nome, data_inicio, data_fim, local, status, inscritos_count")
      .order("data_inicio", { ascending: false });
    setEventos(data ?? []);
    setLoading(false);
  }

  async function criarEvento() {
    if (!form.nome.trim() || !form.data_inicio || !form.data_fim) return;
    setCriando(true);
    const { data, error } = await supabase
      .from("eventos")
      .insert({ nome: form.nome, data_inicio: form.data_inicio, data_fim: form.data_fim, status: "rascunho", inscritos_count: 0 })
      .select()
      .single();

    if (!error && data) {
      // Redireciona direto para o painel do evento recém-criado
      router.push(`/eventos/${data.id}`);
    } else {
      setCriando(false);
    }
  }

  async function excluirEvento(id: string) {
    setExcluindo(id);
    await supabase.from("eventos").delete().eq("id", id);
    setEventos((prev) => prev.filter((e) => e.id !== id));
    setMenuAberto(null);
    setExcluindo(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-axon-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Line-up & Eventos</h1>
          <p className="text-gray-400 mt-1">Gerencie os festivais, categorias e a ordem de apresentação.</p>
        </div>
        <button
          onClick={() => setModalNovo(true)}
          className="bg-axon-gold text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-axon-gold/90 transition-colors"
        >
          <Plus size={20} /> Novo Evento
        </button>
      </div>

      {/* Grade */}
      {eventos.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <CalendarDays size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">Nenhum evento cadastrado ainda.</p>
          <p className="text-sm mt-1">Clique em "Novo Evento" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((evento) => {
            const status = STATUS_CONFIG[evento.status] ?? { label: evento.status, cor: "text-gray-400 bg-white/5 border-white/10" };
            return (
              <div key={evento.id} className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col hover:border-axon-gold/40 transition-colors group relative">

                {/* Menu */}
                <div className="absolute top-6 right-6">
                  <button onClick={() => setMenuAberto(menuAberto === evento.id ? null : evento.id)} className="text-gray-500 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                  {menuAberto === evento.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(null)} />
                      <div className="absolute right-0 mt-2 w-44 bg-axon-panel border border-axon-border rounded-xl shadow-2xl z-50 py-2">
                        <Link href={`/eventos/${evento.id}`} onClick={() => setMenuAberto(null)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <Settings size={15} /> Editar Evento
                        </Link>
                        <div className="h-px bg-axon-border my-1" />
                        <button onClick={() => excluirEvento(evento.id)} disabled={excluindo === evento.id}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-50">
                          {excluindo === evento.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.cor}`}>{status.label}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-4 pr-6">{evento.nome}</h3>

                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CalendarDays size={16} className="shrink-0" />
                    <span>{formatarPeriodo(evento.data_inicio, evento.data_fim)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={16} className="shrink-0" />
                    <span>{evento.local || "Local não definido"}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-axon-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={16} />
                    <span>{evento.inscritos_count ?? 0} inscritos</span>
                  </div>
                  <Link href={`/eventos/${evento.id}`}
                    className="text-sm font-medium text-axon-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    Acessar Painel &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Novo Evento — só o essencial */}
      {modalNovo && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => !criando && setModalNovo(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md p-6 space-y-5">

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Novo Evento</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Você poderá configurar todos os detalhes dentro do painel do evento.</p>
                </div>
                {!criando && (
                  <button onClick={() => setModalNovo(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Nome do Festival *</label>
                  <input
                    type="text"
                    placeholder="Ex: Festival de Dança AXON 2026"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    disabled={criando}
                    className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Data de Início *</label>
                    <input
                      type="date"
                      value={form.data_inicio}
                      onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                      disabled={criando}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Data de Fim *</label>
                    <input
                      type="date"
                      value={form.data_fim}
                      onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
                      disabled={criando}
                      className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-axon-gold transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                {!criando && (
                  <button onClick={() => setModalNovo(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    Cancelar
                  </button>
                )}
                <button
                  onClick={criarEvento}
                  disabled={criando || !form.nome.trim() || !form.data_inicio || !form.data_fim}
                  className="flex items-center gap-2 bg-axon-gold text-black font-semibold px-5 py-2.5 rounded-md hover:bg-axon-gold/90 transition-colors text-sm disabled:opacity-50 min-w-[140px] justify-center"
                >
                  {criando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Criando evento...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Criar & Configurar
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}