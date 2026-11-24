"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { CLASE_BOTON_PRIMARIO, CLASE_BOTON_SECUNDARIO } from "@/components/landing/boton-entrar";

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
          className={CLASE_BOTON_PRIMARIO}
        >
          {entrando === "google" ? "Entrando…" : "Entrar con Google"}
        </button>
      )}
      {desarrollo && (
        <button
          type="button"
          disabled={entrando !== null}
          onClick={() => entrar("desarrollo")}
          className={`${CLASE_BOTON_SECUNDARIO} disabled:opacity-70`}
        >
          {entrando === "desarrollo" ? "Entrando…" : "Entrar como desarrollador"}
        </button>
      )}
    </div>
  );
}
