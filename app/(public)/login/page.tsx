"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

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

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }

    const role = data.user.user_metadata?.role as string | undefined;

    switch (role) {
      case "admin":
        router.push("/dashboard");
        break;
      case "escola":
        router.push("/elenco");
        break;
      case "jurado":
        router.push("/avaliacao");
        break;
      default:
        router.push("/participante");
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Logo */}
        <div className="text-center">
          <span className="text-3xl font-bold tracking-wider">
            AXON <span className="text-axon-green font-light">Fest</span>
          </span>
          <p className="text-gray-400 text-sm mt-2">
            Gestão de Festivais Artísticos
          </p>
        </div>

        {/* Card */}
        <div className="bg-axon-panel border border-axon-border rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-white">
              Entrar na plataforma
            </h1>
            <p className="text-gray-400 text-sm">
              Acesse com suas credenciais.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-green transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
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
                className="bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-green transition-colors disabled:opacity-50"
              />
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-axon-green text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-axon-green/90 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600">
          AXON Fest © 2026 — Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}