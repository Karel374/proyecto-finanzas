import { Suspense } from "react";

import { VistaCuentas } from "@/components/cuentas/vista-cuentas";
import { cuentasConSaldos } from "@/lib/datos/cuentas";
import { listarTransferencias } from "@/lib/datos/transferencias";
import { hoy } from "@/lib/fechas";

export default function PaginaCuentas() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-[28px] font-semibold">Cuentas</h1>
      <Suspense fallback={<p className="text-texto-2 text-sm">Cargando cuentas…</p>}>
        <Contenido />
      </Suspense>
    </section>
  );
}

async function Contenido() {
  const [{ cuentas, resumen }, transferencias] = await Promise.all([
    cuentasConSaldos(),
    listarTransferencias(),
  ]);
  return <VistaCuentas cuentas={cuentas} resumen={resumen} transferencias={transferencias} hoy={hoy()} />;
}
