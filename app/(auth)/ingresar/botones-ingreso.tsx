"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

/** Acepta solo rutas internas para no redirigir a otro sitio después de entrar. */
function destinoSeguro(): string {
  const destino = new URLSearchParams(window.location.search).get("callbackUrl");
  return destino && destino.startsWith("/") && !destino.startsWith("//") ? destino : "/";
}

export function BotonesIngreso({ google, desarrollo }: { google: boolean; desarrollo: boolean }) {
  const [entrando, setEntrando] = useState<string | null>(null);

  function entrar(proveedor: string) {
    setEntrando(proveedor);
    void signIn(proveedor, { callbackUrl: destinoSeguro() });
  }

  return (
    <div className="flex flex-col gap-3">
      {google && (
        <button
          type="button"
          disabled={entrando !== null}
          onClick={() => entrar("google")}
          className="bg-acento text-sobre-acento focus-visible:outline-acento rounded-md px-4 py-2.5 text-sm font-medium hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {entrando === "google" ? "Entrando…" : "Entrar con Google"}
        </button>
      )}
      {desarrollo && (
        <button
          type="button"
          disabled={entrando !== null}
          onClick={() => entrar("desarrollo")}
          className="border-borde bg-superficie-2 text-texto focus-visible:outline-acento rounded-md border px-4 py-2.5 text-sm font-medium hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {entrando === "desarrollo" ? "Entrando…" : "Entrar como desarrollador"}
        </button>
      )}
    </div>
  );
}
