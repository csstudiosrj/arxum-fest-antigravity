"use client";

import { useState } from "react";
import { Users, Music, CreditCard, Upload, Plus, AlertCircle, ShoppingBag, Image } from "lucide-react";

export default function PortalEscolaPage() {
  const[abaAtiva, setAbaAtiva] = useState("elenco");

  return (
    <div className="min-h-screen bg-axon-bg flex flex-col">
      <header className="h-16 bg-axon-panel border-b border-axon-border flex items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-wider">
            AXON <span className="text-axon-green font-light">Fest</span>
          </span>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setAbaAtiva("elenco")} className={`text-sm font-medium transition-colors ${abaAtiva === "elenco" ? "text-axon-green" : "text-gray-400 hover:text-white"}`}>Meu Elenco</button>
            <button onClick={() => setAbaAtiva("inscricoes")} className={`text-sm font-medium transition-colors ${abaAtiva === "inscricoes" ? "text-axon-green" : "text-gray-400 hover:text-white"}`}>Minhas Inscrições</button>
            <button onClick={() => setAbaAtiva("loja")} className={`text-sm font-medium transition-colors ${abaAtiva === "loja" ? "text-axon-green" : "text-gray-400 hover:text-white"}`}>Loja do Evento</button>
            <button onClick={() => setAbaAtiva("financeiro")} className={`text-sm font-medium transition-colors ${abaAtiva === "financeiro" ? "text-axon-green" : "text-gray-400 hover:text-white"}`}>Financeiro</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">Studio Alpha de Dança</div>
            <div className="text-xs text-gray-500">Área do Coreógrafo</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-axon-border flex items-center justify-center text-white font-bold">SA</div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-8 space-y-6">
        
        {abaAtiva === "elenco" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Meu Banco de Elenco</h1>
                <p className="text-gray-400 text-sm">Cadastre seus bailarinos uma única vez para usá-los em qualquer festival.</p>
              </div>
              <button className="bg-axon-green text-black px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#00c866]">
                <Plus size={18} /> Novo Bailarino
              </button>
            </div>
            
            <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-axon-bg/50 text-gray-400 border-b border-axon-border">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nome Completo</th>
                    <th className="px-6 py-4 font-medium">Data de Nascimento</th>
                    <th className="px-6 py-4 font-medium">CPF / RG</th>
                    <th className="px-6 py-4 font-medium">Termo de Imagem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-axon-border">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-white font-medium">Ana Clara Silva</td>
                    <td className="px-6 py-4 text-gray-300">15/04/2008 (16 anos)</td>
                    <td className="px-6 py-4 text-gray-400">111.222.333-44</td>
                    <td className="px-6 py-4 text-axon-green text-xs">Assinado Digitalmente</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-white font-medium">Beatriz Souza</td>
                    <td className="px-6 py-4 text-gray-300">22/10/2007 (17 anos)</td>
                    <td className="px-6 py-4 text-gray-400">555.666.777-88</td>
                    <td className="px-6 py-4 text-yellow-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> Pendente (Assinatura dos Pais)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {abaAtiva === "inscricoes" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Minhas Coreografias</h1>
                <p className="text-gray-400 text-sm">Envie suas músicas e gerencie as inscrições ativas.</p>
              </div>
              <button className="bg-axon-panel border border-axon-border text-white px-4 py-2 rounded-md font-medium hover:bg-white/5">
                Inscrever em Novo Festival
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-axon-panel border border-axon-border rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">O Despertar</h3>
                    <p className="text-sm text-gray-400">Festival de Dança AXON 2026 • Jazz Avançado</p>
                  </div>
                  <span className="bg-axon-green/10 text-axon-green border border-axon-green/20 px-2 py-1 rounded text-xs font-medium">Confirmada</span>
                </div>
                <div className="bg-axon-bg border border-axon-border rounded-lg p-4 flex items-center justify-between border-dashed">
                  <div className="flex items-center gap-3">
                    <Music size={20} className="text-axon-green" />
                    <div>
                      <p className="text-sm text-white">Música Enviada</p>
                      <p className="text-xs text-gray-500">001_StudioAlpha_ODespertar.mp3</p>
                    </div>
                  </div>
                  <button className="text-xs text-gray-400 hover:text-white underline">Substituir</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOVA ABA: LOJA & UPSELL */}
        {abaAtiva === "loja" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Loja do Evento</h1>
                <p className="text-gray-400 text-sm">Compre antecipadamente pacotes de mídia e merchandising oficial.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-axon-panel border border-axon-border rounded-xl p-6 flex flex-col group">
                <div className="w-12 h-12 bg-axon-bg border border-axon-border rounded-lg flex items-center justify-center text-axon-green mb-4">
                  <Image size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Pacote de Fotos Oficial</h3>
                <p className="text-sm text-gray-400 mb-4 flex-1">Receba todas as fotos em alta resolução da sua coreografia.</p>
                <div className="flex items-center justify-between pt-4 border-t border-axon-border">
                  <span className="text-xl font-bold text-white">R$ 50,00</span>
                  <button className="bg-axon-green text-black px-3 py-1.5 rounded text-sm font-bold hover:bg-[#00c866]">Adicionar</button>
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
                  <button className="bg-axon-green text-black px-3 py-1.5 rounded text-sm font-bold hover:bg-[#00c866]">Adicionar</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}