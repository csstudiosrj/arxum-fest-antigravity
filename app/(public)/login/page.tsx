export default function LoginPage() {
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

        {/* Card de login */}
        <div className="bg-axon-panel border border-axon-border rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-white">Entrar na plataforma</h1>
            <p className="text-gray-400 text-sm">
              Acesse com suas credenciais.
            </p>
          </div>

          <form className="flex flex-col gap-4">
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
                className="bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-green transition-colors"
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
                className="bg-axon-bg border border-axon-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-axon-green transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-axon-green text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-axon-green/90 transition-colors mt-2"
            >
              Entrar
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