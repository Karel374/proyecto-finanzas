"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export const CLASE_BOTON_PRIMARIO =
  "bg-k-tinta text-k-sobre-tinta inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-medium transition-[background-color,translate,box-shadow] duration-200 hover:bg-[#262b33] hover:shadow-[0_12px_30px_-12px_rgba(14,17,22,0.6)] active:translate-y-px disabled:opacity-70";

export const CLASE_BOTON_SECUNDARIO =
  "border-k-linea-fuerte text-k-tinta hover:border-k-tinta inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-medium transition-colors duration-200";

/** Ícono oficial de Google, en sus colores: la marca lo exige así en el botón de inicio de sesión. */
function LogoGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"
      />
    </svg>
  );
}

/**
 * Acción principal. Con Google configurado inicia sesión ahí mismo; si no (por ejemplo, en
 * desarrollo sin claves), lleva a la pantalla de ingreso.
 */
export function BotonEntrar({
  google,
  textos,
  className = "",
}: {
  google: boolean;
  textos: { entrar: string; abriendo: string; sinGoogle: string };
  className?: string;
}) {
  const [entrando, setEntrando] = useState(false);

  if (!google) {
    return (
      <Link href="/ingresar" className={`${CLASE_BOTON_PRIMARIO} ${className}`}>
        {textos.sinGoogle}
      </Link>
    );
  }
  return (
    <button
      type="button"
      disabled={entrando}
      onClick={() => {
        setEntrando(true);
        void signIn("google", { callbackUrl: "/panel" });
      }}
      className={`${CLASE_BOTON_PRIMARIO} ${className}`}
    >
      <span className="grid size-6 place-items-center rounded-full bg-white">
        <LogoGoogle />
      </span>
      {entrando ? textos.abriendo : textos.entrar}
    </button>
  );
}
