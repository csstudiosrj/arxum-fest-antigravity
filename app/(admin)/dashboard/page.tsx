import { createClient } from "@/lib/supabase/server";
import { Users, Ticket, Mic2, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalInscricoes },
    { count: totalParticipantes },
    { count: midiasPendentes },
    { data: receitaData },
  ] = await Promise.all([
    supabase.from("apresentacoes").select("*", { count: "exact", head: true }),
    supabase.from("participantes").select("*", { count: "exact", head: true }),
    supabase.from("apresentacoes").select("*", { count: "exact", head: true }).is("arquivo_audio", null),
    supabase.from("apresentacoes").select("valor_total").eq("status_pagamento", "Pendente").not("valor_total", "is", null),
  ]);

  const receitaTotal = receitaData?.reduce((acc, c) => acc + (c.valor_total ?? 0), 0) ?? 0;
  const receitaFormatada = receitaTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const kpis = [
    {
      label: "Inscrições Ativas",
      value: totalInscricoes ?? 0,
      sub: "apresentações cadastradas",
      icon: Users,
      iconColor: "text-axon-gold",
      subColor: "text-gray-500",
    },
    {
      label: "Receita Pendente",
      value: receitaFormatada,
      sub: "aguardando confirmação",
      icon: TrendingUp,
      iconColor: "text-axon-gold",
      subColor: "text-gray-500",
    },
    {
      label: "Participantes",
      value: totalParticipantes ?? 0,
      sub: "no banco de elenco",
      icon: Ticket,
      iconColor: "text-axon-gold",
      subColor: "text-gray-500",
    },
    {
      label: "Mídias Pendentes",
      value: midiasPendentes ?? 0,
      sub: midiasPendentes ? "áudios sem envio" : "tudo em ordem",
      icon: Mic2,
      iconColor: midiasPendentes ? "text-red-400" : "text-emerald-400",
      subColor: midiasPendentes ? "text-red-400/80" : "text-emerald-400/80",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral do ARXUM Fest.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-sm font-medium">{kpi.label}</span>
                <Icon size={20} className={kpi.iconColor} />
              </div>
              <div>
                <span className="text-3xl font-bold text-white">{kpi.value}</span>
                <p className={`text-xs mt-1 ${kpi.subColor}`}>{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl p-8 min-h-[300px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-axon-border rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white">Gráfico de Desempenho</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Em breve: evolução de inscrições e receita ao longo do tempo.
          </p>
        </div>
      </div>
    </div>
  );
}