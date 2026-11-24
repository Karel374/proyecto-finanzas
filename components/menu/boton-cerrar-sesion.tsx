"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function BotonCerrarSesion() {
  return (
    <button
      type="button"
      title="Cerrar sesión"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-texto-2 hover:bg-superficie-2 hover:text-texto focus-visible:outline-acento flex items-center justify-center gap-3 rounded-md px-3 py-2 text-sm focus-visible:outline-2 xl:justify-start"
    >
      <LogOut aria-hidden="true" className="size-5 shrink-0" />
      <span className="sr-only xl:not-sr-only">Cerrar sesión</span>
    </button>
  );
}
