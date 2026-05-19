import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Roles permitidas para a área do grupo
const ROLES_GRUPO = ["escola_admin", "coreografo"];

export default async function GrupoRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/grupo/login");
  }

  // Busca role e grupo_id
  const { data: userData, error } = await supabase
    .from("usuarios")
    .select("role, grupo_id")
    .eq("id", session.user.id)
    .single();

  if (error || !userData || !ROLES_GRUPO.includes(userData.role)) {
    redirect("/grupo/login");
  }

  // Se o usuário não pertence a um grupo, também não pode acessar
  if (!userData.grupo_id) {
    redirect("/grupo/login");
  }

  // Tudo ok – renderiza os filhos (que podem ser os sub-layouts protegidos)
  return <>{children}</>;
}