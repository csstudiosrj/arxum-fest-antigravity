"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, GraduationCap } from "lucide-react";

export default function EscolaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) throw authError;
      if (!authData.session) throw new Error("Sessão não iniciada.");

      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", authData.session.user.id)
        .single();

      if (userError || !userData) {
        await supabase.auth.signOut();
        setError("Erro ao verificar permissões. Contate o suporte.");
        return;
      }

      if (userData.role !== "escola_admin" && userData.role !== "coreografo") {
        await supabase.auth.signOut();
        setError("Acesso negado. Área restrita às escolas participantes.");
        return;
      }

      window.location.href = "/escola/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-axon-bg p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-axon-green-dim border border-axon-green/20 mb-4">
            <GraduationCap size={28} className="text-axon-green" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AXON <span className="text-axon-green font-light">Fest</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Portal das Escolas</p>
        </div>

        {/* Card */}
        <div className="bg-axon-panel border border-axon-border rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Entrar na sua conta</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-axon-green transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-axon-green transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-axon-green text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Problemas com acesso? Fale com o organizador do evento.
        </p>
      </div>
    </div>
  );
}