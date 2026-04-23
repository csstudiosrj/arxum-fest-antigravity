"use client";

import { useState } from "react";
import { Mic, Send, Wifi, Bluetooth, CheckCircle2 } from "lucide-react";

export default function JuradoPage() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="min-h-screen bg-axon-bg flex flex-col select-none">
      
      {/* TOPBAR DO JURADO */}
      <header className="h-16 bg-axon-panel border-b border-axon-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-axon-border flex items-center justify-center text-white font-bold">J1</div>
          <div>
            <h2 className="text-white font-bold leading-tight">Carlinhos de Jesus</h2>
            <p className="text-xs text-gray-400 leading-tight">Mesa de Avaliação</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs font-medium bg-axon-green/10 text-axon-green px-3 py-1.5 rounded-full border border-axon-green/20">
            <Wifi size={14} /> Online
          </span>
          <span className="flex items-center gap-2 text-xs font-medium bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-full border border-blue-500/20">
            <Bluetooth size={14} /> Sync Ativo
          </span>
        </div>
      </header>

      {/* ÁREA PRINCIPAL (TABLET VIEW) */}
      <main className="flex-1 p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
        
        {/* INFORMAÇÃO DA COREOGRAFIA ATUAL */}
        <div className="bg-axon-panel border border-axon-border rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-axon-green" />
          <p className="text-axon-green font-bold text-sm tracking-widest uppercase mb-2">Apresentação Atual • #012</p>
          <h1 className="text-4xl font-black text-white mb-2">O Despertar</h1>
          <p className="text-xl text-gray-400">Studio Alpha • Jazz Avançado (Conjunto)</p>
        </div>

        {/* CRITÉRIOS DE AVALIAÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Critério 1 */}
          <div className="bg-axon-panel border border-axon-border rounded-2xl p-6 flex flex-col items-center gap-4">
            <h3 className="text-lg font-bold text-white">Técnica</h3>
            <input 
              type="number" 
              placeholder="0.0" 
              step="0.1" 
              min="0" 
              max="10"
              className="w-full text-center text-5xl font-black bg-axon-bg border border-axon-border rounded-xl py-6 text-white focus:outline-none focus:border-axon-green transition-colors"
            />
          </div>

          {/* Critério 2 */}
          <div className="bg-axon-panel border border-axon-border rounded-2xl p-6 flex flex-col items-center gap-4">
            <h3 className="text-lg font-bold text-white">Criatividade</h3>
            <input 
              type="number" 
              placeholder="0.0" 
              step="0.1" 
              min="0" 
              max="10"
              className="w-full text-center text-5xl font-black bg-axon-bg border border-axon-border rounded-xl py-6 text-white focus:outline-none focus:border-axon-green transition-colors"
            />
          </div>

          {/* Critério 3 */}
          <div className="bg-axon-panel border border-axon-border rounded-2xl p-6 flex flex-col items-center gap-4">
            <h3 className="text-lg font-bold text-white">Figurino / Presença</h3>
            <input 
              type="number" 
              placeholder="0.0" 
              step="0.1" 
              min="0" 
              max="10"
              className="w-full text-center text-5xl font-black bg-axon-bg border border-axon-border rounded-xl py-6 text-white focus:outline-none focus:border-axon-green transition-colors"
            />
          </div>

        </div>

        {/* FEEDBACK DE ÁUDIO E ENVIO */}
        <div className="flex gap-4 mt-auto">
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`flex-1 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold text-lg transition-all ${
              isRecording 
                ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse" 
                : "bg-axon-panel border-axon-border text-gray-400 hover:text-white hover:border-gray-500"
            }`}
          >
            <Mic size={28} />
            {isRecording ? "Gravando Crítica... (Clique para Parar)" : "Gravar Feedback em Áudio"}
          </button>

          <button className="flex-1 bg-axon-green text-black rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-[#00c866] transition-colors shadow-[0_0_30px_rgba(0,230,118,0.3)]">
            <Send size={28} />
            Enviar Notas
          </button>
        </div>

      </main>
    </div>
  );
}