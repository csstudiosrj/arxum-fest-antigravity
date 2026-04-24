"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }

    const { data: usuario, error: roleError } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id", authData.session.user.id)
      .single();

    if (roleError || !usuario) {
      await supabase.auth.signOut();
      setError("Acesso negado. Área restrita à organização do festival.");
      setLoading(false);
      return;
    }

    if (usuario.role !== "admin" && usuario.role !== "super_admin") {
      await supabase.auth.signOut();
      setError("Acesso negado. Área restrita à organização do festival.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">

        <div className="text-center">
          <span className="text-3xl font-bold tracking-wider text-white">
            AXON <span className="text-[#00e676] font-light">Fest</span>
          </span>
          <p className="text-gray-500 text-sm mt-2">Painel do Organizador</p>
        </div>

        <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-white">Acesso Restrito</h1>
            <p className="text-gray-400 text-sm mt-1">Exclusivo para a organização do festival.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="organizador@festival.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e676] transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e676] transition-colors disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00e676] text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-[#00e676]/90 active:bg-[#00e676]/80 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verificando acesso...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-700">
          AXON Fest © 2026 — Acesso autorizado apenas para organizadores cadastrados
        </p>
      </div>
    </div>
  );
}