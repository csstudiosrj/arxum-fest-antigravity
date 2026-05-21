import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default async function ConfirmarParticipacaoPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: vinculo, error } = await supabase
    .from("grupo_participante")
    .select("id, confirmado, grupo_id, participante_id")
    .eq("token_confirmacao", token)
    .single();

  if (error || !vinculo) {
    notFound();
  }

  if (vinculo.confirmado) {
    return (
      <div className="min-h-screen bg-axon-bg flex items-center justify-center px-4">
        <div className="bg-axon-panel border border-axon-border rounded-xl p-8 max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Vínculo já confirmado</h1>
          <p className="text-gray-400">Você já havia confirmado sua participação neste grupo.</p>
        </div>
      </div>
    );
  }

  const { error: updateError } = await supabase
    .from("grupo_participante")
    .update({ confirmado: true, status: "ativo" })
    .eq("id", vinculo.id);

  if (updateError) {
    return (
      <div className="min-h-screen bg-axon-bg flex items-center justify-center px-4">
        <div className="bg-axon-panel border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Erro ao confirmar</h1>
          <p className="text-gray-400">Ocorreu um erro. Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-axon-bg flex items-center justify-center px-4">
      <div className="bg-axon-panel border border-emerald-500/30 rounded-xl p-8 max-w-md text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Vínculo confirmado!</h1>
        <p className="text-gray-400 mb-6">Agora você está oficialmente vinculado ao grupo no ARXUM Fest.</p>
        <p className="text-sm text-gray-500">O organizador do festival poderá contar com sua participação.</p>
      </div>
    </div>
  );
}