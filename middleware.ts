import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];

const ROLE_ROUTES: Record<string, string[]> = {
  admin: ["/dashboard", "/eventos", "/inscricoes", "/midias", "/jurados", "/loja", "/termos", "/marketing", "/pdv", "/configuracoes"],
  escola: ["/elenco", "/inscricoes-escola", "/musicas", "/loja-escola"],
  jurado: ["/avaliacao"],
};

const SHARED_ROUTES = ["/participante"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas passam direto
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Verifica se existe cookie de sessão do Supabase
  const hasSession = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
  );

  // Sem sessão → login
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Com sessão → deixa passar (a verificação de role fica nas páginas via Server Component)
  if (SHARED_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const allAllowed = Object.values(ROLE_ROUTES).flat();
  const isKnownRoute = allAllowed.some((prefix) => pathname.startsWith(prefix));

  if (!isKnownRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};