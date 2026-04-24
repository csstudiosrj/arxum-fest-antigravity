import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AXON Fest — Painel do Jurado",
};

export default function JuradoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-axon-bg text-white flex flex-col items-center justify-center">
      {children}
    </div>
  );
}