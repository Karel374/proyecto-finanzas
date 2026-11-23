"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert, X } from "lucide-react";
import { useState, useTransition, type KeyboardEvent, type RefObject } from "react";
import type { z } from "zod";

import { useForm, useWatch } from "react-hook-form";

import {
  actualizarMovimiento,
  guardarPlantilla,
  quitarPlantilla,
  registrarConPlantilla,
  registrarMovimiento,
} from "@/app/(app)/movimientos/acciones";
import { useAvisos } from "@/components/ui/avisos";
import { Boton } from "@/components/ui/boton";
import { Campo, Entrada, MensajeError, PuntoColor, Selector } from "@/components/ui/campos";
import type { Resultado } from "@/lib/acciones";
import { colorDeCategoria } from "@/lib/colores";
import type { DatosDelFormulario } from "@/lib/datos/movimientos";
import { centavosATexto, formatearMovimiento, textoACentavos } from "@/lib/dinero";
import { esquemaMovimiento, type PlantillaGuardada } from "@/lib/esquemas";
import { ayer, hoy, limitesFechaMovimiento } from "@/lib/fechas";

import type { MovimientoEditable } from "./contexto-registro";

type Tipo = "GASTO" | "INGRESO";
const esquemaSinConfirmar = esquemaMovimiento.omit({ confirmarInusual: true });
type Valores = z.input<typeof esquemaSinConfirmar>;

/** Primera categoría válida para el tipo: la última usada si sigue activa, o la primera de la lista. */
function categoriaPorDefecto(datos: DatosDelFormulario, tipo: Tipo): string {
  const delTipo = datos.categorias.filter((c) => c.tipo === tipo);
  const ultima = datos.ultimas[tipo];
  return delTipo.find((c) => c.id === ultima)?.id ?? delTipo[0]?.id ?? "";
}

function cuentaPorDefecto(datos: DatosDelFormulario): string {
  return datos.cuentas.find((c) => c.id === datos.ultimas.cuenta)?.id ?? datos.cuentas[0]?.id ?? "";
}

