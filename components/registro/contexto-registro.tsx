"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** Movimiento que se edita en el panel: lo mínimo para precargar el formulario. */
export type MovimientoEditable = {
  id: string;
  tipo: "GASTO" | "INGRESO";
  montoCentavos: number;
  categoriaId: string;
  cuentaId: string;
  fecha: string;
  nota: string | null;
};

/** `apertura` sube cada vez que se abre el panel, para que su contenido arranque de cero. */
type Estado = { abierto: boolean; editando: MovimientoEditable | null; apertura: number };

type Contexto = Estado & {
  abrir: () => void;
  editar: (movimiento: MovimientoEditable) => void;
  cerrar: () => void;
};

const ContextoRegistro = createContext<Contexto | null>(null);

/** true si el usuario está escribiendo: ahí la tecla N es una letra, no un atajo. */
function escribiendoEn(objetivo: EventTarget | null): boolean {
  if (!(objetivo instanceof HTMLElement)) return false;
  return objetivo.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(objetivo.tagName);
}

/**
 * Estado del panel de registro (sección 7): se abre desde cualquier pantalla con el botón
 * "Registrar" o la tecla N, y también para editar un movimiento.
 */
export function ProveedorRegistro({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ abierto: false, editando: null, apertura: 0 });

  const abrir = useCallback(
    () => setEstado((anterior) => ({ abierto: true, editando: null, apertura: anterior.apertura + 1 })),
    [],
  );
  const editar = useCallback(
    (movimiento: MovimientoEditable) =>
      setEstado((anterior) => ({ abierto: true, editando: movimiento, apertura: anterior.apertura + 1 })),
    [],
  );
  const cerrar = useCallback(() => setEstado((anterior) => ({ ...anterior, abierto: false })), []);

  useEffect(() => {
    function alPulsar(evento: KeyboardEvent) {
      if (evento.key !== "n" && evento.key !== "N") return;
      if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.repeat) return;
      if (escribiendoEn(evento.target) || document.querySelector('[role="dialog"]')) return;
      evento.preventDefault();
      abrir();
    }
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abrir]);

  const valor = useMemo(() => ({ ...estado, abrir, editar, cerrar }), [estado, abrir, editar, cerrar]);
  return <ContextoRegistro.Provider value={valor}>{children}</ContextoRegistro.Provider>;
}

export function useRegistro(): Contexto {
  const contexto = useContext(ContextoRegistro);
  if (!contexto) throw new Error("useRegistro debe usarse dentro de ProveedorRegistro");
  return contexto;
}
