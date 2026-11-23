import { ErrorDeAccion } from "@/lib/acciones";
import { metodoPagoDeCuenta } from "@/lib/calculos/cuentas";
import { promedioSiEsInusual, totales, type TipoMovimiento } from "@/lib/calculos/movimientos";
import { formatearDolares } from "@/lib/dinero";
import type { DatosMovimiento, FiltrosMovimientos } from "@/lib/esquemas";
import { aColumnaDate, deColumnaDate, esFechaISO, hoy, periodo, sumarMeses } from "@/lib/fechas";

import { datosDelUsuario, DEL_USUARIO, type ClienteDelUsuario } from "./cliente";
import { validarCategoriaYCuenta } from "./referencias";

export const MOVIMIENTOS_POR_PAGINA = 50;

/**
 * Aviso de monto inusual (sección 6): compara un gasto contra los gastos de su categoría en los
 * últimos 3 meses. Si supera 5 veces el promedio y el usuario no confirmó, pide confirmación.
 */
async function verificarMontoInusual(
  db: ClienteDelUsuario,
  datos: Pick<DatosMovimiento, "tipo" | "monto" | "categoriaId" | "confirmarInusual">,
  categoriaNombre: string,
  excluirId?: string,
) {
  if (datos.tipo !== "GASTO" || datos.confirmarInusual) return;
  const hoyISO = hoy();
  const previos = await db.movimiento.findMany({
    where: {
      tipo: "GASTO",
      categoriaId: datos.categoriaId,
      esAjuste: false,
      fecha: { gte: aColumnaDate(sumarMeses(hoyISO, -3)), lte: aColumnaDate(hoyISO) },
      ...(excluirId ? { NOT: { id: excluirId } } : {}),
    },
    select: { montoCentavos: true },
  });
  const promedio = promedioSiEsInusual(
    datos.monto,
    previos.map((m) => m.montoCentavos),
  );
  if (promedio !== null) {
    throw new ErrorDeAccion(
      "CONFIRMAR",
      `¿Seguro que son ${formatearDolares(datos.monto)}? Sueles gastar ${formatearDolares(promedio)} en ${categoriaNombre}`,
      "monto",
    );
  }
}

/** Recuerda la última categoría (por tipo) y la última cuenta usadas, para preseleccionarlas. */
async function recordarUltimas(
  db: ClienteDelUsuario,
  tipo: TipoMovimiento,
  categoriaId: string,
  cuentaId: string,
) {
  await db.ajustes.updateMany({
    data:
      tipo === "GASTO"
        ? { ultimaCategoriaGastoId: categoriaId, ultimaCuentaId: cuentaId }
        : { ultimaCategoriaIngresoId: categoriaId, ultimaCuentaId: cuentaId },
  });
}

export async function crearMovimiento(datos: DatosMovimiento) {
  const db = await datosDelUsuario();
  const { categoria, cuenta } = await validarCategoriaYCuenta(
    db,
    datos.tipo,
    datos.categoriaId,
    datos.cuentaId,
  );
  await verificarMontoInusual(db, datos, categoria.nombre);

  const movimiento = await db.movimiento.create({
    data: {
      usuarioId: DEL_USUARIO,
      tipo: datos.tipo,
      montoCentavos: datos.monto,
      categoriaId: categoria.id,
      cuentaId: cuenta.id,
      fecha: aColumnaDate(datos.fecha),
      nota: datos.nota,
      metodoPago: metodoPagoDeCuenta(cuenta.tipo),
    },
  });
  await recordarUltimas(db, datos.tipo, categoria.id, cuenta.id);
  return { id: movimiento.id };
}

