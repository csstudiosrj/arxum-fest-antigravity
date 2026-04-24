import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/supabase/server";
import AdminShell from "./_components/AdminShell";

export const metadata: Metadata = {
  title: "AXON Fest — Painel do Organizador",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getUserRole();

  if (!role) redirect("/login");
  if (role !== "admin") redirect("/login");

  return <AdminShell>{children}</AdminShell>;
}