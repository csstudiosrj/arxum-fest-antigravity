"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function EscolaLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");
  const [nomeEscola, setNomeEscola] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      if (authData.session) {
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("role")
          .eq("id", authData.session.user.id)
          .single();

        if (userError || !userData) {
          await supabase.auth.signOut();
          setError("Erro ao verificar permissões. Contate o suporte.");
          setLoading(false);
          return;
        }

        // Verifica se é escola_admin ou coreografo
        if (userData.role !== 'escola_admin' && userData.role !== 'coreografo') {
          await supabase.auth.signOut();
          setError("Acesso negado. Área restrita às escolas participantes.");
          setLoading(false);
          return;
        }

        router.push("/escola/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Inserir escola
        const { data: escolaData, error: escolaError } = await supabase
          .from("escolas")
          .insert({
            nome: nomeEscola.trim(),
            responsavel: responsavel.trim(),
            telefone: telefone.trim(),
            email: email.trim(),
          })
          .select()
          .single();

        if (escolaError) throw escolaError;

        // Inserir usuário
        const { error: userError } = await supabase
          .from("usuarios")
          .insert({
            email: email.trim(),
            nome: nome.trim(),
            role: 'escola_admin',
            escola_id: escolaData.id,
          });

        if (userError) throw userError;

        setError("Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-axon-bg to-black p-4">
      <div className="w-full max-w-md bg-axon-panel border border-axon-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? "Login da Escola" : "Cadastro da Escola"}
          </h1>
          <p className="text-gray-400">
            {isLogin ? "Acesse o painel da sua escola" : "Cadastre sua escola para participar"}
          </p>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
              isLogin ? "bg-axon-green text-black" : "bg-axon-bg text-gray-400 hover:bg-gray-700"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
              !isLogin ? "bg-axon-green text-black" : "bg-axon-bg text-gray-400 hover:bg-gray-700"
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleCadastro} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-axon-green"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome da Escola</label>
                <input
                  type="text"
                  value={nomeEscola}
                  onChange={(e) => setNomeEscola(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-axon-green"
                  placeholder="Nome da escola"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Responsável</label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-axon-green"
                  placeholder="Nome do responsável"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-axon-green"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-axon-green"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-axon-green"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-axon-green"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-axon-green text-black font-semibold py-3 rounded-lg hover:bg-[#d4af6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-axon-green hover:underline text-sm">
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}