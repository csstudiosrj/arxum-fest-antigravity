"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Minus, Trash2, ShoppingCart, Wifi, WifiOff,
  QrCode, Banknote, CreditCard, CheckCircle, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import QRCode from "qrcode";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  tipo: "cantina" | "bilheteria";
  estoque: number | null;
  ativo: boolean;
  ordem: number;
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

interface VendaLocal {
  id: string;
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
  forma_pagamento: string;
  produtora_id: string | null;
  operador_nome: string | null;
  sincronizado: boolean;
  created_at: string;
}

interface PdvConfig {
  pin_admin: string;
  pix_chave: string | null;
  pix_nome: string | null;
  pix_cidade: string | null;
}

// ─── IndexedDB ────────────────────────────────────────────────────────────────

function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("axon_pdv", 1);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("vendas"))
        db.createObjectStore("vendas", { keyPath: "id" });
      if (!db.objectStoreNames.contains("produtos"))
        db.createObjectStore("produtos", { keyPath: "id" });
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

async function buscarVendasPendentes(): Promise<VendaLocal[]> {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("vendas", "readonly");
    const req = tx.objectStore("vendas").getAll();
    req.onsuccess = () =>
      resolve((req.result as VendaLocal[]).filter((v) => !v.sincronizado));
    req.onerror = () => reject(req.error);
  });
}

