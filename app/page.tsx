// src/app/page.tsx
import Link from "next/link";

export default function FestHome() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">ARXUM Fest</h1>
        <p className="text-lg text-gray-400">Plataforma de eventos e festivais.</p>
        <Link
          href="/login"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 py-3 rounded-lg transition-all"
        >
          Acessar
        </Link>
        <p className="text-xs text-gray-600 mt-12">© 2026 ARXUM Sistemas</p>
      </div>
    </main>
  );
}