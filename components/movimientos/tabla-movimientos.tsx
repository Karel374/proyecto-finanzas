import { agruparPorDia } from "@/lib/calculos/movimientos";
import { colorDeCategoria } from "@/lib/colores";
import type { FilaMovimiento } from "@/lib/datos/movimientos";
import { formatearDolares, formatearMovimiento } from "@/lib/dinero";
import { formatearDia } from "@/lib/fechas";
import { PuntoColor } from "@/components/ui/campos";

import { AccionesFila } from "./acciones-fila";

/**
 * Tabla de movimientos (sección 7): agrupada por día con el subtotal en la cabecera del grupo.
 * Columnas Fecha, Categoría, Cuenta, Nota y Monto; el monto a la derecha, con signo y color.
 */
export function TablaMovimientos({ movimientos }: { movimientos: FilaMovimiento[] }) {
  if (!movimientos.length) {
    return (
      <div className="border-borde bg-superficie text-texto-2 rounded-lg border p-8 text-center text-sm">
        No hay movimientos con estos filtros. Pulsa <kbd className="border-borde rounded border px-1">N</kbd>{" "}
        para registrar uno.
      </div>
    );
  }

  return (
    <div className="border-borde bg-superficie overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="text-texto-3 border-borde border-b text-left text-xs">
          <tr>
            <th scope="col" className="w-28 px-4 py-2 font-medium">
              Fecha
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Categoría
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Cuenta
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Nota
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Monto
            </th>
            <th scope="col" className="w-24 px-4 py-2">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        {agruparPorDia(movimientos).map((grupo) => (
          <tbody key={grupo.fecha} className="border-borde border-b last:border-b-0">
            <tr className="bg-superficie-2">
              <th
                scope="colgroup"
                colSpan={4}
                className="text-texto-2 px-4 py-2 text-left text-xs font-medium first-letter:uppercase"
              >
                {formatearDia(grupo.fecha)}
              </th>
              <td className="text-texto-2 px-4 py-2 text-right text-xs font-medium">
                {formatearDolares(grupo.subtotalCentavos)}
              </td>
              <td />
            </tr>
            {grupo.movimientos.map((movimiento) => (
              <tr key={movimiento.id} className="border-borde hover:bg-superficie-2 border-t">
                <td className="text-texto-3 px-4 py-2.5">
                  {movimiento.fecha.slice(8)}/{movimiento.fecha.slice(5, 7)}
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <PuntoColor color={colorDeCategoria(movimiento)} />
                    {movimiento.categoria}
                    {movimiento.automatico ? (
                      <span className="bg-acento-suave text-texto rounded px-1.5 py-0.5 text-[11px] font-medium">
                        Automático
                      </span>
                    ) : null}
                    {movimiento.esAjuste ? (
                      <span className="bg-alerta-fondo text-alerta rounded px-1.5 py-0.5 text-[11px] font-medium">
                        Ajuste
                      </span>
                    ) : null}
                  </span>
                </td>
                <td className="text-texto-2 px-4 py-2.5">{movimiento.cuenta}</td>
                <td className="text-texto-2 max-w-64 truncate px-4 py-2.5">{movimiento.nota}</td>
                <td
                  className={`px-4 py-2.5 text-right font-medium ${movimiento.tipo === "GASTO" ? "text-gasto" : "text-ingreso"}`}
                >
                  {formatearMovimiento(movimiento.montoCentavos, movimiento.tipo)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <AccionesFila movimiento={movimiento} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
