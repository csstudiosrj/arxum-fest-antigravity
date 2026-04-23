"use client";

import { useState } from "react";
import { Search, Download, Play, AlertCircle, CheckCircle2, FileAudio, Clock, Filter, MoreHorizontal } from "lucide-react";

export default function MidiasPage() {
  const [abaAtiva, setAbaAtiva] = useState("todas");

  const midias =[
    { id: "001", coreografia: "O Despertar", escola: "Studio Alpha", arquivo: "001_StudioAlpha_ODespertar.mp3", duracao: "03:15", status: "Validado", tamanho: "4.2 MB" },
    { id: "002", coreografia: "Valsa das Flores", escola: "Cia Beta", arquivo: "Pendente", duracao: "--:--", status: "Pendente", tamanho: "--" },
    { id: "003", coreografia: "Ruptura", escola: "Studio Alpha", arquivo: "003_StudioAlpha_Ruptura.wav", duracao: "04:20", status: "Validado", tamanho: "45.1 MB" },
    { id: "004", coreografia: "Urban Kings", escola: "Escola Gama", arquivo: "audio_whatsapp_final.mp3", duracao: "02:50", status: "Erro", tamanho: "1.1 MB" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Mídias & Áudio</h1>
          <p className="text-gray-400 mt-1">Validação de trilhas sonoras e exportação para o operador.</p>
        </div>
        <button className="bg-axon-green text-black px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#00c866] transition-colors">
          <Download size={20} />
          Exportar ZIP (Line-up)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <FileAudio size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Esperado</p>
            <p className="text-2xl font-bold text-white">142</p>
          </div>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-axon-green/10 flex items-center justify-center text-axon-green">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Validados</p>
            <p className="text-2xl font-bold text-white">125</p>
          </div>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Pendentes</p>
            <p className="text-2xl font-bold text-white">14</p>
          </div>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Com Erro</p>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
        </div>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
        <div className="flex border-b border-axon-border px-4">
          {["todas", "validadas", "pendentes", "erros"].map((aba) => (
            <button 
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors capitalize ${abaAtiva === aba ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}
            >
              {aba}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-axon-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por ID, coreografia ou escola..."
              className="w-full bg-axon-bg border border-axon-border rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-axon-green transition-colors"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-axon-bg border border-axon-border rounded-md text-sm text-gray-300 hover:text-white transition-colors">
            <Filter size={16} />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-axon-bg/50 text-gray-400 border-b border-axon-border">
              <tr>
                <th className="px-6 py-4 font-medium">Ordem</th>
                <th className="px-6 py-4 font-medium">Coreografia / Escola</th>
                <th className="px-6 py-4 font-medium">Nome do Arquivo (Auto-Rename)</th>
                <th className="px-6 py-4 font-medium text-center">Duração</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axon-border">
              {midias.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-medium">{item.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{item.coreografia}</p>
                    <p className="text-xs text-gray-500">{item.escola}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-xs px-2 py-1 rounded ${item.status === 'Validado' ? 'bg-white/5 text-gray-300' : 'text-gray-500'}`}>
                      {item.arquivo}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{item.tamanho}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300">{item.duracao}</td>
                  <td className="px-6 py-4">
                    {item.status === "Validado" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-axon-green bg-axon-green/10 border border-axon-green/20"><CheckCircle2 size={12} /> Validado</span>}
                    {item.status === "Pendente" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-yellow-500 bg-yellow-500/10 border border-yellow-500/20"><Clock size={12} /> Pendente</span>}
                    {item.status === "Erro" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20"><AlertCircle size={12} /> Qualidade Ruim</span>}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30" disabled={item.status === 'Pendente'}>
                      <Play size={14} className="ml-0.5" />
                    </button>
                    <button className="text-gray-500 hover:text-white transition-colors p-1">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}