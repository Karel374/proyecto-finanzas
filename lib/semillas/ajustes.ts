/**
 * Valores de Ajustes que no son el valor por defecto de la columna (sección 23).
 * Los demás (tema SISTEMA, $5,00 de gasto hormiga, 6 meses de fondo, 9,45 % de IESS,
 * 30 % no facturable, 20 % de colchón, multiplicador 25, día de revisión 1,
 * límite de cobertura de $32.000) ya los pone el esquema.
 */

/** Distribución de partida por perfil, en porcentajes enteros (sección 12). Editable por el usuario. */
export const DISTRIBUCION_OBJETIVO_SEMILLA = {
  CONSERVADOR: { polizasDepositos: 60, fondosInversion: 25, etfsGlobales: 15, cripto: 0 },
  MODERADO: { polizasDepositos: 35, fondosInversion: 25, etfsGlobales: 40, cripto: 0 },
  AGRESIVO: { polizasDepositos: 15, fondosInversion: 15, etfsGlobales: 65, cripto: 5 },
} as const;

/** Una plantilla base de cada tipo (sección 13). Los campos entre llaves se rellenan al usarla. */
export const PLANTILLAS_MENSAJE_SEMILLA = {
  contacto:
    "Hola, {cliente}. Soy {mi_nombre}, {mi_profesion}. Ayudo a negocios como el tuyo con {servicio}. " +
    "Trabajo con {habilidades}. ¿Te parece si conversamos 15 minutos esta semana para ver si te puedo ayudar?",
  propuesta:
    "Hola, {cliente}. Gracias por tu tiempo. Te envío la propuesta de {servicio}.\n\n" +
    "Qué incluye: lo que conversamos, con las herramientas {habilidades}.\n" +
    "Precio: {precio}.\n\n" +
    "Si estás de acuerdo, coordinamos la fecha de inicio. Quedo atento a cualquier duda.\n\n{mi_nombre}",
} as const;
