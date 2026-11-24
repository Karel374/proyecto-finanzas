import { Suspense } from "react";

import { resumenDelUsuario } from "@/lib/datos/usuario";

export default function Inicio() {
  return (
    <section className="flex flex-col gap-6">
      <Suspense fallback={<h1 className="text-[28px] font-semibold">Inicio</h1>}>
        <Bienvenida />
      </Suspense>
    </section>
  );
}

/** Bienvenida provisional: muestra lo que dejó la siembra. El panel de inicio llega en la fase 5. */
async function Bienvenida() {
  const resumen = await resumenDelUsuario();
  const saludo = resumen.nombre ? `Hola, ${resumen.nombre}` : "Hola";

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-semibold">{saludo}</h1>
        <p className="text-texto-2 text-base">Tu cuenta está lista. El panel de inicio llega en la fase 5.</p>
      </div>
      <ul className="grid grid-cols-3 gap-6">
        <Dato titulo="Categorías" valor={resumen.categorias} detalle="De gasto e ingreso, listas para usar" />
        <Dato titulo="Cuentas" valor={resumen.cuentas.length} detalle={resumen.cuentas.join(", ")} />
        <Dato titulo="Ideas de ingreso" valor={resumen.ideas} detalle="Para cualquier carrera" />
      </ul>
    </>
  );
}

function Dato({ titulo, valor, detalle }: { titulo: string; valor: number; detalle: string }) {
  return (
    <li className="border-borde bg-superficie flex flex-col gap-1 rounded-lg border p-5">
      <span className="text-texto-2 text-sm">{titulo}</span>
      <span className="text-[28px] font-semibold">{valor}</span>
      <span className="text-texto-3 text-xs">{detalle}</span>
    </li>
  );
}
