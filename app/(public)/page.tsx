import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarRange,
  CheckCircle2,
  Layers3,
  Palette,
  PanelTop,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const features = [
  {
    icon: Palette,
    eyebrow: "100% white-label",
    title: "Seu festival com a sua marca, não com a nossa cara.",
    description:
      "Personalize logo, cores, identidade visual e a experiência do portal para que cada cliente enxergue o AXON Fest como uma extensão do próprio evento.",
  },
  {
    icon: Layers3,
    eyebrow: "Terminologia dinâmica",
    title: "O sistema fala a linguagem do seu nicho.",
    description:
      "Troque termos como Bailarino, Atleta, Músico, Atores, Coreografia, Apresentação ou Peça sem gambiarra e sem quebrar o fluxo do portal.",
  },
  {
    icon: Workflow,
    eyebrow: "Gestão centralizada",
    title: "Menos planilhas soltas. Mais controle real da operação.",
    description:
      "Inscrições, documentos, pagamentos, jurados, cronograma, mídia obrigatória e acompanhamento do evento em um único ambiente organizado.",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description:
      "Comece com a estrutura principal da organização e prepare o ambiente para publicar seu próximo festival.",
  },
  {
    number: "02",
    title: "Personalize seu portal",
    description:
      "Defina marca, terminologias e regras para que o sistema reflita exatamente a forma como seu evento funciona.",
  },
  {
    number: "03",
    title: "Abra as inscrições",
    description:
      "Receba participantes, apresentações, arquivos obrigatórios e acompanhe tudo sem depender de formulários improvisados.",
  },
  {
    number: "04",
    title: "Realize o evento",
    description:
      "Centralize cronograma, operação, avaliação e conferência das informações para rodar o festival com mais segurança.",
  },
];

