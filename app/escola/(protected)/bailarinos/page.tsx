"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, Plus, Search, Trash2, Edit2, 
  CheckCircle, XCircle, Loader2, UserPlus, Save,
  Calendar as CalendarIcon, Tag, X
} from "lucide-react";

interface Bailarino {
  id: string;
  nome: string;
  data_nascimento: string;
  cpf: string | null;
  termo_assinado: boolean;
  modalidades: string[] | null; // Agora tratado como array de strings (IDs ou Nomes validados)
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
    modalidades: [] as string[],
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
        
        // 2. Buscar estilos que o organizador ATIVOU nas configurações
        // Fazemos um join entre estilos e tenant_estilos_ativos
        const { data: estilosData } = await supabase
          .from("estilos")
          .select(`
            id,
            nome,
            tenant_estilos_ativos!inner(ativo)
          `)
          .eq("tenant_estilos_ativos.ativo", true)
          .order("nome");

        setEstilosDisponiveis(estilosData as any || []);

        // 3. Buscar bailarinos daquela escola
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
        modalidades: formData.modalidades, // Enviando o array selecionado
        termo_assinado: formData.termo_assinado,
        escola_id: escolaId
      };

      if (formData.id) {
        await supabase.from("bailarinos").update(payload).eq("id", formData.id);
      } else {
        await supabase.from("bailarinos").insert([payload]);
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert("Erro ao salvar bailarino");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ id: "", nome: "", data_nascimento: "", cpf: "", modalidades: [], termo_assinado: false });
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
    b.modalidades?.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bailarinos & Elenco</h1>
          <p className="text-gray-400">Gerencie o banco de dados oficial de atletas da sua escola.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-axon-gold text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#d4af6a] transition-all shadow-[0_0_20px_rgba(197,160,89,0.2)]"
        >
          <UserPlus size={20} />
          Novo Bailarino
        </button>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="bg-axon-panel border border-axon-border p-4 rounded-xl shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou modalidade ativa..."
            className="w-full bg-axon-bg border border-axon-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-axon-gold transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABELA DE ELENCO */}
      <div className="bg-axon-panel border border-axon-border rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                <th className="px-6 py-5 font-semibold">Nome do Bailarino</th>
                <th className="px-6 py-5 font-semibold">Idade / Nasc.</th>
                <th className="px-6 py-5 font-semibold">Modalidades Vinculadas</th>
                <th className="px-6 py-5 font-semibold">Status Termo</th>
                <th className="px-6 py-5 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axon-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-4 text-axon-gold" size={40} />
                    Sincronizando banco de elenco...
                  </td>
                </tr>
              ) : filteredBailarinos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500 italic">
                    Nenhum bailarino encontrado no registro.
                  </td>
                </tr>
              ) : (
                filteredBailarinos.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-white font-bold">{b.nome}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{b.cpf || 'CPF NÃO INFORMADO'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-lg font-semibold text-white">{calcularIdade(b.data_nascimento)}</span>
                        <span className="text-xs text-gray-500">anos</span>
                      </div>
                      <span className="text-[10px] text-gray-600 block">{new Date(b.data_nascimento).toLocaleDateString('pt-BR')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {b.modalidades && b.modalidades.length > 0 ? (
                          b.modalidades.map((m, i) => (
                            <span key={i} className="text-[10px] bg-axon-gold-dim border border-axon-gold/20 px-2 py-0.5 rounded text-axon-gold font-medium uppercase">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-600">Nenhuma</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {b.termo_assinado ? (
                        <span className="inline-flex items-center gap-1.5 text-axon-green text-[10px] font-black tracking-tighter bg-axon-green/10 px-2 py-1 rounded-full border border-axon-green/20">
                          <CheckCircle size={12} /> ASSINADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-500 text-[10px] font-black tracking-tighter bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                          <XCircle size={12} /> PENDENTE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setFormData({
                              id: b.id,
                              nome: b.nome,
                              data_nascimento: b.data_nascimento,
                              cpf: b.cpf || "",
                              modalidades: b.modalidades || [],
                              termo_assinado: b.termo_assinado
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-axon-gold hover:bg-axon-gold/10 rounded-lg transition-all"
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

      {/* MODAL DE CADASTRO (BLINDADO) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-axon-panel border border-axon-border w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-6 border-b border-axon-border flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">{formData.id ? "Atualizar Registro" : "Adicionar ao Elenco"}</h2>
                <p className="text-xs text-gray-400 mt-1">Preencha os dados oficiais do participante.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nome Completo</label>
                  <input 
                    required
                    autoFocus
                    className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 mt-1 text-white focus:border-axon-gold outline-none transition-all"
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Data de Nascimento</label>
                  <div className="relative mt-1">
                    <input 
                      type="date"
                      required
                      style={{ colorScheme: 'dark' }} // Força o ícone nativo a ficar branco/claro
                      className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 text-white focus:border-axon-gold outline-none appearance-none"
                      value={formData.data_nascimento}
                      onChange={e => setFormData({...formData, data_nascimento: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CPF (Apenas Números)</label>
                  <input 
                    className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 mt-1 text-white focus:border-axon-gold outline-none"
                    value={formData.cpf}
                    placeholder="000.000.000-00"
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
              </div>

              {/* SELEÇÃO CONTROLADA DE MODALIDADES */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={12} /> Modalidades que este bailarino pratica
                </label>
                <div className="bg-axon-bg border border-axon-border rounded-xl p-4 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {estilosDisponiveis.length > 0 ? (
                    estilosDisponiveis.map((estilo) => {
                      const isSelected = formData.modalidades.includes(estilo.nome);
                      return (
                        <button
                          key={estilo.id}
                          type="button"
                          onClick={() => toggleModalidade(estilo.nome)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            isSelected 
                            ? "bg-axon-gold text-black border-axon-gold shadow-[0_0_10px_rgba(197,160,89,0.3)]" 
                            : "bg-white/5 text-gray-400 border-axon-border hover:border-gray-500"
                          }`}
                        >
                          {estilo.nome}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-500 italic">Nenhuma modalidade configurada pelo organizador.</p>
                  )}
                </div>
              </div>

              <div className="bg-axon-gold/5 border border-axon-gold/10 p-4 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 accent-axon-gold rounded border-gray-300"
                    checked={formData.termo_assinado}
                    onChange={e => setFormData({...formData, termo_assinado: e.target.checked})}
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">Termo de imagem e responsabilidade assinado?</span>
                    <p className="text-[10px] text-gray-500 leading-tight">Marque apenas se possuir o documento físico ou digital arquivado na escola.</p>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 text-white py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Descartar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-axon-gold text-black py-4 rounded-xl font-black hover:bg-[#d4af6a] flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-xl"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {formData.id ? "SALVAR ALTERAÇÕES" : "FINALIZAR CADASTRO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}