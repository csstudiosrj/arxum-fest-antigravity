export default function AvaliacaoPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Cabeçalho */}
      <div className="text-center flex flex-col gap-2">
        <span className="text-axon-green text-sm font-medium tracking-widest uppercase">
          Painel do Jurado
        </span>
        <h1 className="text-3xl font-bold text-white">Avaliação</h1>
        <p className="text-gray-400 text-sm">
          Interface de avaliação — em construção.
        </p>
      </div>

      {/* Placeholder do card de avaliação */}
      <div className="bg-axon-panel border border-axon-border rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-widest">
            Apresentação atual
          </span>
          <p className="text-white font-semibold text-lg">
            Aguardando início da apresentação...
          </p>
        </div>

        <div className="h-px bg-axon-border" />

        <p className="text-gray-500 text-sm text-center">
          Os campos de avaliação aparecerão aqui quando o módulo for ativado.
        </p>
      </div>
    </div>
  );
}