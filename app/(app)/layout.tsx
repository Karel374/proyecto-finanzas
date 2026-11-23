import { Suspense } from "react";

import { MenuLateral } from "@/components/menu/menu-lateral";
import { ProveedorRegistro } from "@/components/registro/contexto-registro";
import { RegistroConDatos, RespaldoRecurrentes } from "@/components/registro/registro-con-datos";
import { ProveedorAvisos } from "@/components/ui/avisos";

/** Estructura de toda página con sesión: menú lateral fijo y contenido de hasta 1280 px (sección 3). */
export default function LayoutApp({ children }: LayoutProps<"/">) {
  return (
    <ProveedorAvisos>
      <ProveedorRegistro>
        <div className="flex min-h-screen min-w-[1024px]">
          <MenuLateral />
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-8">{children}</main>
        </div>
        <Suspense>
          <RegistroConDatos />
          <RespaldoRecurrentes />
        </Suspense>
      </ProveedorRegistro>
    </ProveedorAvisos>
  );
}
