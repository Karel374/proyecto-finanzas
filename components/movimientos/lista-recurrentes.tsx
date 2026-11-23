"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import type { z } from "zod";

import { useForm, useWatch } from "react-hook-form";

import {
  actualizarRecurrente,
  cambiarEstadoRecurrente,
  eliminarRecurrente,
  guardarRecurrente,
} from "@/app/(app)/movimientos/acciones";
import { useAvisos } from "@/components/ui/avisos";
import { Boton } from "@/components/ui/boton";
import { Campo, Entrada, MensajeError, PuntoColor, Selector } from "@/components/ui/campos";
import { Dialogo } from "@/components/ui/dialogos";
import { describirRegla, ETIQUETAS_FRECUENCIA } from "@/lib/calculos/recurrentes";
import { colorDeCategoria } from "@/lib/colores";
import type { RecurrenteListado } from "@/lib/datos/recurrentes";
import { centavosATexto, formatearMovimiento } from "@/lib/dinero";
import { esquemaRecurrente, FRECUENCIAS, type EntradaRecurrente } from "@/lib/esquemas";
import { formatearFecha, hoy } from "@/lib/fechas";

type Categoria = {
  id: string;
  nombre: string;
  tipo: "GASTO" | "INGRESO";
  colorSlot: number | null;
  sistema: "INTERESES_COMISIONES" | "RENDIMIENTOS" | null;
};
type Cuenta = { id: string; nombre: string };

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/**
 * Pestaña Recurrentes (sección 7): reglas que crean movimientos solos, como el arriendo o una
 * suscripción. Se pueden pausar, editar (solo afecta lo futuro) y borrar.
 */
