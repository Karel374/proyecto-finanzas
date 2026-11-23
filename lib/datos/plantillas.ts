import { ErrorDeAccion } from "@/lib/acciones";
import { MAXIMO_PLANTILLAS } from "@/lib/calculos/movimientos";
import { esquemaPlantillaGuardada, type PlantillaGuardada } from "@/lib/esquemas";
import { hoy } from "@/lib/fechas";

import { datosDelUsuario, type ClienteDelUsuario } from "./cliente";
import { crearMovimiento } from "./movimientos";
import { validarCategoriaYCuenta } from "./referencias";

/**
 * Plantillas de registro (sección 7): hasta 6 accesos directos guardados en Ajustes.plantillas.
 * Una plantilla cuya categoría o cuenta ya no existe o se archivó no se muestra.
 */
async function leerPlantillas(db: ClienteDelUsuario): Promise<PlantillaGuardada[]> {
  const ajustes = await db.ajustes.findFirst({ select: { plantillas: true } });
  const crudas = Array.isArray(ajustes?.plantillas) ? ajustes.plantillas : [];
  return crudas.flatMap((cruda) => {
    const leida = esquemaPlantillaGuardada.safeParse(cruda);
    return leida.success ? [leida.data] : [];
  });
}

async function guardarPlantillas(db: ClienteDelUsuario, plantillas: PlantillaGuardada[]) {
  await db.ajustes.updateMany({ data: { plantillas } });
}

export async function listarPlantillas() {
  const db = await datosDelUsuario();
  const [plantillas, categorias, cuentas] = await Promise.all([
    leerPlantillas(db),
    db.categoria.findMany({ where: { archivada: false }, select: { id: true } }),
    db.cuenta.findMany({ where: { archivada: false }, select: { id: true } }),
  ]);
  const categoriasActivas = new Set(categorias.map((c) => c.id));
  const cuentasActivas = new Set(cuentas.map((c) => c.id));
  return plantillas.filter((p) => categoriasActivas.has(p.categoriaId) && cuentasActivas.has(p.cuentaId));
}

export async function crearPlantilla(datos: {
  nombre: string;
  tipo: "GASTO" | "INGRESO";
  monto: number;
  categoriaId: string;
  cuentaId: string;
  nota: string | null;
}) {
  const db = await datosDelUsuario();
  const plantillas = await leerPlantillas(db);
  if (plantillas.length >= MAXIMO_PLANTILLAS) {
    throw new ErrorDeAccion("VALIDACION", `Puedes tener hasta ${MAXIMO_PLANTILLAS} plantillas`, "nombre");
  }
  await validarCategoriaYCuenta(db, datos.tipo, datos.categoriaId, datos.cuentaId);
  const nueva: PlantillaGuardada = {
    id: crypto.randomUUID(),
    nombre: datos.nombre,
    tipo: datos.tipo,
    montoCentavos: datos.monto,
    categoriaId: datos.categoriaId,
    cuentaId: datos.cuentaId,
    nota: datos.nota,
  };
  await guardarPlantillas(db, [...plantillas, nueva]);
  return nueva;
}

export async function borrarPlantilla(id: string) {
  const db = await datosDelUsuario();
  const plantillas = await leerPlantillas(db);
  await guardarPlantillas(
    db,
    plantillas.filter((p) => p.id !== id),
  );
}

/** Un clic en la plantilla guarda el movimiento con fecha de hoy (sección 7). */
export async function usarPlantilla(id: string) {
  const db = await datosDelUsuario();
  const plantilla = (await leerPlantillas(db)).find((p) => p.id === id);
  if (!plantilla) throw new ErrorDeAccion("NO_ENCONTRADO", "No se encontró la plantilla");
  return crearMovimiento({
    tipo: plantilla.tipo,
    monto: plantilla.montoCentavos,
    categoriaId: plantilla.categoriaId,
    cuentaId: plantilla.cuentaId,
    fecha: hoy(),
    nota: plantilla.nota,
    // Es un monto que el usuario ya definió: no se le pregunta otra vez si es inusual.
    confirmarInusual: true,
  });
}