async function marcarSincronizada(id: string) {
  const db = await abrirDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("vendas", "readwrite");
    const store = tx.objectStore("vendas");
    const req = store.get(id);
    req.onsuccess = () => {
      const v = req.result as VendaLocal;
      if (v) { v.sincronizado = true; store.put(v); }
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

// ─── Gerador PIX EMV ──────────────────────────────────────────────────────────

function gerarPixEMV(chave: string, nome: string, cidade: string, valor: number): string {
  const valorStr = valor.toFixed(2);
  function tlv(tag: string, value: string) {
    return `${tag}${value.length.toString().padStart(2, "0")}${value}`;
  }
  const merchantAccountInfo = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", chave);
  const payload = [
    tlv("00", "01"),
    tlv("26", merchantAccountInfo),
    tlv("52", "0000"),
    tlv("53", "986"),
    tlv("54", valorStr),
    tlv("58", "BR"),
    tlv("59", nome.substring(0, 25)),
    tlv("60", cidade.substring(0, 15)),
    tlv("62", tlv("05", "***")),
    "6304",
  ].join("");
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return payload + (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

// ─── Modal QR Code PIX ────────────────────────────────────────────────────────

function ModalPIX({
  total, config, onConfirmar, onCancelar,
}: {
  total: number; config: PdvConfig; onConfirmar: () => void; onCancelar: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!config.pix_chave || !config.pix_nome || !config.pix_cidade) return;
    const emv = gerarPixEMV(
      config.pix_chave,
      config.pix_nome,
      config.pix_cidade,
      total
    );
    QRCode.toDataURL(emv, {
      width: 280,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [total, config]);

  const semConfig = !config.pix_chave || !config.pix_nome || !config.pix_cidade;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-axon-panel border border-axon-border rounded-2xl p-6 w-full max-w-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <QrCode size={20} className="text-axon-gold" /> Pagamento PIX
          </h2>
          <button onClick={onCancelar} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-axon-gold mb-1">
            R$ {total.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-gray-500">Valor exato a ser cobrado</p>
        </div>

        {semConfig ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
            <p className="text-yellow-400 text-sm">
              Configure a chave PIX em <strong>PDV → Configurações</strong>.
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="QR Code PIX"
                width={220}
                height={220}
                className="rounded-xl bg-white p-2"
              />
            ) : (
              <div className="w-[220px] h-[220px] bg-axon-bg border border-axon-border rounded-xl animate-pulse" />
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Após o cliente pagar, confirme o recebimento.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancelar}
            className="py-3 rounded-xl border border-axon-border text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="py-3 rounded-xl bg-axon-gold text-black font-bold text-sm hover:bg-axon-gold/80 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} /> Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Troco ──────────────────────────────────────────────────────────────

function ModalTroco({
  total, onConfirmar, onCancelar,
}: {
  total: number; onConfirmar: () => void; onCancelar: () => void;
}) {
  const [valor, setValor] = useState("");
  const valorNum = parseFloat(valor.replace(",", ".")) || 0;
  const troco = valorNum - total;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-axon-panel border border-axon-border rounded-2xl p-6 w-full max-w-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Banknote size={20} className="text-yellow-400" /> Pagamento em Dinheiro
          </h2>
          <button onClick={onCancelar} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-white mb-1">
            R$ {total.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-gray-500">Total a cobrar</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Valor Recebido</label>
          <input
            type="number"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full bg-axon-bg border border-axon-border rounded-xl px-4 py-3 text-white text-2xl font-bold text-right focus:outline-none focus:border-axon-gold"
            placeholder="0,00"
            autoFocus
          />
        </div>

        {valorNum >= total && (
          <div className="bg-axon-gold/10 border border-axon-gold/30 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Troco</p>
            <p className="text-3xl font-bold text-axon-gold">
              R$ {troco.toFixed(2).replace(".", ",")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancelar}
            className="py-3 rounded-xl border border-axon-border text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={valorNum < total}
            className="py-3 rounded-xl bg-axon-gold text-black font-bold text-sm hover:bg-axon-gold/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tela de Venda Finalizada ─────────────────────────────────────────────────

function TelaVendaFinalizada({ onNova }: { onNova: () => void }) {
  useEffect(() => {
    const t = setTimeout(onNova, 3000);
    return () => clearTimeout(t);
  }, [onNova]);

  return (
    <div className="fixed inset-0 bg-axon-bg flex flex-col items-center justify-center gap-6 z-50">
      <div className="w-24 h-24 rounded-full bg-axon-gold/20 border-2 border-axon-gold flex items-center justify-center animate-bounce">
        <CheckCircle size={48} className="text-axon-gold" />
      </div>
      <h2 className="text-2xl font-bold text-white">Venda Registrada!</h2>
      <p className="text-gray-500 text-sm">Próximo atendimento em instantes...</p>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function CaixaPage() {
  const supabase = createClient();

  const [config, setConfig] = useState<PdvConfig | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [online, setOnline] = useState(true);
  const [modal, setModal] = useState<"pix" | "dinheiro" | null>(null);
  const [vendaFinalizada, setVendaFinalizada] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  // Tenant isolation
  const [produtoraId, setProdutoraId] = useState<string | null>(null);
  const [operadorNome, setOperadorNome] = useState<string | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    window.addEventListener("online", () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));
  }, []);

  useEffect(() => {
    async function init() {
      // Autenticação e obtenção do tenant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("usuarios")
        .select("nome, produtora_id")
        .eq("id", user.id)
        .single();

      const pid = userData?.produtora_id ?? null;
      const nomeOp = userData?.nome ?? null;
      setProdutoraId(pid);
      setOperadorNome(nomeOp);

      // Carregar configurações PIX filtradas por produtora
      if (pid) {
        const { data: cfg } = await supabase
          .from("pdv_config")
          .select("*")
          .eq("produtora_id", pid)
          .maybeSingle();
        if (cfg) {
          setConfig(cfg as PdvConfig);
        } else {
          setConfig({
            pin_admin: "",
            pix_chave: null,
            pix_nome: null,
            pix_cidade: null,
          });
        }
      } else {
        setConfig({
          pin_admin: "",
          pix_chave: null,
          pix_nome: null,
          pix_cidade: null,
        });
      }

      // Carregar produtos (apenas cantina)
      if (navigator.onLine && pid) {
        const { data: prods } = await supabase
          .from("pdv_produtos")
          .select("*")
          .eq("produtora_id", pid)
          .eq("ativo", true)
          .eq("tipo", "cantina")
          .order("ordem");
        if (prods) {
          setProdutos(prods as Produto[]);
          await cachearProdutos(prods as Produto[]);
          return;
        }
      }
      // Fallback offline / sem tenant
      const cache = await buscarProdutosCache();
      setProdutos(cache.filter((p) => p.tipo === "cantina" && p.ativo));
    }
    init();
  }, [supabase]);

  const sincronizar = useCallback(async () => {
    const pendentes = await buscarVendasPendentes();
    if (pendentes.length === 0) return;

    // Envio em lote para o Supabase
    const vendasParaEnviar = pendentes.map(({ sincronizado, ...v }) => ({
      ...v,
      sincronizado: true,
    }));
    const { error } = await supabase.from("pdv_vendas").insert(vendasParaEnviar);
    if (!error) {
      // Marca todas como sincronizadas no IndexedDB
      await Promise.all(pendentes.map((v) => marcarSincronizada(v.id)));
    }
  }, [supabase]);

  useEffect(() => { if (online) sincronizar(); }, [online, sincronizar]);

  const adicionar = (p: Produto) =>
    setCarrinho((prev) => {
      const ex = prev.find((i) => i.produto.id === p.id);
      if (ex) return prev.map((i) => i.produto.id === p.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      return [...prev, { produto: p, quantidade: 1 }];
    });

  const ajustar = (id: string, delta: number) =>
    setCarrinho((prev) =>
      prev.map((i) => i.produto.id === id ? { ...i, quantidade: i.quantidade + delta } : i)
        .filter((i) => i.quantidade > 0)
    );

  const total = carrinho.reduce((a, i) => a + i.produto.preco * i.quantidade, 0);

  const finalizar = async (forma: string) => {
    if (!produtoraId) return;

    // Gera um objeto de venda plano para cada item do carrinho
    const vendasGeradas: VendaLocal[] = carrinho.map((item) => ({
      id: crypto.randomUUID(),
      produto_id: item.produto.id,
      produto_nome: item.produto.nome,
      quantidade: item.quantidade,
      preco_unitario: item.produto.preco,
      total: item.produto.preco * item.quantidade,
      forma_pagamento: forma,
      produtora_id: produtoraId,
      operador_nome: operadorNome,
      sincronizado: false,
      created_at: new Date().toISOString(),
    }));

    // Salva todas no IndexedDB
    await Promise.all(vendasGeradas.map((v) => salvarVendaLocal(v)));

    // Se online, envia em lote para o Supabase
    if (navigator.onLine) {
      const { error } = await supabase
        .from("pdv_vendas")
        .insert(vendasGeradas.map(({ sincronizado, ...v }) => ({ ...v, sincronizado: true })));
      if (!error) {
        await Promise.all(vendasGeradas.map((v) => marcarSincronizada(v.id)));
      }
    }

    setModal(null);
    setVendaFinalizada(true);
  };

  const resetar = () => { setCarrinho([]); setVendaFinalizada(false); };

  const categorias = ["Todos", ...Array.from(new Set(produtos.map((p) => p.categoria)))];
  const produtosFiltrados = categoriaAtiva === "Todos"
    ? produtos : produtos.filter((p) => p.categoria === categoriaAtiva);

  if (!config) {
    return (
      <div className="fixed inset-0 bg-axon-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-axon-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (vendaFinalizada) return <TelaVendaFinalizada onNova={resetar} />;

  return (
    <>
      {modal === "pix" && config && (
        <ModalPIX total={total} config={config}
          onConfirmar={() => finalizar("pix")} onCancelar={() => setModal(null)} />
      )}
      {modal === "dinheiro" && (
        <ModalTroco total={total}
          onConfirmar={() => finalizar("dinheiro")} onCancelar={() => setModal(null)} />
      )}

      <div className="h-screen flex flex-col bg-axon-bg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-axon-border bg-axon-panel shrink-0">
          <span className="text-white font-bold text-sm">🍔 Cantina</span>
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${
            online
              ? "bg-green-500/10 text-green-400 border-green-500/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}>
            {online ? <Wifi size={11} /> : <WifiOff size={11} />}
            {online ? "Online" : "Offline"}
          </span>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-axon-border shrink-0">
              {categorias.map((c) => (
                <button key={c} onClick={() => setCategoriaAtiva(c)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoriaAtiva === c
                      ? "bg-axon-gold text-black"
                      : "bg-axon-panel border border-axon-border text-gray-400 hover:text-white"
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {produtosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                  <ShoppingCart size={40} className="opacity-20" />
                  <p className="text-sm">Nenhum produto cadastrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {produtosFiltrados.map((p) => (
                    <button key={p.id} onClick={() => adicionar(p)}
                      className="bg-axon-panel border border-axon-border rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 sm:h-32 active:scale-95 hover:border-axon-gold transition-all group">
                      <span className="text-xs text-gray-500 mb-1">{p.categoria}</span>
                      <span className="text-sm font-semibold text-white group-hover:text-axon-gold transition-colors leading-tight mb-2">
                        {p.nome}
                      </span>
                      <span className="text-lg font-bold text-axon-gold">
                        R$ {p.preco.toFixed(2).replace(".", ",")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-72 lg:w-80 bg-axon-panel border-l border-axon-border flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-axon-border">
              <div className="flex items-center gap-2 text-white font-medium text-sm">
                <ShoppingCart size={16} className="text-axon-gold" />
                Pedido
                {carrinho.length > 0 && (
                  <span className="bg-axon-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {carrinho.reduce((a, i) => a + i.quantidade, 0)}
                  </span>
                )}
              </div>
              <button onClick={() => setCarrinho([])} className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {carrinho.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                  <ShoppingCart size={32} className="opacity-20" />
                  <p className="text-xs text-center">Toque nos produtos para adicionar</p>
                </div>
              ) : (
                carrinho.map((item) => (
                  <div key={item.produto.id} className="flex items-center justify-between bg-axon-bg border border-axon-border rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs font-medium text-white truncate">{item.produto.nome}</p>
                      <p className="text-xs text-axon-gold font-bold mt-0.5">
                        R$ {(item.produto.preco * item.quantidade).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => ajustar(item.produto.id, -1)}
                        className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white active:scale-95">
                        <Minus size={13} />
                      </button>
                      <span className="text-sm font-bold text-white w-4 text-center">{item.quantidade}</span>
                      <button onClick={() => ajustar(item.produto.id, 1)}
                        className="w-7 h-7 rounded-full bg-axon-gold/20 flex items-center justify-center text-axon-gold hover:bg-axon-gold/30 active:scale-95">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-axon-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-xl font-bold text-axon-gold">
                  R$ {total.toFixed(2).replace(".", ",")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button disabled={!carrinho.length} onClick={() => setModal("pix")}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-axon-bg border border-axon-border text-gray-400 hover:text-axon-gold hover:border-axon-gold/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95">
                  <QrCode size={18} />
                  <span className="text-xs font-medium">PIX</span>
                </button>
                <button disabled={!carrinho.length} onClick={() => setModal("dinheiro")}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-axon-bg border border-axon-border text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95">
                  <Banknote size={18} />
                  <span className="text-xs font-medium">Dinheiro</span>
                </button>
                <button disabled={!carrinho.length} onClick={() => finalizar("cartao")}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-axon-bg border border-axon-border text-gray-400 hover:text-blue-400 hover:border-blue-400/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95">
                  <CreditCard size={18} />
                  <span className="text-xs font-medium">Cartão</span>
                </button>
              </div>

              <button disabled={!carrinho.length} onClick={() => setModal("pix")}
                className="w-full py-3.5 rounded-xl bg-axon-gold text-black font-bold text-sm hover:bg-axon-gold/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95">
                Cobrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}