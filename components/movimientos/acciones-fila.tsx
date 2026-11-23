"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";

import { deshacerBorrado, eliminarMovimiento } from "@/app/(app)/movimientos/acciones";
import { useRegistro } from "@/components/registro/contexto-registro";
import { useAvisos } from "@/components/ui/avisos";
import type { FilaMovimiento } from "@/lib/datos/movimientos";
import { formatearMovimiento } from "@/lib/dinero";

/** Editar abre el panel de registro con el movimiento; borrar ofrece "Deshacer" 5 segundos (sección 6). */
export function AccionesFila({ movimiento }: { movimiento: FilaMovimiento }) {
  const { editar } = useRegistro();
  const { mostrar } = useAvisos();
  const [ocupado, iniciar] = useTransition();
  const descripcion = `${formatearMovimiento(movimiento.montoCentavos, movimiento.tipo)} en ${movimiento.categoria}`;

  function borrar() {
    iniciar(async () => {
      const resultado = await eliminarMovimiento({ id: movimiento.id });
      if (!resultado.ok) {
        mostrar({ tipo: "error", mensaje: resultado.error });
        return;
      }
      const copia = resultado.datos;
      mostrar({
        tipo: "exito",
        mensaje: `Se borró ${descripcion}`,
        accion: {
          etiqueta: "Deshacer",
          hacer: () => {
            void deshacerBorrado(copia).then((restaurado) => {
              if (!restaurado.ok) mostrar({ tipo: "error", mensaje: restaurado.error });
            });
          },
        },
      });
    });
  }

  const clase =
    "text-texto-3 hover:text-texto hover:bg-superficie focus-visible:outline-acento rounded p-1.5 focus-visible:outline-2 disabled:opacity-50";
  return (
    <span className="inline-flex gap-1">
      <button
        type="button"
        className={clase}
        aria-label={`Editar ${descripcion}`}
        title="Editar"
        onClick={() =>
          editar({
            id: movimiento.id,
            tipo: movimiento.tipo,
            montoCentavos: movimiento.montoCentavos,
            categoriaId: movimiento.categoriaId,
            cuentaId: movimiento.cuentaId,
            fecha: movimiento.fecha,
            nota: movimiento.nota,
          })
        }
      >
        <Pencil aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        className={`${clase} hover:text-gasto`}
        aria-label={`Borrar ${descripcion}`}
        title="Borrar"
        disabled={ocupado}
        onClick={borrar}
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </span>
  );
}
