import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const HIERARQUIA: Record<string, string[]> = {
  super_admin: ["super_admin", "admin", "produtor", "marketing", "assistente", "escola_admin", "coreografo"],
  admin:       ["produtor", "marketing", "assistente", "escola_admin", "coreografo"],
  produtor:    [],
  marketing:   [],
  assistente:  [],
  escola_admin: [],
  coreografo:  [],
};

export async function POST(req: NextRequest) {
  // Instância administrativa com service_role para operações de Auth e escrita no DB
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const body = await req.json();
    const { email, role, action, password, userId, grupo_id, nome } = body;

    // ── Autenticação do solicitante (Zero Trust) ──
    const supabase = createServerClient();
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser();

    if (authError || !caller) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    // Buscar dados reais do solicitante na tabela usuarios
    const { data: callerData, error: callerError } = await supabase
      .from("usuarios")
      .select("role, produtora_id")
      .eq("id", caller.id)
      .single();

    if (callerError || !callerData) {
      return NextResponse.json({ error: "Usuário solicitante não encontrado no sistema." }, { status: 403 });
    }

    const { role: inviterRole, produtora_id: inviterProdutoraId } = callerData;

    // ── Validação básica da ação ──
    if (!action || !["invite", "add", "update", "remove"].includes(action)) {
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    }

    // ── Ação REMOVER ──
    if (action === "remove") {
      if (!userId) return NextResponse.json({ error: "userId ausente." }, { status: 400 });

      // Verificar se o usuário alvo pertence à mesma produtora
      const { data: targetUser, error: targetError } = await supabase
        .from("usuarios")
        .select("produtora_id")
        .eq("id", userId)
        .single();

      if (targetError || !targetUser) {
        return NextResponse.json({ error: "Usuário alvo não encontrado." }, { status: 404 });
      }

      if (targetUser.produtora_id !== inviterProdutoraId) {
        return NextResponse.json({ error: "Usuário não pertence à sua organização." }, { status: 403 });
      }

      // Excluir usuário da autenticação e do banco (com supabaseAdmin para bypass RLS)
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        return NextResponse.json({ error: deleteAuthError.message }, { status: 400 });
      }

      await supabaseAdmin.from("usuarios").delete().eq("id", userId);
      return NextResponse.json({ success: true });
    }

    // ── Ação ATUALIZAR CARGO ──
    if (action === "update") {
      if (!userId || !role || !inviterRole) {
        return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
      }

      // Verificar permissão hierárquica do solicitante para o novo cargo
      if (!HIERARQUIA[inviterRole]?.includes(role)) {
        return NextResponse.json({ error: "Sem permissão para atribuir este cargo." }, { status: 403 });
      }

      // Verificar isolamento de tenant
      const { data: targetUser, error: targetError } = await supabase
        .from("usuarios")
        .select("produtora_id")
        .eq("id", userId)
        .single();

      if (targetError || !targetUser) {
        return NextResponse.json({ error: "Usuário alvo não encontrado." }, { status: 404 });
      }

      if (targetUser.produtora_id !== inviterProdutoraId) {
        return NextResponse.json({ error: "Usuário não pertence à sua organização." }, { status: 403 });
      }

      // Atualizar cargo (com supabaseAdmin para bypass RLS)
      const { error: updateError } = await supabaseAdmin
        .from("usuarios")
        .update({ role })
        .eq("id", userId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // ── Ações CONVITE e ADICIONAR ──
    if (action === "invite" || action === "add") {
      if (!email || !role) {
        return NextResponse.json({ error: "Email e cargo são obrigatórios." }, { status: 400 });
      }

      // Verificar permissão hierárquica do solicitante para o cargo do novo usuário
      if (!HIERARQUIA[inviterRole]?.includes(role)) {
        return NextResponse.json({ error: "Você não tem permissão para criar usuários com esse cargo." }, { status: 403 });
      }

      let newUserId: string;

      if (action === "invite") {
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: { role, produtora_id: inviterProdutoraId },
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        newUserId = data.user.id;
      } else {
        if (!password || password.length < 6) {
          return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres." }, { status: 400 });
        }
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role, produtora_id: inviterProdutoraId },
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        newUserId = data.user.id;
      }

      // Persistir na tabela usuarios (com supabaseAdmin para bypass RLS)
      const { error: upsertError } = await supabaseAdmin
        .from("usuarios")
        .upsert(
          {
            id: newUserId,
            email,
            role,
            nome: nome ?? null,
            organizacao_id: grupo_id ?? null,   // coluna física no banco é 'organizacao_id'
            ativo: true,                         // obrigatório (NOT NULL)
            produtora_id: inviterProdutoraId,
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        return NextResponse.json(
          { error: "Usuário criado, mas erro ao salvar dados complementares: " + upsertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Fallback (não deve chegar aqui)
    return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno do servidor.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}