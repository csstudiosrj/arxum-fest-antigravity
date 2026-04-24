import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];

const ROLE_ROUTES: Record<string, string[]> = {
  admin: ["/dashboard", "/eventos", "/inscricoes", "/midias", "/jurados", "/loja", "/termos", "/marketing", "/pdv", "/configuracoes"],
  escola: ["/elenco", "/inscricoes-escola", "/musicas", "/loja-escola"],
  jurado: ["/avaliacao"],
};

const SHARED_ROUTES = ["/participante"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rota pública
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (user) {
      const role = user.user_metadata?.role ?? "participante";
      return NextResponse.redirect(new URL(getHomeByRole(role), request.url));
    }
    return supabaseResponse;
  }

  // Sem sessão → login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = user.user_metadata?.role ?? "participante";

  // Rota compartilhada → qualquer autenticado acessa
  if (SHARED_ROUTES.some((r) => pathname.startsWith(r))) {
    return supabaseResponse;
  }

  // Verifica permissão por role
  const allowedPrefixes = ROLE_ROUTES[role] ?? [];
  const isAllowed = allowedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isAllowed) {
    return NextResponse.redirect(new URL(getHomeByRole(role), request.url));
  }

  return supabaseResponse;
}

function getHomeByRole(role: string): string {
  switch (role) {
    case "admin": return "/dashboard";
    case "escola": return "/elenco";
    case "jurado": return "/avaliacao";
    default: return "/participante";
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};