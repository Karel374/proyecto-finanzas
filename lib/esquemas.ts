/**
 * Esquemas de validación de la fase 4. Los mismos esquemas validan el formulario en el navegador
 * y la Server Action en el servidor (sección 2). Los mensajes son los de la sección 6.
 * Lo que un esquema no puede saber (si la categoría es del usuario y del tipo correcto,
 * o si la cuenta existe) lo valida la capa de datos con el cliente del usuario.
 */
import { z } from "zod";

import { reglaValida } from "@/lib/calculos/recurrentes";
import { esquemaMonto, MONTO_MAXIMO_CENTAVOS, textoACentavos } from "@/lib/dinero";
import { compararFechas, esFechaISO, hoy, limitesFechaMovimiento } from "@/lib/fechas";

export const TIPOS_MOVIMIENTO = ["GASTO", "INGRESO"] as const;
export const TIPOS_CUENTA = ["EFECTIVO", "BANCO", "BILLETERA", "TARJETA_CREDITO"] as const;
export const FRECUENCIAS = ["SEMANAL", "MENSUAL", "ANUAL"] as const;

const id = (mensaje: string) => z.string({ error: mensaje }).trim().min(1, mensaje);

const nota = z
  .string()
  .trim()
  .max(140, "La nota admite hasta 140 caracteres")
  .optional()
  .transform((valor) => (valor ? valor : null));

const fechaISO = z.string().refine(esFechaISO, "Elige una fecha válida");

/** Fecha de un movimiento a mano: desde hace 5 años hasta hoy en Ecuador. */
const fechaMovimiento = fechaISO.superRefine((fecha, contexto) => {
  if (!esFechaISO(fecha)) return;
  const { minima, maxima } = limitesFechaMovimiento(hoy());
  if (compararFechas(fecha, maxima) > 0) {
    contexto.addIssue({ code: "custom", message: "La fecha no puede ser futura" });
  } else if (compararFechas(fecha, minima) < 0) {
    contexto.addIssue({ code: "custom", message: "La fecha no puede ser de hace más de 5 años" });
  }
});

/** Saldo escrito por el usuario: puede ser cero. */
const saldo = z.string().transform((texto, contexto) => {
  const centavos = texto.trim() === "" ? 0 : textoACentavos(texto);
  if (centavos === null) {
    contexto.addIssue({ code: "custom", message: "Ingresa un saldo válido, por ejemplo 150,00" });
    return z.NEVER;
  }
  if (centavos > MONTO_MAXIMO_CENTAVOS * 100) {
    contexto.addIssue({ code: "custom", message: "El saldo es demasiado grande" });
    return z.NEVER;
  }
  return centavos;
});

const diaDelMesOpcional = z
  .union([z.string(), z.number()])
  .optional()
  .transform((valor, contexto) => {
    if (valor === undefined || valor === "") return null;
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < 1 || numero > 31) {
      contexto.addIssue({ code: "custom", message: "Elige un día entre 1 y 31" });
      return z.NEVER;
    }
    return numero;
  });

// ───────────── Movimiento ─────────────

export const esquemaMovimiento = z.object({
  tipo: z.enum(TIPOS_MOVIMIENTO),
  monto: esquemaMonto,
  categoriaId: id("Elige una categoría"),
  cuentaId: id("Elige la cuenta"),
  fecha: fechaMovimiento,
  nota,
  /** El usuario ya confirmó un monto inusual (sección 6). */
  confirmarInusual: z.boolean().optional().default(false),
});
export type EntradaMovimiento = z.input<typeof esquemaMovimiento>;
export type DatosMovimiento = z.output<typeof esquemaMovimiento>;

export const esquemaEditarMovimiento = esquemaMovimiento.extend({ id: id("Falta el movimiento") });

export const esquemaId = z.object({ id: id("Falta el identificador") });

// ───────────── Transferencia ─────────────

export const esquemaTransferencia = z
  .object({
    cuentaOrigenId: id("Elige la cuenta de origen"),
    cuentaDestinoId: id("Elige la cuenta de destino"),
    monto: esquemaMonto,
    fecha: fechaMovimiento,
    nota,
  })
  .refine((datos) => datos.cuentaOrigenId !== datos.cuentaDestinoId, {
    message: "Elige dos cuentas distintas",
    path: ["cuentaDestinoId"],
  });
export type EntradaTransferencia = z.input<typeof esquemaTransferencia>;

// ───────────── Cuenta ─────────────

export const esquemaCuenta = z
  .object({
    nombre: z.string().trim().min(1, "Ponle un nombre a la cuenta").max(60, "Máximo 60 caracteres"),
    tipo: z.enum(TIPOS_CUENTA),
    institucion: z
      .string()
      .trim()
      .max(60, "Máximo 60 caracteres")
      .optional()
      .transform((valor) => (valor ? valor : null)),
    saldoInicial: saldo,
    fechaSaldoInicial: fechaISO.refine(
      (fecha) => compararFechas(fecha, hoy()) <= 0,
      "La fecha del saldo no puede ser futura",
    ),
    cupo: z
      .string()
      .optional()
      .transform((texto, contexto) => {
        if (!texto || texto.trim() === "") return null;
        const centavos = textoACentavos(texto);
        if (centavos === null || centavos <= 0) {
          contexto.addIssue({ code: "custom", message: "Ingresa un cupo mayor que cero" });
          return z.NEVER;
        }
        return centavos;
      }),
    diaCorte: diaDelMesOpcional,
    diaPago: diaDelMesOpcional,
  })
  .transform((datos) =>
    // Cupo, corte y pago solo tienen sentido en una tarjeta.
    datos.tipo === "TARJETA_CREDITO" ? datos : { ...datos, cupo: null, diaCorte: null, diaPago: null },
  );
