"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  ShoppingBag,
  Tag,
  Package,
  BarChart3,
  Settings,
  QrCode,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ClipboardList,
  Upload,
  Coffee,
  Ticket,
  LayoutGrid,
} from "lucide-react";

type TipoProduto = "cantina" | "bilheteria";

type CategoriaCantina = "Bebidas" | "Salgados" | "Doces" | "Lanches" | "Outros";
type CategoriaBilheteria = "Ingressos" | "Pacotes" | "VIP" | "Outros";
type Categoria = CategoriaCantina | CategoriaBilheteria | "Todos";

interface PdvProduto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number | null;
  tipo: TipoProduto;
  categoria: string | null;
  ativo: boolean;
  evento_id: string | null;
  created_at: string;
}

interface PdvVenda {
  id: string;
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
  forma_pagamento: "pix" | "dinheiro" | "cartao";
  created_at: string;
  operador_nome: string | null;
}

interface ConfigPdv {
  id?: string;
  produtora_id: string;
  pix_chave: string | null;
  pix_nome: string | null;
  pix_cidade: string | null;
  pin_admin: string | null;
}

const CATEGORIAS_CANTINA: CategoriaCantina[] = ["Bebidas", "Salgados", "Doces", "Lanches", "Outros"];
const CATEGORIAS_BILHETERIA: CategoriaBilheteria[] = ["Ingressos", "Pacotes", "VIP", "Outros"];

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function formatarDataHora(data: string): string {
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ToastState {
  msg: string;
  tipo: "ok" | "erro" | "aviso";
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
}

function ConfirmModal({ open, title, message, onConfirm, onCancel, loading, destructive }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${destructive ? "bg-red-500/10 border border-red-500/30" : "bg-axon-gold/10 border border-axon-gold/30"}`}>
            <AlertCircle size={22} className={destructive ? "text-red-400" : "text-axon-gold"} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-400 mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-axon-border text-gray-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2 ${destructive ? "bg-red-500 text-white hover:bg-red-600" : "bg-axon-gold text-black hover:bg-axon-gold/80"}`}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModalProdutoProps {
  open: boolean;
  produto?: PdvProduto | null;
  eventoId: string | null;
  tipoInicial?: TipoProduto;
  categoriaInicial?: string;
  onClose: () => void;
  onSaved: (produto: PdvProduto) => void;
}

function ModalProduto({ open, produto, eventoId, tipoInicial, categoriaInicial, onClose, onSaved }: ModalProdutoProps) {
  const isEdicao = !!produto;
  const [nome, setNome] = useState(() => produto?.nome ?? "");
  const [descricao, setDescricao] = useState(() => produto?.descricao ?? "");
  const [preco, setPreco] = useState(() => (produto ? String(produto.preco.toFixed(2)) : ""));
  const [estoque, setEstoque] = useState(() => (produto?.estoque != null ? String(produto.estoque) : ""));
  const [tipo, setTipo] = useState<TipoProduto>(() => produto?.tipo ?? tipoInicial ?? "cantina");
  const [categoriaSelect, setCategoriaSelect] = useState<string>(() => {
    const cat = produto?.categoria ?? categoriaInicial ?? "";
    const listaCantina: string[] = CATEGORIAS_CANTINA;
    const listaBilheteria: string[] = CATEGORIAS_BILHETERIA;
    const tipoAtual = produto?.tipo ?? tipoInicial ?? "cantina";
    const lista = tipoAtual === "cantina" ? listaCantina : listaBilheteria;
    return lista.includes(cat) ? cat : "Outros";
  });
  const [categoriaCustom, setCategoriaCustom] = useState<string>(() => {
    const cat = produto?.categoria ?? categoriaInicial ?? "";
    const listaCantina: string[] = CATEGORIAS_CANTINA;
    const listaBilheteria: string[] = CATEGORIAS_BILHETERIA;
    const tipoAtual = produto?.tipo ?? tipoInicial ?? "cantina";
    const lista = tipoAtual === "cantina" ? listaCantina : listaBilheteria;
    return !lista.includes(cat) && cat !== "" ? cat : "";
  });
  const [ativo, setAtivo] = useState(() => produto?.ativo ?? true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open) return;

    if (produto) {
      setNome(produto.nome);
      setDescricao(produto.descricao ?? "");
      setPreco(produto.preco.toFixed(2));
      setEstoque(produto.estoque != null ? String(produto.estoque) : "");
      setTipo(produto.tipo);
      const listaCantina: string[] = CATEGORIAS_CANTINA;
      const listaBilheteria: string[] = CATEGORIAS_BILHETERIA;
      const lista = produto.tipo === "cantina" ? listaCantina : listaBilheteria;
      if (lista.includes(produto.categoria ?? "")) {
        setCategoriaSelect(produto.categoria ?? "Outros");
        setCategoriaCustom("");
      } else {
        setCategoriaSelect("Outros");
        setCategoriaCustom(produto.categoria ?? "");
      }
      setAtivo(produto.ativo);
    } else {
      setNome("");
      setDescricao("");
      setPreco("");
      setEstoque("");
      setTipo(tipoInicial ?? "cantina");
      const cat = categoriaInicial ?? "";
      const listaCantina: string[] = CATEGORIAS_CANTINA;
      const listaBilheteria: string[] = CATEGORIAS_BILHETERIA;
      const lista = (tipoInicial ?? "cantina") === "cantina" ? listaCantina : listaBilheteria;
      if (lista.includes(cat)) {
        setCategoriaSelect(cat);
        setCategoriaCustom("");
      } else {
        setCategoriaSelect("Outros");
        setCategoriaCustom("");
      }
      setAtivo(true);
    }

    setErro("");
  }, [open, produto, tipoInicial, categoriaInicial]);

  const handleTipoChange = (novoTipo: TipoProduto) => {
    setTipo(novoTipo);
    setCategoriaSelect("Outros");
    setCategoriaCustom("");
  };

  const categoriaFinal = categoriaSelect === "Outros" && categoriaCustom.trim() ? categoriaCustom.trim() : categoriaSelect;
  const categoriasList = tipo === "cantina" ? CATEGORIAS_CANTINA : CATEGORIAS_BILHETERIA;

  async function handleSalvar() {
    setErro("");
    if (!nome.trim()) return setErro("Nome é obrigatório.");
    const precoNum = parseFloat(preco.replace(",", "."));
    if (isNaN(precoNum) || precoNum < 0) return setErro("Preço inválido.");
    const estoqueNum = estoque.trim() !== "" ? parseInt(estoque, 10) : null;

    setSalvando(true);
    const supabase = createClient();

    const payload = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      preco: precoNum,
      estoque: estoqueNum,
      tipo,
      categoria: categoriaFinal || null,
      ativo,
      evento_id: eventoId ?? null,
    };

    if (isEdicao && produto) {
      const { data, error } = await supabase.from("pdv_produtos").update(payload).eq("id", produto.id).select().single();
      if (error) {
        setErro(error.message);
        setSalvando(false);
        return;
      }
      onSaved(data as PdvProduto);
    } else {
      const { data, error } = await supabase.from("pdv_produtos").insert(payload).select().single();
      if (error) {
        setErro(error.message);
        setSalvando(false);
        return;
      }
      onSaved(data as PdvProduto);
    }

    setSalvando(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto py-8" onClick={onClose}>
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-axon-border">
          <h2 className="text-lg font-semibold text-white">{isEdicao ? "Editar Produto" : "Novo Produto"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
              placeholder="Ex: Coca-Cola 350ml"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
              placeholder="Opcional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Preço (R$) *</label>
              <input
                type="text"
                inputMode="decimal"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Estoque</label>
              <input
                type="number"
                min="0"
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
                placeholder="Ilimitado"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Seção *</label>
            <div className="flex gap-3">
              {(["cantina", "bilheteria"] as TipoProduto[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTipoChange(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    tipo === t ? "bg-axon-gold text-black border-axon-gold" : "border-axon-border text-gray-400 hover:text-white hover:border-gray-500"
                  }`}
                >
                  {t === "cantina" ? "🍔 Cantina" : "🎟 Bilheteria"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Categoria</label>
            <select
              value={categoriaSelect}
              onChange={(e) => setCategoriaSelect(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold/50"
            >
              {categoriasList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {categoriaSelect === "Outros" && (
              <input
                type="text"
                value={categoriaCustom}
                onChange={(e) => setCategoriaCustom(e.target.value)}
                placeholder="Nome da categoria personalizada (opcional)"
                className="mt-2 w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAtivo(!ativo)}
              className={`relative w-10 h-6 rounded-full transition-colors ${ativo ? "bg-axon-gold" : "bg-axon-border"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${ativo ? "translate-x-5" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-300">Produto {ativo ? "ativo" : "inativo"}</span>
          </div>

          {erro && <p className="text-xs text-red-400">{erro}</p>}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-axon-border text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex-1 py-2 rounded-lg bg-axon-gold text-black font-bold flex items-center justify-center gap-2 hover:bg-axon-gold/80 disabled:opacity-50"
          >
            {salvando && <Loader2 size={16} className="animate-spin" />}
            {isEdicao ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AbaProdutosProps {
  produtos: PdvProduto[];
  eventoId: string | null;
  importando: boolean;
  onImportar: () => void;
  onNovoProduto: (tipo?: TipoProduto, categoria?: string) => void;
  onEditar: (p: PdvProduto) => void;
  onExcluir: (p: PdvProduto) => void;
}

function AbaProdutos({ produtos, eventoId, importando, onImportar, onNovoProduto, onEditar, onExcluir }: AbaProdutosProps) {
  const [tipoAtivo, setTipoAtivo] = useState<TipoProduto>("cantina");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Todos");
  const [busca, setBusca] = useState("");

  const categoriasList: string[] = tipoAtivo === "cantina" ? ["Todos", ...CATEGORIAS_CANTINA] : ["Todos", ...CATEGORIAS_BILHETERIA];

  const handleTipoChange = (tipo: TipoProduto) => {
    setTipoAtivo(tipo);
    setCategoriaAtiva("Todos");
  };

  const produtosFiltrados = produtos.filter((p) => {
    if (p.tipo !== tipoAtivo) return false;
    if (categoriaAtiva !== "Todos") {
      const catProduto = p.categoria ?? "Outros";
      const listaConhecida: string[] = tipoAtivo === "cantina" ? CATEGORIAS_CANTINA : CATEGORIAS_BILHETERIA;
      const catNormalizada = listaConhecida.includes(catProduto) ? catProduto : "Outros";
      if (catNormalizada !== categoriaAtiva) return false;
    }
    if (busca.trim()) {
      return p.nome.toLowerCase().includes(busca.toLowerCase());
    }
    return true;
  });

  const produtosPorTipo = produtos.filter((p) => p.tipo === tipoAtivo);

  if (eventoId && produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-20 h-20 rounded-2xl bg-axon-gold/10 border border-axon-gold/20 flex items-center justify-center mb-6">
          <ShoppingBag size={36} className="text-axon-gold/60" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum produto cadastrado</h3>
        <p className="text-gray-500 text-sm text-center max-w-md mb-8">
          Este evento ainda não possui produtos. Você pode importar o cardápio padrão como ponto de partida ou criar seus produtos do zero.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            onClick={onImportar}
            disabled={importando}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-axon-gold text-black font-bold hover:bg-axon-gold/80 disabled:opacity-60 transition-colors"
          >
            {importando ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            Importar Cardápio Padrão
          </button>
          <button
            onClick={() => onNovoProduto()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-axon-border text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Plus size={18} />
            Cadastrar do Zero
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full bg-axon-panel border border-axon-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/40"
          />
        </div>
        <button
          onClick={() => onNovoProduto(tipoAtivo, categoriaAtiva !== "Todos" ? categoriaAtiva : undefined)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-bold hover:bg-axon-gold/80 transition-colors"
        >
          <Plus size={15} /> Novo Produto
        </button>
      </div>

      <div className="flex border-b border-axon-border">
        {[
          { key: "cantina" as TipoProduto, label: "🍔 Cantina", icon: Coffee },
          { key: "bilheteria" as TipoProduto, label: "🎟 Bilheteria", icon: Ticket },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTipoChange(key)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${tipoAtivo === key ? "border-b-2 border-axon-gold text-axon-gold" : "text-gray-400 hover:text-white"}`}
          >
            {label} ({produtos.filter((p) => p.tipo === key).length})
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categoriasList.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoriaAtiva === cat ? "bg-axon-gold text-black" : "bg-axon-panel border border-axon-border text-gray-400 hover:text-white hover:border-gray-500"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {produtosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-axon-panel border border-axon-border flex items-center justify-center mb-4">
            <Package size={24} className="text-gray-600" />
          </div>
          {produtosPorTipo.length === 0 ? (
            <>
              <p className="text-gray-400 font-medium">Nenhum produto nesta seção</p>
              <p className="text-gray-600 text-sm mt-1 mb-4">Adicione produtos à seção {tipoAtivo}.</p>
              <button
                onClick={() => onNovoProduto(tipoAtivo)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-axon-gold/10 border border-axon-gold/30 text-axon-gold text-sm hover:bg-axon-gold/20 transition-colors"
              >
                <Plus size={14} /> Adicionar produto
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400 font-medium">Nenhum produto em \"{categoriaAtiva}\"</p>
              <p className="text-gray-600 text-sm mt-1 mb-4">Cadastre um produto já nesta categoria.</p>
              <button
                onClick={() => onNovoProduto(tipoAtivo, categoriaAtiva !== "Todos" ? categoriaAtiva : undefined)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-axon-gold/10 border border-axon-gold/30 text-axon-gold text-sm hover:bg-axon-gold/20 transition-colors"
              >
                <Plus size={14} /> Adicionar em {categoriaAtiva}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {produtosFiltrados.map((p) => (
            <div
              key={p.id}
              className={`bg-axon-panel border rounded-xl p-4 flex flex-col gap-2 transition-colors ${p.ativo ? "border-axon-border hover:border-gray-600" : "border-axon-border/40 opacity-60"}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{p.nome}</h4>
                  {p.descricao && <p className="text-xs text-gray-500 mt-0.5 truncate">{p.descricao}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onEditar(p)} className="p-1 text-gray-500 hover:text-axon-gold transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => onExcluir(p)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-axon-border/50">
                <span className="text-base font-bold text-axon-gold">{formatarMoeda(p.preco)}</span>
                <div className="flex items-center gap-2">
                  {p.categoria && (
                    <span className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">{p.categoria}</span>
                  )}
                  {p.estoque !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.estoque > 0 ? "bg-emerald-900/30 text-emerald-400" : "bg-red-900/30 text-red-400"}`}>
                      {p.estoque === 0 ? "Esgotado" : `${p.estoque} un`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface AbaVendasProps {
  eventoId: string | null;
  produtoraId: string;
}

function AbaVendas({ eventoId, produtoraId }: AbaVendasProps) {
  const [vendas, setVendas] = useState<PdvVenda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroForma, setFiltroForma] = useState<string>("todos");
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const carregarVendas = useCallback(async () => {
    setCarregando(true);
    const supabase = createClient();
    let query = supabase.from("pdv_vendas").select("*").order("created_at", { ascending: false }).limit(200);

    if (eventoId) {
      query = query.eq("evento_id", eventoId);
    } else {
      query = query.eq("produtora_id", produtoraId);
    }

    const { data } = await query;
    setVendas(data ?? []);
    setCarregando(false);
  }, [eventoId, produtoraId]);

  useEffect(() => {
    if (!eventoId && !produtoraId) return;

    carregarVendas();
    const supabase = createClient();
    const filterString = eventoId ? `evento_id=eq.${eventoId}` : `produtora_id=eq.${produtoraId}`;
    const channel = supabase
      .channel(`pdv_vendas_realtime:${filterString}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pdv_vendas",
          filter: filterString,
        },
        () => {
          carregarVendas();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [carregarVendas, eventoId, produtoraId]);

  const vendasFiltradas = filtroForma === "todos" ? vendas : vendas.filter((v) => v.forma_pagamento === filtroForma);
  const totalGeral = vendasFiltradas.reduce((acc, v) => acc + v.total, 0);
  const totalPix = vendas.filter((v) => v.forma_pagamento === "pix").reduce((acc, v) => acc + v.total, 0);
  const totalDinheiro = vendas.filter((v) => v.forma_pagamento === "dinheiro").reduce((acc, v) => acc + v.total, 0);
  const totalCartao = vendas.filter((v) => v.forma_pagamento === "cartao").reduce((acc, v) => acc + v.total, 0);

  const badgeForma = (forma: string) => {
    const map: Record<string, string> = {
      pix: "bg-emerald-900/30 text-emerald-400",
      dinheiro: "bg-amber-900/30 text-amber-400",
      cartao: "bg-blue-900/30 text-blue-400",
    };
    return map[forma] ?? "bg-gray-800 text-gray-400";
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Geral", valor: totalGeral, cor: "text-axon-gold", icon: TrendingUp },
          { label: "PIX", valor: totalPix, cor: "text-emerald-400", icon: QrCode },
          { label: "Dinheiro", valor: totalDinheiro, cor: "text-amber-400", icon: DollarSign },
          { label: "Cartão", valor: totalCartao, cor: "text-blue-400", icon: Tag },
        ].map(({ label, valor, cor, icon: Icon }) => (
          <div key={label} className="bg-axon-panel border border-axon-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className={`text-xl font-bold ${cor} tabular-nums`}>{formatarMoeda(valor)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {["todos", "pix", "dinheiro", "cartao"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltroForma(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtroForma === f ? "bg-axon-gold text-black" : "bg-axon-panel border border-axon-border text-gray-400 hover:text-white"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={carregarVendas} className="ml-auto text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-axon-gold" size={28} />
        </div>
      ) : vendasFiltradas.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList size={36} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma venda registrada.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-axon-border">
          <table className="w-full text-sm">
            <thead className="bg-axon-panel border-b border-axon-border">
              <tr className="text-left text-gray-500 text-xs">
                <th className="px-4 py-3 font-medium">Data/Hora</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium text-center">Qtd</th>
                <th className="px-4 py-3 font-medium text-right">Unit.</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Operador</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.map((v, i) => (
                <tr key={v.id} className={`border-b border-axon-border/40 hover:bg-white/[0.02] ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                  <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{formatarDataHora(v.created_at)}</td>
                  <td className="px-4 py-2.5 text-white font-medium">{v.produto_nome}</td>
                  <td className="px-4 py-2.5 text-center text-gray-300 tabular-nums">{v.quantidade}</td>
                  <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums">{formatarMoeda(v.preco_unitario)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-axon-gold tabular-nums">{formatarMoeda(v.total)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badgeForma(v.forma_pagamento)}`}>{v.forma_pagamento.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{v.operador_nome ?? "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-axon-border bg-axon-panel/50">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-xs text-gray-500 font-medium">{vendasFiltradas.length} venda(s)</td>
                <td className="px-4 py-3 text-right font-bold text-axon-gold tabular-nums">{formatarMoeda(totalGeral)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

interface AbaConfiguracoesProps {
  produtoraId: string;
}

function AbaConfiguracoes({ produtoraId }: AbaConfiguracoesProps) {
  const [config, setConfig] = useState<ConfigPdv>({
    produtora_id: produtoraId,
    pix_chave: "",
    pix_nome: "",
    pix_cidade: "",
    pin_admin: "",
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarPin, setMostrarPin] = useState(false);
  const [pinConfirm, setPinConfirm] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const supabase = createClient();
      const { data } = await supabase.from("pdv_config").select("*").eq("produtora_id", produtoraId).maybeSingle();
      if (data) setConfig(data as ConfigPdv);
      setCarregando(false);
    };
    if (produtoraId) carregar();
  }, [produtoraId]);

  async function salvar() {
    setErro("");
    setSucesso("");
    if (config.pin_admin && config.pin_admin !== pinConfirm && pinConfirm !== "") {
      return setErro("Os PINs não coincidem.");
    }
    setSalvando(true);
    const supabase = createClient();

    const payload = {
      produtora_id: produtoraId,
      pix_chave: config.pix_chave || null,
      pix_nome: config.pix_nome || null,
      pix_cidade: config.pix_cidade || null,
      pin_admin: config.pin_admin || null,
    };

    if (config.id) {
      const { error } = await supabase.from("pdv_config").update(payload).eq("id", config.id);
      if (error) setErro(error.message);
      else setSucesso("Configurações salvas.");
    } else {
      const { data, error } = await supabase.from("pdv_config").insert(payload).select().single();
      if (error) setErro(error.message);
      else {
        setConfig(data as ConfigPdv);
        setSucesso("Configurações salvas.");
      }
    }

    setSalvando(false);
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-axon-gold" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="bg-axon-panel border border-axon-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center">
            <QrCode size={16} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Configuração PIX</h3>
            <p className="text-xs text-gray-500">Dados para geração do QR Code</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Chave PIX</label>
            <input
              type="text"
              value={config.pix_chave ?? ""}
              onChange={(e) => setConfig({ ...config, pix_chave: e.target.value })}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
              placeholder="CPF, CNPJ, e-mail ou chave aleatória"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nome do recebedor</label>
              <input
                type="text"
                value={config.pix_nome ?? ""}
                onChange={(e) => setConfig({ ...config, pix_nome: e.target.value })}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
                placeholder="Ex: Festival de Dança"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Cidade</label>
              <input
                type="text"
                value={config.pix_cidade ?? ""}
                onChange={(e) => setConfig({ ...config, pix_cidade: e.target.value })}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
                placeholder="Ex: Rio de Janeiro"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-axon-gold/10 border border-axon-gold/20 flex items-center justify-center">
            <Lock size={16} className="text-axon-gold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">PIN Administrativo</h3>
            <p className="text-xs text-gray-500">Código de segurança para operações críticas</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">PIN (4–6 dígitos)</label>
            <div className="relative">
              <input
                type={mostrarPin ? "text" : "password"}
                value={config.pin_admin ?? ""}
                onChange={(e) => setConfig({ ...config, pin_admin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 pr-9 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
                placeholder="••••"
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => setMostrarPin(!mostrarPin)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {mostrarPin ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Confirmar PIN</label>
            <input
              type={mostrarPin ? "text" : "password"}
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-axon-gold/50"
              placeholder="••••"
              maxLength={6}
            />
          </div>
        </div>
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {sucesso && (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle2 size={16} /> {sucesso}
        </div>
      )}

      <button
        onClick={salvar}
        disabled={salvando}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-axon-gold text-black font-bold hover:bg-axon-gold/80 disabled:opacity-50 transition-colors"
      >
        {salvando && <Loader2 size={16} className="animate-spin" />}
        Salvar Configurações
      </button>
    </div>
  );
}

export default function PdvPage() {
  const searchParams = useSearchParams();
  const eventoId = searchParams.get("eventoId");

  const [aba, setAba] = useState<"produtos" | "vendas" | "configuracoes">("produtos");
  const [produtos, setProdutos] = useState<PdvProduto[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [produtoraId, setProdutoraId] = useState("");
  const [importando, setImportando] = useState(false);
  const [modalProdutoOpen, setModalProdutoOpen] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState<PdvProduto | null>(null);
  const [tipoInicialModal, setTipoInicialModal] = useState<TipoProduto | undefined>(undefined);
  const [categoriaInicialModal, setCategoriaInicialModal] = useState<string | undefined>(undefined);
  const [excluindoProduto, setExcluindoProduto] = useState<PdvProduto | null>(null);
  const [confirmExcluirOpen, setConfirmExcluirOpen] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const mostrarToast = useCallback((msg: string, tipo: ToastState["tipo"] = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("usuarios").select("produtora_id").eq("id", user.id).single();
      if (data?.produtora_id) setProdutoraId(data.produtora_id);
    };
    fetchUser();
  }, []);

  const carregarProdutos = useCallback(async () => {
    setCarregandoProdutos(true);
    const supabase = createClient();
    let query = supabase.from("pdv_produtos").select("*").order("nome");

    if (eventoId) {
      query = query.eq("evento_id", eventoId);
    } else {
      query = query.is("evento_id", null);
    }

    const { data } = await query;
    setProdutos(data ?? []);
    setCarregandoProdutos(false);
  }, [eventoId]);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const importarCardapioPadrao = useCallback(async () => {
    if (!eventoId) return;
    setImportando(true);
    const supabase = createClient();

    const { data: padroes, error } = await supabase.from("pdv_produtos").select("*").is("evento_id", null);

    if (error || !padroes || padroes.length === 0) {
      mostrarToast("Nenhum produto no cardápio padrão encontrado.", "aviso");
      setImportando(false);
      return;
    }

    const clones = padroes.map(({ id: _id, created_at: _ca, ...rest }) => ({
      ...rest,
      evento_id: eventoId,
    }));

    const { data: inseridos, error: insertError } = await supabase.from("pdv_produtos").insert(clones).select();

    if (insertError) {
      mostrarToast(insertError.message, "erro");
    } else {
      setProdutos(inseridos ?? []);
      mostrarToast(`${inseridos?.length ?? 0} produto(s) importado(s) com sucesso.`, "ok");
    }
    setImportando(false);
  }, [eventoId, mostrarToast]);

  const handleNovoProduto = useCallback((tipo?: TipoProduto, categoria?: string) => {
    setEditandoProduto(null);
    setTipoInicialModal(tipo);
    setCategoriaInicialModal(categoria);
    setModalProdutoOpen(true);
  }, []);

  const handleEditarProduto = useCallback((p: PdvProduto) => {
    setEditandoProduto(p);
    setTipoInicialModal(undefined);
    setCategoriaInicialModal(undefined);
    setModalProdutoOpen(true);
  }, []);

  const handleExcluir = useCallback((p: PdvProduto) => {
    setExcluindoProduto(p);
    setConfirmExcluirOpen(true);
  }, []);

  const confirmarExclusao = async () => {
    if (!excluindoProduto) return;
    setDeletando(true);
    const supabase = createClient();
    const { error } = await supabase.from("pdv_produtos").delete().eq("id", excluindoProduto.id);
    if (error) {
      mostrarToast(error.message, "erro");
    } else {
      setProdutos((prev) => prev.filter((p) => p.id !== excluindoProduto.id));
      mostrarToast("Produto excluído.");
    }
    setDeletando(false);
    setConfirmExcluirOpen(false);
    setExcluindoProduto(null);
  };

  const handleProdutoSalvo = useCallback(
    (produto: PdvProduto) => {
      setProdutos((prev) => {
        const idx = prev.findIndex((p) => p.id === produto.id);
        if (idx >= 0) {
          const novo = [...prev];
          novo[idx] = produto;
          return novo;
        }
        return [...prev, produto];
      });
      mostrarToast(editandoProduto ? "Produto atualizado." : "Produto criado.");
      setModalProdutoOpen(false);
      setEditandoProduto(null);
    },
    [editandoProduto, mostrarToast]
  );

  const ABAS = [
    { key: "produtos" as const, label: "Produtos", icon: Package },
    { key: "vendas" as const, label: "Vendas", icon: BarChart3 },
    { key: "configuracoes" as const, label: "Configurações", icon: Settings },
  ];

  const toastColors: Record<ToastState["tipo"], string> = {
    ok: "bg-axon-gold text-black",
    erro: "bg-red-500 text-white",
    aviso: "bg-amber-500 text-black",
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-axon-gold/10 border border-axon-gold/20 flex items-center justify-center">
                <ShoppingBag size={18} className="text-axon-gold" />
              </div>
              <h1 className="text-2xl font-semibold text-white">PDV Administrativo</h1>
            </div>
            <p className="text-sm text-gray-500 ml-12">{eventoId ? "Gestão de produtos e vendas do evento" : "Cardápio padrão — base para novos eventos"}</p>
          </div>
          {eventoId && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-axon-panel border border-axon-border text-xs text-gray-400">
              <LayoutGrid size={12} />
              <span className="font-mono">{eventoId.slice(0, 8)}…</span>
            </div>
          )}
        </div>

        <div className="flex border-b border-axon-border">
          {ABAS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setAba(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${aba === key ? "border-b-2 border-axon-gold text-axon-gold" : "text-gray-400 hover:text-white"}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {aba === "produtos" &&
            (carregandoProdutos ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-axon-gold" size={28} />
              </div>
            ) : (
              <AbaProdutos
                produtos={produtos}
                eventoId={eventoId}
                importando={importando}
                onImportar={importarCardapioPadrao}
                onNovoProduto={handleNovoProduto}
                onEditar={handleEditarProduto}
                onExcluir={handleExcluir}
              />
            ))}

          {aba === "vendas" && produtoraId && <AbaVendas eventoId={eventoId} produtoraId={produtoraId} />}
          {aba === "configuracoes" && produtoraId && <AbaConfiguracoes produtoraId={produtoraId} />}
        </div>
      </div>

      <ModalProduto
        open={modalProdutoOpen}
        produto={editandoProduto}
        eventoId={eventoId}
        tipoInicial={tipoInicialModal}
        categoriaInicial={categoriaInicialModal}
        onClose={() => {
          setModalProdutoOpen(false);
          setEditandoProduto(null);
        }}
        onSaved={handleProdutoSalvo}
      />

      <ConfirmModal
        open={confirmExcluirOpen}
        title="Excluir produto"
        message={`Deseja excluir permanentemente "${excluindoProduto?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmarExclusao}
        onCancel={() => {
          setConfirmExcluirOpen(false);
          setExcluindoProduto(null);
        }}
        loading={deletando}
        destructive
      />

      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all ${toastColors[toast.tipo]}`}>
          {toast.tipo === "ok" && <CheckCircle2 size={16} />}
          {toast.tipo === "erro" && <AlertCircle size={16} />}
          {toast.tipo === "aviso" && <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}