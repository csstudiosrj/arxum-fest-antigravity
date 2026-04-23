"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Settings, ListTree, CalendarDays, GripVertical } from "lucide-react";

export default function PainelEventoPage() {
  // Estado para controlar qual aba está ativa
  const[abaAtiva, setAbaAtiva] = useState("configuracoes");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* NAVEGAÇÃO SUPERIOR (BREADCRUMB) */}
      <div className="flex items-center gap-4">
        <Link 
          href="/eventos" 
          className="w-10 h-10 bg-axon-panel border border-axon-border rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Festival de Dança AXON 2026</h1>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border text-axon-green bg-axon-green/10 border-axon-green/20">
              Inscrições Abertas
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">15 a 18 de Julho, 2026 • Teatro Municipal, RJ</p>
        </div>
      </div>

      {/* SISTEMA DE ABAS (TABS) */}
      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
        
        {/* Cabeçalho das Abas */}
        <div className="flex border-b border-axon-border px-4">
          <button 
            onClick={() => setAbaAtiva("configuracoes")}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "configuracoes" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <Settings size={18} />
            Configurações
          </button>
          <button 
            onClick={() => setAbaAtiva("categorias")}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "categorias" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <ListTree size={18} />
            Categorias & Taxas
          </button>
          <button 
            onClick={() => setAbaAtiva("lineup")}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "lineup" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <CalendarDays size={18} />
            Line-up (Cronograma)
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="p-8">
          
          {/* Aba: Configurações */}
          {abaAtiva === "configuracoes" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-white mb-4">Dados Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Nome do Festival</label>
                  <input type="text" disabled value="Festival de Dança AXON 2026" className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2 text-white opacity-50 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Local (Teatro/Ginásio)</label>
                  <input type="text" disabled value="Teatro Municipal, RJ" className="w-full bg-axon-bg border border-axon-border rounded-md px-4 py-2 text-white opacity-50 cursor-not-allowed" />
                </div>
              </div>
              <p className="text-sm text-gray-500 italic mt-4">* Campos bloqueados na visualização de demonstração.</p>
            </div>
          )}

          {/* Aba: Categorias */}
          {abaAtiva === "categorias" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Categorias Disponíveis</h3>
                <button className="text-sm text-axon-green hover:underline">Adicionar Categoria</button>
              </div>
              
              <div className="bg-axon-bg border border-axon-border rounded-lg divide-y divide-axon-border">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">Jazz Avançado</p>
                    <p className="text-sm text-gray-400">Solo: R$ 100 | Duo: R$ 150 | Conjunto: R$ 60/pax</p>
                  </div>
                  <span className="bg-white/5 text-gray-300 text-xs px-2 py-1 rounded">12 Inscrições</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">Ballet Clássico de Repertório</p>
                    <p className="text-sm text-gray-400">Solo: R$ 120 | Duo: R$ 180 | Conjunto: R$ 70/pax</p>
                  </div>
                  <span className="bg-white/5 text-gray-300 text-xs px-2 py-1 rounded">8 Inscrições</span>
                </div>
              </div>
            </div>
          )}

          {/* Aba: Line-up */}
          {abaAtiva === "lineup" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Montagem do Line-up</h3>
                  <p className="text-sm text-gray-400">Arraste para reordenar as apresentações.</p>
                </div>
                <button className="bg-white/5 border border-axon-border text-white px-4 py-2 rounded-md text-sm hover:bg-white/10 transition-colors">
                  Gerar PDF
                </button>
              </div>

              {/* Mockup de Drag and Drop */}
              <div className="space-y-2">
                {[
                  { id: "001", escola: "Studio de Dança Alpha", coreografia: "O Despertar", cat: "Jazz Avançado" },
                  { id: "002", escola: "Cia de Ballet Beta", coreografia: "Valsa das Flores", cat: "Ballet Clássico" },
                  { id: "003", escola: "Escola de Artes Gama", coreografia: "Ruptura", cat: "Dança Contemporânea" }
                ].map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 bg-axon-bg border border-axon-border p-3 rounded-lg hover:border-gray-600 transition-colors cursor-move group">
                    <GripVertical size={20} className="text-gray-600 group-hover:text-gray-400" />
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.coreografia}</p>
                      <p className="text-xs text-gray-400">{item.escola} • {item.cat}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {item.id}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-axon-green mt-4">
                O recurso real de Drag & Drop será implementado na fase de integração.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}