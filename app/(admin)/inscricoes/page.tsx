"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search, Filter, MoreHorizontal, Users, Music,
  DollarSign, CheckCircle2, Clock, Loader2, X, Plus
} from "lucide-react";

type Coreografia = {
  id: string;
  nome: string;
  categoria: string;
  tipo: string;
  quantidade_bailarinos: number | null;
  valor_total: number | null;
  status_pagamento: string | null;
  escolas: { nome: string } | null;
};

type Bailarino = {
  id: string;
  nome: string;
  data_nascimento: string;
  cpf: string | null;
  termo_assinado: boolean | null;
  escolas: { nome: string } | null;
  inscricoes_count?: number;
};

type KPIs = {
  total_coreografias: number;
  bailarinos_unicos: number;
  receita_confirmada: number;
};

function calcularIdade(data_nascimento: string): number {
  const hoje = new Date();
  const nasc = new Date(data_nascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function InscricoesPage() {
  const supabase = createClient();

  const [abaAtiva, setAbaAtiva]           = useState("coreografias");
  const [busca, setBusca]                 = useState("");
  const [coreografias, setCoreografias]   = useState<Coreografia[]>([]);
  const [bailarinos, setBailarinos]       = useState<Bailarino[]>([]);
  const [kpis, setKpis]                   = useState<KPIs>({ total_coreografias: 0, bailarinos_unicos: 0, receita_confirmada: 0 });
  const [loading, setLoading]             = useState(true);
  const [pagina, setPagina]               = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const POR_PAGINA = 20;

  const carregarKpis = useCallback(async () => {
    const [{ count: totalCor }, { count: totalBail }, { data: receita }] = await Promise.all([
      supabase.from("coreografias").select("*", { count: "exact", head: true }),
      supabase.from("bailarinos").select("*", { count: "exact", head: true }),
      supabase.from("coreografias").select("valor_total").eq("status_pagamento", "pago"),
    ]);

    const receitaTotal = (receita ?? []).reduce((acc, c) => acc + (c.valor_total ?? 0), 0);

    setKpis({
      total_coreografias: totalCor ?? 0,
      bailarinos_unicos: totalBail ?? 0,
      receita_confirmada: receitaTotal,
    });
  }, [supabase]);

  const carregarCoreografias = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("coreografias")
      .select("id, nome, categoria, tipo, quantidade_bailarinos, valor_total, status_pagamento, escolas(nome)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);

    if (busca.trim()) {
      query = query.or(`nome.ilike.%${busca}%,categoria.ilike.%${busca}%`);
    }

    const { data, count } = await query;
    setCoreografias((data as unknown as Coreografia[]) ?? []);
    setTotalRegistros(count ?? 0);
    setLoading(false);
  }, [supabase, pagina, busca]);

  const carregarBailarinos = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("bailarinos")
      .select("id, nome, data_nascimento, cpf, termo_assinado, escolas(nome)", { count: "exact" })
      .order("nome", { ascending: true })
      .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);

    if (busca.trim()) {
      query = query.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`);
    }

    const { data, count } = await query;

    // Conta inscrições por bailarino
    const ids = (data ?? []).map((b: { id: string }) => b.id);
    const { data: elenco } = await supabase
      .from("coreografia_elenco")
      .select("bailarino_id")
      .in("bailarino_id", ids);

    const contagem: Record<string, number> = {};
    (elenco ?? []).forEach((e: { bailarino_id: string }) => {
      contagem[e.bailarino_id] = (contagem[e.bailarino_id] ?? 0) + 1;
    });

    const bailarinosComContagem = (data ?? []).map((b: { id: string }) => ({
      ...(b as object),
      inscricoes_count: contagem[b.id] ?? 0,
    }));

    setBailarinos(bailarinosComContagem as Bailarino[]);
    setTotalRegistros(count ?? 0);
    setLoading(false);
  }, [supabase, pagina, busca]);

  useEffect(() => {
    void carregarKpis();
  }, [carregarKpis]);

  useEffect(() => {
    setPagina(1);
  }, [busca, abaAtiva]);

  useEffect(() => {
    if (abaAtiva === "coreografias") void carregarCoreografias();
    else void carregarBailarinos();
  }, [abaAtiva, pagina, busca, carregarCoreografias, carregarBailarinos]);

  const totalPaginas = Math.ceil(totalRegistros / POR_PAGINA);
  const inicio = totalRegistros === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1;
  const fim = Math.min(pagina * POR_PAGINA, totalRegistros);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Inscrições & Elenco</h1>
          <p className="text-gray-400 mt-1">Gestão de coreografias, bailarinos e status financeiro.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-axon-panel border border-axon-border text-white px-4 py-2 rounded-md font-medium hover:bg-white/5 transition-colors">
            Exportar Excel
          </button>
          <button className="bg-axon-green text-black px-4 py-2 rounded-md font-medium hover:bg-[#00c866] transition-colors flex items-center gap-2">
            <Plus size={18} /> Nova Inscrição Manual
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Music size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total de Coreografias</p>
            <p className="text-2xl font-bold text-white">{kpis.total_coreografias}</p>
          </div>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Bailarinos Únicos</p>
            <p className="text-2xl font-bold text-white">{kpis.bailarinos_unicos}</p>
          </div>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-axon-green/10 flex items-center justify-center text-axon-green">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Receita Confirmada</p>
            <p className="text-2xl font-bold text-white">{formatarReais(kpis.receita_confirmada)}</p>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">

        {/* Abas */}
        <div className="flex border-b border-axon-border px-4">
          <button
            onClick={() => setAbaAtiva("coreografias")}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "coreografias" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <Music size={18} /> Coreografias Inscritas
          </button>
          <button
            onClick={() => setAbaAtiva("elenco")}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "elenco" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <Users size={18} /> Banco de Elenco
          </button>
        </div>

        {/* Barra de busca */}
        <div className="p-4 border-b border-axon-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={abaAtiva === "coreografias" ? "Buscar por coreografia ou categoria..." : "Buscar por nome ou CPF..."}
              className="w-full bg-axon-bg border border-axon-border rounded-md pl-10 pr-10 py-2 text-sm text-white focus:outline-none focus:border-axon-green transition-colors"
            />
            {busca && (
              <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-axon-bg border border-axon-border rounded-md text-sm text-gray-300 hover:text-white transition-colors">
            <Filter size={16} /> Filtros Avançados
          </button>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="animate-spin text-axon-gold" />
          </div>
        ) : (
          <>
            {/* TABELA COREOGRAFIAS */}
            {abaAtiva === "coreografias" && (
              <div className="overflow-x-auto">
                {coreografias.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Music size={40} className="mx-auto mb-3 opacity-20" />
                    <p>Nenhuma coreografia encontrada.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-axon-bg/50 text-gray-400 border-b border-axon-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Escola / Grupo</th>
                        <th className="px-6 py-4 font-medium">Coreografia</th>
                        <th className="px-6 py-4 font-medium">Categoria</th>
                        <th className="px-6 py-4 font-medium text-center">Pax</th>
                        <th className="px-6 py-4 font-medium">Valor</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-axon-border">
                      {coreografias.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{item.escolas?.nome ?? "—"}</td>
                          <td className="px-6 py-4 text-gray-300">{item.nome}</td>
                          <td className="px-6 py-4 text-gray-400">
                            {item.categoria}
                            <span className="text-xs text-gray-500 block">{item.tipo}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-300">{item.quantidade_bailarinos ?? "—"}</td>
                          <td className="px-6 py-4 text-gray-300">{item.valor_total != null ? formatarReais(item.valor_total) : "—"}</td>
                          <td className="px-6 py-4">
                            {item.status_pagamento === "pago" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-axon-green bg-axon-green/10 border border-axon-green/20">
                                <CheckCircle2 size={12} /> Pago
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-yellow-500 bg-yellow-500/10 border border-yellow-500/20">
                                <Clock size={12} /> {item.status_pagamento ?? "Pendente"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-gray-500 hover:text-white transition-colors p-1">
                              <MoreHorizontal size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TABELA ELENCO */}
            {abaAtiva === "elenco" && (
              <div className="overflow-x-auto">
                {bailarinos.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Users size={40} className="mx-auto mb-3 opacity-20" />
                    <p>Nenhum bailarino encontrado.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-axon-bg/50 text-gray-400 border-b border-axon-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Nome do Bailarino</th>
                        <th className="px-6 py-4 font-medium">Escola Vinculada</th>
                        <th className="px-6 py-4 font-medium text-center">Idade</th>
                        <th className="px-6 py-4 font-medium">CPF</th>
                        <th className="px-6 py-4 font-medium text-center">Coreografias</th>
                        <th className="px-6 py-4 font-medium text-center">Termo</th>
                        <th className="px-6 py-4 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-axon-border">
                      {bailarinos.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{item.nome}</td>
                          <td className="px-6 py-4 text-gray-300">{item.escolas?.nome ?? "—"}</td>
                          <td className="px-6 py-4 text-center text-gray-300">{calcularIdade(item.data_nascimento)} anos</td>
                          <td className="px-6 py-4 text-gray-400">{item.cpf ?? "—"}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-white/5 text-gray-300 px-2.5 py-1 rounded-md text-xs font-medium">
                              {item.inscricoes_count ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.termo_assinado ? (
                              <span className="inline-flex items-center gap-1 text-xs text-axon-green">
                                <CheckCircle2 size={14} /> Assinado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-yellow-500">
                                <Clock size={14} /> Pendente
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-gray-500 hover:text-white transition-colors p-1">
                              <MoreHorizontal size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}

        {/* Paginação */}
        <div className="p-4 border-t border-axon-border flex items-center justify-between text-sm text-gray-400">
          <span>
            {totalRegistros === 0 ? "Nenhum registro" : `Mostrando ${inicio} a ${fim} de ${totalRegistros} registros`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-3 py-1 border border-axon-border rounded hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina >= totalPaginas}
              className="px-3 py-1 border border-axon-border rounded hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}