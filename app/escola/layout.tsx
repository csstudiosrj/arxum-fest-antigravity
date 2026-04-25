import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AXON Fest — Portal da Escola",
};

export default function EscolaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}