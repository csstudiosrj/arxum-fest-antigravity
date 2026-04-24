import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas que não precisam de autenticação
const PUBLIC_ROUTES = ["/login"];

// Mapeamento de role → prefixos de rota permitidos
const ROLE_ROUTES: Record<string, string[]> = {
  admin: ["/dashboard", "/eventos", "/inscricoes", "/midias", "/jurados", "/loja", "/termos", "/marketing", "/pdv", "/configuracoes"],
  escola: ["/elenco", "/inscricoes-escola", "/musicas", "/loja-escola"],
  jurado: ["/avaliacao"],
};

// Qualquer usuário autenticado pode acessar
const SHARED_ROUTES = ["/participante"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cria a resposta base (permite que o Supabase atualize os cookies de sessão)
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Busca o usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Rota pública: deixa passar sempre
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Se já está logado e tenta acessar /login, redireciona para seu painel
    if (user) {
      const role = user.user_metadata?.role ?? "participante";
      const destination = getHomeByRole(role);
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return supabaseResponse;
  }

  // 2. Sem sessão: redireciona para login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Com sessão: verifica se a role tem acesso à rota
  const role = user.user_metadata?.role ?? "participante";

  // Rota compartilhada: qualquer autenticado acessa
  if (SHARED_ROUTES.some((r) => pathname.startsWith(r))) {
    return supabaseResponse;
  }

  // Verifica se a role tem permissão para o caminho atual
  const allowedPrefixes = ROLE_ROUTES[role] ?? [];
  const isAllowed = allowedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isAllowed) {
    // Redireciona para o painel correto da role, sem acesso à rota solicitada
    const destination = getHomeByRole(role);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}

// Retorna a rota inicial de cada role
function getHomeByRole(role: string): string {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "escola":
      return "/elenco";
    case "jurado":
      return "/avaliacao";
    default:
      return "/participante";
  }
}

// Define quais rotas o middleware intercepta (exclui assets e arquivos estáticos)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};