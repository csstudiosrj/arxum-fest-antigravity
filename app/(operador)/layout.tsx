"use client";

import { useState, createContext, useContext } from "react";
import { Lock } from "lucide-react";

// ─── Contexto do PIN ──────────────────────────────────────────────────────────

interface OperadorContextType {
  pinValidado: boolean;
  setPinValidado: (v: boolean) => void;
}

const OperadorContext = createContext<OperadorContextType>({
  pinValidado: false,
  setPinValidado: () => {},
});

export const useOperador = () => useContext(OperadorContext);

// ─── Tela de PIN ──────────────────────────────────────────────────────────────

function TelaPIN({ onAutenticado }: { onAutenticado: () => void }) {
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState(false);
  const [tentando, setTentando] = useState(false);

  const validar = async (pinDigitado: string) => {
    setTentando(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pdv_config")
        .select("pin_vendedor")
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setErro(true);
        setTimeout(() => { setPin(""); setErro(false); setTentando(false); }, 800);
        return;
      }

      if (pinDigitado === data.pin_vendedor) {
        onAutenticado();
      } else {
        setErro(true);
        setTimeout(() => { setPin(""); setErro(false); setTentando(false); }, 800);
      }
    } catch {
      setErro(true);
      setTimeout(() => { setPin(""); setErro(false); setTentando(false); }, 800);
    }
  };

  const handleDigito = (d: string) => {
    if (tentando || pin.length >= 4) return;
    const novo = pin + d;
    setPin(novo);
    if (novo.length === 4) validar(novo);
  };

  return (
    <div className="fixed inset-0 bg-[#0d0807] flex flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-[#1a1413] border border-[#2e2825] flex items-center justify-center">
          <Lock size={28} className="text-[#C5A059]" />
        </div>
        <h1 className="text-xl font-bold text-white">Acesso ao Operador</h1>
        <p className="text-gray-500 text-sm">Digite o PIN de 4 dígitos</p>
      </div>

      {/* Pontos */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
            pin.length > i
              ? erro ? "bg-red-500 border-red-500" : "bg-[#C5A059] border-[#C5A059]"
              : "border-[#2e2825]"
          }`} />
        ))}
      </div>

      {erro && <p className="text-red-400 text-sm -mt-4">PIN incorreto. Tente novamente.</p>}

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
          <button
            key={i}
            onClick={() => {
              if (d === "⌫") setPin((p) => p.slice(0, -1));
              else if (d !== "") handleDigito(d);
            }}
            disabled={d === "" || tentando}
            className={`h-16 rounded-2xl text-xl font-bold transition-all active:scale-95 ${
              d === ""
                ? "pointer-events-none"
                : d === "⌫"
                ? "bg-[#1a1413] border border-[#2e2825] text-gray-400 hover:text-white"
                : "bg-[#1a1413] border border-[#2e2825] text-white hover:border-[#C5A059] hover:text-[#C5A059]"
            } disabled:opacity-50`}
          >
            {tentando && pin.length === 4 && d !== "⌫" && d !== "" ? "" : d}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Layout Principal ─────────────────────────────────────────────────────────

export default function OperadorLayout({ children }: { children: React.ReactNode }) {
  const [pinValidado, setPinValidado] = useState(false);

  return (
    <OperadorContext.Provider value={{ pinValidado, setPinValidado }}>
      {pinValidado ? children : <TelaPIN onAutenticado={() => setPinValidado(true)} />}
    </OperadorContext.Provider>
  );
}