export type EntradaCuenta = z.input<typeof esquemaCuenta>;

export const esquemaEditarCuenta = z.object({
  id: id("Falta la cuenta"),
  nombre: z.string().trim().min(1, "Ponle un nombre a la cuenta").max(60, "Máximo 60 caracteres"),
  institucion: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((valor) => (valor ? valor : null)),
  cupo: z
    .string()
    .optional()
    .transform((texto) => (texto && texto.trim() !== "" ? textoACentavos(texto) : null)),
  diaCorte: diaDelMesOpcional,
  diaPago: diaDelMesOpcional,
});

export const esquemaCuadrar = z.object({
  cuentaId: id("Falta la cuenta"),
  saldoReal: saldo,
  crearAjuste: z.boolean(),
});

// ───────────── Plantilla ─────────────

export const esquemaPlantilla = z.object({
  nombre: z.string().trim().min(1, "Ponle un nombre a la plantilla").max(30, "Máximo 30 caracteres"),
  tipo: z.enum(TIPOS_MOVIMIENTO),
  monto: esquemaMonto,
  categoriaId: id("Elige una categoría"),
  cuentaId: id("Elige la cuenta"),
  nota,
});
export type EntradaPlantilla = z.input<typeof esquemaPlantilla>;

/** Plantilla tal como se guarda en Ajustes.plantillas (JSON). */
export const esquemaPlantillaGuardada = z.object({
  id: z.string(),
  nombre: z.string(),
  tipo: z.enum(TIPOS_MOVIMIENTO),
  montoCentavos: z.number().int().positive(),
  categoriaId: z.string(),
  cuentaId: z.string(),
  nota: z.string().nullable(),
});
export type PlantillaGuardada = z.output<typeof esquemaPlantillaGuardada>;

// ───────────── Recurrente ─────────────

const enteroOpcional = z
  .union([z.string(), z.number()])
  .optional()
  .transform((valor) => (valor === undefined || valor === "" ? null : Number(valor)));

export const esquemaRecurrente = z
  .object({
    tipo: z.enum(TIPOS_MOVIMIENTO),
    monto: esquemaMonto,
    categoriaId: id("Elige una categoría"),
    cuentaId: id("Elige la cuenta"),
    nota,
    frecuencia: z.enum(FRECUENCIAS),
    diaSemana: enteroOpcional,
    diaMes: enteroOpcional,
    mes: enteroOpcional,
    fechaInicio: fechaISO,
    fechaFin: z
      .string()
      .optional()
      .transform((valor) => (valor ? valor : null))
      .refine((valor) => valor === null || esFechaISO(valor), "Elige una fecha válida"),
  })
  .transform((datos) => ({
    ...datos,
    // Solo se guardan los campos que la frecuencia usa.
    diaSemana: datos.frecuencia === "SEMANAL" ? datos.diaSemana : null,
    diaMes: datos.frecuencia === "SEMANAL" ? null : datos.diaMes,
    mes: datos.frecuencia === "ANUAL" ? datos.mes : null,
  }))
  .superRefine((datos, contexto) => {
    if (!reglaValida(datos)) {
      const campo = datos.frecuencia === "SEMANAL" ? "diaSemana" : datos.diaMes === null ? "diaMes" : "mes";
      contexto.addIssue({ code: "custom", path: [campo], message: "Completa cuándo se repite" });
    }
    if (datos.fechaFin && compararFechas(datos.fechaFin, datos.fechaInicio) < 0) {
      contexto.addIssue({ code: "custom", path: ["fechaFin"], message: "Termina antes de empezar" });
    }
  });
export type EntradaRecurrente = z.input<typeof esquemaRecurrente>;

export const esquemaPausarRecurrente = z.object({ id: id("Falta el recurrente"), activo: z.boolean() });

// ───────────── Filtros de la página de movimientos ─────────────

export const esquemaFiltrosMovimientos = z.object({
  periodo: z.enum(["HOY", "SEMANA", "MES", "ANIO", "RANGO"]).catch("MES"),
  desde: z.string().optional().catch(undefined),
  hasta: z.string().optional().catch(undefined),
  tipo: z.enum(["TODOS", ...TIPOS_MOVIMIENTO]).catch("TODOS"),
  categorias: z.array(z.string()).catch([]),
  cuentas: z.array(z.string()).catch([]),
  texto: z.string().max(140).optional().catch(undefined),
  pagina: z.coerce.number().int().min(1).catch(1),
});
export type FiltrosMovimientos = z.output<typeof esquemaFiltrosMovimientos>;
