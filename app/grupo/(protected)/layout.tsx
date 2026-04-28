"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EscolaShell from "../_components/EscolaShell";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/escola/login");
        return;
      }

      // Busca usando a nova coluna grupo_id
      const { data: userData, error } = await supabase
        .from("usuarios")
        .select("role, grupo_id")
        .eq("id", session.user.id)
        .single();

      if (error || !userData) {
        router.push("/escola/login");
        return;
      }

      if (userData.role !== 'escola_admin' && userData.role !== 'coreografo') {
        router.push("/escola/login");
        return;
      }

      setAutorizado(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  if (loading || !autorizado) {
    return (
      <div className="min-h-screen bg-axon-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-axon-gold" size={40} />
      </div>
    );
  }

  return <EscolaShell>{children}</EscolaShell>;
}