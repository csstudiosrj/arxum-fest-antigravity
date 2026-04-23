import Link from "next/link";
import { CalendarDays, MapPin, Users, Plus, MoreHorizontal } from "lucide-react";

export default function EventosPage() {
  // Dados simulados (Mock) para visualizarmos o layout
  const eventos =[
    {
      id: "1",
      nome: "Festival de Dança AXON 2026",
      data: "15 a 18 de Julho, 2026",
      local: "Teatro Municipal, RJ",
      inscritos: 342,
      status: "Inscrições Abertas",
      corStatus: "text-axon-green bg-axon-green/10 border-axon-green/20",
    },
    {
      id: "2",
      nome: "Copa de Hip Hop Sul",
      data: "10 de Setembro, 2026",
      local: "Ginásio de Esportes, PR",
      inscritos: 0,
      status: "Em Montagem",
      corStatus: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    },
    {
      id: "3",
      nome: "Mostra de Inverno AXON",
      data: "05 de Junho, 2025",
      local: "Teatro Positivo, PR",
      inscritos: 850,
      status: "Concluído",
      corStatus: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* CABEÇALHO */}
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

      {/* GRADE DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((evento) => (
          <div key={evento.id} className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col hover:border-axon-green/50 transition-colors group relative">
            
            {/* Botão de opções (3 pontinhos) */}
            <button className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>

            {/* Tag de Status */}
            <div className="mb-4">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${evento.corStatus}`}>
                {evento.status}
              </span>
            </div>

            {/* Informações Principais */}
            <h3 className="text-xl font-bold text-white mb-4 pr-6">{evento.nome}</h3>
            
            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CalendarDays size={16} />
                <span>{evento.data}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin size={16} />
                <span>{evento.local}</span>
              </div>
            </div>

            {/* Rodapé do Card */}
            <div className="pt-4 border-t border-axon-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users size={16} />
                <span>{evento.inscritos} inscritos</span>
              </div>
              
              {/* Link para o painel interno do evento */}
              <Link 
                href={`/eventos/${evento.id}`}
                className="text-sm font-medium text-axon-green opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Acessar Painel &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}