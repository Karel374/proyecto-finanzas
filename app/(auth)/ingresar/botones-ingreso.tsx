"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

/** Acepta solo rutas internas para no redirigir a otro sitio después de entrar. */
function destinoSeguro(): string {
  const destino = new URLSearchParams(window.location.search).get("callbackUrl");
  return destino && destino.startsWith("/") && !destino.startsWith("//") ? destino : "/panel";
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
          className="bg-m-laton text-m-sobre-laton hover:bg-m-laton-luz rounded-full px-6 py-3 text-sm font-medium transition-[background-color,translate] active:translate-y-px disabled:opacity-70"
        >
          {entrando === "google" ? "Entrando…" : "Entrar con Google"}
        </button>
      )}
      {desarrollo && (
        <button
          type="button"
          disabled={entrando !== null}
          onClick={() => entrar("desarrollo")}
          className="border-m-linea text-m-texto hover:border-m-laton rounded-full border px-6 py-3 text-sm font-medium transition-colors disabled:opacity-70"
        >
          {entrando === "desarrollo" ? "Entrando…" : "Entrar como desarrollador"}
        </button>
      )}
    </div>
  );
}
