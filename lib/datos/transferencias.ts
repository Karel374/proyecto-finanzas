import { ErrorDeAccion } from "@/lib/acciones";
import { aColumnaDate, deColumnaDate } from "@/lib/fechas";

import { datosDelUsuario, DEL_USUARIO } from "./cliente";
import { validarCuentaActiva } from "./referencias";

/**
 * Transferencias entre cuentas propias (sección 15): retirar del cajero, pagar la tarjeta, pasar
 * dinero al ahorro. Viven en su propia tabla, así que nunca cuentan como ingreso ni gasto.
 */
export async function crearTransferencia(datos: {
  cuentaOrigenId: string;
  cuentaDestinoId: string;
  monto: number;
  fecha: string;
  nota: string | null;
}) {
  const db = await datosDelUsuario();
  if (datos.cuentaOrigenId === datos.cuentaDestinoId) {
    throw new ErrorDeAccion("VALIDACION", "Elige dos cuentas distintas", "cuentaDestinoId");
  }
  const [origen, destino] = await Promise.all([
    validarCuentaActiva(db, datos.cuentaOrigenId, "cuentaOrigenId"),
    validarCuentaActiva(db, datos.cuentaDestinoId, "cuentaDestinoId"),
  ]);
  const transferencia = await db.transferencia.create({
    data: {
      usuarioId: DEL_USUARIO,
      cuentaOrigenId: origen.id,
      cuentaDestinoId: destino.id,
      montoCentavos: datos.monto,
      fecha: aColumnaDate(datos.fecha),
      nota: datos.nota,
    },
  });
  await db.ajustes.updateMany({ data: { ultimaCuentaId: origen.id } });
  return { id: transferencia.id };
}

/** Transferencias entre cuentas propias, de la más reciente a la más antigua. */
export async function listarTransferencias(limite = 20) {
  const db = await datosDelUsuario();
  const filas = await db.transferencia.findMany({
    // Las de deudas, préstamos e inversiones se ven en sus módulos (fases 8, 9 y 12).
    where: { deudaId: null, prestamoId: null, inversionId: null },
    orderBy: [{ fecha: "desc" }, { creadoEn: "desc" }],
    take: limite,
    include: {
      cuentaOrigen: { select: { nombre: true } },
      cuentaDestino: { select: { nombre: true } },
    },
  });
  return filas.map((fila) => ({
    id: fila.id,
    fecha: deColumnaDate(fila.fecha),
    montoCentavos: fila.montoCentavos,
    nota: fila.nota,
    origen: fila.cuentaOrigen?.nombre ?? "",
    destino: fila.cuentaDestino?.nombre ?? "",
  }));
}

export async function borrarTransferencia(id: string) {
  const db = await datosDelUsuario();
  const transferencia = await db.transferencia.findUnique({ where: { id } });
  if (!transferencia || transferencia.deudaId || transferencia.prestamoId || transferencia.inversionId) {
    throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró la transferencia");
  }
  await db.transferencia.delete({ where: { id } });
}
