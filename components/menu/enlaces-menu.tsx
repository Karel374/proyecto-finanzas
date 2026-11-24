"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BLOQUES_MENU } from "./secciones";

/** Enlaces del menú agrupados por bloque. Debajo de 1280 px solo se ven los íconos. */
export function EnlacesMenu() {
  const rutaActual = usePathname();

  return (
    <nav aria-label="Secciones" className="flex flex-col gap-4">
      {BLOQUES_MENU.map((bloque) => (
        <div key={bloque.titulo} className="flex flex-col gap-0.5">
          <h2 className="text-texto-3 hidden px-3 pb-1 text-xs font-medium tracking-wide uppercase xl:block">
            {bloque.titulo}
          </h2>
          <ul className="flex flex-col gap-0.5">
            {bloque.secciones.map(({ titulo, ruta, icono: Icono }) => {
              const activa = rutaActual === ruta || rutaActual.startsWith(`${ruta}/`);
              return (
                <li key={ruta}>
                  <Link
                    href={ruta}
                    title={titulo}
                    aria-current={activa ? "page" : undefined}
                    className={`focus-visible:outline-acento flex items-center justify-center gap-3 rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 xl:justify-start ${
                      activa
                        ? "bg-marca text-sobre-marca font-medium"
                        : "text-texto-2 hover:bg-superficie-2 hover:text-texto"
                    }`}
                  >
                    <Icono aria-hidden="true" className="size-5 shrink-0" />
                    <span className="sr-only xl:not-sr-only">{titulo}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
