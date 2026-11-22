import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

import { ID_PROVEEDOR_DESARROLLO } from "@/lib/auth/acceso-desarrollo";
import { opcionesAuth, proveedoresActivos } from "@/lib/auth/opciones";

async function manejar(request: NextRequest, contexto: RouteContext<"/api/auth/[...nextauth]">) {
  const { nextauth } = await contexto.params;
  // Sin el acceso de desarrollo activo, cualquier ruta de ese proveedor responde 404 (sección 2).
  if (nextauth.includes(ID_PROVEEDOR_DESARROLLO) && !proveedoresActivos().desarrollo) {
    return new Response("No encontrado", { status: 404 });
  }
  return NextAuth(request, contexto, opcionesAuth()) as Promise<Response>;
}

export { manejar as GET, manejar as POST };
