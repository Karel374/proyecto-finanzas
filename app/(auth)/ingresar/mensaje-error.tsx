"use client";

import { CircleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";

/** Códigos de error de NextAuth traducidos. Cualquier otro muestra el mensaje genérico. */
const MENSAJES: Record<string, string> = {
  OAuthAccountNotLinked: "Ese correo ya está asociado a otro método de inicio de sesión.",
  AccessDenied: "No se permitió el acceso.",
  CredentialsSignin: "No se pudo entrar con el acceso de desarrollo.",
};

export function MensajeError() {
  const codigo = useSearchParams().get("error");
  if (!codigo) return null;

  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-2xl border border-[#f3c9c6] bg-[#fdf1f0] p-4 text-sm text-[#9f2a22]"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {MENSAJES[codigo] ?? "No se pudo iniciar sesión. Intenta de nuevo."}
    </p>
  );
}
