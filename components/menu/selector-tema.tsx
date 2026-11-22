"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { cambiarTema } from "@/app/(app)/acciones";
import { atributoTema, type TemaApp } from "@/lib/tema";

const OPCIONES: { valor: TemaApp; etiqueta: string; Icono: typeof Sun }[] = [
  { valor: "CLARO", etiqueta: "Tema claro", Icono: Sun },
  { valor: "OSCURO", etiqueta: "Tema oscuro", Icono: Moon },
  { valor: "SISTEMA", etiqueta: "Seguir el sistema", Icono: Monitor },
];

function aplicarEnPagina(tema: TemaApp) {
  const atributo = atributoTema(tema);
  if (atributo) document.documentElement.setAttribute("data-tema", atributo);
  else document.documentElement.removeAttribute("data-tema");
}

/**
 * Selector de tema. Recibe el tema guardado en Ajustes; si la cookie del navegador no coincide
 * (por ejemplo, al entrar desde otro equipo), la corrige para que la próxima carga no parpadee.
 */
export function SelectorTema({ temaGuardado }: { temaGuardado: TemaApp }) {
  const [tema, setTema] = useState(temaGuardado);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  useEffect(() => {
    aplicarEnPagina(temaGuardado);
    if (!document.cookie.includes(`tema=${temaGuardado}`)) {
      document.cookie = `tema=${temaGuardado}; path=/; max-age=31536000; samesite=lax`;
    }
  }, [temaGuardado]);

  function elegir(nuevo: TemaApp) {
    const anterior = tema;
    setTema(nuevo);
    setError(null);
    aplicarEnPagina(nuevo);
    iniciar(async () => {
      const resultado = await cambiarTema(nuevo);
      if (!resultado.ok) {
        setTema(anterior);
        aplicarEnPagina(anterior);
        setError(resultado.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        role="group"
        aria-label="Tema"
        className="border-borde bg-superficie-2 flex flex-col gap-0.5 rounded-md border p-0.5 xl:flex-row"
      >
        {OPCIONES.map(({ valor, etiqueta, Icono }) => (
          <button
            key={valor}
            type="button"
            title={etiqueta}
            aria-label={etiqueta}
            aria-pressed={tema === valor}
            disabled={pendiente}
            onClick={() => elegir(valor)}
            className={`focus-visible:outline-acento flex flex-1 items-center justify-center rounded py-1.5 focus-visible:outline-2 ${
              tema === valor ? "bg-superficie text-texto shadow-sm" : "text-texto-3 hover:text-texto"
            }`}
          >
            <Icono aria-hidden="true" className="size-4" />
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-gasto text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
