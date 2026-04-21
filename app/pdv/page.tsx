import { Ticket, Store } from "lucide-react";

export default function PdvPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">PDV & Bilheteria</h1>
          <p className="text-gray-400 mt-1">Frente de caixa para ingressos, cantina e merchandising.</p>
        </div>
        <button className="bg-axon-green text-black px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#00c866] transition-colors">
          <Store size={20} />
          Abrir Caixa
        </button>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-axon-border rounded-full flex items-center justify-center mb-4 text-gray-500">
          <Ticket size={32} />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Frente de Caixa (POS)</h3>
        <p className="text-gray-400 max-w-md">
          Interface rápida para venda de ingressos na porta e gestão de produtos da cantina. Feita para funcionar com velocidade em tablets ou notebooks.
        </p>
      </div>
    </div>
  );
}