"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, ArrowRight, CircleCheck, Pencil, Plus, Scale, Trash2, TriangleAlert } from "lucide-react";
import { useState, useTransition } from "react";
import type { z } from "zod";

import { useForm, useWatch } from "react-hook-form";

import {
  actualizarCuenta,
  agregarCuenta,
  archivar,
  cuadrar,
  eliminarTransferencia,
} from "@/app/(app)/cuentas/acciones";
import { useAvisos } from "@/components/ui/avisos";
import { Boton } from "@/components/ui/boton";
import { Campo, Entrada, MensajeError, Selector } from "@/components/ui/campos";
import { Dialogo } from "@/components/ui/dialogos";
import {
  ETIQUETAS_TIPO_CUENTA,
  esPasivo,
  type ResumenCuentas,
  type TipoCuenta,
} from "@/lib/calculos/cuentas";
import { centavosATexto, formatearDolares, textoACentavos } from "@/lib/dinero";
import { esquemaCuenta, TIPOS_CUENTA, type EntradaCuenta } from "@/lib/esquemas";
import { formatearFecha } from "@/lib/fechas";

type CuentaConSaldo = {
  id: string;
  nombre: string;
  tipo: TipoCuenta;
  institucion: string | null;
  saldoCentavos: number;
  cupoCentavos: number | null;
  diaCorte: number | null;
  diaPago: number | null;
  fechaSaldoInicial: string;
};

type Transferencia = {
  id: string;
  fecha: string;
  montoCentavos: number;
  nota: string | null;
  origen: string;
  destino: string;
};

type Dialogos =
  | { tipo: "nueva" }
  | { tipo: "editar"; cuenta: CuentaConSaldo }
  | { tipo: "cuadrar"; cuenta: CuentaConSaldo }
  | null;

