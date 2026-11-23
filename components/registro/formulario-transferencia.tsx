"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, type KeyboardEvent, type RefObject } from "react";
import type { z } from "zod";

import { useForm } from "react-hook-form";

import { registrarTransferencia } from "@/app/(app)/movimientos/acciones";
import { useAvisos } from "@/components/ui/avisos";
import { Boton } from "@/components/ui/boton";
import { Campo, Entrada, MensajeError, Selector } from "@/components/ui/campos";
import { formatearDolares, textoACentavos } from "@/lib/dinero";
import { esquemaTransferencia, type EntradaTransferencia } from "@/lib/esquemas";
import { ayer, hoy, limitesFechaMovimiento } from "@/lib/fechas";

type Cuenta = { id: string; nombre: string };
type Valores = EntradaTransferencia;

/**
 * Transferencia entre cuentas propias (sección 15): retirar del cajero, pagar la tarjeta, pasar al
 * ahorro. No cuenta como ingreso ni gasto.
 */
export function FormularioTransferencia({
  cuentas,
  cuentaInicial,
  montoRef,
  alTerminar,
}: {
  cuentas: Cuenta[];
  cuentaInicial: string | null;
  montoRef: RefObject<HTMLInputElement | null>;
  alTerminar: () => void;
}) {
  const { mostrar } = useAvisos();
  const [enviando, iniciar] = useTransition();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const hoyISO = hoy();
  const limites = limitesFechaMovimiento(hoyISO);
  const origen = cuentas.find((c) => c.id === cuentaInicial)?.id ?? cuentas[0]?.id ?? "";
  const destino = cuentas.find((c) => c.id !== origen)?.id ?? "";

  const { register, handleSubmit, getValues, setValue, setError, setFocus, reset, formState } = useForm<
    Valores,
    unknown,
    z.output<typeof esquemaTransferencia>
  >({
    resolver: zodResolver(esquemaTransferencia),
    defaultValues: { cuentaOrigenId: origen, cuentaDestinoId: destino, monto: "", fecha: hoyISO, nota: "" },
  });
  const { ref: refMonto, ...registroMonto } = register("monto");

  if (cuentas.length < 2) {
    return (
      <p className="bg-superficie-2 text-texto-2 rounded-md p-4 text-sm">
        Para transferir necesitas al menos dos cuentas. Agrégalas en la página Cuentas.
      </p>
    );
  }

  function guardar(seguir: boolean) {
    setErrorGeneral(null);
    void handleSubmit(() => {
      const valores = getValues();
      iniciar(async () => {
        const resultado = await registrarTransferencia(valores);
        if (!resultado.ok) {
          let alguno = false;
          for (const [campo, mensaje] of Object.entries(resultado.campos ?? {})) {
            if (campo in valores) {
              setError(campo as keyof Valores, { message: mensaje });
              alguno = true;
            }
          }
          if (!alguno) setErrorGeneral(resultado.error);
          return;
        }
        const nombre = (id: string) => cuentas.find((c) => c.id === id)?.nombre ?? "";
        mostrar({
          tipo: "exito",
          mensaje: `Transferencia de ${formatearDolares(textoACentavos(valores.monto) ?? 0)} de ${nombre(valores.cuentaOrigenId)} a ${nombre(valores.cuentaDestinoId)}`,
        });
        if (seguir) {
          reset({ ...valores, monto: "", nota: "" });
          setFocus("monto");
        } else {
          alTerminar();
        }
      });
    })();
  }

  function alPulsar(evento: KeyboardEvent<HTMLFormElement>) {
    if (evento.key !== "Enter" || evento.nativeEvent.isComposing) return;
    if ((evento.target as HTMLElement).tagName === "BUTTON") return;
    evento.preventDefault();
    guardar(evento.shiftKey);
  }

  const errores = formState.errors;

  return (
    <form
      onKeyDown={alPulsar}
      onSubmit={(evento) => evento.preventDefault()}
      className="flex flex-col gap-5"
      noValidate
    >
      <Campo id="monto-transferencia" etiqueta="Monto" error={errores.monto?.message}>
        <Entrada
          id="monto-transferencia"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          className="text-xl font-semibold"
          invalido={Boolean(errores.monto)}
          {...registroMonto}
          ref={(elemento) => {
            refMonto(elemento);
            montoRef.current = elemento;
          }}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo id="cuentaOrigenId" etiqueta="Desde" error={errores.cuentaOrigenId?.message}>
          <Selector
            id="cuentaOrigenId"
            invalido={Boolean(errores.cuentaOrigenId)}
            {...register("cuentaOrigenId")}
          >
            {cuentas.map((cuenta) => (
              <option key={cuenta.id} value={cuenta.id}>
                {cuenta.nombre}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo id="cuentaDestinoId" etiqueta="Hacia" error={errores.cuentaDestinoId?.message}>
          <Selector
            id="cuentaDestinoId"
            invalido={Boolean(errores.cuentaDestinoId)}
            {...register("cuentaDestinoId")}
          >
            {cuentas.map((cuenta) => (
              <option key={cuenta.id} value={cuenta.id}>
                {cuenta.nombre}
              </option>
            ))}
          </Selector>
        </Campo>
      </div>

      <Campo id="fecha-transferencia" etiqueta="Fecha" error={errores.fecha?.message}>
        <div className="flex gap-2">
          <Entrada
            id="fecha-transferencia"
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

      <Campo id="nota-transferencia" etiqueta="Nota (opcional)" error={errores.nota?.message}>
        <Entrada
          id="nota-transferencia"
          maxLength={140}
          autoComplete="off"
          placeholder="Por ejemplo, retiro del cajero"
          {...register("nota")}
        />
      </Campo>

      {errorGeneral ? <MensajeError>{errorGeneral}</MensajeError> : null}

      <Boton variante="primario" disabled={enviando} onClick={() => guardar(false)}>
        {enviando ? "Guardando…" : "Transferir"}
      </Boton>
    </form>
  );
}
