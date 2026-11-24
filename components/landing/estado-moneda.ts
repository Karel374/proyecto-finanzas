/**
 * Estado compartido entre el controlador del scroll (DOM) y la escena 3D. Es un objeto mutable
 * a propósito: se escribe y se lee en cada cuadro, y pasar por React costaría un render por cuadro.
 * Las medidas van en píxeles de la ventana.
 */
export const moneda = {
  /** Centro de la moneda en la ventana. */
  x: 0,
  y: 0,
  diametro: 0,
  /** Giro sobre el eje vertical de la pantalla: π/2 es de frente, menos es más acostada. */
  inclinacion: Math.PI / 2,
  /** Ladeo sobre el eje de la vista, hacia donde gira la línea. */
  rumbo: 0,
  /** Giro sobre su propio eje, como una rueda. */
  rodado: 0,
  /** 0: sombra en el piso (primera pantalla); 1: sombra proyectada sobre la página (viaje). */
  modoSombra: 0,
  /** El controlador ya midió la página y los valores son válidos. */
  listo: false,
  /** La entrada (caída y giro) debe correr; si es false, la moneda aparece ya posada. */
  conEntrada: true,
  /** Pide terminar la entrada ya (el usuario hizo scroll o clic). */
  saltarEntrada: false,
  /** Pide un cuadro nuevo a la escena; la escena lo conecta al montarse. Sin cambios, no se redibuja. */
  redibujar: () => {},
};

/** Eventos que la escena avisa al DOM durante la entrada. */
export const EVENTO_TITULO = "kanomics:titulo";
export const EVENTO_FIN_ENTRADA = "kanomics:fin-entrada";
export const EVENTO_ESCENA_LISTA = "kanomics:escena-lista";
