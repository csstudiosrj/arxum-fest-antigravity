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
  const [organizacao, setOrganizacao] = useState<any>(null);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [criando, setCriando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function buscarOrganizacao() {
      if (!email) {
        setError("Link invalido - e-mail nao encontrado");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("organizacoes")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        setError("Organizacao nao encontrada ou link expirado");
        setLoading(false);
        return;
      }

      setOrganizacao(data);
      setLoading(false);
    }

    buscarOrganizacao();
  }, [email, supabase]);

  async function criarConta() {
    if (!organizacao) {
      setError("Organizacao nao carregada.");
      return;
    }

    if (!senha || senha.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas nao coincidem");
      return;
    }

    setCriando(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: organizacao.email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/escola/login`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuario nao retornado pelo Supabase.");

      const { data: organizacaoAtualizada, error: updateOrganizacaoError } = await supabase
        .from("organizacoes")
        .update({
          responsavel: organizacao.responsavel ?? null,
          telefone: organizacao.telefone ?? null,
          email: organizacao.email,
        })
        .eq("id", organizacao.id)
        .select()
        .single();

      if (updateOrganizacaoError) throw updateOrganizacaoError;

      const { error: usuarioError } = await supabase
        .from("usuarios")
        .update({ organizacao_id: organizacaoAtualizada.id })
        .eq("id", authData.user.id);

      if (usuarioError) throw usuarioError;

      setSucesso(true);

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
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-axon-bg)]">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto mb-4 animate-spin text-axon-gold" />
          <p className="text-white">Verificando convite...</p>
        </div>
      </div>
    );
  }

  if (error && !organizacao) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-axon-bg)] p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-axon-panel p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="mb-2 text-xl font-bold text-white">Convite Invalido</h1>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 w-full rounded-lg bg-axon-gold py-3 font-semibold text-black transition-colors hover:opacity-90"
          >
            Voltar ao Inicio
          </button>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-axon-bg)] p-4">
        <div className="w-full max-w-md rounded-2xl border border-axon-border bg-axon-panel p-8 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-axon-gold" />
          <h1 className="mb-2 text-xl font-bold text-white">Conta Criada</h1>
          <p className="mb-4 text-sm text-gray-400">
            Bem-vindo a plataforma, {organizacao?.responsavel || "Responsavel"}.
          </p>
          <p className="text-xs text-gray-500">Redirecionando para o painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-axon-bg)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-axon-border bg-axon-panel p-8">
        <div className="mb-8 text-center">
          <Mail size={40} className="mx-auto mb-4 text-axon-gold" />
          <h1 className="mb-2 text-2xl font-bold text-white">Convite de Acesso</h1>
          <p className="text-sm text-gray-400">
            Crie sua senha para acessar o sistema da organizacao{" "}
            <strong className="text-white">{organizacao.nome}</strong>
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="rounded-lg border border-axon-border bg-[var(--color-axon-bg)] p-4">
            <div className="mb-1 text-sm text-gray-400">Organizacao</div>
            <div className="font-medium text-white">{organizacao.nome}</div>
          </div>

          <div className="rounded-lg border border-axon-border bg-[var(--color-axon-bg)] p-4">
            <div className="mb-1 text-sm text-gray-400">Responsavel</div>
            <div className="font-medium text-white">
              {organizacao.responsavel || "Nao informado"}
            </div>
          </div>

          <div className="rounded-lg border border-axon-border bg-[var(--color-axon-bg)] p-4">
            <div className="mb-1 text-sm text-gray-400">E-mail</div>
            <div className="font-medium text-white">{organizacao.email}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Senha <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-axon-border bg-[var(--color-axon-bg)] py-3 pl-10 pr-4 text-white focus:border-axon-gold focus:outline-none"
                placeholder="Minimo 6 caracteres"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Confirmar Senha <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full rounded-lg border border-axon-border bg-[var(--color-axon-bg)] py-3 pl-10 pr-4 text-white focus:border-axon-gold focus:outline-none"
                placeholder="Digite a senha novamente"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <button
          onClick={criarConta}
          disabled={criando || !senha || !confirmarSenha}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-axon-gold py-3 font-semibold text-black transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {criando ? <Loader2 size={18} className="animate-spin" /> : null}
          {criando ? "Criando Conta..." : "Criar Conta"}
        </button>
      </div>
    </div>
  );
}