"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, Plus, Search, Trash2, Edit2, 
  CheckCircle, XCircle, Loader2, UserPlus, Save 
} from "lucide-react";

interface Bailarino {
  id: string;
  nome: string;
  data_nascimento: string;
  cpf: string | null;
  termo_assinado: boolean;
  modalidades: string | null;
}

export default function BailarinosPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bailarinos, setBailarinos] = useState<Bailarino[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [escolaId, setEscolaId] = useState<string | null>(null);
  
  // Estado para o Modal de Cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    data_nascimento: "",
    cpf: "",
    modalidades: "",
    termo_assinado: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Pegar o usuário logado e sua escola
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("usuarios")
        .select("escola_id")
        .eq("id", user.id)
        .single();

      if (userData?.escola_id) {
        setEscolaId(userData.escola_id);
        
        // 2. Buscar bailarinos daquela escola
        const { data: list } = await supabase
          .from("bailarinos")
          .select("*")
          .eq("escola_id", userData.escola_id)
          .order("nome", { ascending: true });

        setBailarinos(list || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escolaId) return;
    setSaving(true);

    try {
      const payload = {
        nome: formData.nome,
        data_nascimento: formData.data_nascimento,
        cpf: formData.cpf || null,
        modalidades: formData.modalidades,
        termo_assinado: formData.termo_assinado,
        escola_id: escolaId
      };

      if (formData.id) {
        // Editar
        await supabase.from("bailarinos").update(payload).eq("id", formData.id);
      } else {
        // Novo
        await supabase.from("bailarinos").insert([payload]);
      }

      setIsModalOpen(false);
      setFormData({ id: "", nome: "", data_nascimento: "", cpf: "", modalidades: "", termo_assinado: false });
      fetchData();
    } catch (error) {
      alert("Erro ao salvar bailarino");
    } finally {
      setSaving(false);
    }
  };

  const deleteBailarino = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este bailarino?")) return;
    await supabase.from("bailarinos").delete().eq("id", id);
    fetchData();
  };

  const calcularIdade = (data: string) => {
    const hoje = new Date();
    const nasc = new Date(data);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  const filteredBailarinos = bailarinos.filter(b => 
    b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.modalidades && b.modalidades.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bailarinos & Elenco</h1>
          <p className="text-gray-400">Gerencie o banco de dados de atletas da sua escola.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: "", nome: "", data_nascimento: "", cpf: "", modalidades: "", termo_assinado: false });
            setIsModalOpen(true);
          }}
          className="bg-axon-green text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#00c866] transition-all shadow-[0_0_20px_rgba(0,230,118,0.2)]"
        >
          <UserPlus size={20} />
          Novo Bailarino
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-axon-panel border border-axon-border p-4 rounded-xl flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou modalidade..."
            className="w-full bg-axon-bg border border-axon-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-axon-green transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Nome</th>
                <th className="px-6 py-4 font-semibold">Idade</th>
                <th className="px-6 py-4 font-semibold">Modalidades</th>
                <th className="px-6 py-4 font-semibold">Termo</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axon-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                    Carregando elenco...
                  </td>
                </tr>
              ) : filteredBailarinos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Nenhum bailarino encontrado.
                  </td>
                </tr>
              ) : (
                filteredBailarinos.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-white font-medium">{b.nome}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {calcularIdade(b.data_nascimento)} anos
                      <span className="text-xs text-gray-500 block">{new Date(b.data_nascimento).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {b.modalidades?.split(',').map((m, i) => (
                          <span key={i} className="text-[10px] bg-white/5 border border-axon-border px-2 py-0.5 rounded uppercase text-gray-400">
                            {m.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {b.termo_assinado ? (
                        <span className="flex items-center gap-1 text-axon-green text-xs font-bold">
                          <CheckCircle size={14} /> ASSINADO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                          <XCircle size={14} /> PENDENTE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setFormData({
                              id: b.id,
                              nome: b.nome,
                              data_nascimento: b.data_nascimento,
                              cpf: b.cpf || "",
                              modalidades: b.modalidades || "",
                              termo_assinado: b.termo_assinado
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteBailarino(b.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-axon-panel border border-axon-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-axon-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{formData.id ? "Editar Bailarino" : "Novo Bailarino"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                  <input 
                    required
                    className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2 mt-1 text-white focus:border-axon-green outline-none"
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Nascimento</label>
                    <input 
                      type="date"
                      required
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2 mt-1 text-white focus:border-axon-green outline-none"
                      value={formData.data_nascimento}
                      onChange={e => setFormData({...formData, data_nascimento: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">CPF (Opcional)</label>
                    <input 
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2 mt-1 text-white focus:border-axon-green outline-none"
                      value={formData.cpf}
                      onChange={e => setFormData({...formData, cpf: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Modalidades (Ex: Jazz, Ballet, Hip Hop)</label>
                  <input 
                    placeholder="Separe por vírgula"
                    className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2 mt-1 text-white focus:border-axon-green outline-none"
                    value={formData.modalidades}
                    onChange={e => setFormData({...formData, modalidades: e.target.value})}
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer group mt-2">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 accent-axon-green"
                    checked={formData.termo_assinado}
                    onChange={e => setFormData({...formData, termo_assinado: e.target.checked})}
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Termo de imagem e responsabilidade assinado?</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 text-white py-3 rounded-lg font-bold hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-axon-green text-black py-3 rounded-lg font-bold hover:bg-[#00c866] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}