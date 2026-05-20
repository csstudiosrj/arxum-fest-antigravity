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

  const { data: participacao, error } = await supabase
    .from("participacoes_participante_grupo_evento")
    .select("id, confirmado")
    .eq("token_confirmacao", token)
    .single();

  if (error || !participacao) {
    notFound();
  }

  if (participacao.confirmado) {
    return (
      <div className="min-h-screen bg-axon-bg flex items-center justify-center px-4">
        <div className="bg-axon-panel border border-axon-border rounded-xl p-8 max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Participação já confirmada
          </h1>
          <p className="text-gray-400">
            Você já havia confirmado sua participação anteriormente.
          </p>
        </div>
      </div>
    );
  }

  const { error: updateError } = await supabase
    .from("participacoes_participante_grupo_evento")
    .update({ confirmado: true, status_disponibilidade: "disponivel" })
    .eq("id", participacao.id);

  if (updateError) {
    return (
      <div className="min-h-screen bg-axon-bg flex items-center justify-center px-4">
        <div className="bg-axon-panel border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Erro ao confirmar
          </h1>
          <p className="text-gray-400">
            Ocorreu um erro. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-axon-bg flex items-center justify-center px-4">
      <div className="bg-axon-panel border border-emerald-500/30 rounded-xl p-8 max-w-md text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Participação confirmada!
        </h1>
        <p className="text-gray-400 mb-6">
          Agora você está oficialmente participando do festival.
        </p>
        <p className="text-sm text-gray-500">
          Em breve você receberá mais informações sobre o evento.
        </p>
      </div>
    </div>
  );
}