"use client";

import { useState } from "react";
import { Ticket, Coffee, ShoppingCart, Plus, Minus, CreditCard, Banknote, Trash2 } from "lucide-react";

export default function PdvPage() {
  const [abaAtiva, setAbaAtiva] = useState("cantina");

  const produtosCantina =[
    { id: "C1", nome: "Água Mineral 500ml", preco: 5.00, categoria: "Bebidas" },
    { id: "C2", nome: "Refrigerante Lata", preco: 8.00, categoria: "Bebidas" },
    { id: "C3", nome: "Coxinha de Frango", preco: 10.00, categoria: "Salgados" },
    { id: "C4", nome: "Pão de Queijo", preco: 7.00, categoria: "Salgados" },
    { id: "C5", nome: "Bolo de Chocolate", preco: 12.00, categoria: "Doces" },
    { id: "C6", nome: "Café Expresso", preco: 6.00, categoria: "Bebidas" },
  ];

  const produtosBilheteria =[
    { id: "I1", nome: "Ingresso Inteira - Lote 2", preco: 60.00, categoria: "Ingressos" },
    { id: "I2", nome: "Ingresso Meia - Lote 2", preco: 30.00, categoria: "Ingressos" },
    { id: "I3", nome: "Passaporte 3 Dias", preco: 150.00, categoria: "Pacotes" },
  ];

  const produtosAtuais = abaAtiva === "cantina" ? produtosCantina : produtosBilheteria;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      
      {/* LADO ESQUERDO: PRODUTOS */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Frente de Caixa (PDV)</h1>
          <div className="flex bg-axon-panel border border-axon-border rounded-lg p-1">
            <button 
              onClick={() => setAbaAtiva("cantina")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${abaAtiva === "cantina" ? "bg-axon-bg text-white shadow" : "text-gray-400 hover:text-white"}`}
            >
              <Coffee size={16} /> Cantina
            </button>
            <button 
              onClick={() => setAbaAtiva("bilheteria")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${abaAtiva === "bilheteria" ? "bg-axon-bg text-white shadow" : "text-gray-400 hover:text-white"}`}
            >
              <Ticket size={16} /> Bilheteria
            </button>
          </div>
        </div>

        <div className="flex-1 bg-axon-panel border border-axon-border rounded-xl p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {produtosAtuais.map((produto) => (
              <button 
                key={produto.id}
                className="bg-axon-bg border border-axon-border rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-axon-green transition-colors group h-32 active:scale-95"
              >
                <span className="text-xs text-gray-500 mb-2">{produto.categoria}</span>
                <span className="text-sm font-medium text-white mb-1 group-hover:text-axon-green transition-colors">{produto.nome}</span>
                <span className="text-lg font-bold text-white">R$ {produto.preco.toFixed(2).replace('.', ',')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LADO DIREITO: CARRINHO / CHECKOUT */}
      <div className="w-96 bg-axon-panel border border-axon-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-axon-border bg-axon-bg/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-medium">
            <ShoppingCart size={18} className="text-axon-green" />
            Pedido Atual
          </div>
          <button className="text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Lista de Itens no Carrinho */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Item Mock 1 */}
          <div className="flex items-center justify-between bg-axon-bg border border-axon-border p-3 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Água Mineral 500ml</p>
              <p className="text-xs text-gray-400">R$ 5,00</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"><Minus size={14} /></button>
              <span className="text-sm font-medium w-4 text-center text-white">2</span>
              <button className="w-7 h-7 rounded-full bg-axon-green/20 flex items-center justify-center text-axon-green hover:bg-axon-green/30"><Plus size={14} /></button>
            </div>
          </div>

          {/* Item Mock 2 */}
          <div className="flex items-center justify-between bg-axon-bg border border-axon-border p-3 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Coxinha de Frango</p>
              <p className="text-xs text-gray-400">R$ 10,00</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"><Minus size={14} /></button>
              <span className="text-sm font-medium w-4 text-center text-white">1</span>
              <button className="w-7 h-7 rounded-full bg-axon-green/20 flex items-center justify-center text-axon-green hover:bg-axon-green/30"><Plus size={14} /></button>
            </div>
          </div>
        </div>

        {/* Resumo e Pagamento */}
        <div className="p-4 border-t border-axon-border bg-axon-bg/50 space-y-4">
          <div className="flex items-center justify-between text-lg font-bold text-white">
            <span>Total:</span>
            <span className="text-axon-green">R$ 20,00</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="flex flex-col items-center justify-center gap-2 bg-axon-panel border border-axon-border rounded-lg p-3 text-gray-300 hover:text-white hover:border-axon-green transition-colors">
              <Banknote size={20} />
              <span className="text-xs font-medium">Dinheiro</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 bg-axon-panel border border-axon-border rounded-lg p-3 text-gray-300 hover:text-white hover:border-axon-green transition-colors">
              <CreditCard size={20} />
              <span className="text-xs font-medium">Cartão / PIX</span>
            </button>
          </div>

          <button className="w-full bg-axon-green text-black font-bold py-3 rounded-lg hover:bg-[#00c866] transition-colors">
            Finalizar Venda
          </button>
        </div>
      </div>

    </div>
  );
}