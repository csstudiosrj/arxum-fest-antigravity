import { createClient } from "@/lib/supabase/server";
import { Users, Ticket, Mic2, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // ── Busca paralela de todos os KPIs ──
  const [
    { count: totalInscricoes },
    { count: totalBailarinos },
    { count: midiasPendentes },
    { data: receitaData },
  ] = await Promise.all([
    supabase
      .from("coreografias")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("bailarinos")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("coreografias")
      .select("*", { count: "exact", head: true })
      .is("arquivo_audio", null),
    supabase
      .from("coreografias")
      .select("valor")
      .eq("status_pagamento", "pago"),
  ]);

  // Soma da receita confirmada
  const receitaTotal =
    receitaData?.reduce((acc, c) => acc + (c.valor ?? 0), 0) ?? 0;

  const receitaFormatada = receitaTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const kpis = [
    {
      label: "Inscrições Ativas",
      value: totalInscricoes ?? 0,
      sub: "coreografias cadastradas",
      icon: Users,
      iconColor: "text-axon-gold",
      subColor: "text-gray-500",
    },
    {
      label: "Receita Confirmada",
      value: receitaFormatada,
      sub: "pagamentos confirmados",
      icon: TrendingUp,
      iconColor: "text-axon-green",
      subColor: "text-gray-500",
    },
    {
      label: "Bailarinos Cadastrados",
      value: totalBailarinos ?? 0,
      sub: "no banco de elenco",
      icon: Ticket,
      iconColor: "text-axon-gold",
      subColor: "text-gray-500",
    },
    {
      label: "Mídias Pendentes",
      value: midiasPendentes ?? 0,
      sub: midiasPendentes ? "atenção necessária" : "tudo em ordem",
      icon: Mic2,
      iconColor: midiasPendentes ? "text-red-400" : "text-axon-green",
      subColor: midiasPendentes ? "text-red-400/80" : "text-axon-green/80",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral do seu festival.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-sm font-medium">{kpi.label}</span>
                <Icon size={20} className={kpi.iconColor} />
              </div>
              <div>
                <span className="text-3xl font-bold text-white">
                  {kpi.value}
                </span>
                <p className={`text-xs mt-1 ${kpi.subColor}`}>{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder gráfico */}
      <div className="bg-axon-panel border border-axon-border rounded-xl p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-axon-border rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white">
            Gráfico de Desempenho
          </h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Aqui entrará o gráfico de inscrições e vendas ao longo do tempo.
          </p>
        </div>
      </div>

    </div>
  );
}