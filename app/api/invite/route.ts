import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const HIERARQUIA: Record<string, string[]> = {
  super_admin: ["super_admin", "admin", "produtor", "marketing", "assistente"],
  admin:       ["produtor", "marketing", "assistente"],
  produtor:    [], marketing: [], assistente: [],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role, action, password, inviterRole, userId } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ── Remover ──
    if (action === "remove") {
      if (!userId) return NextResponse.json({ error: "userId ausente." }, { status: 400 });
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      await supabaseAdmin.from("usuarios").delete().eq("id", userId);
      return NextResponse.json({ success: true });
    }

    // ── Atualizar cargo ──
    if (action === "update") {
      if (!userId || !role || !inviterRole)
        return NextResponse.json({ error: "Campos ausentes." }, { status: 400 });
      if (!HIERARQUIA[inviterRole]?.includes(role))
        return NextResponse.json({ error: "Sem permissão para atribuir este cargo." }, { status: 403 });
      const { error } = await supabaseAdmin.from("usuarios").update({ role }).eq("id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    // ── Validações para invite/add ──
    if (!email || !role || !action || !inviterRole)
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });

    if (!HIERARQUIA[inviterRole]?.includes(role))
      return NextResponse.json({ error: "Você não tem permissão para criar usuários com esse cargo." }, { status: 403 });

    let newUserId: string;

    if (action === "invite") {
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      newUserId = data.user.id;

    } else if (action === "add") {
      if (!password || password.length < 6)
        return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres." }, { status: 400 });
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      newUserId = data.user.id;

    } else {
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    }

    const { error: upsertError } = await supabaseAdmin
      .from("usuarios")
      .upsert(
        { id: newUserId, email, role, nome: null, telefone: null, foto_url: null },
        { onConflict: "id" }
      );

    if (upsertError)
      return NextResponse.json({ error: "Usuário criado, mas erro ao salvar cargo: " + upsertError.message }, { status: 500 });

    return NextResponse.json({ success: true });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}