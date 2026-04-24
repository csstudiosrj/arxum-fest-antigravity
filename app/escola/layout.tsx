import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/supabase/server";
import EscolaShell from "@/app/escola/_components/EscolaShell";

export const metadata: Metadata = {
  title: "AXON Fest — Portal da Escola",
};

export default async function EscolaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getUserRole();

  if (!role) redirect("/login");
  if (role !== "escola") redirect("/login");

  return <EscolaShell>{children}</EscolaShell>;
}