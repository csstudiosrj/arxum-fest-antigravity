import { Users, Ticket, Mic2, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral do seu festival.</p>
      </div>

      {/* CARDS DE RESUMO (MOCK) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Inscrições Ativas</span>
            <Users size={20} className="text-axon-green" />
          </div>
          <div>
            <span className="text-3xl font-bold text-white">342</span>
            <p className="text-xs text-gray-500 mt-1">+12 nas últimas 24h</p>
          </div>
        </div>

        <div className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Receita (Inscrições)</span>
            <TrendingUp size={20} className="text-axon-green" />
          </div>
          <div>
            <span className="text-3xl font-bold text-white">R$ 18.450</span>
            <p className="text-xs text-gray-500 mt-1">Faturamento bruto</p>
          </div>
        </div>

        <div className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Ingressos Vendidos</span>
            <Ticket size={20} className="text-axon-green" />
          </div>
          <div>
            <span className="text-3xl font-bold text-white">850</span>
            <p className="text-xs text-gray-500 mt-1">Lote 1 esgotado</p>
          </div>
        </div>

        <div className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Mídias Pendentes</span>
            <Mic2 size={20} className="text-red-400" />
          </div>
          <div>
            <span className="text-3xl font-bold text-white">14</span>
            <p className="text-xs text-red-400/80 mt-1">Atenção necessária</p>
          </div>
        </div>

      </div>

      {/* ÁREA DE CONTEÚDO VAZIA PARA FUTUROS MÓDULOS */}
      <div className="bg-axon-panel border border-axon-border rounded-xl p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-axon-border rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white">Gráfico de Desempenho</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Aqui entrará o gráfico de inscrições e vendas de ingressos ao longo do tempo.
          </p>
        </div>
      </div>

    </div>
  );
}