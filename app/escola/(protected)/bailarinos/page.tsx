"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, Plus, Search, Trash2, Edit2, 
  Loader2, UserPlus, Save, X, Tag, AlertTriangle,
  Calendar as CalendarIcon
} from "lucide-react";

interface Bailarino {
  id: string;
  nome: string;
  data_nascimento: string;
  cpf: string | null;
  modalidades: string | null; // No banco é TEXT
}

interface EstiloAtivo {
  id: string;
  nome: string;
}

export default function BailarinosPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bailarinos, setBailarinos] = useState<Bailarino[]>([]);
  const [estilosDisponiveis, setEstilosDisponiveis] = useState<EstiloAtivo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [escolaId, setEscolaId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    data_nascimento: "",
    cpf: "",
    modalidades: [] as string[] // Na UI usamos Array para as pills
  });

  // MÁSCARA DE CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setFormData({ ...formData, cpf: value });
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("usuarios")
        .select("escola_id")
        .eq("id", user.id)
        .single();

      if (userData?.escola_id) {
        setEscolaId(userData.escola_id);
        
        // Busca estilos ativos
        const { data: ativos } = await supabase
          .from("tenant_estilos_ativos")
          .select("estilo_id")
          .eq("escola_id", userData.escola_id)
          .eq("ativo", true);

        if (ativos && ativos.length > 0) {
          const { data: estilos } = await supabase
            .from("estilos")
            .select("id, nome")
            .in("id", ativos.map(a => a.estilo_id))
            .order("nome");
          setEstilosDisponiveis(estilos || []);
        }

        const { data: list } = await supabase
          .from("bailarinos")
          .select("*")
          .eq("escola_id", userData.escola_id)
          .order("nome", { ascending: true });

        setBailarinos(list || []);
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escolaId) return;
    setSaving(true);

    try {
      // CONVERSÃO CRUCIAL: Array da UI -> String do Banco
      const modalidadesString = formData.modalidades.join(", ");

      const payload = {
        nome: formData.nome,
        data_nascimento: formData.data_nascimento,
        cpf: formData.cpf || null,
        modalidades: modalidadesString,
        escola_id: escolaId
      };

      if (formData.id) {
        const { error } = await supabase.from("bailarinos").update(payload).eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bailarinos").insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ id: "", nome: "", data_nascimento: "", cpf: "", modalidades: [] });
  };

  const toggleModalidade = (nome: string) => {
    setFormData(prev => ({
      ...prev,
      modalidades: prev.modalidades.includes(nome)
        ? prev.modalidades.filter(m => m !== nome)
        : [...prev.modalidades, nome]
    }));
  };

  const deleteBailarino = async (id: string) => {
    if (!confirm("Confirmar exclusão definitiva?")) return;
    await supabase.from("bailarinos").delete().eq("id", id);
    fetchData();
  };

  // Função segura para transformar a string do banco em array para a tabela
  const renderModalidades = (modStr: string | null) => {
    if (!modStr) return null;
    return modStr.split(", ").map((m, i) => (
      <span key={i} className="text-[10px] bg-axon-gold/10 text-axon-gold px-2 py-0.5 rounded border border-axon-gold/20 font-bold uppercase mr-1">
        {m}
      </span>
    ));
  };

  const filteredBailarinos = bailarinos.filter(b => 
    b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.modalidades && b.modalidades.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bailarinos & Elenco</h1>
          <p className="text-gray-400">Banco de dados oficial da escola.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-axon-gold text-black px-6 py-3 rounded-lg font-black flex items-center gap-2 hover:bg-[#d4af6a] transition-all shadow-xl"
        >
          <UserPlus size={20} /> NOVO BAILARINO
        </button>
      </div>

      <div className="bg-axon-panel border border-axon-border p-4 rounded-xl shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text"
            placeholder="Pesquisar bailarino..."
            className="w-full bg-axon-bg border border-axon-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-axon-gold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-5">Nome</th>
                <th className="px-6 py-5">Nascimento</th>
                <th className="px-6 py-5">CPF</th>
                <th className="px-6 py-5">Modalidades</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axon-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center"><Loader2 className="animate-spin mx-auto text-axon-gold" /></td>
                </tr>
              ) : filteredBailarinos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500 italic">Nenhum registro encontrado.</td>
                </tr>
              ) : (
                filteredBailarinos.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] group">
                    <td className="px-6 py-4 text-white font-bold">{b.nome}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {b.data_nascimento ? new Date(b.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '---'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">{b.cpf || "---"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {renderModalidades(b.modalidades)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => {
                          const modsArray = b.modalidades ? b.modalidades.split(", ") : [];
                          setFormData({ id: b.id, nome: b.nome, data_nascimento: b.data_nascimento, cpf: b.cpf || "", modalidades: modsArray });
                          setIsModalOpen(true);
                        }} className="p-2 text-gray-400 hover:text-axon-gold"><Edit2 size={18} /></button>
                        <button onClick={() => deleteBailarino(b.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-axon-panel border border-axon-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-axon-border flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Ficha do Bailarino</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nome Completo</label>
                  <input required className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 mt-1 text-white focus:border-axon-gold outline-none"
                    value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Data de Nascimento</label>
                  <input type="date" required style={{ colorScheme: 'dark' }} className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 mt-1 text-white focus:border-axon-gold outline-none"
                    value={formData.data_nascimento} onChange={e => setFormData({...formData, data_nascimento: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CPF</label>
                  <input className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 mt-1 text-white focus:border-axon-gold outline-none"
                    value={formData.cpf} placeholder="000.000.000-00" onChange={handleCPFChange} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={12} /> Modalidades Selecionadas
                </label>
                <div className="bg-axon-bg border border-axon-border rounded-xl p-4 flex flex-wrap gap-2 min-h-[60px]">
                  {estilosDisponiveis.length > 0 ? (
                    estilosDisponiveis.map((estilo) => {
                      const isSelected = formData.modalidades.includes(estilo.nome);
                      return (
                        <button key={estilo.id} type="button" onClick={() => toggleModalidade(estilo.nome)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            isSelected ? "bg-axon-gold text-black border-axon-gold shadow-lg" : "bg-white/5 text-gray-500 border-axon-border hover:border-gray-500"
                          }`}>{estilo.nome}</button>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-500/70 text-xs italic">
                      <AlertTriangle size={14} /> Ative as modalidades no painel de configurações.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 text-white py-4 rounded-xl font-bold hover:bg-white/10">CANCELAR</button>
                <button type="submit" disabled={saving} className="flex-1 bg-axon-gold text-black py-4 rounded-xl font-black hover:bg-[#d4af6a] flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} SALVAR REGISTRO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}