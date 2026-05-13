import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, nome, role } = await req.json();

    if (!email || !nome || !role) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );

    // Convida o usuário via Auth (envia email automático)
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { nome, role },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://axon-fest.vercel.app"}/login`,
    });

    if (authError) {
      // Se usuário já existe, apenas retorna sucesso
      if (authError.message.includes("already been registered")) {
        return NextResponse.json({ ok: true, jaExiste: true });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Cria ou atualiza registro na tabela usuarios
    if (authData.user) {
      await supabase.from("usuarios").upsert({
        id: authData.user.id,
        nome,
        email,
        role,
        ativo: true,
      }, { onConflict: "id" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}