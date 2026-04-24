import type { Metadata } from "next";
import EscolaShell from "./_components/EscolaShell";

export const metadata: Metadata = {
  title: "AXON Fest — Portal da Escola",
};

export default function EscolaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EscolaShell>{children}</EscolaShell>;
}