import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  LayoutTemplate,
  Music4,
  Rocket,
  Settings2,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Rocket,
    title: "Crie seu festival em minutos",
    description:
      "Comece com uma estrutura pronta para publicar seu evento com agilidade. Cadastre as informações principais, organize categorias, períodos e prepare a base do portal sem depender de planilhas ou processos improvisados.",
    highlights: [
      "Estrutura inicial pronta para começar rápido",
      "Organização central do evento desde o primeiro acesso",
      "Mais clareza para sua equipe antes da abertura das inscrições",
    ],
  },
  {
    number: "02",
    icon: LayoutTemplate,
    title: "Personalize o portal com a sua marca",
    description:
      "O AXON Fest é white-label de verdade. Você define identidade visual, logo, cores e até a terminologia usada no sistema para que cada cliente, festival ou modalidade tenha uma experiência alinhada à própria operação.",
    highlights: [
      "Portal com cara da sua marca",
      'Termos dinâmicos como “Bailarino”, “Atleta”, “Coreografia” ou “Peça”',
      "Experiência mais profissional para escolas, grupos e participantes",
    ],
  },
  {
    number: "03",
    icon: Users,
    title: "Abra as inscrições e receba tudo em um só lugar",
    description:
      "Com o portal publicado, escolas, grupos e participantes conseguem enviar inscrições com mais autonomia. O sistema centraliza dados, documentos, mídias e informações do evento para reduzir retrabalho e evitar perda de informação no meio do processo.",
    highlights: [
      "Cadastro organizado de participantes e apresentações",
      "Envio de materiais obrigatórios e complementares",
      "Fluxo mais claro para revisão antes da confirmação",
    ],
  },
  {
    number: "04",
    icon: Trophy,
    title: "Execute o evento com controle total",
    description:
      "Da gestão financeira ao acompanhamento de cronograma e avaliação, o AXON Fest ajuda sua equipe a conduzir o festival com previsibilidade. Em vez de apagar incêndios, você passa a operar com visão centralizada e mais segurança em cada etapa.",
    highlights: [
      "Pagamentos e inscrições acompanhados em um único ambiente",
      "Cronograma, operação e acompanhamento mais organizados",
      "Base preparada para notas, jurados e gestão de evento em escala",
    ],
  },
];

const pillars = [
  {
    icon: Settings2,
    title: "Menos improviso operacional",
    text: "Substitua processos espalhados em WhatsApp, planilhas, formulários e anotações por um fluxo único e mais confiável.",
  },
  {
    icon: Music4,
    title: "Mais controle sobre cada inscrição",
    text: "Receba informações, arquivos e pendências de forma estruturada para revisar melhor e reduzir erros antes do evento.",
  },
  {
    icon: Wallet,
    title: "Gestão mais profissional",
    text: "Centralize inscrições, organização financeira e acompanhamento do festival em uma plataforma pensada para operação real.",
  },
  {
    icon: CalendarDays,
    title: "Mais clareza para sua equipe",
    text: "Com o fluxo organizado, a direção e a produção ganham visibilidade para tomar decisões com antecedência.",
  },
];

const details = [
  {
    icon: FileCheck2,
    title: "Fluxo pensado para o organizador",
    text: "Cada etapa foi desenhada para simplificar o caminho entre abrir inscrições, revisar pendências e confirmar participantes.",
  },
  {
    icon: Sparkles,
    title: "Experiência premium para o cliente",
    text: "O portal transmite mais profissionalismo para escolas, grupos e responsáveis, fortalecendo a percepção de valor do seu festival.",
  },
  {
    icon: CheckCircle2,
    title: "Base pronta para crescer",
    text: "A plataforma comunica robustez, organização e capacidade de escala mesmo antes de você estruturar todas as próximas páginas públicas.",
  },
];

function SectionTitle({
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

export default function ComoFuncionaPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0C] text-zinc-100">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(197,160,89,0.16),transparent_38%)]" />
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#C5A059]">
              Como funciona
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Um fluxo mais inteligente para organizar festivais com mais
              controle, mais agilidade e menos ruído operacional.
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
              O AXON Fest foi pensado para transformar a operação do seu evento
              em um processo centralizado, profissional e escalável. Em vez de
              depender de ferramentas soltas, sua equipe passa a trabalhar em um
              sistema criado para a realidade de festivais.
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
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#C5A059]/40 hover:bg-white/10"
              >
                Voltar para a home
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {details.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5 text-[#C5A059]" />
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
        <SectionTitle
          eyebrow="Passo a passo"
          title="Da criação do evento até a execução, tudo segue uma lógica simples."
          description="A proposta do AXON Fest não é só digitalizar tarefas. É organizar a jornada completa do festival para que sua equipe ganhe tempo, reduza falhas e entregue uma experiência melhor para todos os envolvidos."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article
                key={step.number}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#C5A059]/30 hover:bg-white/[0.05] sm:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold tracking-[0.22em] text-[#C5A059]">
                    {step.number}
                  </span>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <Icon className="h-5 w-5 text-[#C5A059]" />
                  </div>
                </div>

                <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
                  {step.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {step.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-3 text-sm leading-6 text-zinc-300"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C5A059]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
          <SectionTitle
            eyebrow="Por que isso importa"
            title="Seu festival deixa de depender de esforço manual para funcionar bem."
            description="Quando a operação está centralizada, a equipe consegue focar no que realmente importa: qualidade do evento, experiência dos participantes e crescimento da marca do festival."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-white/10 bg-[#111112] p-6"
                >
                  <Icon className="h-5 w-5 text-[#C5A059]" />
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {pillar.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center sm:px-8 lg:py-24">
        <span className="inline-flex rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#C5A059]">
          Próximo passo
        </span>

        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Se o seu festival cresceu, sua operação também precisa evoluir.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
          O AXON Fest nasce para profissionalizar a gestão do evento, dar mais
          autonomia ao seu time e entregar uma experiência mais sólida para quem
          se inscreve, organiza e participa.
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
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#C5A059]/40 hover:bg-white/10"
          >
            Voltar para a home
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