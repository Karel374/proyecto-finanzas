/**
 * Generación de recurrentes (sección 7). Función pura: dada una regla y un tramo de fechas,
 * devuelve las fechas de sus ocurrencias. La base y el cron solo guardan lo que esto calcula.
 */
import { compararFechas, diaDeLaSemana, fechaConDiaAjustado, sumarDias, type FechaISO } from "@/lib/fechas";

export type Frecuencia = "SEMANAL" | "MENSUAL" | "ANUAL";

export type ReglaRecurrente = {
  frecuencia: Frecuencia;
  /** 1 = lunes … 7 = domingo. Solo SEMANAL. */
  diaSemana: number | null;
  /** 1 a 31. MENSUAL y ANUAL. Si el mes no tiene ese día, cae el último. */
  diaMes: number | null;
  /** 1 a 12. Solo ANUAL. */
  mes: number | null;
  fechaInicio: FechaISO;
  fechaFin: FechaISO | null;
  activo: boolean;
  ultimaGenerada: FechaISO | null;
};

export const ETIQUETAS_FRECUENCIA: Record<Frecuencia, string> = {
  SEMANAL: "Cada semana",
  MENSUAL: "Cada mes",
  ANUAL: "Cada año",
};

function maxFecha(a: FechaISO, b: FechaISO): FechaISO {
  return compararFechas(a, b) >= 0 ? a : b;
}

function minFecha(a: FechaISO, b: FechaISO): FechaISO {
  return compararFechas(a, b) <= 0 ? a : b;
}

/** true si la regla tiene los campos que su frecuencia necesita. */
export function reglaValida(
  regla: Pick<ReglaRecurrente, "frecuencia" | "diaSemana" | "diaMes" | "mes">,
): boolean {
  const entre = (valor: number | null, min: number, max: number) =>
    valor !== null && Number.isInteger(valor) && valor >= min && valor <= max;
  switch (regla.frecuencia) {
    case "SEMANAL":
      return entre(regla.diaSemana, 1, 7);
    case "MENSUAL":
      return entre(regla.diaMes, 1, 31);
    case "ANUAL":
      return entre(regla.diaMes, 1, 31) && entre(regla.mes, 1, 12);
  }
}

/**
 * Fechas de las ocurrencias de la regla entre `desde` y `hasta`, las dos incluidas,
 * respetando fechaInicio y fechaFin. No mira `activo` ni `ultimaGenerada`.
 */
export function ocurrenciasEntre(regla: ReglaRecurrente, desde: FechaISO, hasta: FechaISO): FechaISO[] {
  if (!reglaValida(regla)) throw new Error("Regla de recurrente incompleta");
  const inicio = maxFecha(desde, regla.fechaInicio);
  const fin = regla.fechaFin ? minFecha(hasta, regla.fechaFin) : hasta;
  if (compararFechas(inicio, fin) > 0) return [];

  const fechas: FechaISO[] = [];
  const dentro = (fecha: FechaISO) => compararFechas(fecha, inicio) >= 0 && compararFechas(fecha, fin) <= 0;

  switch (regla.frecuencia) {
    case "SEMANAL": {
      const salto = ((regla.diaSemana as number) - diaDeLaSemana(inicio) + 7) % 7;
      for (
        let fecha = sumarDias(inicio, salto);
        compararFechas(fecha, fin) <= 0;
        fecha = sumarDias(fecha, 7)
      ) {
        fechas.push(fecha);
      }
      break;
    }
    case "MENSUAL": {
      let [anio, mes] = inicio.split("-").map(Number);
      const [anioFin, mesFin] = fin.split("-").map(Number);
      while (anio < anioFin || (anio === anioFin && mes <= mesFin)) {
        const fecha = fechaConDiaAjustado(anio, mes, regla.diaMes as number);
        if (dentro(fecha)) fechas.push(fecha);
        mes += 1;
        if (mes > 12) {
          mes = 1;
          anio += 1;
        }
      }
      break;
    }
    case "ANUAL": {
      const anioInicio = Number(inicio.slice(0, 4));
      const anioFin = Number(fin.slice(0, 4));
      for (let anio = anioInicio; anio <= anioFin; anio++) {
        const fecha = fechaConDiaAjustado(anio, regla.mes as number, regla.diaMes as number);
        if (dentro(fecha)) fechas.push(fecha);
      }
      break;
    }
  }
  return fechas;
}

/**
 * Ocurrencias que el cron debe crear hoy: las posteriores a `ultimaGenerada` (o desde fechaInicio
 * si nunca generó) y hasta hoy. Una regla en pausa no genera nada.
 */
export function ocurrenciasPendientes(regla: ReglaRecurrente, hoyISO: FechaISO): FechaISO[] {
  if (!regla.activo) return [];
  const desde = regla.ultimaGenerada ? sumarDias(regla.ultimaGenerada, 1) : regla.fechaInicio;
  return ocurrenciasEntre(regla, desde, hoyISO);
}

/**
 * Ocurrencias que todavía no llegan pero caen en el mes actual: los "recurrentes pendientes del mes"
 * que usa la proyección de la sección 8.
 */
export function pendientesDelMes(regla: ReglaRecurrente, hoyISO: FechaISO, finDelMes: FechaISO): FechaISO[] {
  if (!regla.activo) return [];
  return ocurrenciasEntre(regla, sumarDias(hoyISO, 1), finDelMes);
}

/** Texto corto de la regla para la lista: "Cada mes, el día 31". */
export function describirRegla(
  regla: Pick<ReglaRecurrente, "frecuencia" | "diaSemana" | "diaMes" | "mes">,
): string {
  const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  const MESES = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  switch (regla.frecuencia) {
    case "SEMANAL":
      return `Cada ${DIAS[(regla.diaSemana ?? 1) - 1]}`;
    case "MENSUAL":
      return `Cada mes, el día ${regla.diaMes}`;
    case "ANUAL":
      return `Cada año, el ${regla.diaMes} de ${MESES[(regla.mes ?? 1) - 1]}`;
  }
}
