import { Mic2, Download } from "lucide-react";

export default function MidiasPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mídias & Áudio</h1>
          <p className="text-gray-400 mt-1">Validação de trilhas sonoras e exportação offline.</p>
        </div>
        <button className="bg-axon-panel border border-axon-border text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-white/5 transition-colors">
          <Download size={20} />
          Exportar ZIP (Offline)
        </button>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-axon-border rounded-full flex items-center justify-center mb-4 text-gray-500">
          <Mic2 size={32} />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Central de Áudio</h3>
        <p className="text-gray-400 max-w-md">
          Aqui o sistema fará o "Auto-Rename" inteligente e empacotará todas as músicas na ordem exata do Line-up para o operador de som baixar.
        </p>
      </div>
    </div>
  );
}