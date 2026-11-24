import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { MonedaGiratoria } from "@/components/landing/moneda-giratoria";
import { proveedoresActivos } from "@/lib/auth/opciones";

import { BotonesIngreso } from "./botones-ingreso";
import { MensajeError } from "./mensaje-error";

export const metadata: Metadata = { title: "Ingresar · Finanzas personales" };

export default function PaginaIngresar() {
  // En el build de producción NODE_ENV es "production": el botón de desarrollo nunca llega al HTML.
  const proveedores = proveedoresActivos();
  const ninguno = !proveedores.google && !proveedores.desarrollo;

  return (
    <main className="grid flex-1 md:grid-cols-[1.1fr_1fr]">
      <div className="border-m-linea relative hidden items-center justify-center overflow-hidden border-r md:flex">
        <MonedaGiratoria className="w-[min(70%,30rem)]" />
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="text-m-texto-2 hover:text-m-texto self-start text-sm transition-colors">
          ← Volver al inicio
        </Link>
        <div className="my-auto flex w-full max-w-sm flex-col gap-8 py-12">
          <MonedaGiratoria className="w-20 md:hidden" />
          <div className="flex flex-col gap-3">
            <h1 className="titular text-m-texto text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.02]">
              Entra a tus finanzas.
            </h1>
            <p className="text-m-texto-2 text-base leading-relaxed">
              Tus gastos, ingresos, cuentas y recurrentes te esperan donde los dejaste.
            </p>
          </div>

          <Suspense>
            <MensajeError />
          </Suspense>

          {ninguno ? (
            <p
              role="alert"
              className="border-m-linea bg-m-superficie text-m-texto-2 rounded-xl border p-4 text-sm"
            >
              No hay ningún método de inicio de sesión configurado. Agrega GOOGLE_CLIENT_ID y
              GOOGLE_CLIENT_SECRET al archivo .env.
            </p>
          ) : (
            <BotonesIngreso google={proveedores.google} desarrollo={proveedores.desarrollo} />
          )}

          <p className="text-m-texto-3 text-sm">Tus datos se guardan separados y no se envían a terceros.</p>
        </div>
      </div>
    </main>
  );
}