export async function editarMovimiento(id: string, datos: DatosMovimiento) {
  const db = await datosDelUsuario();
  const existente = await db.movimiento.findUnique({ where: { id } });
  if (!existente) throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró el movimiento");
  const { categoria, cuenta } = await validarCategoriaYCuenta(
    db,
    datos.tipo,
    datos.categoriaId,
    datos.cuentaId,
  );
  await verificarMontoInusual(db, datos, categoria.nombre, id);

  await db.movimiento.update({
    where: { id },
    data: {
      tipo: datos.tipo,
      montoCentavos: datos.monto,
      categoriaId: categoria.id,
      cuentaId: cuenta.id,
      fecha: aColumnaDate(datos.fecha),
      nota: datos.nota,
      metodoPago: metodoPagoDeCuenta(cuenta.tipo),
    },
  });
  return { id };
}

/** Lo que hace falta para deshacer un borrado: el movimiento tal como estaba. */
export type MovimientoBorrado = {
  id: string;
  tipo: TipoMovimiento;
  montoCentavos: number;
  categoriaId: string;
  cuentaId: string;
  fecha: string;
  nota: string | null;
  recurrenteId: string | null;
  planIngresoId: string | null;
  creadoEn: string;
};

/** Borra un movimiento y devuelve su copia, para el botón "Deshacer" (sección 6). */
export async function borrarMovimiento(id: string): Promise<MovimientoBorrado> {
  const db = await datosDelUsuario();
  const movimiento = await db.movimiento.findUnique({ where: { id } });
  if (!movimiento) throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró el movimiento");
  await db.movimiento.delete({ where: { id } });
  return {
    id: movimiento.id,
    tipo: movimiento.tipo,
    montoCentavos: movimiento.montoCentavos,
    categoriaId: movimiento.categoriaId,
    cuentaId: movimiento.cuentaId,
    fecha: deColumnaDate(movimiento.fecha),
    nota: movimiento.nota,
    recurrenteId: movimiento.recurrenteId,
    planIngresoId: movimiento.planIngresoId,
    creadoEn: movimiento.creadoEn.toISOString(),
  };
}

/**
 * Vuelve a crear un movimiento borrado, con su mismo id y su fecha de registro, así queda en el
 * mismo lugar de la lista. Las referencias se validan otra vez: la copia viene del navegador.
 */
export async function restaurarMovimiento(copia: MovimientoBorrado) {
  const db = await datosDelUsuario();
  if (!esFechaISO(copia.fecha)) throw new ErrorDeAccion("VALIDACION", "Fecha inválida");
  const { categoria, cuenta } = await validarCategoriaYCuenta(
    db,
    copia.tipo,
    copia.categoriaId,
    copia.cuentaId,
  );
  const recurrente = copia.recurrenteId
    ? await db.recurrente.findUnique({ where: { id: copia.recurrenteId }, select: { id: true } })
    : null;
  const creadoEn = new Date(copia.creadoEn);

  await db.movimiento.create({
    data: {
      usuarioId: DEL_USUARIO,
      id: copia.id,
      tipo: copia.tipo,
      montoCentavos: copia.montoCentavos,
      categoriaId: categoria.id,
      cuentaId: cuenta.id,
      fecha: aColumnaDate(copia.fecha),
      nota: copia.nota,
      metodoPago: metodoPagoDeCuenta(cuenta.tipo),
      recurrenteId: recurrente?.id ?? null,
      creadoEn: Number.isNaN(creadoEn.getTime()) ? new Date() : creadoEn,
    },
  });
}

/** Rango de fechas de los filtros. Un rango personalizado inválido cae en el mes actual. */
export function rangoDeFiltros(filtros: Pick<FiltrosMovimientos, "periodo" | "desde" | "hasta">) {
  const hoyISO = hoy();
  if (filtros.periodo === "RANGO" && filtros.desde && filtros.hasta) {
    try {
      return periodo("RANGO", hoyISO, { desde: filtros.desde, hasta: filtros.hasta });
    } catch {
      return periodo("MES", hoyISO);
    }
  }
  return periodo(filtros.periodo === "RANGO" ? "MES" : filtros.periodo, hoyISO);
}

