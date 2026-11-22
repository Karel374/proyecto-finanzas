import type { Metadata } from "next";
import { Suspense } from "react";

import { proveedoresActivos } from "@/lib/auth/opciones";

import { BotonesIngreso } from "./botones-ingreso";
import { MensajeError } from "./mensaje-error";

export const metadata: Metadata = { title: "Ingresar · Finanzas personales" };

export default function PaginaIngresar() {
  // En el build de producción NODE_ENV es "production": el botón de desarrollo nunca llega al HTML.
  const proveedores = proveedoresActivos();
  const ninguno = !proveedores.google && !proveedores.desarrollo;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="border-borde bg-superficie flex w-full max-w-sm flex-col gap-6 rounded-lg border p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-semibold">Finanzas personales</h1>
          <p className="text-texto-2 text-sm">Entra para ver tus gastos, ingresos, metas y presupuestos.</p>
        </div>

        <Suspense>
          <MensajeError />
        </Suspense>

        {ninguno ? (
          <p role="alert" className="bg-alerta-fondo text-alerta rounded-md p-3 text-sm">
            No hay ningún método de inicio de sesión configurado. Agrega GOOGLE_CLIENT_ID y
            GOOGLE_CLIENT_SECRET al archivo .env.
          </p>
        ) : (
          <BotonesIngreso google={proveedores.google} desarrollo={proveedores.desarrollo} />
        )}
      </div>
    </main>
  );
}
