import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protege la app: sin sesión, toda página manda a /ingresar.
 * Con sesión, /ingresar manda al inicio. La autorización real vive en lib/datos,
 * que siempre filtra por el usuario de la sesión; esto solo evita pintar páginas vacías.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const enIngresar = pathname === "/ingresar";

  if (!token && !enIngresar) {
    const destino = new URL("/ingresar", request.url);
    if (pathname !== "/") destino.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(destino);
  }
  if (token && enIngresar) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Todo menos las rutas de autenticación, el cron, los archivos de Next y los estáticos con extensión.
  matcher: ["/((?!api/auth|api/cron|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