/**
 * Página de movimientos (sección 7): filtros en una fila, totales del resultado filtrado
 * (ingresos, gastos y balance) y 50 movimientos por página, del más reciente al más antiguo.
 */
export async function listarMovimientos(filtros: FiltrosMovimientos) {
  const db = await datosDelUsuario();
  const rango = rangoDeFiltros(filtros);
  const texto = filtros.texto?.trim();

  const where = {
    fecha: { gte: aColumnaDate(rango.desde), lte: aColumnaDate(rango.hasta) },
    ...(filtros.tipo !== "TODOS" ? { tipo: filtros.tipo } : {}),
    ...(filtros.categorias.length ? { categoriaId: { in: filtros.categorias } } : {}),
    ...(filtros.cuentas.length ? { cuentaId: { in: filtros.cuentas } } : {}),
    ...(texto ? { nota: { contains: texto, mode: "insensitive" as const } } : {}),
  };

  const [filas, cantidad, porTipo] = await Promise.all([
    db.movimiento.findMany({
      where,
      orderBy: [{ fecha: "desc" }, { creadoEn: "desc" }],
      skip: (filtros.pagina - 1) * MOVIMIENTOS_POR_PAGINA,
      take: MOVIMIENTOS_POR_PAGINA,
      include: {
        categoria: { select: { nombre: true, colorSlot: true, sistema: true } },
        cuenta: { select: { nombre: true } },
      },
    }),
    db.movimiento.count({ where }),
    db.movimiento.groupBy({ by: ["tipo"], where, _sum: { montoCentavos: true } }),
  ]);

  const resumen = totales(
    porTipo.map((grupo) => ({ tipo: grupo.tipo, montoCentavos: grupo._sum.montoCentavos ?? 0 })),
  );

  return {
    rango,
    resumen,
    cantidad,
    paginas: Math.max(1, Math.ceil(cantidad / MOVIMIENTOS_POR_PAGINA)),
    movimientos: filas.map((fila) => ({
      id: fila.id,
      tipo: fila.tipo,
      montoCentavos: fila.montoCentavos,
      fecha: deColumnaDate(fila.fecha),
      nota: fila.nota,
      categoriaId: fila.categoriaId,
      categoria: fila.categoria.nombre,
      colorSlot: fila.categoria.colorSlot,
      sistema: fila.categoria.sistema,
      cuentaId: fila.cuentaId,
      cuenta: fila.cuenta.nombre,
      automatico: fila.recurrenteId !== null,
      esAjuste: fila.esAjuste,
    })),
  };
}

export type FilaMovimiento = Awaited<ReturnType<typeof listarMovimientos>>["movimientos"][number];

/** Todo lo que necesita el panel de registro: categorías, cuentas, últimas usadas y plantillas. */
export async function datosDelFormulario() {
  const db = await datosDelUsuario();
  const [categorias, cuentas, ajustes] = await Promise.all([
    db.categoria.findMany({
      where: { archivada: false },
      orderBy: [{ tipo: "asc" }, { orden: "asc" }],
      select: { id: true, nombre: true, tipo: true, colorSlot: true, sistema: true },
    }),
    db.cuenta.findMany({
      where: { archivada: false },
      orderBy: [{ tipo: "asc" }, { nombre: "asc" }],
      select: { id: true, nombre: true, tipo: true },
    }),
    db.ajustes.findFirst({
      select: { ultimaCategoriaGastoId: true, ultimaCategoriaIngresoId: true, ultimaCuentaId: true },
    }),
  ]);
  return {
    categorias,
    cuentas,
    ultimas: {
      GASTO: ajustes?.ultimaCategoriaGastoId ?? null,
      INGRESO: ajustes?.ultimaCategoriaIngresoId ?? null,
      cuenta: ajustes?.ultimaCuentaId ?? null,
    },
  };
}

export type DatosDelFormulario = Awaited<ReturnType<typeof datosDelFormulario>>;
