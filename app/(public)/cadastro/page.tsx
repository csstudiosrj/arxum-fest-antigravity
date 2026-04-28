import React from "react";
"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  User2,
  AlertCircle,
  Trophy,
  Users,
  LayoutTemplate,
} from "lucide-react";

type ToastType = "success" | "error" | "warning";

type ToastState = {
  type: ToastType;
  message: string;
} | null;

type FormData = {
  nomeCompleto: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  nomeProdutora: string;
  documento: string;
  cidade: string;
  estado: string;
  tipoFestival: string;
  tamanhoEstimado: string;
};

const ESTADOS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const TIPOS_FESTIVAL = ["Dança", "Música", "Teatro"];
const TAMANHOS = ["Pequeno", "Médio", "Grande"];

const INITIAL_FORM: FormData = {
  nomeCompleto: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  nomeProdutora: "",
  documento: "",
  cidade: "",
  estado: "",
  tipoFestival: "",
  tamanhoEstimado: "",
};

function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;

  const styles: Record<ToastType, string> = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    error: "border-red-500/30 bg-red-500/10 text-red-200",
    warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-100",
  };

  const icons: Record<ToastType, JSX.Element> = {
    success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 shrink-0" />,
    warning: <AlertCircle className="h-4 w-4 shrink-0" />,
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${styles[toast.type]}`}
    >
      <div className="flex items-start gap-2">
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

function Label({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-medium text-zinc-200">
      {children}
      {required ? <span className="ml-1 text-[#C5A059]">*</span> : null}
    </label>
  );
}

function formatDocumento(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 14);

  if (numbers.length <= 11) {
    return numbers
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function sanitizeDocumento(value: string) {
  return value.replace(/\D/g, "");
}

export default function CadastroPage() {
  const supabase = createClient();

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const passwordStrength = useMemo(() => {
    const senha = form.senha;
    let score = 0;

    if (senha.length >= 8) score += 1;
    if (/[A-Z]/.test(senha)) score += 1;
    if (/[0-9]/.test(senha)) score += 1;
    if (/[^A-Za-z0-9]/.test(senha)) score += 1;

    if (score <= 1) return { label: "Fraca", color: "bg-red-500" };
    if (score <= 3) return { label: "Média", color: "bg-yellow-500" };
    return { label: "Forte", color: "bg-emerald-500" };
  }, [form.senha]);

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function showToast(type: ToastType, message: string) {
    setToast({ type, message });
  }

  function validateForm() {
    if (
      !form.nomeCompleto.trim() ||
      !form.email.trim() ||
      !form.senha.trim() ||
      !form.confirmarSenha.trim() ||
      !form.nomeProdutora.trim() ||
      !form.documento.trim() ||
      !form.cidade.trim() ||
      !form.estado.trim() ||
      !form.tipoFestival.trim() ||
      !form.tamanhoEstimado.trim()
    ) {
      showToast("warning", "Preencha todos os campos obrigatórios.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      showToast("error", "Digite um e-mail válido.");
      return false;
    }

    if (form.senha.length < 8) {
      showToast("error", "A senha deve ter pelo menos 8 caracteres.");
      return false;
    }

    if (form.senha !== form.confirmarSenha) {
      showToast("error", "A confirmação de senha não confere.");
      return false;
    }

    const documentoLimpo = sanitizeDocumento(form.documento);
    if (documentoLimpo.length !== 11 && documentoLimpo.length !== 14) {
      showToast("error", "Informe um CPF ou CNPJ válido.");
      return false;
    }

    return true;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setToast(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.senha,
        options: {
          data: {
            full_name: form.nomeCompleto.trim(),
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message || "Não foi possível criar sua conta.");
      }

      const authUserId = signUpData.user?.id;

      if (!authUserId) {
        throw new Error(
          "Conta criada sem retorno do usuário. Verifique o e-mail de confirmação e tente entrar novamente."
        );
      }

      const { data: produtoraData, error: produtoraError } = await supabase
        .from("produtoras")
        .insert({
          nome: form.nomeProdutora.trim(),
          cnpj_cpf: sanitizeDocumento(form.documento),
          cidade: form.cidade.trim(),
          estado: form.estado,
          tipo_festival: form.tipoFestival,
          tamanho_estimado: form.tamanhoEstimado,
        })
        .select("id")
        .single();

      if (produtoraError || !produtoraData) {
        throw new Error(
          produtoraError?.message || "Não foi possível criar a produtora."
        );
      }

      const produtoraId = produtoraData.id;

      const { error: usuarioError } = await supabase.from("usuarios").insert({
        id: authUserId,
        nome: form.nomeCompleto.trim(),
        email: form.email.trim().toLowerCase(),
        produtora_id: produtoraId,
        papel: "organizador",
      });

      if (usuarioError) {
        throw new Error(
          usuarioError.message || "Não foi possível vincular o usuário à produtora."
        );
      }

      const { error: tenantConfigError } = await supabase.from("tenant_config").insert({
        produtora_id: produtoraId,
        termo_evento: "Festival",
        termo_inscricao: "Inscrição",
        termo_participante: "Participante",
        termo_grupo: "Grupo",
        termo_apresentacao: "Apresentação",
      });

      if (tenantConfigError) {
        throw new Error(
          tenantConfigError.message || "Não foi possível criar a configuração inicial."
        );
      }

      showToast(
        "success",
        "Cadastro concluído com sucesso. Verifique seu e-mail para confirmar a conta e continuar."
      );

      setForm(INITIAL_FORM);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao finalizar o cadastro.";

      showToast("error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,160,89,0.20),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(197,160,89,0.08),transparent_30%)]" />
          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-12 xl:px-16 xl:py-16">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                <Sparkles className="h-4 w-4 text-[#C5A059]" />
                AXON Fest
              </Link>

              <div className="mt-16 max-w-xl">
                <span className="inline-flex rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#C5A059]">
                  Onboarding do Organizador
                </span>

                <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                  Coloque sua produtora no ar com uma operação mais profissional desde o primeiro acesso.
                </h1>

                <p className="mt-6 text-base leading-8 text-zinc-400 xl:text-lg">
                  O AXON Fest foi criado para quem organiza festivais e precisa
                  centralizar inscrições, participantes, apresentações, operação e
                  identidade da marca em uma plataforma única, moderna e escalável.
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {[
                  {
                    icon: Building2,
                    title: "White-label de verdade",
                    text: "Sua produtora entra com identidade própria, com base pronta para personalização da marca e do portal.",
                  },
                  {
                    icon: LayoutTemplate,
                    title: "Fluxo organizado desde o início",
                    text: "Cadastre sua operação com estrutura clara para evoluir sem depender de soluções improvisadas.",
                  },
                  {
                    icon: Users,
                    title: "Experiência melhor para quem participa",
                    text: "Menos ruído operacional e mais clareza para participantes, grupos e equipe interna.",
                  },
                  {
                    icon: Trophy,
                    title: "Preparado para crescer",
                    text: "Comece com o essencial e avance para uma gestão mais robusta conforme seu festival evolui.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl border border-[#C5A059]/20 bg-[#C5A059]/10 p-3">
                          <Icon className="h-5 w-5 text-[#C5A059]" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-white">
                            {item.title}
                          </h2>
                          <p className="mt-2 text-sm leading-7 text-zinc-400">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#C5A059]" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Porta de entrada pensada para conversão e confiança
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    Um onboarding bom reduz atrito, deixa o próximo passo claro e
                    antecipa falhas com validação e feedback imediato, o que é uma
                    prática central em experiências SaaS de alta performance. [web:259][web:266]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
          <div className="w-full max-w-2xl">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                <Sparkles className="h-4 w-4 text-[#C5A059]" />
                AXON Fest
              </Link>

              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
                Crie sua conta e registre sua produtora
              </h1>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Comece agora a estruturar seu festival em uma plataforma feita para operação real.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 shadow-2xl sm:p-8">
              <div className="mb-6">
                <span className="inline-flex rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#C5A059]">
                  Cadastro definitivo
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  Sua conta + sua produtora em um único fluxo
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Preencha os dados abaixo para iniciar sua operação no AXON Fest.
                </p>
              </div>

              <div className="mb-5">
                <Toast toast={toast} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <User2 className="h-4 w-4 text-[#C5A059]" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      Dados da Conta
                    </h3>
                  </div>

                  <div className="grid gap-5">
                    <div>
                      <Label required>Nome Completo</Label>
                      <div className="relative">
                        <User2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={form.nomeCompleto}
                          onChange={(e) => updateField("nomeCompleto", e.target.value)}
                          placeholder="Seu nome completo"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label required>E-mail</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="voce@seudominio.com"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label required>Senha</Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <input
                            type={showSenha ? "text" : "password"}
                            value={form.senha}
                            onChange={(e) => updateField("senha", e.target.value)}
                            placeholder="Mínimo de 8 caracteres"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] pl-11 pr-12 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSenha((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                            aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showSenha ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Força da senha</span>
                            <span className="font-medium text-zinc-300">
                              {form.senha ? passwordStrength.label : "—"}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/5">
                            <div
                              className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                              style={{
                                width: !form.senha
                                  ? "0%"
                                  : passwordStrength.label === "Fraca"
                                  ? "33%"
                                  : passwordStrength.label === "Média"
                                  ? "66%"
                                  : "100%",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label required>Confirmar Senha</Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <input
                            type={showConfirmarSenha ? "text" : "password"}
                            value={form.confirmarSenha}
                            onChange={(e) =>
                              updateField("confirmarSenha", e.target.value)
                            }
                            placeholder="Repita sua senha"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] pl-11 pr-12 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmarSenha((prev) => !prev)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                            aria-label={
                              showConfirmarSenha
                                ? "Ocultar confirmação de senha"
                                : "Mostrar confirmação de senha"
                            }
                          >
                            {showConfirmarSenha ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              form.confirmarSenha &&
                              form.senha === form.confirmarSenha
                                ? "bg-emerald-400"
                                : "bg-zinc-600"
                            }`}
                          />
                          <span className="text-zinc-500">
                            {form.confirmarSenha && form.senha === form.confirmarSenha
                              ? "As senhas conferem"
                              : "Confirme sua senha"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#C5A059]" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      Dados da Produtora
                    </h3>
                  </div>

                  <div className="grid gap-5">
                    <div>
                      <Label required>Nome da Produtora / Festival</Label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={form.nomeProdutora}
                          onChange={(e) =>
                            updateField("nomeProdutora", e.target.value)
                          }
                          placeholder="Ex.: Horizonte Cultural"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label required>CNPJ / CPF</Label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.documento}
                          onChange={(e) =>
                            updateField("documento", formatDocumento(e.target.value))
                          }
                          placeholder="Digite o documento"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                        />
                      </div>

                      <div>
                        <Label required>Cidade</Label>
                        <div className="relative">
                          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="text"
                            value={form.cidade}
                            onChange={(e) => updateField("cidade", e.target.value)}
                            placeholder="Sua cidade"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label required>Estado</Label>
                        <select
                          value={form.estado}
                          onChange={(e) => updateField("estado", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-4 text-sm text-white outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                        >
                          <option value="">Selecione</option>
                          {ESTADOS.map((uf) => (
                            <option key={uf} value={uf}>
                              {uf}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label required>Tipo de Festival</Label>
                        <select
                          value={form.tipoFestival}
                          onChange={(e) =>
                            updateField("tipoFestival", e.target.value)
                          }
                          className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-4 text-sm text-white outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                        >
                          <option value="">Selecione</option>
                          {TIPOS_FESTIVAL.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label required>Tamanho Estimado</Label>
                      <select
                        value={form.tamanhoEstimado}
                        onChange={(e) =>
                          updateField("tamanhoEstimado", e.target.value)
                        }
                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#0D0D0F] px-4 text-sm text-white outline-none transition focus:border-[#C5A059]/60 focus:ring-2 focus:ring-[#C5A059]/10"
                      >
                        <option value="">Selecione</option>
                        {TAMANHOS.map((tamanho) => (
                          <option key={tamanho} value={tamanho}>
                            {tamanho}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-[#C5A059]" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        O que acontece ao finalizar
                      </p>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">
                        Sua conta é criada, sua produtora é registrada, o vínculo
                        do organizador é gravado e a configuração inicial da tenant
                        é preparada para você começar com a base pronta.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#C5A059] px-6 text-sm font-semibold text-[#111111] transition hover:bg-[#d4b06a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finalizando cadastro...
                    </>
                  ) : (
                    <>
                      Finalizar Cadastro
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-6 text-zinc-500">
                  Ao continuar, você inicia sua conta no AXON Fest e concorda em
                  seguir o fluxo de validação e ativação da plataforma.
                </p>
              </form>

              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="text-center text-sm text-zinc-500">
                  Já tem conta?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-[#C5A059] transition hover:text-[#d4b06a]"
                  >
                    Entrar no sistema
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}