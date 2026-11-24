import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

/** Páginas que cualquiera puede ver sin sesión. */
const PUBLICAS = new Set(["/", "/ingresar"]);

/**
 * Protege la app: sin sesión, toda página que no sea pública manda a /ingresar.
 * Con sesión, la landing y /ingresar mandan al panel. La autorización real vive en lib/datos,
 * que siempre filtra por el usuario de la sesión; esto solo evita pintar páginas vacías.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const publica = PUBLICAS.has(pathname);

  if (!token && !publica) {
    const destino = new URL("/ingresar", request.url);
    destino.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(destino);
  }
  if (token && publica) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Todo menos las rutas de autenticación, el cron, los archivos de Next y los estáticos con extensión.
  matcher: ["/((?!api/auth|api/cron|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
