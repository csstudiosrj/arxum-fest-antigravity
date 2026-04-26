"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, AlertCircle, Mail, Lock } from "lucide-react";

export default function ConvitePage() {
  const params = useParams();
  const router = useRouter();
  const email = params.email as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [escola, setEscola] = useState<any>(null);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [criando, setCriando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function buscarEscola() {
      if (!email) {
        setError("Link inválido - e-mail não encontrado");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("escolas")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        setError("Escola não encontrada ou link expirado");
        setLoading(false);
        return;
      }

      setEscola(data);
      setLoading(false);
    }

    buscarEscola();
  }, [email]);

  async function criarConta() {
    if (!senha || senha.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    setCriando(true);
    setError("");

    try {
      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: escola.email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/escola/login`,
        },
      });

      if (authError) throw authError;

      setSucesso(true);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/escola/dashboard");
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setCriando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-axon-bg to-black">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-axon-green mx-auto mb-4" />
          <p className="text-white">Verificando convite...</p>
        </div>
      </div>
    );
  }

  if (error && !escola) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-axon-bg to-black p-4">
        <div className="bg-axon-panel border border-red-500/30 rounded-2xl p-8 w-full max-w-md text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Convite Inválido</h1>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 w-full bg-axon-green text-black font-semibold py-3 rounded-lg hover:bg-[#d4af6a] transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-axon-bg to-black p-4">
        <div className="bg-axon-panel border border-green-500/30 rounded-2xl p-8 w-full max-w-md text-center">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Conta Criada!</h1>
          <p className="text-gray-400 text-sm mb-4">
            Bem-vindo à plataforma, {escola.responsavel || "Responsável"}!
          </p>
          <p className="text-gray-500 text-xs">
            Redirecionando para o painel da escola...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-axon-bg to-black p-4">
      <div className="bg-axon-panel border border-axon-border rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Mail size={48} className="text-axon-green mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Convite para Escola</h1>
          <p className="text-gray-400 text-sm">
            Crie sua senha para acessar o sistema da escola <strong className="text-white">{escola.nome}</strong>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-axon-bg border border-axon-border rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Escola</div>
            <div className="text-white font-medium">{escola.nome}</div>
          </div>

          <div className="bg-axon-bg border border-axon-border rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Responsável</div>
            <div className="text-white font-medium">{escola.responsavel || "Não informado"}</div>
          </div>

          <div className="bg-axon-bg border border-axon-border rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">E-mail</div>
            <div className="text-white font-medium">{escola.email}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-axon-bg border border-axon-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-axon-green"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Senha <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-axon-bg border border-axon-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-axon-green"
                placeholder="Digite a senha novamente"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <button
          onClick={criarConta}
          disabled={criando || !senha || !confirmarSenha}
          className="w-full mt-6 bg-axon-green text-black font-semibold py-3 rounded-lg hover:bg-[#d4af6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {criando ? <Loader2 size={18} className="animate-spin" /> : null}
          {criando ? "Criando Conta..." : "Criar Conta"}
        </button>
      </div>
    </div>
  );
}