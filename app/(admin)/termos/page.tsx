"use client";

import { useState } from "react";
import { FileSignature, FileText, CheckSquare, Users } from "lucide-react";

export default function TermosPage() {
  const [abaAtiva, setAbaAtiva] = useState("regulamento");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Termos & Contratos</h1>
          <p className="text-gray-400 mt-1">Gestão do Edital e termos de responsabilidade legais.</p>
        </div>
        <button className="bg-axon-green text-black px-4 py-2 rounded-md font-medium hover:bg-[#00c866] transition-colors">
          Salvar Alterações
        </button>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
        <div className="flex border-b border-axon-border px-4">
          <button onClick={() => setAbaAtiva("regulamento")} className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "regulamento" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}>
            <FileText size={18} /> Regulamento (Edital)
          </button>
          <button onClick={() => setAbaAtiva("imagem")} className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "imagem" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}>
            <FileSignature size={18} /> Uso de Imagem
          </button>
          <button onClick={() => setAbaAtiva("status")} className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "status" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}>
            <Users size={18} /> Status de Assinaturas
          </button>
        </div>

        <div className="p-6">
          {abaAtiva === "regulamento" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-axon-bg border border-axon-border rounded-lg p-4 flex items-start gap-3">
                <CheckSquare size={20} className="text-axon-green mt-0.5" />
                <div>
                  <p className="text-white font-medium">Aceite Obrigatório</p>
                  <p className="text-sm text-gray-400">O coordenador da escola será obrigado a marcar a caixa "Li e concordo com o regulamento" antes de finalizar qualquer inscrição.</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Texto do Regulamento Oficial</label>
                <textarea 
                  className="w-full h-96 bg-axon-bg border border-axon-border rounded-lg p-4 text-gray-300 focus:outline-none focus:border-axon-green resize-none"
                  placeholder="Cole aqui o texto completo do regulamento do seu festival..."
                  defaultValue="Art. 1º - O Festival de Dança AXON tem como objetivo..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}