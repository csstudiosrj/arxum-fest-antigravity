import { CalendarDays, Plus } from "lucide-react";

export default function EventosPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Line-up & Eventos</h1>
          <p className="text-gray-400 mt-1">Gerencie os festivais, categorias e a ordem de apresentação.</p>
        </div>
        <button className="bg-axon-green text-black px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#00c866] transition-colors">
          <Plus size={20} />
          Novo Evento
        </button>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-axon-border rounded-full flex items-center justify-center mb-4 text-gray-500">
          <CalendarDays size={32} />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Nenhum evento criado</h3>
        <p className="text-gray-400 max-w-md">
          Aqui você verá a lista dos seus festivais. Ao acessar um evento, você poderá montar o cronograma (Drag & Drop) e gerenciar as categorias.
        </p>
      </div>
    </div>
  );
}