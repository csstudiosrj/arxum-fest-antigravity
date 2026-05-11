import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARXUM Fest — Portal do Grupo",
};

export default function GrupoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}