export function FormularioMovimiento({
  tipoInicial,
  datos,
  plantillas,
  editando,
  montoRef,
  alTerminar,
}: {
  tipoInicial: Tipo;
  datos: DatosDelFormulario;
  plantillas: PlantillaGuardada[];
  editando: MovimientoEditable | null;
  montoRef: RefObject<HTMLInputElement | null>;
  alTerminar: () => void;
}) {
  const { mostrar } = useAvisos();
  const [enviando, iniciar] = useTransition();
  const [confirmacion, setConfirmacion] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [nombrePlantilla, setNombrePlantilla] = useState<string | null>(null);
  const hoyISO = hoy();
  const limites = limitesFechaMovimiento(hoyISO);

  const formulario = useForm<Valores, unknown, z.output<typeof esquemaSinConfirmar>>({
    resolver: zodResolver(esquemaSinConfirmar),
    defaultValues: editando
      ? {
          tipo: editando.tipo,
          monto: centavosATexto(editando.montoCentavos),
          categoriaId: editando.categoriaId,
          cuentaId: editando.cuentaId,
          fecha: editando.fecha,
          nota: editando.nota ?? "",
        }
      : {
          tipo: tipoInicial,
          monto: "",
          categoriaId: categoriaPorDefecto(datos, tipoInicial),
          cuentaId: cuentaPorDefecto(datos),
          fecha: hoyISO,
          nota: "",
        },
  });
  const { register, setValue, setError, setFocus, reset, getValues, formState } = formulario;
  const tipo = useWatch({ control: formulario.control, name: "tipo" }) as Tipo;
  const categorias = datos.categorias.filter((c) => c.tipo === tipo);
  const { ref: refMonto, ...registroMonto } = register("monto");

  function aplicarErrores(resultado: Extract<Resultado<unknown>, { ok: false }>) {
    if (resultado.codigo === "CONFIRMAR") {
      setConfirmacion(resultado.error);
      return;
    }
    const campos = resultado.campos ?? {};
    let alguno = false;
    for (const [campo, mensaje] of Object.entries(campos)) {
      if (["monto", "categoriaId", "cuentaId", "fecha", "nota"].includes(campo)) {
        setError(campo as keyof Valores, { message: mensaje });
        alguno = true;
      }
    }
    if (!alguno) setErrorGeneral(resultado.error);
  }

  function guardar(seguir: boolean) {
    setErrorGeneral(null);
    void formulario.handleSubmit(() => {
      const valores = getValues();
      const confirmarInusual = confirmacion !== null;
      iniciar(async () => {
        const resultado = editando
          ? await actualizarMovimiento({ ...valores, id: editando.id, confirmarInusual })
          : await registrarMovimiento({ ...valores, confirmarInusual });
        if (!resultado.ok) {
          aplicarErrores(resultado);
          return;
        }
        setConfirmacion(null);
        const categoria = datos.categorias.find((c) => c.id === valores.categoriaId)?.nombre ?? "";
        const monto = textoACentavos(valores.monto) ?? 0;
        mostrar({
          tipo: "exito",
          mensaje: `${editando ? "Guardado" : valores.tipo === "GASTO" ? "Gasto registrado" : "Ingreso registrado"}: ${formatearMovimiento(monto, valores.tipo)} en ${categoria}`,
        });
        if (seguir && !editando) {
          // Shift + Enter: el panel queda abierto con el monto vacío para registrar otro.
          reset({ ...valores, monto: "", nota: "" });
          setFocus("monto");
        } else {
          alTerminar();
        }
      });
    })();
  }

  /** Enter guarda y cierra; Shift + Enter guarda y deja el panel abierto (sección 7). */
  function alPulsar(evento: KeyboardEvent<HTMLFormElement>) {
    if (evento.key !== "Enter" || evento.nativeEvent.isComposing) return;
    const objetivo = evento.target as HTMLElement;
    if (objetivo.tagName === "BUTTON" || objetivo.tagName === "TEXTAREA") return;
    evento.preventDefault();
    guardar(evento.shiftKey);
  }

  function cambiarTipo(nuevo: Tipo) {
    setValue("tipo", nuevo);
    setValue("categoriaId", categoriaPorDefecto(datos, nuevo));
    setConfirmacion(null);
  }

  function usarPlantilla(plantilla: PlantillaGuardada) {
    iniciar(async () => {
      const resultado = await registrarConPlantilla({ id: plantilla.id });
      if (!resultado.ok) {
        setErrorGeneral(resultado.error);
        return;
      }
      mostrar({
        tipo: "exito",
        mensaje: `${plantilla.nombre}: ${formatearMovimiento(plantilla.montoCentavos, plantilla.tipo)} registrado`,
      });
      alTerminar();
    });
  }

  function borrarPlantilla(plantilla: PlantillaGuardada) {
    iniciar(async () => {
      const resultado = await quitarPlantilla({ id: plantilla.id });
      if (!resultado.ok) setErrorGeneral(resultado.error);
    });
  }

  function crearPlantilla() {
    const nombre = nombrePlantilla?.trim();
    if (!nombre) return;
    const valores = getValues();
    iniciar(async () => {
      const resultado = await guardarPlantilla({ ...valores, nombre });
      if (!resultado.ok) {
        setErrorGeneral(resultado.error);
        return;
      }
      setNombrePlantilla(null);
      mostrar({ tipo: "exito", mensaje: `Plantilla "${nombre}" guardada` });
    });
  }

  const errores = formState.errors;

  return (
    <form
      onKeyDown={alPulsar}
      onSubmit={(evento) => evento.preventDefault()}
      className="flex flex-col gap-5"
      noValidate
    >
      {plantillas.length ? (
        <div className="flex flex-wrap gap-2" aria-label="Plantillas" role="group">
          {plantillas.map((plantilla) => (
            <span
              key={plantilla.id}
              className="border-borde bg-superficie-2 inline-flex items-center rounded-full border text-xs"
            >
              <button
                type="button"
                disabled={enviando}
                onClick={() => usarPlantilla(plantilla)}
                className="focus-visible:outline-acento rounded-l-full py-1 pr-1 pl-3 font-medium hover:underline focus-visible:outline-2"
              >
                {plantilla.nombre} · {formatearMovimiento(plantilla.montoCentavos, plantilla.tipo)}
              </button>
              <button
                type="button"
                aria-label={`Quitar la plantilla ${plantilla.nombre}`}
                onClick={() => borrarPlantilla(plantilla)}
                className="text-texto-3 hover:text-gasto focus-visible:outline-acento rounded-r-full py-1 pr-2 pl-1 focus-visible:outline-2"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {editando ? (
        <div role="radiogroup" aria-label="Tipo" className="flex gap-2">
          {(["GASTO", "INGRESO"] as const).map((valor) => (
            <Boton
              key={valor}
              role="radio"
              aria-checked={tipo === valor}
              tamano="chico"
              variante={tipo === valor ? "secundario" : "fantasma"}
              onClick={() => cambiarTipo(valor)}
            >
              {valor === "GASTO" ? "Gasto" : "Ingreso"}
            </Boton>
          ))}
        </div>
      ) : null}

      <Campo id="monto" etiqueta="Monto" error={errores.monto?.message}>
        <Entrada
          id="monto"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          invalido={Boolean(errores.monto)}
          className="text-xl font-semibold"
          {...registroMonto}
          ref={(elemento) => {
            refMonto(elemento);
            montoRef.current = elemento;
          }}
          onChange={(evento) => {
            void registroMonto.onChange(evento);
            setConfirmacion(null);
          }}
        />
      </Campo>

      {confirmacion ? (
        <div
          role="alert"
          className="bg-alerta-fondo text-alerta flex items-start gap-2 rounded-md p-3 text-sm"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            {confirmacion}. <strong>Pulsa Enter otra vez para guardarlo</strong> o corrige el monto.
          </p>
        </div>
      ) : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-texto-2 mb-1.5 text-sm font-medium">Categoría</legend>
        <div className="grid grid-cols-2 gap-1.5">
          {categorias.map((categoria) => (
            <label key={categoria.id} className="relative">
              <input
                type="radio"
                value={categoria.id}
                className="peer sr-only"
                {...register("categoriaId")}
              />
              <span className="border-borde text-texto-2 peer-checked:border-acento peer-checked:bg-acento-suave peer-checked:text-texto peer-focus-visible:outline-acento hover:bg-superficie-2 flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm peer-focus-visible:outline-2">
                <PuntoColor color={colorDeCategoria(categoria)} />
                <span className="truncate">{categoria.nombre}</span>
              </span>
            </label>
          ))}
        </div>
        {errores.categoriaId ? <MensajeError>{errores.categoriaId.message}</MensajeError> : null}
      </fieldset>

      <Campo id="fecha" etiqueta="Fecha" error={errores.fecha?.message}>
        <div className="flex gap-2">
          <Entrada
            id="fecha"
            type="date"
            min={limites.minima}
            max={limites.maxima}
            invalido={Boolean(errores.fecha)}
            {...register("fecha")}
          />
          <Boton tamano="chico" onClick={() => setValue("fecha", hoyISO, { shouldValidate: true })}>
            Hoy
          </Boton>
          <Boton tamano="chico" onClick={() => setValue("fecha", ayer(hoyISO), { shouldValidate: true })}>
            Ayer
          </Boton>
        </div>
      </Campo>

      <Campo
        id="cuentaId"
        etiqueta="Cuenta"
        error={errores.cuentaId?.message}
        ayuda="El método de pago se completa según el tipo de cuenta"
      >
        <Selector id="cuentaId" invalido={Boolean(errores.cuentaId)} {...register("cuentaId")}>
          {datos.cuentas.map((cuenta) => (
            <option key={cuenta.id} value={cuenta.id}>
              {cuenta.nombre}
            </option>
          ))}
        </Selector>
      </Campo>

      <Campo id="nota" etiqueta="Nota (opcional)" error={errores.nota?.message}>
        <Entrada
          id="nota"
          maxLength={140}
          autoComplete="off"
          invalido={Boolean(errores.nota)}
          {...register("nota")}
        />
      </Campo>

      {errorGeneral ? <MensajeError>{errorGeneral}</MensajeError> : null}

      <div className="flex flex-col gap-3">
        <Boton variante="primario" disabled={enviando} onClick={() => guardar(false)}>
          {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Guardar"}
        </Boton>
        {!editando ? (
          nombrePlantilla === null ? (
            <Boton variante="fantasma" tamano="chico" onClick={() => setNombrePlantilla("")}>
              Guardar como plantilla
            </Boton>
          ) : (
            <div className="flex gap-2">
              <Entrada
                aria-label="Nombre de la plantilla"
                placeholder="Nombre, por ejemplo Almuerzo"
                maxLength={30}
                value={nombrePlantilla}
                onChange={(evento) => setNombrePlantilla(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter") {
                    evento.preventDefault();
                    evento.stopPropagation();
                    crearPlantilla();
                  }
                }}
              />
              <Boton tamano="chico" onClick={crearPlantilla} disabled={enviando}>
                Guardar
              </Boton>
            </div>
          )
        ) : null}
      </div>
    </form>
  );
}
