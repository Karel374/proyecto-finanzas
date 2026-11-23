import { cache } from "react";

import { ErrorDeAccion } from "@/lib/acciones";
import { metodoPagoDeCuenta } from "@/lib/calculos/cuentas";
import { ocurrenciasPendientes, type ReglaRecurrente } from "@/lib/calculos/recurrentes";
import { aColumnaDate, compararFechas, deColumnaDate, hoy, type FechaISO } from "@/lib/fechas";

import { datosDelUsuario, DEL_USUARIO, type ClienteDelUsuario } from "./cliente";
import { validarCategoriaYCuenta } from "./referencias";

type DatosRecurrente = {
  tipo: "GASTO" | "INGRESO";
  monto: number;
  categoriaId: string;
  cuentaId: string;
  nota: string | null;
  frecuencia: "SEMANAL" | "MENSUAL" | "ANUAL";
  diaSemana: number | null;
  diaMes: number | null;
  mes: number | null;
  fechaInicio: string;
  fechaFin: string | null;
};

type FilaRecurrente = Awaited<ReturnType<ClienteDelUsuario["recurrente"]["findFirstOrThrow"]>>;

function aRegla(fila: FilaRecurrente): ReglaRecurrente {
  return {
    frecuencia: fila.frecuencia,
    diaSemana: fila.diaSemana,
    diaMes: fila.diaMes,
    mes: fila.mes,
    fechaInicio: deColumnaDate(fila.fechaInicio),
    fechaFin: fila.fechaFin ? deColumnaDate(fila.fechaFin) : null,
    activo: fila.activo,
    ultimaGenerada: fila.ultimaGenerada ? deColumnaDate(fila.ultimaGenerada) : null,
  };
}

/**
 * Crea las ocurrencias pendientes de todos los recurrentes activos de un usuario, hasta hoy
 * (sección 7). La usan el cron diario y, como respaldo, la apertura de la app. Correrla dos veces
 * no duplica nada: solo avanza desde `ultimaGenerada`, y la base rechaza un segundo movimiento del
 * mismo recurrente en la misma fecha (createMany con skipDuplicates).
 */
export async function generarRecurrentes(db: ClienteDelUsuario, hoyISO: FechaISO): Promise<number> {
  const reglas = await db.recurrente.findMany({
    where: { activo: true },
    include: { cuenta: { select: { tipo: true } } },
  });

  let creados = 0;
  for (const fila of reglas) {
    const regla = aRegla(fila);
    // Una regla que todavía no empieza no avanza su marca.
    if (compararFechas(regla.fechaInicio, hoyISO) > 0) continue;

    const fechas = ocurrenciasPendientes(regla, hoyISO);
    if (fechas.length) {
      const resultado = await db.movimiento.createMany({
        data: fechas.map((fecha) => ({
          usuarioId: DEL_USUARIO,
          tipo: fila.tipo,
          montoCentavos: fila.montoCentavos,
          categoriaId: fila.categoriaId,
          cuentaId: fila.cuentaId,
          fecha: aColumnaDate(fecha),
          nota: fila.nota,
          metodoPago: metodoPagoDeCuenta(fila.cuenta.tipo),
          recurrenteId: fila.id,
        })),
        skipDuplicates: true,
      });
      creados += resultado.count;
    }
    await db.recurrente.update({ where: { id: fila.id }, data: { ultimaGenerada: aColumnaDate(hoyISO) } });
  }
  return creados;
}

/** Respaldo al abrir la app: genera los pendientes del usuario de la sesión una vez por petición. */
export const generarRecurrentesDelUsuario = cache(async () => {
  return generarRecurrentes(await datosDelUsuario(), hoy());
});

export async function listarRecurrentes() {
  const db = await datosDelUsuario();
  const filas = await db.recurrente.findMany({
    orderBy: [{ activo: "desc" }, { fechaInicio: "desc" }],
    include: {
      categoria: { select: { nombre: true, colorSlot: true, sistema: true } },
      cuenta: { select: { nombre: true } },
    },
  });
  return filas.map((fila) => ({
    id: fila.id,
    tipo: fila.tipo,
    montoCentavos: fila.montoCentavos,
    categoriaId: fila.categoriaId,
    categoria: fila.categoria.nombre,
    colorSlot: fila.categoria.colorSlot,
    sistema: fila.categoria.sistema,
    cuentaId: fila.cuentaId,
    cuenta: fila.cuenta.nombre,
    nota: fila.nota,
    ...aRegla(fila),
  }));
}

export type RecurrenteListado = Awaited<ReturnType<typeof listarRecurrentes>>[number];

export async function crearRecurrente(datos: DatosRecurrente) {
  const db = await datosDelUsuario();
  const { categoria, cuenta } = await validarCategoriaYCuenta(
    db,
    datos.tipo,
    datos.categoriaId,
    datos.cuentaId,
  );
  const recurrente = await db.recurrente.create({
    data: {
      usuarioId: DEL_USUARIO,
      tipo: datos.tipo,
      montoCentavos: datos.monto,
      categoriaId: categoria.id,
      cuentaId: cuenta.id,
      nota: datos.nota,
      frecuencia: datos.frecuencia,
      diaSemana: datos.diaSemana,
      diaMes: datos.diaMes,
      mes: datos.mes,
      fechaInicio: aColumnaDate(datos.fechaInicio),
      fechaFin: datos.fechaFin ? aColumnaDate(datos.fechaFin) : null,
    },
  });
  // Las ocurrencias que ya pasaron (desde fechaInicio hasta hoy) aparecen enseguida.
  await generarRecurrentes(db, hoy());
  return { id: recurrente.id };
}

/**
 * Edita la regla. Solo afecta las ocurrencias futuras: la generación avanza desde `ultimaGenerada`,
 * y las ya creadas no se tocan (sección 7).
 */
export async function editarRecurrente(id: string, datos: DatosRecurrente) {
  const db = await datosDelUsuario();
  const existente = await db.recurrente.findUnique({ where: { id } });
  if (!existente) throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró el recurrente");
  const { categoria, cuenta } = await validarCategoriaYCuenta(
    db,
    datos.tipo,
    datos.categoriaId,
    datos.cuentaId,
  );
  await db.recurrente.update({
    where: { id },
    data: {
      tipo: datos.tipo,
      montoCentavos: datos.monto,
      categoriaId: categoria.id,
      cuentaId: cuenta.id,
      nota: datos.nota,
      frecuencia: datos.frecuencia,
      diaSemana: datos.diaSemana,
      diaMes: datos.diaMes,
      mes: datos.mes,
      fechaInicio: aColumnaDate(datos.fechaInicio),
      fechaFin: datos.fechaFin ? aColumnaDate(datos.fechaFin) : null,
    },
  });
}

/**
 * Pausa o reactiva. Al reactivar no se crean los meses que estuvo en pausa: `ultimaGenerada`
 * salta a hoy (sección 7).
 */
export async function pausarRecurrente(id: string, activo: boolean) {
  const db = await datosDelUsuario();
  const existente = await db.recurrente.findUnique({ where: { id } });
  if (!existente) throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró el recurrente");
  await db.recurrente.update({
    where: { id },
    data: activo ? { activo: true, ultimaGenerada: aColumnaDate(hoy()) } : { activo: false },
  });
}

/** Borra la regla. Los movimientos que ya generó se quedan, sin la etiqueta de automático. */
export async function borrarRecurrente(id: string) {
  const db = await datosDelUsuario();
  const existente = await db.recurrente.findUnique({ where: { id } });
  if (!existente) throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró el recurrente");
  await db.recurrente.delete({ where: { id } });
}
