"use client";

import { useRef, useState, type RefObject } from "react";

import { PanelLateral } from "@/components/ui/dialogos";
import type { DatosDelFormulario } from "@/lib/datos/movimientos";
import type { PlantillaGuardada } from "@/lib/esquemas";

import { useRegistro, type MovimientoEditable } from "./contexto-registro";
import { FormularioMovimiento } from "./formulario-movimiento";
import { FormularioTransferencia } from "./formulario-transferencia";

type Pestana = "GASTO" | "INGRESO" | "TRANSFERENCIA";

const PESTANAS: { valor: Pestana; etiqueta: string }[] = [
  { valor: "GASTO", etiqueta: "Gasto" },
  { valor: "INGRESO", etiqueta: "Ingreso" },
  { valor: "TRANSFERENCIA", etiqueta: "Transferencia" },
];

/**
 * Panel de registro (sección 7). Por defecto abre en Gasto con el cursor en el monto, así un gasto
 * común se guarda con el monto, la categoría ya preseleccionada y Enter.
 */
export function PanelRegistro({
  datos,
  plantillas,
}: {
  datos: DatosDelFormulario;
  plantillas: PlantillaGuardada[];
}) {
  const { abierto, editando, apertura, cerrar } = useRegistro();
  const montoRef = useRef<HTMLInputElement | null>(null);

  return (
    <PanelLateral
      abierto={abierto}
      alCambiar={(valor) => (valor ? undefined : cerrar())}
      titulo={editando ? "Editar movimiento" : "Registrar"}
      descripcion={
        editando ? undefined : "Enter guarda y cierra. Shift + Enter guarda y deja el panel abierto."
      }
      onOpenAutoFocus={(evento) => {
        // El foco va directo al monto, no al primer botón.
        evento.preventDefault();
        montoRef.current?.focus();
      }}
    >
      {/* Cada apertura monta el contenido de nuevo: arranca en Gasto (o en el tipo que se edita). */}
      <ContenidoPanel
        key={apertura}
        datos={datos}
        plantillas={plantillas}
        editando={editando}
        montoRef={montoRef}
        alTerminar={cerrar}
      />
    </PanelLateral>
  );
}

function ContenidoPanel({
  datos,
  plantillas,
  editando,
  montoRef,
  alTerminar,
}: {
  datos: DatosDelFormulario;
  plantillas: PlantillaGuardada[];
  editando: MovimientoEditable | null;
  montoRef: RefObject<HTMLInputElement | null>;
  alTerminar: () => void;
}) {
  const [pestana, setPestana] = useState<Pestana>(editando ? editando.tipo : "GASTO");

  return (
    <>
      {!editando ? (
        <div
          role="radiogroup"
          aria-label="Tipo de registro"
          className="bg-superficie-2 border-borde grid grid-cols-3 gap-1 rounded-md border p-1"
        >
          {PESTANAS.map(({ valor, etiqueta }) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={pestana === valor}
              onClick={() => {
                setPestana(valor);
                requestAnimationFrame(() => montoRef.current?.focus());
              }}
              className={`focus-visible:outline-acento rounded py-1.5 text-sm font-medium focus-visible:outline-2 ${
                pestana === valor ? "bg-superficie text-texto shadow-sm" : "text-texto-2 hover:text-texto"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      ) : null}

      {pestana === "TRANSFERENCIA" ? (
        <FormularioTransferencia
          cuentas={datos.cuentas}
          cuentaInicial={datos.ultimas.cuenta}
          montoRef={montoRef}
          alTerminar={alTerminar}
        />
      ) : (
        <FormularioMovimiento
          key={editando ? `editar-${editando.id}` : `nuevo-${pestana}`}
          tipoInicial={pestana}
          datos={datos}
          plantillas={editando ? [] : plantillas.filter((p) => p.tipo === pestana)}
          editando={editando}
          montoRef={montoRef}
          alTerminar={alTerminar}
        />
      )}
    </>
  );
}