/** Vista de Cuentas (sección 15): saldo por cuenta, disponible, deuda en tarjetas y próximos pagos. */
export function VistaCuentas({
  cuentas,
  resumen,
  transferencias,
  hoy,
}: {
  cuentas: CuentaConSaldo[];
  resumen: ResumenCuentas;
  transferencias: Transferencia[];
  hoy: string;
}) {
  const { mostrar } = useAvisos();
  const [dialogo, setDialogo] = useState<Dialogos>(null);
  const [ocupado, iniciar] = useTransition();

  function archivarCuenta(cuenta: CuentaConSaldo) {
    iniciar(async () => {
      const resultado = await archivar({ id: cuenta.id });
      mostrar(
        resultado.ok
          ? { tipo: "exito", mensaje: `${cuenta.nombre} archivada. Su historial se conserva.` }
          : { tipo: "error", mensaje: resultado.error },
      );
    });
  }

  function borrarTransferencia(transferencia: Transferencia) {
    iniciar(async () => {
      const resultado = await eliminarTransferencia({ id: transferencia.id });
      mostrar(
        resultado.ok
          ? { tipo: "exito", mensaje: "Transferencia borrada" }
          : { tipo: "error", mensaje: resultado.error },
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {cuentas.length === 1 ? (
        <div className="bg-acento-suave text-texto flex items-center justify-between gap-4 rounded-lg p-4 text-sm">
          <p>
            Agrega tus otras cuentas (banco, billeteras, tarjetas) con su saldo de hoy para saber cuánto
            tienes en cada lugar.
          </p>
          <Boton onClick={() => setDialogo({ tipo: "nueva" })}>
            <Plus aria-hidden="true" className="size-4" />
            Agregar cuenta
          </Boton>
        </div>
      ) : null}

      <dl className="grid grid-cols-3 gap-6">
        <div className="bg-marca text-sobre-marca flex flex-col gap-1 rounded-lg p-5">
          <dt className="text-sm opacity-90">Disponible</dt>
          <dd className="text-[28px] font-semibold">{formatearDolares(resumen.disponibleCentavos)}</dd>
          <dd className="text-xs opacity-80">Efectivo, banco y billeteras</dd>
        </div>
        <div className="border-borde bg-superficie flex flex-col gap-1 rounded-lg border p-5">
          <dt className="text-texto-2 text-sm">Debes en tarjetas</dt>
          <dd className="text-[28px] font-semibold">{formatearDolares(resumen.deudaTarjetasCentavos)}</dd>
        </div>
        <div className="border-borde bg-superficie flex flex-col gap-2 rounded-lg border p-5">
          <dt className="text-texto-2 text-sm">Próximos pagos de tarjeta</dt>
          {resumen.proximosPagos.length ? (
            resumen.proximosPagos.slice(0, 3).map((pago) => (
              <dd key={pago.cuentaId} className="flex justify-between text-sm">
                <span>
                  {pago.nombre} · {formatearFecha(pago.fecha)}
                  {pago.fecha === hoy ? " (hoy)" : ""}
                </span>
                <span className="font-medium">{formatearDolares(pago.montoCentavos)}</span>
              </dd>
            ))
          ) : (
            <dd className="text-texto-3 text-sm">Sin pagos pendientes</dd>
          )}
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tus cuentas</h2>
          {cuentas.length > 1 ? (
            <Boton onClick={() => setDialogo({ tipo: "nueva" })}>
              <Plus aria-hidden="true" className="size-4" />
              Agregar cuenta
            </Boton>
          ) : null}
        </div>
        <ul className="grid grid-cols-3 gap-4">
          {cuentas.map((cuenta) => (
            <li
              key={cuenta.id}
              className="border-borde bg-superficie flex flex-col gap-3 rounded-lg border p-5"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{cuenta.nombre}</span>
                <span className="text-texto-3 text-xs">
                  {ETIQUETAS_TIPO_CUENTA[cuenta.tipo]}
                  {cuenta.institucion ? ` · ${cuenta.institucion}` : ""}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-texto-3 text-xs">{esPasivo(cuenta.tipo) ? "Deuda" : "Saldo"}</span>
                <span className="text-xl font-semibold">{formatearDolares(cuenta.saldoCentavos)}</span>
                {cuenta.tipo === "TARJETA_CREDITO" && cuenta.cupoCentavos ? (
                  <span className="text-texto-3 text-xs">
                    Cupo disponible{" "}
                    {formatearDolares(cuenta.cupoCentavos - Math.max(0, cuenta.saldoCentavos))}
                  </span>
                ) : null}
              </div>
              <div className="mt-auto flex gap-1">
                <Boton tamano="chico" onClick={() => setDialogo({ tipo: "cuadrar", cuenta })}>
                  <Scale aria-hidden="true" className="size-3.5" />
                  Cuadrar
                </Boton>
                <Boton
                  tamano="chico"
                  variante="fantasma"
                  aria-label={`Editar ${cuenta.nombre}`}
                  onClick={() => setDialogo({ tipo: "editar", cuenta })}
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                </Boton>
                {cuentas.length > 1 ? (
                  <Boton
                    tamano="chico"
                    variante="fantasma"
                    aria-label={`Archivar ${cuenta.nombre}`}
                    disabled={ocupado}
                    onClick={() => archivarCuenta(cuenta)}
                  >
                    <Archive aria-hidden="true" className="size-3.5" />
                  </Boton>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Transferencias recientes</h2>
        <p className="text-texto-2 text-sm">
          Mover dinero entre tus cuentas no cuenta como ingreso ni gasto. Regístralas desde el panel de
          registro.
        </p>
        {transferencias.length ? (
          <ul className="border-borde bg-superficie divide-borde divide-y rounded-lg border">
            {transferencias.map((transferencia) => (
              <li key={transferencia.id} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                <span className="text-texto-3 w-24">{formatearFecha(transferencia.fecha)}</span>
                <span className="flex flex-1 items-center gap-2">
                  {transferencia.origen}
                  <ArrowRight aria-label="hacia" className="text-texto-3 size-3.5" />
                  {transferencia.destino}
                  {transferencia.nota ? <span className="text-texto-3">· {transferencia.nota}</span> : null}
                </span>
                <span className="font-medium">{formatearDolares(transferencia.montoCentavos)}</span>
                <Boton
                  tamano="chico"
                  variante="peligro"
                  aria-label="Borrar transferencia"
                  disabled={ocupado}
                  onClick={() => borrarTransferencia(transferencia)}
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                </Boton>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-texto-3 text-sm">Todavía no hay transferencias.</p>
        )}
      </div>

      <Dialogo
        abierto={dialogo !== null}
        alCambiar={(abierto) => !abierto && setDialogo(null)}
        titulo={
          dialogo?.tipo === "cuadrar"
            ? `Cuadrar ${dialogo.cuenta.nombre}`
            : dialogo?.tipo === "editar"
              ? `Editar ${dialogo.cuenta.nombre}`
              : "Agregar cuenta"
        }
        descripcion={
          dialogo?.tipo === "cuadrar" ? "Escribe el saldo que ves hoy en tu banco o billetera." : undefined
        }
      >
        {dialogo?.tipo === "nueva" ? (
          <FormularioCuenta hoy={hoy} alTerminar={() => setDialogo(null)} />
        ) : null}
        {dialogo?.tipo === "editar" ? (
          <FormularioEditar cuenta={dialogo.cuenta} alTerminar={() => setDialogo(null)} />
        ) : null}
        {dialogo?.tipo === "cuadrar" ? (
          <FormularioCuadrar cuenta={dialogo.cuenta} alTerminar={() => setDialogo(null)} />
        ) : null}
      </Dialogo>
    </div>
  );
}

function FormularioCuenta({ hoy, alTerminar }: { hoy: string; alTerminar: () => void }) {
  const { mostrar } = useAvisos();
  const [enviando, iniciar] = useTransition();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const { register, handleSubmit, getValues, control, formState } = useForm<
    EntradaCuenta,
    unknown,
    z.output<typeof esquemaCuenta>
  >({
    resolver: zodResolver(esquemaCuenta),
    defaultValues: {
      nombre: "",
      tipo: "BANCO",
      institucion: "",
      saldoInicial: "",
      fechaSaldoInicial: hoy,
      cupo: "",
      diaCorte: "",
      diaPago: "",
    },
  });
  const tipo = useWatch({ control, name: "tipo" });
  const errores = formState.errors;

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={handleSubmit(() =>
        iniciar(async () => {
          const resultado = await agregarCuenta(getValues());
          if (!resultado.ok) {
            setErrorGeneral(resultado.error);
            return;
          }
          mostrar({ tipo: "exito", mensaje: `Cuenta ${getValues().nombre} agregada` });
          alTerminar();
        }),
      )}
    >
      <div className="grid grid-cols-2 gap-3">
        <Campo id="c-nombre" etiqueta="Nombre" error={errores.nombre?.message}>
          <Entrada
            id="c-nombre"
            autoFocus
            placeholder="Por ejemplo, Ahorros Pichincha"
            invalido={Boolean(errores.nombre)}
            {...register("nombre")}
          />
        </Campo>
        <Campo id="c-tipo" etiqueta="Tipo">
          <Selector id="c-tipo" {...register("tipo")}>
            {TIPOS_CUENTA.map((valor) => (
              <option key={valor} value={valor}>
                {ETIQUETAS_TIPO_CUENTA[valor]}
              </option>
            ))}
          </Selector>
        </Campo>
      </div>
      <Campo id="c-institucion" etiqueta="Institución (opcional)">
        <Entrada id="c-institucion" {...register("institucion")} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo
          id="c-saldo"
          etiqueta={tipo === "TARJETA_CREDITO" ? "Deuda de hoy" : "Saldo de hoy"}
          error={errores.saldoInicial?.message}
          ayuda={tipo === "TARJETA_CREDITO" ? "Lo que debes en la tarjeta" : undefined}
        >
          <Entrada
            id="c-saldo"
            inputMode="decimal"
            placeholder="0,00"
            invalido={Boolean(errores.saldoInicial)}
            {...register("saldoInicial")}
          />
        </Campo>
        <Campo id="c-fecha" etiqueta="Fecha del saldo" error={errores.fechaSaldoInicial?.message}>
          <Entrada id="c-fecha" type="date" max={hoy} {...register("fechaSaldoInicial")} />
        </Campo>
      </div>
      {tipo === "TARJETA_CREDITO" ? (
        <div className="grid grid-cols-3 gap-3">
          <Campo id="c-cupo" etiqueta="Cupo" error={errores.cupo?.message}>
            <Entrada id="c-cupo" inputMode="decimal" placeholder="0,00" {...register("cupo")} />
          </Campo>
          <Campo id="c-corte" etiqueta="Día de corte" error={errores.diaCorte?.message}>
            <Entrada id="c-corte" inputMode="numeric" placeholder="1 a 31" {...register("diaCorte")} />
          </Campo>
          <Campo id="c-pago" etiqueta="Día de pago" error={errores.diaPago?.message}>
            <Entrada id="c-pago" inputMode="numeric" placeholder="1 a 31" {...register("diaPago")} />
          </Campo>
        </div>
      ) : null}
      {errorGeneral ? <MensajeError>{errorGeneral}</MensajeError> : null}
      <Boton type="submit" variante="primario" disabled={enviando}>
        {enviando ? "Guardando…" : "Agregar cuenta"}
      </Boton>
    </form>
  );
}

function FormularioEditar({ cuenta, alTerminar }: { cuenta: CuentaConSaldo; alTerminar: () => void }) {
  const { mostrar } = useAvisos();
  const [enviando, iniciar] = useTransition();
  const [valores, setValores] = useState({
    nombre: cuenta.nombre,
    institucion: cuenta.institucion ?? "",
    cupo: cuenta.cupoCentavos ? centavosATexto(cuenta.cupoCentavos) : "",
    diaCorte: cuenta.diaCorte ? String(cuenta.diaCorte) : "",
    diaPago: cuenta.diaPago ? String(cuenta.diaPago) : "",
  });
  const [error, setError] = useState<string | null>(null);
  const cambiar = (campo: keyof typeof valores) => (evento: { target: { value: string } }) =>
    setValores((anterior) => ({ ...anterior, [campo]: evento.target.value }));

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        iniciar(async () => {
          const resultado = await actualizarCuenta({ id: cuenta.id, ...valores });
          if (!resultado.ok) {
            setError(resultado.error);
            return;
          }
          mostrar({ tipo: "exito", mensaje: "Cuenta actualizada" });
          alTerminar();
        });
      }}
    >
      <Campo id="e-nombre" etiqueta="Nombre">
        <Entrada id="e-nombre" value={valores.nombre} onChange={cambiar("nombre")} />
      </Campo>
      <Campo id="e-institucion" etiqueta="Institución (opcional)">
        <Entrada id="e-institucion" value={valores.institucion} onChange={cambiar("institucion")} />
      </Campo>
      {cuenta.tipo === "TARJETA_CREDITO" ? (
        <div className="grid grid-cols-3 gap-3">
          <Campo id="e-cupo" etiqueta="Cupo">
            <Entrada id="e-cupo" inputMode="decimal" value={valores.cupo} onChange={cambiar("cupo")} />
          </Campo>
          <Campo id="e-corte" etiqueta="Día de corte">
            <Entrada
              id="e-corte"
              inputMode="numeric"
              value={valores.diaCorte}
              onChange={cambiar("diaCorte")}
            />
          </Campo>
          <Campo id="e-pago" etiqueta="Día de pago">
            <Entrada id="e-pago" inputMode="numeric" value={valores.diaPago} onChange={cambiar("diaPago")} />
          </Campo>
        </div>
      ) : null}
      <p className="text-texto-3 text-xs">
        El tipo y el saldo inicial no se cambian. Si el saldo no coincide, usa Cuadrar.
      </p>
      {error ? <MensajeError>{error}</MensajeError> : null}
      <Boton type="submit" variante="primario" disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar cambios"}
      </Boton>
    </form>
  );
}

/** Cuadrar con el banco (sección 15): muestra la diferencia y ofrece crear un ajuste marcado como tal. */
function FormularioCuadrar({ cuenta, alTerminar }: { cuenta: CuentaConSaldo; alTerminar: () => void }) {
  const { mostrar } = useAvisos();
  const [enviando, iniciar] = useTransition();
  const [saldoReal, setSaldoReal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const real = saldoReal.trim() === "" ? null : textoACentavos(saldoReal);
  const diferencia = real === null ? null : real - cuenta.saldoCentavos;

  function guardar(crearAjuste: boolean) {
    setError(null);
    iniciar(async () => {
      const resultado = await cuadrar({ cuentaId: cuenta.id, saldoReal, crearAjuste });
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      mostrar({
        tipo: "exito",
        mensaje:
          resultado.datos.diferenciaCentavos === 0
            ? `${cuenta.nombre} cuadra con tu banco`
            : resultado.datos.ajusteCreado
              ? "Ajuste registrado. Ahora el saldo coincide."
              : "Diferencia guardada. Revisa tus movimientos cuando puedas.",
      });
      alTerminar();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        Según la app, {esPasivo(cuenta.tipo) ? "debes" : "tienes"}{" "}
        <strong>{formatearDolares(cuenta.saldoCentavos)}</strong>.
      </p>
      <Campo
        id="saldo-real"
        etiqueta={esPasivo(cuenta.tipo) ? "Deuda real" : "Saldo real"}
        error={
          saldoReal && real === null ? "Ingresa un saldo válido, por ejemplo 150,00" : (error ?? undefined)
        }
      >
        <Entrada
          id="saldo-real"
          autoFocus
          inputMode="decimal"
          placeholder="0,00"
          value={saldoReal}
          onChange={(evento) => setSaldoReal(evento.target.value)}
        />
      </Campo>
      {diferencia === 0 ? (
        <p className="text-ingreso flex items-center gap-2 text-sm">
          <CircleCheck aria-hidden="true" className="size-4" /> Coincide con el saldo de la app.
        </p>
      ) : diferencia !== null ? (
        <p className="bg-alerta-fondo text-alerta flex items-start gap-2 rounded-md p-3 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Hay una diferencia de {formatearDolares(diferencia)}. Puedes revisar tus movimientos o crear un
          ajuste que la deje en cero.
        </p>
      ) : null}
      <div className="flex gap-2">
        {diferencia === 0 ? (
          <Boton variante="primario" disabled={enviando} onClick={() => guardar(false)}>
            Listo
          </Boton>
        ) : (
          <>
            <Boton variante="primario" disabled={enviando || real === null} onClick={() => guardar(true)}>
              Crear ajuste
            </Boton>
            <Boton disabled={enviando || real === null} onClick={() => guardar(false)}>
              Revisaré los movimientos
            </Boton>
          </>
        )}
      </div>
    </div>
  );
}
