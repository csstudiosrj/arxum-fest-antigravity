import type { Metadata } from "next";
import AdminShell from "./_components/AdminShell";

export const metadata: Metadata = {
  title: "AXON Fest — Painel do Organizador",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}