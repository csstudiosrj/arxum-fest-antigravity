import { Megaphone, Calendar, Plus } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Marketing & Redes Sociais</h1>
          <p className="text-gray-400 mt-1">Agende e publique direto no Instagram oficial do evento.</p>
        </div>
        <button className="bg-axon-green text-black px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#00c866] transition-colors">
          <Plus size={20} /> Agendar Postagem
        </button>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">IG</div>
          <div>
            <p className="text-white font-medium">@axonfestoficial</p>
            <p className="text-sm text-axon-green flex items-center gap-1">Conectado via Meta API</p>
          </div>
        </div>
        <button className="text-sm text-gray-400 hover:text-white border border-axon-border px-4 py-2 rounded hover:bg-white/5">
          Desconectar
        </button>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-axon-bg/50 text-gray-400 border-b border-axon-border">
            <tr>
              <th className="px-6 py-4 font-medium">Postagem</th>
              <th className="px-6 py-4 font-medium">Data Agendada</th>
              <th className="px-6 py-4 font-medium">Plataforma</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-axon-border">
            <tr className="hover:bg-white/[0.02]">
              <td className="px-6 py-4">
                <p className="text-white font-medium">Faltam 10 dias!</p>
                <p className="text-xs text-gray-500 truncate w-64">Preparem suas sapatilhas, o maior festival...</p>
              </td>
              <td className="px-6 py-4 text-gray-300 flex items-center gap-2"><Calendar size={14}/> 05/07/2026 às 18:00</td>
              <td className="px-6 py-4 text-gray-400">Instagram</td>
              <td className="px-6 py-4"><span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded text-xs font-medium">Agendado</span></td>
            </tr>
            <tr className="hover:bg-white/[0.02]">
              <td className="px-6 py-4">
                <p className="text-white font-medium">Inscrições Abertas</p>
                <p className="text-xs text-gray-500 truncate w-64">Corra e garanta a vaga do seu grupo...</p>
              </td>
              <td className="px-6 py-4 text-gray-300 flex items-center gap-2"><Calendar size={14}/> 10/01/2026 às 12:00</td>
              <td className="px-6 py-4 text-gray-400">Instagram</td>
              <td className="px-6 py-4"><span className="bg-axon-green/10 text-axon-green border border-axon-green/20 px-2 py-1 rounded text-xs font-medium">Publicado</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}