function LogoMark() {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a332f] bg-[#15110f] shadow-[0_0_0_1px_rgba(197,160,89,0.06)]">
        <svg viewBox="0 0 48 48" aria-label="AXON Fest" className="h-6 w-6 text-[#C5A059]" fill="none">
          <path
            d="M10 34L24 10L38 34"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 24H32"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="24" cy="24" r="3.5" fill="currentColor" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold tracking-[0.22em] text-[#E7C98A]">AXON FEST</p>
        <p className="text-xs text-gray-500">Festival OS for creators and organizers</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <article className="group rounded-3xl border border-[#2c2622] bg-[#14100f] p-6 transition-all duration-300 hover:border-[#4a4038] hover:bg-[#181312]">
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a332f] bg-[#100c0b] text-[#C5A059]">
        <Icon size={20} />
      </div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059]">{eyebrow}</p>
      <h3 className="text-xl font-semibold leading-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-gray-400">{description}</p>
    </article>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-[#2c2622] bg-[#14100f] p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="text-3xl font-semibold tracking-tight text-white">{number}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-[#C5A059]/40 to-transparent" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-gray-400">{description}</p>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0908] text-white">
      <section className="relative overflow-hidden border-b border-[#1f1a18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(197,160,89,0.16),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_40%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-5 sm:px-6 lg:px-8 lg:pb-24">
          <header className="flex items-center justify-between gap-4 py-4">
            <LogoMark />
            <Link
              href="/cadastro"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#3a332f] bg-[#15110f] px-4 py-2 text-sm font-medium text-gray-200 transition-all hover:border-[#C5A059]/50 hover:text-white"
            >
              Começar agora
              <ArrowRight size={16} />
            </Link>
          </header>

          <div className="grid gap-10 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-center lg:pt-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3a332f] bg-[#15110f] px-3 py-1.5 text-xs font-medium text-[#E7C98A]">
                <Sparkles size={14} />
                SaaS white-label para festivais e competições culturais
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-7xl">
                Pare de montar festival no improviso.
                <span className="block text-[#E7C98A]">Centralize tudo no AXON Fest.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
                O AXON Fest foi criado para organizadores que precisam vender inscrições, receber arquivos,
                coordenar participantes, jurados e cronograma sem depender de planilhas, formulários soltos e retrabalho.
                Você opera com mais clareza, passa mais profissionalismo e ganha escala para crescer o evento.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cadastro"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C5A059] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#d7b26a]"
                >
                  Criar meu Festival
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#3a332f] bg-[#15110f] px-6 py-3 text-sm font-semibold text-gray-200 transition-all hover:border-[#C5A059]/50 hover:text-white"
                >
                  Ver como funciona
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#26211e] bg-[#120f0e] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Multi-tenant</p>
                  <p className="mt-2 text-sm font-medium text-white">Vários festivais, operações separadas e mesma base tecnológica.</p>
                </div>
                <div className="rounded-2xl border border-[#26211e] bg-[#120f0e] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Operação real</p>
                  <p className="mt-2 text-sm font-medium text-white">Da inscrição ao cronograma, sem trocar de ferramenta no meio do caminho.</p>
                </div>
                <div className="rounded-2xl border border-[#26211e] bg-[#120f0e] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Escalável</p>
                  <p className="mt-2 text-sm font-medium text-white">Serve para dança, música, teatro e formatos híbridos.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-8 hidden h-24 w-24 rounded-full bg-[#C5A059]/10 blur-3xl lg:block" />
              <div className="rounded-[28px] border border-[#2e2825] bg-[#12100f] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-5">
                <div className="rounded-[24px] border border-[#2a2421] bg-[#0d0b0a] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3 border-b border-[#1d1917] pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#C5A059]">Painel do organizador</p>
                      <h2 className="mt-2 text-lg font-semibold text-white">Seu festival sob controle</h2>
                    </div>
                    <div className="rounded-full border border-[#2f2926] bg-[#14110f] px-3 py-1 text-xs text-gray-400">
                      AXON Core
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#26211e] bg-[#13100f] p-4 sm:col-span-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">Portal configurado com a identidade do cliente</p>
                          <p className="mt-2 text-sm leading-7 text-gray-400">
                            Marca, nomenclaturas e experiência adaptadas ao tipo de evento que você organiza.
                          </p>
                        </div>
                        <PanelTop className="mt-1 text-[#C5A059]" size={18} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#26211e] bg-[#13100f] p-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-[#C5A059]" />
                        <p className="text-sm font-semibold text-white">Inscrições organizadas</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-gray-400">
                        Receba dados, arquivos obrigatórios e confirmações com menos ruído operacional.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#26211e] bg-[#13100f] p-4">
                      <div className="flex items-center gap-3">
                        <CalendarRange size={18} className="text-[#C5A059]" />
                        <p className="text-sm font-semibold text-white">Cronograma mais claro</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-gray-400">
                        Acompanhe o evento com mais previsibilidade e menos dependência de controles paralelos.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#2a2421] bg-[#11100f] p-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Festival de Dança",
                        "Competição Esportiva",
                        "Mostra de Teatro",
                        "Festival de Música",
                      ].map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center rounded-full border border-[#3b342f] bg-[#171311] px-3 py-1 text-xs text-gray-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-gray-400">
                      O mesmo produto atende eventos diferentes porque o AXON Fest foi pensado para operar como plataforma,
                      não como sistema engessado de nicho único.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C5A059]">Por que escolher o AXON Fest</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Um sistema pensado para a realidade de quem organiza eventos complexos.
          </h2>
          <p className="mt-4 text-base leading-8 text-gray-400">
            Em vez de adaptar sua operação a uma ferramenta genérica, você configura o sistema para refletir o modelo do seu festival,
            reduzir retrabalho da equipe e entregar uma experiência mais profissional para escolas, grupos, artistas e participantes.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.05fr_0.95fr_0.95fr]">
          <div className="lg:row-span-2">
            <FeatureCard {...features[0]} />
          </div>
          <FeatureCard {...features[1]} />
          <FeatureCard {...features[2]} />
          <div className="rounded-3xl border border-[#2c2622] bg-[#14100f] p-6 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C5A059]">O ganho real</p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight text-white">
              Você deixa de apagar incêndio operacional e passa a conduzir o evento com método.
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                "Menos mensagens repetidas para corrigir inscrição manualmente",
                "Menos risco de erro por arquivos e informações espalhadas",
                "Mais clareza para equipe, direção, jurados e participantes",
                "Mais credibilidade para vender um festival maior e melhor organizado",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-[#27211e] bg-[#100d0c] p-4">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0 text-[#C5A059]" />
                  <p className="text-sm leading-7 text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-[#1f1a18] bg-[#0f0d0c]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C5A059]">Como funciona</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Do setup inicial à execução do evento, o fluxo é simples.
              </h2>
              <p className="mt-4 text-base leading-8 text-gray-400">
                O objetivo do AXON Fest não é só digitalizar cadastro. É estruturar a operação inteira do festival em etapas claras,
                para você ganhar velocidade sem perder controle.
              </p>

              <div className="mt-8 rounded-3xl border border-[#2c2622] bg-[#14100f] p-6">
                <p className="text-sm font-semibold text-white">O que isso significa na prática</p>
                <div className="mt-4 space-y-3">
                  {[
                    "Você publica um portal profissional em vez de improvisar processos avulsos.",
                    "A equipe acompanha tudo com menos ruído e mais previsibilidade.",
                    "Os participantes entendem melhor o fluxo e cometem menos erros no envio.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#C5A059]" />
                      <p className="text-sm leading-7 text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-[32px] border border-[#2e2825] bg-[#14110f] p-8 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C5A059]">Pronto para estruturar seu próximo evento?</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Comece agora a construir um festival com mais controle, mais clareza e mais valor percebido.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-gray-400">
                Se o seu evento já cresceu além das planilhas, grupos de mensagens e formulários desconectados,
                o AXON Fest foi feito para ser a base da sua próxima fase.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href="/cadastro"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C5A059] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#d7b26a]"
              >
                Criar meu Festival
                <ArrowRight size={16} />
              </Link>
              <a
                href="#top"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#3a332f] bg-[#15110f] px-6 py-3 text-sm font-semibold text-gray-200 transition-all hover:border-[#C5A059]/50 hover:text-white"
              >
                Voltar ao topo
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1f1a18]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 AXON Fest. Todos os direitos reservados.</p>
          <p>Plataforma white-label para gestão de festivais e eventos competitivos.</p>
        </div>
      </footer>
    </main>
  );
}