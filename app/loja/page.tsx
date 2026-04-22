import { ShoppingBag, Image, Plus } from "lucide-react";

export default function LojaPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Loja & Upsell</h1>
          <p className="text-gray-400 mt-1">Venda pacotes de mídia e produtos durante a inscrição.</p>
        </div>
        <button className="bg-axon-green text-black px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#00c866] transition-colors">
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col group">
          <div className="w-12 h-12 bg-axon-bg border border-axon-border rounded-lg flex items-center justify-center text-axon-green mb-4">
            <Image size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Pacote de Fotos Oficial</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1">Venda antecipada de todas as fotos em alta resolução da coreografia.</p>
          <div className="flex items-center justify-between pt-4 border-t border-axon-border">
            <span className="text-xl font-bold text-white">R$ 50,00</span>
            <span className="text-xs font-medium bg-axon-green/10 text-axon-green px-2 py-1 rounded">Ativo no Upsell</span>
          </div>
        </div>

        <div className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col group">
          <div className="w-12 h-12 bg-axon-bg border border-axon-border rounded-lg flex items-center justify-center text-gray-400 mb-4">
            <ShoppingBag size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Camiseta do Festival</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1">Camiseta oficial edição 2026. Retirada no dia do evento.</p>
          <div className="flex items-center justify-between pt-4 border-t border-axon-border">
            <span className="text-xl font-bold text-white">R$ 80,00</span>
            <span className="text-xs font-medium bg-axon-green/10 text-axon-green px-2 py-1 rounded">Ativo no Upsell</span>
          </div>
        </div>
      </div>
    </div>
  );
}