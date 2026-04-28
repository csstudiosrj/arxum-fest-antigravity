import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  LayoutTemplate,
  Settings2,
  Sparkles,
  Users2,
} from "lucide-react";

const features = [
  {
    icon: LayoutTemplate,
    title: "100% white-label",
    description:
      "Personalize logo, cores, identidade visual e entregue um portal com a cara do seu festival, da sua produtora ou da sua marca.",
  },
  {
    icon: Sparkles,
    title: "Terminologia dinâmica",
    description:
      "Chame cada etapa do jeito que faz sentido para o seu evento: bailarino, atleta, elenco, coreografia, peça, apresentação ou qualquer outro termo da sua operação.",
  },
  {
    icon: Settings2,
    title: "Gestão centralizada",
    description:
      "Inscrições, organização financeira, materiais enviados, acompanhamento do evento e operação reunidos em um único sistema.",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description:
      "Comece a estruturar seu festival em um ambiente pronto para organizar operação, inscrições e comunicação.",
  },
  {
    number: "02",
    title: "Personalize seu portal",
    description:
      "Ajuste marca, cores, logo e terminologias para que a experiência reflita exatamente o seu evento.",
  },
  {
    number: "03",
    title: "Abra as inscrições",
    description:
      "Receba escolas, grupos, participantes e materiais com mais organização e menos retrabalho para sua equipe.",
  },
  {
    number: "04",
    title: "Realize o evento",
    description:
      "Conduza seu festival com mais controle, previsibilidade e confiança em cada etapa da operação.",
  },
];

const highlights = [
  {
    icon: Users2,
    label: "Mais organização",
    text: "Substitua planilhas, mensagens dispersas e processos manuais por um fluxo único e mais profissional.",
  },
  {
    icon: CreditCard,
    label: "Mais controle",
    text: "Centralize informações importantes para que sua equipe revise, acompanhe e execute melhor cada inscrição.",
  },
  {
    icon: CalendarDays,
    label: "Mais escala",
    text: "Prepare sua operação para crescer sem perder clareza, qualidade de atendimento e consistência.",
  },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <span className="inline-flex rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#C5A059]">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-zinc-400 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0B0C] text-zinc-100">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(197,160,89,0.16),transparent_38%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-28">
          <div className="relative z-10 max-w-4xl">
            <span className="inline-flex rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#C5A059]">
              Plataforma SaaS para festivais
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              O sistema definitivo para organizar festivais com mais controle,
              mais velocidade e uma experiência muito mais profissional.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              O AXON Fest foi criado para transformar a gestão de festivais em um
              processo centralizado, white-label e escalável. Organize inscrições,
              operação, comunicação e estrutura do evento em um único lugar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#d7b26a]"
              >
                Criar meu Festival
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#C5A059]/40 hover:bg-white/10"
              >
                Como funciona
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <Icon className="h-5 w-5 text-[#C5A059]" />
                    <p className="mt-3 text-sm font-semibold text-white">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-medium text-zinc-300">
                    AXON Fest
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#C5A059]">
                    Operação centralizada
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Online
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Portal do evento
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Sua marca, suas regras, seu fluxo
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Adapte identidade visual e terminologias para diferentes
                    modalidades, festivais e perfis de cliente.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Inscrições
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      Fluxo mais claro para escolas e participantes
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#121214] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Operação
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      Menos retrabalho para sua equipe
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#E7CC93]">
                    Resultado
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    Mais profissionalismo para quem organiza e para quem participa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <SectionHeader
          eyebrow="Por que escolher o AXON Fest?"
          title="Uma plataforma feita para a realidade de quem organiza festivais."
          description="O objetivo do AXON Fest é simples: substituir improviso operacional por clareza, padronização e escala. Você ganha uma base mais sólida para crescer sem perder controle."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#C5A059]/30 hover:bg-white/[0.05] sm:p-8"
              >
                <Icon className="h-5 w-5 text-[#C5A059]" />
                <h3 className="mt-5 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400 sm:text-base">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
          <SectionHeader
            eyebrow="Como funciona"
            title="Um processo simples para tirar seu festival do improviso."
            description="Com poucos passos, você estrutura seu evento, personaliza a experiência e passa a operar com muito mais confiança."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-white/10 bg-[#111112] p-6"
              >
                <span className="text-sm font-semibold tracking-[0.24em] text-[#C5A059]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {step.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/como-funciona"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#E7CC93] transition hover:text-[#f1dba8]"
            >
              Ver página completa de como funciona
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center sm:px-8 lg:py-24">
        <span className="inline-flex rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#C5A059]">
          Próximo passo
        </span>

        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Crie uma base profissional para o seu próximo festival.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
          Se hoje sua operação depende de planilhas, mensagens soltas e processos
          manuais, o AXON Fest foi feito para mudar esse cenário com mais
          controle, consistência e visão de crescimento.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#d7b26a]"
          >
            Criar meu Festival
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/como-funciona"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#C5A059]/40 hover:bg-white/10"
          >
            Entender o processo
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <p>© {new Date().getFullYear()} AXON Fest. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="transition hover:text-zinc-300">
              Início
            </Link>
            <Link href="/como-funciona" className="transition hover:text-zinc-300">
              Como funciona
            </Link>
            <Link href="/cadastro" className="transition hover:text-zinc-300">
              Criar meu Festival
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}