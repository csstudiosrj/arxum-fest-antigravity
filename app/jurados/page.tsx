"use client";

import { useState } from "react";
import { Gavel, Trophy, WifiOff, QrCode, Bluetooth, Download } from "lucide-react";

export default function JuradosPage() {
  const [abaAtiva, setAbaAtiva] = useState("apuracao");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Jurados & Apuração</h1>
          <p className="text-gray-400 mt-1">Gestão de notas, ranking ao vivo e sincronização offline.</p>
        </div>
        <button className="bg-axon-panel border border-axon-border text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-white/5 transition-colors">
          <WifiOff size={20} className="text-axon-green" />
          Sincronizar Notas Offline
        </button>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
        <div className="flex border-b border-axon-border px-4">
          <button onClick={() => setAbaAtiva("apuracao")} className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "apuracao" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}>
            <Trophy size={18} /> Ranking ao Vivo
          </button>
          <button onClick={() => setAbaAtiva("painel")} className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "painel" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}>
            <Gavel size={18} /> Controle de Jurados
          </button>
          <button onClick={() => setAbaAtiva("sync")} className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "sync" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}>
            <WifiOff size={18} /> Central Offline
          </button>
        </div>

        <div className="p-6">
          {abaAtiva === "apuracao" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Categoria Atual: Jazz Avançado (Conjunto)</h3>
                <button className="text-sm bg-white/5 border border-axon-border px-3 py-1.5 rounded hover:bg-white/10 flex items-center gap-2">
                  <Download size={16} /> Gerar PDF Premiação
                </button>
              </div>
              <div className="bg-axon-bg border border-axon-border rounded-lg divide-y divide-axon-border">
                <div className="p-4 flex items-center justify-between bg-axon-green/5">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-yellow-500">1º</span>
                    <div>
                      <p className="text-white font-medium">O Despertar</p>
                      <p className="text-sm text-gray-400">Studio Alpha</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">9.85</p>
                    <p className="text-xs text-gray-500">Média Final</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">2º</span>
                    <div>
                      <p className="text-white font-medium">Ruptura</p>
                      <p className="text-sm text-gray-400">Cia Beta</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">9.40</p>
                    <p className="text-xs text-gray-500">Média Final</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === "sync" && (
            <div className="space-y-6 animate-in fade-in text-center py-8">
              <div className="w-16 h-16 bg-axon-bg border border-axon-border rounded-full flex items-center justify-center mx-auto mb-4">
                <Bluetooth size={32} className="text-axon-green" />
              </div>
              <h3 className="text-xl font-medium text-white">Sincronização de Palco</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Aproxime o celular do produtor para receber as notas via Bluetooth, ou escaneie o QR Code gerado no tablet do jurado.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <button className="bg-axon-green text-black px-6 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-[#00c866]">
                  <Bluetooth size={20} /> Ativar Recepção Bluetooth
                </button>
                <button className="bg-axon-panel border border-axon-border text-white px-6 py-3 rounded-md font-medium flex items-center gap-2 hover:bg-white/5">
                  <QrCode size={20} /> Ler QR Code do Jurado
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}