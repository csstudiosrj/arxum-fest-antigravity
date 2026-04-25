// app/(admin)/inscricoes/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminShell from "../_components/AdminShell";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type StatusPagamento = "pago" | "pendente";

interface Escola {
  id: string;
  nome: string;
  responsavel: string;
  telefone: string;
  email: string;
}

interface Bailarino {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  escola_id: string;
  termo_assinado: boolean;
}

interface Coreografia {
  id: string;
  nome: string;
  escola_id: string;
  tipo: string;
  quantidade_bailarinos: number;
  valor_total: number;
  status_pagamento: StatusPagamento;
  created_at: string;
  escolas?: { nome: string };
}

// ─── Masks ────────────────────────────────────────────────────────────────────

function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function maskDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
}

function dateMaskToISO(masked: string): string {
  // dd/mm/yyyy -> yyyy-mm-dd
  const [d, m, y] = masked.split("/");
  if (!d || !m || !y || y.length < 4) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// ─── Modal de Novo Bailarino ──────────────────────────────────────────────────

interface ModalBailarinoProps {
  escolaId: string | null;
  onClose: () => void;
  onSaved: (bailarino: Bailarino) => void;
}

function ModalBailarino({ escolaId, onClose, onSaved }: ModalBailarinoProps) {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [termoAssinado, setTermoAssinado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvarBailarino() {
    setErro(null);
    if (!nome.trim()) { setErro("Nome obrigatorio."); return; }
    if (!escolaId) { setErro("Selecione uma escola antes de adicionar bailarino."); return; }
    setSalvando(true);
    const isoDate = dateMaskToISO(dataNasc);
    const { data, error } = await supabase
      .from("bailarinos")
      .insert({
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ""),
        data_nascimento: isoDate || null,
        escola_id: escolaId,
        termo_assinado: termoAssinado,
      })
      .select()
      .single();
    setSalvando(false);
    if (error) { setErro(error.message); return; }
    onSaved(data as Bailarino);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white">Cadastrar Bailarino</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1" htmlFor="bail-nome">
              Nome completo *
            </label>
            <input
              id="bail-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
              placeholder="Nome do bailarino"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1" htmlFor="bail-cpf">
              CPF
            </label>
            <input
              id="bail-cpf"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1" htmlFor="bail-nasc">
              Data de nascimento
            </label>
            <input
              id="bail-nasc"
              type="text"
              value={dataNasc}
              onChange={(e) => setDataNasc(maskDate(e.target.value))}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
              placeholder="dd/mm/aaaa"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termoAssinado}
              onChange={(e) => setTermoAssinado(e.target.checked)}
              className="w-4 h-4 accent-axon-gold rounded"
            />
            <span className="text-sm text-neutral-300">Termo assinado</span>
          </label>

          {erro && (
            <p className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle size={14} /> {erro}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={salvarBailarino}
            disabled={salvando}
            className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {salvando && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Nova Inscricao ─────────────────────────────────────────────────────

interface ModalInscricaoProps {
  escolas: Escola[];
  onClose: () => void;
  onSaved: () => void;
}

function ModalInscricao({ escolas, onClose, onSaved }: ModalInscricaoProps) {
  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [escolaId, setEscolaId] = useState<string>("");
  const [tipo, setTipo] = useState("solo");
  const [qtdBailarinos, setQtdBailarinos] = useState(1);
  const [valorTotal, setValorTotal] = useState("");
  const [statusPagamento, setStatusPagamento] = useState<StatusPagamento>("pendente");

  const [bailarinos, setBailarinos] = useState<Bailarino[]>([]);
  const [bailarinosDaEscola, setBailarinos_escola] = useState<Bailarino[]>([]);
  const [elencoSelecionado, setElencoSelecionado] = useState<string[]>([]);

  const [modalBailarino, setModalBailarino] = useState(false);
  const [carregandoBailarinos, setCarregandoBailarinos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarBailarinoBailarinos = useCallback(async (id: string) => {
    setCarregandoBailarinos(true);
    const { data } = await supabase
      .from("bailarinos")
      .select("*")
      .eq("escola_id", id)
      .order("nome");
    setBailarinos_escola((data as Bailarino[]) ?? []);
    setCarregandoBailarinos(false);
  }, [supabase]);

  useEffect(() => {
    if (escolaId) carregarBailarinoBailarinos(escolaId);
    else setBailarinos_escola([]);
    setElencoSelecionado([]);
  }, [escolaId, carregarBailarinoBailarinos]);

  function toggleElenco(id: string) {
    setElencoSelecionado((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function salvar() {
    setErro(null);
    if (!nome.trim()) { setErro("Nome da coreografia e obrigatorio."); return; }
    setSalvando(true);

    const valor = parseFloat(valorTotal.replace(",", ".")) || 0;

    const { data: coreo, error: coreoErr } = await supabase
      .from("coreografias")
      .insert({
        nome: nome.trim(),
        escola_id: escolaId || null,
        tipo,
        quantidade_bailarinos: qtdBailarinos,
        valor_total: valor,
        status_pagamento: statusPagamento,
      })
      .select()
      .single();

    if (coreoErr) { setErro(coreoErr.message); setSalvando(false); return; }

    if (elencoSelecionado.length > 0) {
      const elencoRows = elencoSelecionado.map((bid) => ({
        coreografia_id: coreo.id,
        bailarino_id: bid,
      }));
      const { error: elencoErr } = await supabase
        .from("coreografia_elenco")
        .insert(elencoRows);
      if (elencoErr) { setErro(elencoErr.message); setSalvando(false); return; }
    }

    setSalvando(false);
    onSaved();
  }

  return (
    <>
      {modalBailarino && (
        <ModalBailarino
          escolaId={escolaId || null}
          onClose={() => setModalBailarino(false)}
          onSaved={(b) => {
            setBailarinos_escola((prev) => [...prev, b]);
            setModalBailarino(false);
          }}
        />
      )}

      <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10 px-4">
        <div className="bg-axon-panel border border-axon-border rounded-xl w-full max-w-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-axon-border">
            <h2 className="text-base font-semibold text-white">Nova Inscricao</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Nome da coreografia */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1" htmlFor="coreo-nome">
                Nome da coreografia *
              </label>
              <input
                id="coreo-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                placeholder="Ex: Alma Livre"
              />
            </div>

            {/* Escola */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1" htmlFor="coreo-escola">
                Escola
              </label>
              <select
                id="coreo-escola"
                value={escolaId}
                onChange={(e) => setEscolaId(e.target.value)}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold transition-colors"
              >
                <option value="">Sem escola vinculada</option>
                {escolas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo e Qtd */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1" htmlFor="coreo-tipo">
                  Tipo
                </label>
                <select
                  id="coreo-tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold transition-colors"
                >
                  <option value="solo">Solo</option>
                  <option value="duo">Duo</option>
                  <option value="conjunto">Conjunto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1" htmlFor="coreo-qtd">
                  Qtd. bailarinos
                </label>
                <input
                  id="coreo-qtd"
                  type="number"
                  min={1}
                  value={qtdBailarinos}
                  onChange={(e) => setQtdBailarinos(Number(e.target.value))}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold transition-colors"
                />
              </div>
            </div>

            {/* Valor e Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1" htmlFor="coreo-valor">
                  Valor total (R$)
                </label>
                <input
                  id="coreo-valor"
                  type="text"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value.replace(/[^0-9,\.]/g, ""))}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1" htmlFor="coreo-status">
                  Status pagamento
                </label>
                <select
                  id="coreo-status"
                  value={statusPagamento}
                  onChange={(e) => setStatusPagamento(e.target.value as StatusPagamento)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-axon-gold transition-colors"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
            </div>

            {/* Elenco */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-400">
                  Elenco{escolaId ? ` — ${bailarinosDaEscola.length} bailarinos` : ""}
                </span>
                {escolaId && (
                  <button
                    type="button"
                    onClick={() => setModalBailarino(true)}
                    className="flex items-center gap-1 text-xs text-axon-gold hover:opacity-80 transition-opacity"
                  >
                    <UserPlus size={13} />
                    Cadastrar bailarino
                  </button>
                )}
              </div>

              {!escolaId && (
                <p className="text-xs text-neutral-600 bg-axon-bg border border-axon-border rounded-lg px-3 py-3">
                  Selecione uma escola para escolher o elenco.
                </p>
              )}

              {escolaId && carregandoBailarinos && (
                <div className="flex items-center gap-2 text-xs text-neutral-500 py-3">
                  <Loader2 size={13} className="animate-spin" /> Carregando bailarinos...
                </div>
              )}

              {escolaId && !carregandoBailarinos && bailarinosDaEscola.length === 0 && (
                <p className="text-xs text-neutral-600 bg-axon-bg border border-axon-border rounded-lg px-3 py-3">
                  Nenhum bailarino cadastrado para esta escola.
                </p>
              )}

              {escolaId && !carregandoBailarinos && bailarinosDaEscola.length > 0 && (
                <div className="bg-axon-bg border border-axon-border rounded-lg divide-y divide-axon-border max-h-48 overflow-y-auto">
                  {bailarinosDaEscola.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/3 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={elencoSelecionado.includes(b.id)}
                        onChange={() => toggleElenco(b.id)}
                        className="w-4 h-4 accent-axon-gold rounded"
                      />
                      <span className="text-sm text-white">{b.nome}</span>
                      {b.cpf && (
                        <span className="text-xs text-neutral-500 ml-auto tabular-nums">
                          {b.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {erro && (
              <p className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle size={14} /> {erro}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-axon-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-axon-border text-sm text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={salvando}
              className="flex-1 px-4 py-2 rounded-lg bg-axon-gold text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {salvando && <Loader2 size={14} className="animate-spin" />}
              Confirmar inscricao
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Pagina Principal ──────────────────────────────────────────────────────────

const PER_PAGE = 15;

export default function InscricoesPage() {
  const supabase = createClient();

  const [coreografias, setCoreografias] = useState<Coreografia[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [totalCoreografias, setTotalCoreografias] = useState(0);
  const [totalBailarinos, setTotalBailarinos] = useState(0);
  const [totalPago, setTotalPago] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);

  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  const carregarDados = useCallback(async () => {
    setCarregando(true);

    const from = (pagina - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;

    let query = supabase
      .from("coreografias")
      .select("*, escolas(nome)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (busca.trim()) {
      query = query.ilike("nome", `%${busca.trim()}%`);
    }

    const { data, count, error } = await query;
    if (!error) {
      setCoreografias((data as Coreografia[]) ?? []);
      const total = count ?? 0;
      setTotalPaginas(Math.max(1, Math.ceil(total / PER_PAGE)));
    }

    // KPIs
    const [{ count: totalCoreo }, { count: totalBail }, { data: pagos }, { data: pendentes }] =
      await Promise.all([
        supabase.from("coreografias").select("id", { count: "exact", head: true }),
        supabase.from("bailarinos").select("id", { count: "exact", head: true }),
        supabase.from("coreografias").select("valor_total").eq("status_pagamento", "pago"),
        supabase.from("coreografias").select("valor_total").eq("status_pagamento", "pendente"),
      ]);

    setTotalCoreografias(totalCoreo ?? 0);
    setTotalBailarinos(totalBail ?? 0);
    setTotalPago((pagos ?? []).reduce((acc: number, c: { valor_total: number }) => acc + (c.valor_total ?? 0), 0));
    setTotalPendente((pendentes ?? []).reduce((acc: number, c: { valor_total: number }) => acc + (c.valor_total ?? 0), 0));

    setCarregando(false);
  }, [supabase, busca, pagina]);

  const carregarEscolas = useCallback(async () => {
    const { data } = await supabase.from("escolas").select("*").order("nome");
    setEscolas((data as Escola[]) ?? []);
  }, [supabase]);

  useEffect(() => { carregarDados(); }, [carregarDados]);
  useEffect(() => { carregarEscolas(); }, [carregarEscolas]);

  // Reset pagina quando busca muda
  useEffect(() => { setPagina(1); }, [busca]);

  function formatMoeda(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <AdminShell>
      {modalAberto && (
        <ModalInscricao
          escolas={escolas}
          onClose={() => setModalAberto(false)}
          onSaved={() => {
            setModalAberto(false);
            carregarDados();
          }}
        />
      )}

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Inscricoes e Elenco</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Gerencie coreografias e bailarinos inscritos
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-4 py-2 bg-axon-gold text-black text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Nova Inscricao
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Coreografias", value: totalCoreografias.toString() },
            { label: "Bailarinos", value: totalBailarinos.toString() },
            { label: "Total pago", value: formatMoeda(totalPago), destaque: "green" },
            { label: "A receber", value: formatMoeda(totalPendente), destaque: "gold" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-axon-panel border border-axon-border rounded-xl p-4"
            >
              <p className="text-xs text-neutral-500 mb-1">{kpi.label}</p>
              <p
                className={
                  kpi.destaque === "green"
                    ? "text-lg font-semibold text-axon-green tabular-nums"
                    : kpi.destaque === "gold"
                    ? "text-lg font-semibold text-axon-gold tabular-nums"
                    : "text-lg font-semibold text-white tabular-nums"
                }
              >
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Busca */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full bg-axon-panel border border-axon-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-axon-gold transition-colors"
          />
        </div>

        {/* Tabela */}
        <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-axon-border">
                  <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">
                    Coreografia
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">
                    Escola
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">
                    Tipo
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-neutral-500 font-medium tabular-nums">
                    Bailarinos
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-neutral-500 font-medium tabular-nums">
                    Valor
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-neutral-500 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-axon-border/50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-white/5 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : coreografias.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-neutral-600 text-sm">
                      Nenhuma inscricao encontrada.
                    </td>
                  </tr>
                ) : (
                  coreografias.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-axon-border/50 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-4 py-3 text-white font-medium">{c.nome}</td>
                      <td className="px-4 py-3 text-neutral-400">
                        {c.escolas?.nome ?? <span className="text-neutral-600 italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 capitalize">{c.tipo}</td>
                      <td className="px-4 py-3 text-right text-neutral-400 tabular-nums">
                        {c.quantidade_bailarinos}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-300 tabular-nums">
                        {formatMoeda(c.valor_total ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            c.status_pagamento === "pago"
                              ? "inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-axon-green-dim text-axon-green"
                              : "inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-axon-gold-dim text-axon-gold"
                          }
                        >
                          {c.status_pagamento === "pago" ? "Pago" : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginacao */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-axon-border">
              <span className="text-xs text-neutral-500">
                Pagina {pagina} de {totalPaginas}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="p-1.5 rounded-md border border-axon-border text-neutral-400 hover:text-white hover:border-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Pagina anterior"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-1.5 rounded-md border border-axon-border text-neutral-400 hover:text-white hover:border-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Proxima pagina"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}