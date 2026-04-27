"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EscolaShell from "@/app/escola/_components/EscolaShell";

export default function EscolaProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (mounted) {
          router.replace("/escola/login");
        }
        return;
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("role, escola_id")
        .eq("id", user.id)
        .single();

      if (
        usuarioError ||
        !usuario ||
        !["escola_admin", "coreografo"].includes(usuario.role) ||
        !usuario.escola_id
      ) {
        await supabase.auth.signOut();
        if (mounted) {
          router.replace("/escola/login");
        }
        return;
      }

      if (mounted) {
        setAuthorized(true);
        setLoading(false);
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-axon-bg text-white">
        <div className="text-sm text-white/60">Carregando portal da escola...</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <EscolaShell>{children}</EscolaShell>;
}