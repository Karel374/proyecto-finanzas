"use client";

import { Plus } from "lucide-react";

import { useRegistro } from "./contexto-registro";

/** Botón principal del menú: abre el panel de registro. Atajo: N. */
export function BotonRegistrar() {
  const { abrir } = useRegistro();
  return (
    <button
      type="button"
      onClick={abrir}
      title="Registrar (N)"
      aria-keyshortcuts="N"
      className="bg-acento text-sobre-acento focus-visible:outline-acento flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Plus aria-hidden="true" className="size-5 shrink-0" />
      <span className="sr-only xl:not-sr-only">Registrar</span>
      <kbd className="border-sobre-acento/40 hidden rounded border px-1 text-xs xl:inline">N</kbd>
    </button>
  );
}
