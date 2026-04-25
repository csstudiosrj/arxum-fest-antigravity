"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Ticket, Coffee, ShoppingCart, Plus, Minus,
  CreditCard, Banknote, Trash2, Wifi, WifiOff,
  CheckCircle, QrCode
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  tipo: "cantina" | "bilheteria";
  estoque: number | null;
  ativo: boolean;
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

interface VendaLocal {
  id: string;
  operador_id: string | null;
  itens: { produto_id: string; nome: string; preco: number; quantidade: number }[];
  total: number;
  forma_pagamento: string;
  sincronizado: boolean;
  created_at: string;
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

const DB_NAME = "axon_pdv";
const DB_VERSION = 1;

function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("vendas")) {
        db.createObjectStore("vendas", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("produtos")) {
        db.createObjectStore("produtos", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function salvarVendaLocal(venda: VendaLocal) {
  const db = await abrirDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("vendas", "readwrite");
    tx.objectStore("vendas").put(venda);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function buscarVendasNaoSincronizadas(): Promise<VendaLocal[]> {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("vendas", "readonly");
    const req = tx.objectStore("vendas").getAll();
    req.onsuccess = () =>
      resolve((req.result as VendaLocal[]).filter((v) => !v.sincronizado));
    req.onerror = () => reject(req.error);
  });
}

async function marcarVendaSincronizada(id: string) {
  const db = await abrirDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("vendas", "readwrite");
    const store = tx.objectStore("vendas");
    const req = store.get(id);
    req.onsuccess = () => {
      const venda = req.result as VendaLocal;
      if (venda) {
        venda.sincronizado = true;
        store.put(venda);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

async function cachearProdutos(produtos: Produto[]) {
  const db = await abrirDB();
  const tx = db.transaction("produtos", "readwrite");
  const store = tx.objectStore("produtos");
  store.clear();
  produtos.forEach((p) => store.put(p));
}

async function buscarProdutosCache(): Promise<Produto[]> {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("produtos", "readonly");
    const req = tx.objectStore("produtos").getAll();
    req.onsuccess = () => resolve(req.result as Produto[]);
    req.onerror = () => reject(req.error);
  });
}

// ─── Modal de Troco ───────────────────────────────────────────────────────────

function ModalTroco({
  total,
  onConfirmar,
  onCancelar,
}: {
  total: number;
  onConfirmar: (valorRecebido: number) => void;
  onCancelar: () => void;
}) {
  const [valor, setValor] = useState("");
  const valorNum = parseFloat(valor.replace(",", ".")) || 0;
  const troco = valorNum - total;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-axon-panel border border-axon-border rounded-2xl p-6 w-full max-w-sm space-y-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Banknote size={20} className="text-axon-green" /> Pagamento em Dinheiro
        </h2>
        <div className="text-sm text-gray-400">
          Total a cobrar:{" "}
          <span className="text-white font-bold text-lg">
            R$ {total.toFixed(2).replace(".", ",")}
          </span>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider">
            Valor Recebido
          </label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-axon-green text-right"
            autoFocus
          />
        </div>
        {valorNum >= total && (
          <div className="bg-axon-green/10 border border-axon-green/30 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Troco</p>
            <p className="text-2xl font-bold text-axon-green">
              R$ {troco.toFixed(2).replace(".", ",")}
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onCancelar}
            className="py-3 rounded-lg border border-axon-border text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(valorNum)}
            disabled={valorNum < total}
            className="py-3 rounded-lg bg-axon-green text-black font-bold text-sm hover:bg-[#00c866] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast de Feedback ────────────────────────────────────────────────────────

function Toast({ mensagem, visivel }: { mensagem: string; visivel: boolean }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-axon-green text-black px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-all duration-300 z-50 ${
        visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <CheckCircle size={18} />
      {mensagem}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function PdvPage() {
  const supabase = createClient();

  const [abaAtiva, setAbaAtiva] = useState<"cantina" | "bilheteria">("cantina");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [online, setOnline] = useState(true);
  const [modalTroco, setModalTroco] = useState(false);
  const [toastVisivel, setToastVisivel] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [vendaFinalizada, setVendaFinalizada] = useState(false);

  // ── Status de conexão ──
  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Carregar produtos (Supabase → cache; cache se offline) ──
  useEffect(() => {
    async function carregarProdutos() {
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from("pdv_produtos")
          .select("*")
          .eq("ativo", true)
          .order("categoria");
        if (!error && data) {
          setProdutos(data as Produto[]);
          await cachearProdutos(data as Produto[]);
          return;
        }
      }
      const cache = await buscarProdutosCache();
      setProdutos(cache);
    }
    carregarProdutos();
  }, []);

  // ── Sincronização silenciosa quando volta a internet ──
  const sincronizar = useCallback(async () => {
    const pendentes = await buscarVendasNaoSincronizadas();
    if (!pendentes.length) return;
    for (const venda of pendentes) {
      const { error } = await supabase.from("pdv_vendas").insert({
        id: venda.id,
        operador_id: venda.operador_id,
        itens: venda.itens,
        total: venda.total,
        forma_pagamento: venda.forma_pagamento,
        sincronizado: true,
        created_at: venda.created_at,
      });
      if (!error) await marcarVendaSincronizada(venda.id);
    }
  }, []);

  useEffect(() => {
    if (online) sincronizar();
  }, [online, sincronizar]);

  // ── Carrinho ──
  const adicionarItem = (produto: Produto) => {
    setCarrinho((prev) => {
      const existe = prev.find((i) => i.produto.id === produto.id);
      if (existe)
        return prev.map((i) =>
          i.produto.id === produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const ajustarQuantidade = (id: string, delta: number) => {
    setCarrinho((prev) =>
      prev
        .map((i) =>
          i.produto.id === id ? { ...i, quantidade: i.quantidade + delta } : i
        )
        .filter((i) => i.quantidade > 0)
    );
  };

  const limparCarrinho = () => setCarrinho([]);

  const total = carrinho.reduce(
    (acc, i) => acc + i.produto.preco * i.quantidade,
    0
  );

  // ── Exibir toast ──
  const mostrarToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisivel(true);
    setTimeout(() => setToastVisivel(false), 2500);
  };

  // ── Finalizar venda ──
  const finalizarVenda = async (formaPagamento: string) => {
    if (!carrinho.length) return;

    const { data: { user } } = await supabase.auth.getUser();

    const venda: VendaLocal = {
      id: crypto.randomUUID(),
      operador_id: user?.id ?? null,
      itens: carrinho.map((i) => ({
        produto_id: i.produto.id,
        nome: i.produto.nome,
        preco: i.produto.preco,
        quantidade: i.quantidade,
      })),
      total,
      forma_pagamento: formaPagamento,
      sincronizado: false,
      created_at: new Date().toISOString(),
    };

    await salvarVendaLocal(venda);

    if (navigator.onLine) {
      const { error } = await supabase.from("pdv_vendas").insert({ ...venda, sincronizado: true });
      if (!error) await marcarVendaSincronizada(venda.id);
    }

    setVendaFinalizada(true);
    setTimeout(() => {
      limparCarrinho();
      setVendaFinalizada(false);
      mostrarToast("Venda registrada!");
    }, 800);
  };

  const handleCobrar = (forma: string) => {
    if (forma === "dinheiro") {
      setModalTroco(true);
    } else {
      finalizarVenda(forma);
    }
  };

  const produtosFiltrados = produtos.filter((p) => p.tipo === abaAtiva);

  return (
    <>
      {modalTroco && (
        <ModalTroco
          total={total}
          onConfirmar={() => {
            setModalTroco(false);
            finalizarVenda("dinheiro");
          }}
          onCancelar={() => setModalTroco(false)}
        />
      )}

      <Toast mensagem={toastMsg} visivel={toastVisivel} />

      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* ── Lado Esquerdo: Produtos ── */}
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Frente de Caixa</h1>
              <span
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                  online
                    ? "bg-axon-green/10 text-axon-green border border-axon-green/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}
              >
                {online ? <Wifi size={12} /> : <WifiOff size={12} />}
                {online ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex bg-axon-panel border border-axon-border rounded-lg p-1">
              <button
                onClick={() => setAbaAtiva("cantina")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  abaAtiva === "cantina"
                    ? "bg-axon-bg text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Coffee size={16} /> Cantina
              </button>
              <button
                onClick={() => setAbaAtiva("bilheteria")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  abaAtiva === "bilheteria"
                    ? "bg-axon-bg text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Ticket size={16} /> Bilheteria
              </button>
            </div>
          </div>

          <div className="flex-1 bg-axon-panel border border-axon-border rounded-xl p-6 overflow-y-auto">
            {produtosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                <Coffee size={40} className="opacity-30" />
                <p className="text-sm">Nenhum produto cadastrado nessa categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {produtosFiltrados.map((produto) => (
                  <button
                    key={produto.id}
                    onClick={() => adicionarItem(produto)}
                    className="bg-axon-bg border border-axon-border rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-axon-green transition-colors group h-32 active:scale-95"
                  >
                    <span className="text-xs text-gray-500 mb-2">{produto.categoria}</span>
                    <span className="text-sm font-medium text-white mb-1 group-hover:text-axon-green transition-colors leading-tight">
                      {produto.nome}
                    </span>
                    <span className="text-lg font-bold text-white">
                      R$ {produto.preco.toFixed(2).replace(".", ",")}
                    </span>
                    {produto.estoque !== null && (
                      <span className="text-xs text-gray-500 mt-1">
                        Estoque: {produto.estoque}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Lado Direito: Carrinho ── */}
        <div className="w-96 bg-axon-panel border border-axon-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-axon-border bg-axon-bg/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-medium">
              <ShoppingCart size={18} className="text-axon-green" />
              Pedido Atual
              {carrinho.length > 0 && (
                <span className="bg-axon-green text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {carrinho.reduce((a, i) => a + i.quantidade, 0)}
                </span>
              )}
            </div>
            <button
              onClick={limparCarrinho}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {carrinho.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <ShoppingCart size={36} className="opacity-30" />
                <p className="text-sm text-center">
                  Clique nos produtos para adicionar ao pedido
                </p>
              </div>
            ) : (
              carrinho.map((item) => (
                <div
                  key={item.produto.id}
                  className="flex items-center justify-between bg-axon-bg border border-axon-border p-3 rounded-lg"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm text-white font-medium truncate">{item.produto.nome}</p>
                    <p className="text-xs text-gray-400">
                      R$ {item.produto.preco.toFixed(2).replace(".", ",")} × {item.quantidade} ={" "}
                      <span className="text-axon-green font-medium">
                        R$ {(item.produto.preco * item.quantidade).toFixed(2).replace(".", ",")}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => ajustarQuantidade(item.produto.id, -1)}
                      className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center text-white">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => ajustarQuantidade(item.produto.id, 1)}
                      className="w-7 h-7 rounded-full bg-axon-green/20 flex items-center justify-center text-axon-green hover:bg-axon-green/30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-axon-border bg-axon-bg/50 space-y-4">
            <div className="flex items-center justify-between text-lg font-bold text-white">
              <span>Total:</span>
              <span className={`${vendaFinalizada ? "text-axon-green scale-110" : "text-axon-green"} transition-all`}>
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleCobrar("dinheiro")}
                disabled={!carrinho.length}
                className="flex flex-col items-center justify-center gap-1.5 bg-axon-panel border border-axon-border rounded-lg p-3 text-gray-300 hover:text-white hover:border-axon-green transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Banknote size={20} />
                <span className="text-xs font-medium">Dinheiro</span>
              </button>
              <button
                onClick={() => handleCobrar("pix")}
                disabled={!carrinho.length}
                className="flex flex-col items-center justify-center gap-1.5 bg-axon-panel border border-axon-border rounded-lg p-3 text-gray-300 hover:text-white hover:border-axon-green transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <QrCode size={20} />
                <span className="text-xs font-medium">PIX</span>
              </button>
              <button
                onClick={() => handleCobrar("cartao")}
                disabled={!carrinho.length}
                className="flex flex-col items-center justify-center gap-1.5 bg-axon-panel border border-axon-border rounded-lg p-3 text-gray-300 hover:text-white hover:border-axon-green transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CreditCard size={20} />
                <span className="text-xs font-medium">Cartão</span>
              </button>
            </div>

            <button
              disabled={!carrinho.length}
              onClick={() => handleCobrar("pix")}
              className="w-full bg-axon-green text-black font-bold py-3 rounded-lg hover:bg-[#00c866] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>
    </>
  );
}