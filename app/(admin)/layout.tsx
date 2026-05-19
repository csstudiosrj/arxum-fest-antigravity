import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminShell from "./_components/AdminShell";

// Lista de roles permitidas no painel admin (organizador/produtora)
const ROLES_PERMITIDAS = [
  "admin",
  "super_admin",
  "produtora_admin",
  "produtora_staff",
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Verifica sessão
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // 2. Busca dados do usuário (role, nome, email)
  const { data: userData, error } = await supabase
    .from("usuarios")
    .select("role, nome, email")
    .eq("id", session.user.id)
    .single();

  if (error || !userData) {
    // Se não encontrar na tabela, redireciona
    redirect("/login");
  }

  // 3. Verifica se a role é permitida
  if (!ROLES_PERMITIDAS.includes(userData.role)) {
    redirect("/login");
  }

  // 4. Passa os dados do usuário para o shell cliente
  return (
    <AdminShell
      userEmail={userData.email || session.user.email || ""}
      userName={userData.nome || "Organizador"}
      userRole={userData.role}
    >
      {children}
    </AdminShell>
  );
}