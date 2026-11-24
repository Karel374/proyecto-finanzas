import { Suspense } from "react";

import { BotonRegistrar } from "@/components/registro/boton-registrar";
import { obtenerAjustes } from "@/lib/datos/ajustes";
import { obtenerSesion } from "@/lib/auth/sesion";

import { BotonCerrarSesion } from "./boton-cerrar-sesion";
import { EnlacesMenu } from "./enlaces-menu";
import { SelectorTema } from "./selector-tema";

/** Menú lateral fijo: 240 px desde 1280 px de ancho, solo íconos por debajo (sección 3). */
export function MenuLateral() {
  return (
    <aside className="border-borde bg-superficie sticky top-0 flex h-screen w-16 shrink-0 flex-col gap-5 overflow-y-auto border-r px-2 py-4 xl:w-60 xl:px-3">
      <div className="flex items-center justify-center gap-2 px-1 xl:justify-start">
        <span
          aria-hidden="true"
          className="bg-marca text-sobre-marca grid size-8 place-items-center rounded-md font-bold"
        >
          $
        </span>
        <span className="hidden text-base font-semibold xl:inline">Kanomics</span>
      </div>

      <BotonRegistrar />

      <EnlacesMenu />

      <div className="border-borde mt-auto flex flex-col gap-2 border-t pt-3">
        <Suspense fallback={<div className="bg-superficie-2 h-16 animate-pulse rounded-md" />}>
          <BloqueUsuario />
        </Suspense>
        <BotonCerrarSesion />
      </div>
    </aside>
  );
}

async function BloqueUsuario() {
  const [sesion, ajustes] = await Promise.all([obtenerSesion(), obtenerAjustes()]);
  const nombre = ajustes?.nombre ?? sesion?.user?.name ?? sesion?.user?.email ?? "";

  return (
    <>
      <p className="text-texto-2 hidden truncate px-1 text-sm xl:block" title={nombre}>
        {nombre}
      </p>
      <SelectorTema temaGuardado={ajustes?.tema ?? "SISTEMA"} />
    </>
  );
}
