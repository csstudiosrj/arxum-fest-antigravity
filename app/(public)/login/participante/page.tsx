export default function ParticipantePage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <span className="text-axon-green text-xs font-medium tracking-widest uppercase">
            Área do Participante
          </span>
          <h1 className="text-2xl font-bold text-white">Minha Apresentação</h1>
        </div>

        {/* Card principal */}
        <div className="bg-axon-panel border border-axon-border rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                Bailarino(a)
              </span>
              <p className="text-white font-semibold">—</p>
            </div>

            <div className="h-px bg-axon-border" />

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                Horário de Apresentação
              </span>
              <p className="text-white font-semibold">—</p>
            </div>

            <div className="h-px bg-axon-border" />

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                Coreografia
              </span>
              <p className="text-white font-semibold">—</p>
            </div>
          </div>

          <button
            disabled
            className="w-full border border-axon-green text-axon-green font-semibold py-2.5 rounded-lg text-sm opacity-50 cursor-not-allowed"
          >
            Baixar Certificado
          </button>
        </div>

        <p className="text-center text-xs text-gray-600">
          Informações somente leitura — AXON Fest © 2026
        </p>
      </div>
    </div>
  );
}