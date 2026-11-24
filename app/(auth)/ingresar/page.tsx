import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/landing/piezas";
import { proveedoresActivos } from "@/lib/auth/opciones";

import { BotonesIngreso } from "./botones-ingreso";
import { MensajeError } from "./mensaje-error";

export const metadata: Metadata = { title: "Ingresar · Kanomics" };

export default function PaginaIngresar() {
  // En el build de producción NODE_ENV es "production": el botón de desarrollo nunca llega al HTML.
  const proveedores = proveedoresActivos();
  const ninguno = !proveedores.google && !proveedores.desarrollo;

  return (
    <main className="grid flex-1 lg:grid-cols-[1.15fr_1fr]">
      <div className="bg-k-fondo-2 relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <Logo />
        <p
          aria-hidden="true"
          className="k-nombre k-nombre-gigante pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(10rem,30vw,30rem)] select-none"
        >
          K
        </p>
        <p className="k-titular relative max-w-[16ch] text-[clamp(2rem,3.2vw,3rem)]">
          Que cada dólar tenga un destino.
        </p>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-k-tinta-2 hover:text-k-tinta text-sm transition-colors">
            ← Volver al inicio
          </Link>
          <Logo className="lg:hidden" />
        </div>
        <div className="my-auto flex w-full max-w-sm flex-col gap-8 self-center py-12">
          <div className="flex flex-col gap-3">
            <p className="k-rotulo text-k-tinta-3">Kanomics</p>
            <h1 className="k-titular text-[clamp(2.25rem,5vw,3.25rem)]">Entra a tus finanzas.</h1>
            <p className="text-k-tinta-2 text-base leading-relaxed">
              Tus gastos, ingresos, cuentas y recurrentes te esperan donde los dejaste.
            </p>
          </div>

          <Suspense>
            <MensajeError />
          </Suspense>

          {ninguno ? (
            <p
              role="alert"
              className="border-k-linea bg-k-fondo-2 text-k-tinta-2 rounded-2xl border p-4 text-sm"
            >
              No hay ningún método de inicio de sesión configurado. Agrega GOOGLE_CLIENT_ID y
              GOOGLE_CLIENT_SECRET al archivo .env.
            </p>
          ) : (
            <BotonesIngreso google={proveedores.google} desarrollo={proveedores.desarrollo} />
          )}

          <p className="text-k-tinta-3 text-sm">Tus datos se guardan separados y no se envían a terceros.</p>
        </div>
      </div>
    </main>
  );
}
