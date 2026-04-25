"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, Save, X, Package,
  ReceiptText, Settings, ToggleLeft, ToggleRight,
  TrendingUp, Banknote, QrCode, CreditCard,
  AlertCircle, CheckCircle, ChevronDown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

interface Venda {
  id: string;
  total: number;
  forma_pagamento: string;
  sincronizado: boolean;
  created_at: string;
  itens: { nome: string; preco: number; quantidade: number }[];
  operador_id: string | null;
}

interface PdvConfig {
  id: string;
  pin_vendedor: string;
  chave_pix: string | null;
  nome_recebedor: string | null;
  cidade_recebedor: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORIAS_CANTINA = ["Bebidas", "Salgados", "Doces", "Lanches", "Outros"];
const CATEGORIAS_BILHETERIA = ["Ingressos", "Pacotes", "VIP", "Outros"];

function moeda(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function iconeForma(forma: string) {
  if (forma === "pix") return <QrCode size={14} className="text-axon-green" />;
  if (forma === "cartao") return <CreditCard size={14} className="text-blue-400" />;
  return <Banknote size={14} className="text-yellow-400" />;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, visivel, erro }: { msg: string; visivel: boolean; erro?: boolean }) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg z-50 transition-all duration-300 ${
      visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
    } ${erro ? "bg-red-500 text-white" : "bg-axon-green text-black"}`}>
      {erro ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {msg}
    </div>
  );
}

// ─── Modal de Produto ─────────────────────────────────────────────────────────

function ModalProduto({
  produto,
  onSalvar,
  onFechar,
  salvando,
}: {
  produto: Partial<Produto> | null;
  onSalvar: (p: Partial<Produto>) => void;
  onFechar: () => void;
  salvando: boolean;
}) {
  const [form, setForm] = useState<Partial<Produto>>(
    produto ?? { tipo: "cantina", ativo: true, ordem: 0 }
  );

  const categorias = form.tipo === "bilheteria" ? CATEGORIAS_BILHETERIA : CATEGORIAS_CANTINA;
  const valido = form.nome?.trim() && form.preco && form.categoria && form.tipo;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-axon-panel border border-axon-border rounded-2xl p-6 w-full max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {produto?.id ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button onClick={onFechar} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tipo */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Seção</label>
            <div className="flex bg-axon-bg border border-axon-border rounded-lg p-1">
              {(["cantina", "bilheteria"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, tipo: t, categoria: undefined }))}
                  className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                    form.tipo === t ? "bg-axon-panel text-white shadow" : "text-gray-500 hover:text-white"
                  }`}
                >
                  {t === "cantina" ? "🍔 Cantina" : "🎟️ Bilheteria"}
                </button>
              ))}
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Nome do Produto</label>
            <input
              value={form.nome ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green"
              placeholder="Ex: Água Mineral 500ml"
            />
          </div>

          {/* Preço + Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Preço (R$)</label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={form.preco ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, preco: parseFloat(e.target.value) }))}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Categoria</label>
              <select
                value={form.categoria ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green"
              >
                <option value="">Selecione</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Estoque */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">
              Estoque <span className="text-gray-600 normal-case">(deixe vazio para ilimitado)</span>
            </label>
            <input
              type="number"
              min="0"
              value={form.estoque ?? ""}
              onChange={(e) => setForm((f) => ({
                ...f,
                estoque: e.target.value === "" ? null : parseInt(e.target.value),
              }))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green"
              placeholder="Ilimitado"
            />
          </div>

          {/* Ordem */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">
              Ordem de exibição
            </label>
            <input
              type="number"
              min="0"
              value={form.ordem ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, ordem: parseInt(e.target.value) || 0 }))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onFechar}
            className="flex-1 py-2.5 rounded-lg border border-axon-border text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSalvar(form)}
            disabled={salvando || !valido}
            className="flex-1 py-2.5 rounded-lg bg-axon-green text-black font-bold text-sm hover:bg-[#00c866] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={15} />
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Aba Produtos ─────────────────────────────────────────────────────────────

function AbaProdutos({
  produtos,
  onNovo,
  onEditar,
  onToggle,
  onExcluir,
}: {
  produtos: Produto[];
  onNovo: () => void;
  onEditar: (p: Produto) => void;
  onToggle: (p: Produto) => void;
  onExcluir: (id: string) => void;
}) {
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "cantina" | "bilheteria">("todos");

  const filtrados = produtos.filter((p) =>
    filtroTipo === "todos" ? true : p.tipo === filtroTipo
  );

  const cantina = produtos.filter((p) => p.tipo === "cantina");
  const bilheteria = produtos.filter((p) => p.tipo === "bilheteria");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex bg-axon-bg border border-axon-border rounded-lg p-1">
          {(["todos", "cantina", "bilheteria"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filtroTipo === t ? "bg-axon-panel text-white shadow" : "text-gray-500 hover:text-white"
              }`}
            >
              {t === "todos" ? `Todos (${produtos.length})` : t === "cantina" ? `🍔 Cantina (${cantina.length})` : `🎟️ Bilheteria (${bilheteria.length})`}
            </button>
          ))}
        </div>
        <button
          onClick={onNovo}
          className="flex items-center gap-2 bg-axon-green text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#00c866] transition-colors"
        >
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600 gap-3">
          <Package size={40} className="opacity-30" />
          <p className="text-sm">Nenhum produto cadastrado ainda.</p>
          <button onClick={onNovo} className="text-axon-green text-sm hover:underline">
            Cadastrar primeiro produto →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados
            .sort((a, b) => a.ordem - b.ordem)
            .map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between bg-axon-bg border rounded-xl px-4 py-3 transition-colors ${
                  p.ativo ? "border-axon-border" : "border-axon-border opacity-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{p.nome}</p>
                    <span className="text-xs text-gray-600 bg-axon-panel px-2 py-0.5 rounded-full shrink-0">
                      {p.categoria}
                    </span>
                    <span className="text-xs text-gray-600 shrink-0">
                      {p.tipo === "cantina" ? "🍔" : "🎟️"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-axon-green font-bold text-sm">{moeda(p.preco)}</p>
                    <p className="text-xs text-gray-600">
                      Estoque: {p.estoque === null ? "Ilimitado" : p.estoque}
                    </p>
                    <p className="text-xs text-gray-600">Ordem: {p.ordem}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggle(p)}
                    className={`transition-colors ${p.ativo ? "text-axon-green hover:text-gray-400" : "text-gray-600 hover:text-axon-green"}`}
                    title={p.ativo ? "Desativar" : "Ativar"}
                  >
                    {p.ativo ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button
                    onClick={() => onEditar(p)}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onExcluir(p.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Aba Vendas ───────────────────────────────────────────────────────────────

function AbaVendas({ vendas }: { vendas: Venda[] }) {
  const total = vendas.reduce((a, v) => a + v.total, 0);
  const porForma = {
    pix: vendas.filter((v) => v.forma_pagamento === "pix").reduce((a, v) => a + v.total, 0),
    cartao: vendas.filter((v) => v.forma_pagamento === "cartao").reduce((a, v) => a + v.total, 0),
    dinheiro: vendas.filter((v) => v.forma_pagamento === "dinheiro").reduce((a, v) => a + v.total, 0),
  };

  const [expandido, setExpandido] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Geral", valor: moeda(total), cor: "text-axon-green", icon: <TrendingUp size={16} /> },
          { label: "PIX", valor: moeda(porForma.pix), cor: "text-axon-green", icon: <QrCode size={16} /> },
          { label: "Cartão", valor: moeda(porForma.cartao), cor: "text-blue-400", icon: <CreditCard size={16} /> },
          { label: "Dinheiro", valor: moeda(porForma.dinheiro), cor: "text-yellow-400", icon: <Banknote size={16} /> },
        ].map(({ label, valor, cor, icon }) => (
          <div key={label} className="bg-axon-bg border border-axon-border rounded-xl p-4">
            <div className={`flex items-center gap-1.5 ${cor} mb-2`}>{icon}<span className="text-xs">{label}</span></div>
            <p className={`text-xl font-bold ${cor}`}>{valor}</p>
          </div>
        ))}
      </div>

      {/* Lista de vendas */}
      {vendas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600 gap-3">
          <ReceiptText size={40} className="opacity-30" />
          <p className="text-sm">Nenhuma venda registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...vendas]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((v) => (
              <div key={v.id} className="bg-axon-bg border border-axon-border rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                  onClick={() => setExpandido(expandido === v.id ? null : v.id)}
                >
                  <div className="flex items-center gap-3">
                    {iconeForma(v.forma_pagamento)}
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">{moeda(v.total)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(v.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!v.sincronizado && (
                      <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                        Pendente sync
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${expandido === v.id ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {expandido === v.id && (
                  <div className="px-4 pb-4 border-t border-axon-border pt-3 space-y-1.5">
                    {v.itens.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-400">
                        <span>{item.quantidade}× {item.nome}</span>
                        <span>{moeda(item.preco * item.quantidade)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Aba Configurações ────────────────────────────────────────────────────────

function AbaConfig({
  config,
  onSalvar,
  salvando,
}: {
  config: PdvConfig | null;
  onSalvar: (c: Partial<PdvConfig>) => void;
  salvando: boolean;
}) {
  const [form, setForm] = useState<Partial<PdvConfig>>(config ?? {});

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Acesso dos Vendedores</h3>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 uppercase tracking-wider">PIN de 4 dígitos</label>
          <input
            type="password"
            maxLength={4}
            value={form.pin_vendedor ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, pin_vendedor: e.target.value }))}
            className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green tracking-widest text-center text-2xl font-bold"
            placeholder="••••"
          />
          <p className="text-xs text-gray-600">
            O vendedor usa esse PIN para acessar as telas <code className="text-axon-green">/pdv</code> e <code className="text-axon-green">/bilheteria</code>.
          </p>
        </div>
      </div>

      <div className="h-px bg-axon-border" />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Configuração PIX</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Chave PIX</label>
            <input
              value={form.chave_pix ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, chave_pix: e.target.value }))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green"
              placeholder="CPF, CNPJ, e-mail ou chave aleatória"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Nome do Recebedor</label>
            <input
              value={form.nome_recebedor ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, nome_recebedor: e.target.value }))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green"
              placeholder="Nome que aparece no app do pagador"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Cidade</label>
            <input
              value={form.cidade_recebedor ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, cidade_recebedor: e.target.value }))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-axon-green"
              placeholder="Rio de Janeiro"
            />
          </div>
        </div>
        <p className="text-xs text-gray-600">
          O QR Code PIX é gerado localmente via padrão EMV — sem intermediário, o dinheiro cai direto na sua conta.
        </p>
      </div>

      <button
        onClick={() => onSalvar(form)}
        disabled={salvando}
        className="flex items-center gap-2 bg-axon-green text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#00c866] transition-colors disabled:opacity-40"
      >
        <Save size={15} />
        {salvando ? "Salvando..." : "Salvar Configurações"}
      </button>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function AdminPdvPage() {
  const supabase = createClient();

  const [aba, setAba] = useState<"produtos" | "vendas" | "config">("produtos");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [config, setConfig] = useState<PdvConfig | null>(null);
  const [modalProduto, setModalProduto] = useState<Partial<Produto> | null | false>(false);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState({ msg: "", visivel: false, erro: false });

  const mostrarToast = (msg: string, erro = false) => {
    setToast({ msg, visivel: true, erro });
    setTimeout(() => setToast((t) => ({ ...t, visivel: false })), 2500);
  };

  // ── Carregar dados ──
  useEffect(() => {
    async function carregar() {
      const [{ data: prods }, { data: vends }, { data: cfg }] = await Promise.all([
        supabase.from("pdv_produtos").select("*").order("ordem"),
        supabase.from("pdv_vendas").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("pdv_config").select("*").limit(1).maybeSingle(),
      ]);
      if (prods) setProdutos(prods as Produto[]);
      if (vends) setVendas(vends as Venda[]);
      if (cfg) setConfig(cfg as PdvConfig);
    }
    carregar();
  }, []);

  // ── Realtime vendas ──
  useEffect(() => {
    const channel = supabase
      .channel("pdv_vendas_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pdv_vendas" }, (payload) => {
        setVendas((prev) => [payload.new as Venda, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── CRUD Produtos ──
  const salvarProduto = async (form: Partial<Produto>) => {
    setSalvando(true);
    if (form.id) {
      const { error } = await supabase.from("pdv_produtos").update(form).eq("id", form.id);
      if (!error) {
        setProdutos((prev) => prev.map((p) => (p.id === form.id ? { ...p, ...form } as Produto : p)));
        mostrarToast("Produto atualizado!");
      } else mostrarToast("Erro ao atualizar.", true);
    } else {
      const { data, error } = await supabase.from("pdv_produtos").insert(form).select().single();
      if (!error && data) {
        setProdutos((prev) => [...prev, data as Produto]);
        mostrarToast("Produto cadastrado!");
      } else mostrarToast("Erro ao cadastrar.", true);
    }
    setSalvando(false);
    setModalProduto(false);
  };

  const toggleAtivo = async (p: Produto) => {
    const { error } = await supabase
      .from("pdv_produtos")
      .update({ ativo: !p.ativo })
      .eq("id", p.id);
    if (!error) {
      setProdutos((prev) => prev.map((x) => (x.id === p.id ? { ...x, ativo: !x.ativo } : x)));
      mostrarToast(p.ativo ? "Produto desativado." : "Produto ativado!");
    }
  };

  const excluirProduto = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("pdv_produtos").delete().eq("id", id);
    if (!error) {
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      mostrarToast("Produto excluído.");
    } else mostrarToast("Erro ao excluir.", true);
  };

  // ── Salvar Config ──
  const salvarConfig = async (form: Partial<PdvConfig>) => {
    setSalvando(true);
    if (config?.id) {
      const { error } = await supabase.from("pdv_config").update(form).eq("id", config.id);
      if (!error) { setConfig({ ...config, ...form } as PdvConfig); mostrarToast("Configurações salvas!"); }
      else mostrarToast("Erro ao salvar.", true);
    } else {
      const { data, error } = await supabase.from("pdv_config").insert(form).select().single();
      if (!error && data) { setConfig(data as PdvConfig); mostrarToast("Configurações salvas!"); }
      else mostrarToast("Erro ao salvar.", true);
    }
    setSalvando(false);
  };

  const abas = [
    { id: "produtos" as const, label: "Produtos", icon: Package },
    { id: "vendas" as const, label: "Vendas", icon: ReceiptText },
    { id: "config" as const, label: "Configurações", icon: Settings },
  ];

  return (
    <>
      <Toast {...toast} />

      {modalProduto !== false && (
        <ModalProduto
          produto={modalProduto}
          onSalvar={salvarProduto}
          onFechar={() => setModalProduto(false)}
          salvando={salvando}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">PDV — Gestão</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Cadastro de produtos, acompanhamento de vendas e configurações do caixa.
          </p>
        </div>

        <div className="bg-axon-panel border border-axon-border rounded-2xl overflow-hidden">
          {/* Abas */}
          <div className="flex border-b border-axon-border px-4">
            {abas.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAba(id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  aba === id
                    ? "border-axon-green text-axon-green"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
                {id === "vendas" && vendas.length > 0 && (
                  <span className="ml-1 bg-axon-green/20 text-axon-green text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {vendas.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {aba === "produtos" && (
              <AbaProdutos
                produtos={produtos}
                onNovo={() => setModalProduto(null)}
                onEditar={(p) => setModalProduto(p)}
                onToggle={toggleAtivo}
                onExcluir={excluirProduto}
              />
            )}
            {aba === "vendas" && <AbaVendas vendas={vendas} />}
            {aba === "config" && (
              <AbaConfig config={config} onSalvar={salvarConfig} salvando={salvando} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}