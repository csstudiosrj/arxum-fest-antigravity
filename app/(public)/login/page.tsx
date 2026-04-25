"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const [error, setError] = useState("");
  const[loading, setLoading] = useState(false);

  // Instancia o cliente do Supabase (Padrão SSR)
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
        // Busca o cargo na tabela 'usuarios'
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

        // BLOQUEIO RIGOROSO: Só entra se for admin
        if (userData.role !== 'admin' && userData.role !== 'super_admin') {
          await supabase.auth.signOut();
          setError("Acesso negado. Área restrita à organização do festival.");
          setLoading(false);
          return;
        }

        // Se passou, vai pro painel do festival
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message === "Invalid login credentials" ? "E-mail ou senha incorretos." : message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0d0807] text-white relative">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              AXON <span className="text-[#C5A059]">Fest</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">Acesso restrito à organização do evento.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">E-mail corporativo</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="block w-full rounded-md border border-[#1a1413] bg-[#1a1413] px-4 py-3 text-white focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-colors" 
                  placeholder="admin@festival.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Senha</label>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="block w-full rounded-md border border-[#1a1413] bg-[#1a1413] px-4 py-3 text-white focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-colors" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-md border border-red-500/20 text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="flex w-full justify-center items-center gap-2 rounded-md bg-[#C5A059] text-black py-3 px-4 text-sm font-bold shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar no Sistema"}
            </button>
          </form>
        </div>

        <div className="absolute bottom-6 w-full text-center px-4">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} AXON Group. Todos os direitos reservados.</p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1a1413] border-l border-[#1a1413]/50 items-center justify-center overflow-hidden">
        {/* Imagem de fundo focada em palco/dança */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0807] via-[#0d0807]/80 to-transparent"></div>
        <div className="relative z-10 p-12 text-center max-w-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">Gestão de Festivais</h2>
          <p className="text-lg text-gray-400">A plataforma definitiva para competições artísticas.</p>
        </div>
      </div>
    </div>
  );
}