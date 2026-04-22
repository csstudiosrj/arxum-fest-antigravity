"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Users, Music, DollarSign, CheckCircle2, Clock } from "lucide-react";

export default function InscricoesPage() {
  const[abaAtiva, setAbaAtiva] = useState("coreografias");

  // Dados simulados para Coreografias
  const coreografias =[
    { id: "INS-001", escola: "Studio Alpha", nome: "O Despertar", categoria: "Jazz Avançado", tipo: "Conjunto", pax: 12, valor: "R$ 720,00", status: "Pago" },
    { id: "INS-002", escola: "Cia Beta", nome: "Valsa das Flores", categoria: "Ballet Clássico", tipo: "Solo", pax: 1, valor: "R$ 120,00", status: "Pendente" },
    { id: "INS-003", escola: "Studio Alpha", nome: "Ruptura", categoria: "Contemporâneo", tipo: "Duo", pax: 2, valor: "R$ 180,00", status: "Pago" },
    { id: "INS-004", escola: "Escola Gama", nome: "Urban Kings", categoria: "Danças Urbanas", tipo: "Conjunto", pax: 8, valor: "R$ 480,00", status: "Pago" },
  ];

  // Dados simulados para Banco de Elenco
  const elenco =[
    { id: "B-001", nome: "Ana Clara Silva", escola: "Studio Alpha", idade: 16, cpf: "111.***.***-22", inscricoes: 2 },
    { id: "B-002", nome: "Beatriz Souza", escola: "Studio Alpha", idade: 17, cpf: "222.***.***-33", inscricoes: 1 },
    { id: "B-003", nome: "Carlos Eduardo", escola: "Cia Beta", idade: 15, cpf: "333.***.***-44", inscricoes: 3 },
    { id: "B-004", nome: "Mariana Costa", escola: "Escola Gama", idade: 18, cpf: "444.***.***-55", inscricoes: 1 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Inscrições & Elenco</h1>
          <p className="text-gray-400 mt-1">Gestão de coreografias, bailarinos e status financeiro.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-axon-panel border border-axon-border text-white px-4 py-2 rounded-md font-medium hover:bg-white/5 transition-colors">
            Exportar Excel
          </button>
          <button className="bg-axon-green text-black px-4 py-2 rounded-md font-medium hover:bg-[#00c866] transition-colors">
            Nova Inscrição Manual
          </button>
        </div>
      </div>

      {/* KPIs (Indicadores Rápidos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Music size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total de Coreografias</p>
            <p className="text-2xl font-bold text-white">142</p>
          </div>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Bailarinos Únicos</p>
            <p className="text-2xl font-bold text-white">856</p>
          </div>
        </div>
        <div className="bg-axon-panel border border-axon-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-axon-green/10 flex items-center justify-center text-axon-green">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Receita Confirmada</p>
            <p className="text-2xl font-bold text-white">R$ 12.450</p>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO (ABAS + TABELA) */}
      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
        
        {/* Cabeçalho das Abas */}
        <div className="flex border-b border-axon-border px-4">
          <button 
            onClick={() => setAbaAtiva("coreografias")}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "coreografias" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <Music size={18} />
            Coreografias Inscritas
          </button>
          <button 
            onClick={() => setAbaAtiva("elenco")}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${abaAtiva === "elenco" ? "border-axon-green text-axon-green" : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <Users size={18} />
            Banco de Elenco
          </button>
        </div>

        {/* Barra de Ferramentas (Busca e Filtros) */}
        <div className="p-4 border-b border-axon-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder={abaAtiva === "coreografias" ? "Buscar por escola, coreografia ou ID..." : "Buscar por nome ou CPF..."}
              className="w-full bg-axon-bg border border-axon-border rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-axon-green transition-colors"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-axon-bg border border-axon-border rounded-md text-sm text-gray-300 hover:text-white transition-colors">
            <Filter size={16} />
            Filtros Avançados
          </button>
        </div>

        {/* TABELA: COREOGRAFIAS */}
        {abaAtiva === "coreografias" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-axon-bg/50 text-gray-400 border-b border-axon-border">
                <tr>
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Escola / Grupo</th>
                  <th className="px-6 py-4 font-medium">Coreografia</th>
                  <th className="px-6 py-4 font-medium">Categoria</th>
                  <th className="px-6 py-4 font-medium text-center">Pax</th>
                  <th className="px-6 py-4 font-medium">Valor</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-axon-border">
                {coreografias.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-gray-400">{item.id}</td>
                    <td className="px-6 py-4 text-white font-medium">{item.escola}</td>
                    <td className="px-6 py-4 text-gray-300">{item.nome}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {item.categoria} <span className="text-xs text-gray-500 block">{item.tipo}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-300">{item.pax}</td>
                    <td className="px-6 py-4 text-gray-300">{item.valor}</td>
                    <td className="px-6 py-4">
                      {item.status === "Pago" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-axon-green bg-axon-green/10 border border-axon-green/20">
                          <CheckCircle2 size={12} /> Pago
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-yellow-500 bg-yellow-500/10 border border-yellow-500/20">
                          <Clock size={12} /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-500 hover:text-white transition-colors p-1">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABELA: BANCO DE ELENCO */}
        {abaAtiva === "elenco" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-axon-bg/50 text-gray-400 border-b border-axon-border">
                <tr>
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Nome do Bailarino</th>
                  <th className="px-6 py-4 font-medium">Escola Vinculada</th>
                  <th className="px-6 py-4 font-medium text-center">Idade</th>
                  <th className="px-6 py-4 font-medium">Documento (CPF)</th>
                  <th className="px-6 py-4 font-medium text-center">Inscrições Ativas</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-axon-border">
                {elenco.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-gray-400">{item.id}</td>
                    <td className="px-6 py-4 text-white font-medium">{item.nome}</td>
                    <td className="px-6 py-4 text-gray-300">{item.escola}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{item.idade} anos</td>
                    <td className="px-6 py-4 text-gray-400">{item.cpf}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-white/5 text-gray-300 px-2.5 py-1 rounded-md text-xs font-medium">
                        {item.inscricoes} coreografias
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-500 hover:text-white transition-colors p-1">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rodapé da Tabela (Paginação) */}
        <div className="p-4 border-t border-axon-border flex items-center justify-between text-sm text-gray-400">
          <span>Mostrando 1 a 4 de 142 registros</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-axon-border rounded hover:bg-white/5 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-axon-border rounded hover:bg-white/5">Próxima</button>
          </div>
        </div>

      </div>
    </div>
  );
}