export function ListaRecurrentes({
  recurrentes,
  categorias,
  cuentas,
}: {
  recurrentes: RecurrenteListado[];
  categorias: Categoria[];
  cuentas: Cuenta[];
}) {
  const { mostrar } = useAvisos();
  const [ocupado, iniciar] = useTransition();
  const [editando, setEditando] = useState<RecurrenteListado | "nuevo" | null>(null);

  function pausar(recurrente: RecurrenteListado) {
    iniciar(async () => {
      const resultado = await cambiarEstadoRecurrente({ id: recurrente.id, activo: !recurrente.activo });
      mostrar(
        resultado.ok
          ? {
              tipo: "exito",
              mensaje: recurrente.activo ? "Recurrente en pausa" : "Recurrente reactivado: seguirá desde hoy",
            }
          : { tipo: "error", mensaje: resultado.error },
      );
    });
  }

  function borrar(recurrente: RecurrenteListado) {
    iniciar(async () => {
      const resultado = await eliminarRecurrente({ id: recurrente.id });
      mostrar(
        resultado.ok
          ? { tipo: "exito", mensaje: "Recurrente borrado. Los movimientos que ya creó se quedan." }
          : { tipo: "error", mensaje: resultado.error },
      );
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-texto-2 text-sm">
          Se generan solos cada día a las 00:05 y aparecen con la etiqueta Automático.
        </p>
        <Boton onClick={() => setEditando("nuevo")}>
          <Plus aria-hidden="true" className="size-4" />
          Nuevo recurrente
        </Boton>
      </div>

      {recurrentes.length === 0 ? (
        <div className="border-borde bg-superficie text-texto-2 rounded-lg border p-8 text-center text-sm">
          Todavía no tienes recurrentes. Agrega el arriendo, el plan del celular o una suscripción.
        </div>
      ) : (
        <ul className="border-borde bg-superficie divide-borde divide-y rounded-lg border">
          {recurrentes.map((recurrente) => (
            <li key={recurrente.id} className="flex items-center gap-4 px-4 py-3">
              <PuntoColor color={colorDeCategoria(recurrente)} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {recurrente.nota || recurrente.categoria}
                  {!recurrente.activo ? (
                    <span className="bg-superficie-2 text-texto-2 ml-2 rounded px-1.5 py-0.5 text-[11px]">
                      En pausa
                    </span>
                  ) : null}
                </span>
                <span className="text-texto-3 text-xs">
                  {describirRegla(recurrente)} · {recurrente.categoria} · {recurrente.cuenta} · desde{" "}
                  {formatearFecha(recurrente.fechaInicio)}
                  {recurrente.fechaFin ? ` hasta ${formatearFecha(recurrente.fechaFin)}` : ""}
                </span>
              </div>
              <span
                className={`text-sm font-medium ${recurrente.tipo === "GASTO" ? "text-gasto" : "text-ingreso"}`}
              >
                {formatearMovimiento(recurrente.montoCentavos, recurrente.tipo)}
              </span>
              <span className="flex gap-1">
                <Boton
                  variante="fantasma"
                  tamano="chico"
                  disabled={ocupado}
                  onClick={() => pausar(recurrente)}
                  aria-label={recurrente.activo ? "Pausar" : "Reactivar"}
                >
                  {recurrente.activo ? (
                    <Pause aria-hidden="true" className="size-4" />
                  ) : (
                    <Play aria-hidden="true" className="size-4" />
                  )}
                  {recurrente.activo ? "Pausar" : "Reactivar"}
                </Boton>
                <Boton
                  variante="fantasma"
                  tamano="chico"
                  onClick={() => setEditando(recurrente)}
                  aria-label="Editar"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                </Boton>
                <Boton
                  variante="peligro"
                  tamano="chico"
                  disabled={ocupado}
                  onClick={() => borrar(recurrente)}
                  aria-label="Borrar"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Boton>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Dialogo
        abierto={editando !== null}
        alCambiar={(abierto) => !abierto && setEditando(null)}
        titulo={editando === "nuevo" ? "Nuevo recurrente" : "Editar recurrente"}
        descripcion={
          editando !== "nuevo" && editando
            ? "Los cambios solo afectan lo que se genere desde ahora."
            : undefined
        }
      >
        {editando ? (
          <FormularioRecurrente
            key={editando === "nuevo" ? "nuevo" : editando.id}
            recurrente={editando === "nuevo" ? null : editando}
            categorias={categorias}
            cuentas={cuentas}
            alTerminar={() => setEditando(null)}
          />
        ) : null}
      </Dialogo>
    </div>
  );
}

function FormularioRecurrente({
  recurrente,
  categorias,
  cuentas,
  alTerminar,
}: {
  recurrente: RecurrenteListado | null;
  categorias: Categoria[];
  cuentas: Cuenta[];
  alTerminar: () => void;
}) {
  const { mostrar } = useAvisos();
  const [enviando, iniciar] = useTransition();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const primeraDe = (tipo: "GASTO" | "INGRESO") => categorias.find((c) => c.tipo === tipo)?.id ?? "";

  const { register, handleSubmit, getValues, setValue, setError, control, formState } = useForm<
    EntradaRecurrente,
    unknown,
    z.output<typeof esquemaRecurrente>
  >({
    resolver: zodResolver(esquemaRecurrente),
    defaultValues: recurrente
      ? {
          tipo: recurrente.tipo,
          monto: centavosATexto(recurrente.montoCentavos),
          categoriaId: recurrente.categoriaId,
          cuentaId: recurrente.cuentaId,
          nota: recurrente.nota ?? "",
          frecuencia: recurrente.frecuencia,
          diaSemana: recurrente.diaSemana ?? 1,
          diaMes: recurrente.diaMes ?? 1,
          mes: recurrente.mes ?? 1,
          fechaInicio: recurrente.fechaInicio,
          fechaFin: recurrente.fechaFin ?? "",
        }
      : {
          tipo: "GASTO",
          monto: "",
          categoriaId: primeraDe("GASTO"),
          cuentaId: cuentas[0]?.id ?? "",
          nota: "",
          frecuencia: "MENSUAL",
          diaSemana: 1,
          diaMes: Number(hoy().slice(8)),
          mes: Number(hoy().slice(5, 7)),
          fechaInicio: hoy(),
          fechaFin: "",
        },
  });
  const tipo = useWatch({ control, name: "tipo" });
  const frecuencia = useWatch({ control, name: "frecuencia" });
  const errores = formState.errors;

  function guardar() {
    setErrorGeneral(null);
    void handleSubmit(() => {
      const valores = getValues();
      iniciar(async () => {
        const resultado = recurrente
          ? await actualizarRecurrente({ id: recurrente.id, datos: valores })
          : await guardarRecurrente(valores);
        if (!resultado.ok) {
          let alguno = false;
          for (const [campo, mensaje] of Object.entries(resultado.campos ?? {})) {
            const nombre = campo.replace(/^datos\./, "");
            if (nombre in valores) {
              setError(nombre as keyof EntradaRecurrente, { message: mensaje });
              alguno = true;
            }
          }
          if (!alguno) setErrorGeneral(resultado.error);
          return;
        }
        mostrar({ tipo: "exito", mensaje: recurrente ? "Recurrente actualizado" : "Recurrente creado" });
        alTerminar();
      });
    })();
  }

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(evento) => {
        evento.preventDefault();
        guardar();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Campo id="r-tipo" etiqueta="Tipo">
          <Selector
            id="r-tipo"
            {...register("tipo", {
              onChange: (evento) => setValue("categoriaId", primeraDe(evento.target.value)),
            })}
          >
            <option value="GASTO">Gasto</option>
            <option value="INGRESO">Ingreso</option>
          </Selector>
        </Campo>
        <Campo id="r-monto" etiqueta="Monto" error={errores.monto?.message}>
          <Entrada
            id="r-monto"
            inputMode="decimal"
            placeholder="0,00"
            invalido={Boolean(errores.monto)}
            {...register("monto")}
          />
        </Campo>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo id="r-categoria" etiqueta="Categoría" error={errores.categoriaId?.message}>
          <Selector id="r-categoria" invalido={Boolean(errores.categoriaId)} {...register("categoriaId")}>
            {categorias
              .filter((c) => c.tipo === tipo)
              .map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
          </Selector>
        </Campo>
        <Campo id="r-cuenta" etiqueta="Cuenta" error={errores.cuentaId?.message}>
          <Selector id="r-cuenta" invalido={Boolean(errores.cuentaId)} {...register("cuentaId")}>
            {cuentas.map((cuenta) => (
              <option key={cuenta.id} value={cuenta.id}>
                {cuenta.nombre}
              </option>
            ))}
          </Selector>
        </Campo>
      </div>

      <Campo id="r-nota" etiqueta="Nombre o nota" error={errores.nota?.message}>
        <Entrada id="r-nota" maxLength={140} placeholder="Por ejemplo, Arriendo" {...register("nota")} />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo id="r-frecuencia" etiqueta="Se repite">
          <Selector id="r-frecuencia" {...register("frecuencia")}>
            {FRECUENCIAS.map((valor) => (
              <option key={valor} value={valor}>
                {ETIQUETAS_FRECUENCIA[valor]}
              </option>
            ))}
          </Selector>
        </Campo>
        {frecuencia === "SEMANAL" ? (
          <Campo id="r-dia-semana" etiqueta="Día" error={errores.diaSemana?.message}>
            <Selector id="r-dia-semana" {...register("diaSemana")}>
              {DIAS.map((dia, i) => (
                <option key={dia} value={i + 1}>
                  {dia}
                </option>
              ))}
            </Selector>
          </Campo>
        ) : (
          <div className="flex gap-2">
            <Campo
              id="r-dia-mes"
              etiqueta="Día"
              error={errores.diaMes?.message}
              className="flex-1"
              ayuda="El 31 cae el último día de los meses cortos"
            >
              <Selector id="r-dia-mes" {...register("diaMes")}>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Selector>
            </Campo>
            {frecuencia === "ANUAL" ? (
              <Campo id="r-mes" etiqueta="Mes" error={errores.mes?.message} className="flex-1">
                <Selector id="r-mes" {...register("mes")}>
                  {MESES.map((mes, i) => (
                    <option key={mes} value={i + 1}>
                      {mes}
                    </option>
                  ))}
                </Selector>
              </Campo>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo id="r-inicio" etiqueta="Desde" error={errores.fechaInicio?.message}>
          <Entrada id="r-inicio" type="date" {...register("fechaInicio")} />
        </Campo>
        <Campo id="r-fin" etiqueta="Hasta (opcional)" error={errores.fechaFin?.message}>
          <Entrada id="r-fin" type="date" {...register("fechaFin")} />
        </Campo>
      </div>

      {errorGeneral ? <MensajeError>{errorGeneral}</MensajeError> : null}

      <Boton type="submit" variante="primario" disabled={enviando}>
        {enviando ? "Guardando…" : recurrente ? "Guardar cambios" : "Crear recurrente"}
      </Boton>
    </form>
  );
}
