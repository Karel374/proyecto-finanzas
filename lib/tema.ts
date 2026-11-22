import { z } from "zod";

/** Temas de la sección 3. SISTEMA sigue la preferencia del sistema operativo. */
export const TEMAS = ["CLARO", "OSCURO", "SISTEMA"] as const;
export type TemaApp = (typeof TEMAS)[number];

export const esquemaTema = z.enum(TEMAS);

/** Cookie que recuerda el tema para pintarlo antes de que cargue la página, sin parpadeo. */
export const COOKIE_TEMA = "tema";

/** Valor del atributo `data-tema` del <html>. SISTEMA no pone atributo y manda la media query. */
export function atributoTema(tema: TemaApp): "claro" | "oscuro" | null {
  if (tema === "CLARO") return "claro";
  if (tema === "OSCURO") return "oscuro";
  return null;
}

/**
 * Script que corre en <head> antes de pintar: lee la cookie y pone `data-tema` en el <html>.
 * Va como texto porque se inyecta en línea; no depende de React.
 */
export const SCRIPT_TEMA = `(function(){try{var m=document.cookie.match(/(?:^|; )${COOKIE_TEMA}=(CLARO|OSCURO)/);if(m){document.documentElement.setAttribute("data-tema",m[1]==="CLARO"?"claro":"oscuro");}}catch(e){}})();`;
