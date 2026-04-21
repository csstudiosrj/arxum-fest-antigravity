import { Users, Search } from "lucide-react";

export default function InscricoesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Inscrições & Elenco</h1>
          <p className="text-gray-400 mt-1">Controle de coreografias, bailarinos e status de pagamento.</p>
        </div>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-axon-border rounded-full flex items-center justify-center mb-4 text-gray-500">
          <Users size={32} />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Módulo de Inscrições</h3>
        <p className="text-gray-400 max-w-md">
          Nesta tela, teremos a tabela completa com todas as inscrições recebidas, filtros por escola/coreógrafo e o status financeiro de cada uma.
        </p>
      </div>
    </div>
  );
}