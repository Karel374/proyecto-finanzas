"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type Aviso = {
  id: number;
  mensaje: string;
  tipo: "exito" | "error";
  accion?: { etiqueta: string; hacer: () => void };
};

type Contexto = {
  mostrar: (aviso: Omit<Aviso, "id">, duracionMs?: number) => void;
};

const ContextoAvisos = createContext<Contexto | null>(null);

/**
 * Avisos breves abajo a la derecha. Se anuncian a los lectores de pantalla (aria-live) y cada uno
 * lleva ícono y texto. El de borrar trae "Deshacer" durante 5 segundos (sección 6).
 */
export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const siguiente = useRef(1);

  const cerrar = useCallback((id: number) => setAvisos((lista) => lista.filter((a) => a.id !== id)), []);

  const mostrar = useCallback<Contexto["mostrar"]>(
    (aviso, duracionMs = 5000) => {
      const id = siguiente.current++;
      setAvisos((lista) => [...lista.slice(-2), { ...aviso, id }]);
      window.setTimeout(() => cerrar(id), duracionMs);
    },
    [cerrar],
  );

  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <ContextoAvisos.Provider value={valor}>
      {children}
      <div aria-live="polite" className="fixed right-6 bottom-6 z-[60] flex w-80 flex-col gap-2">
        {avisos.map((aviso) => {
          const Icono = aviso.tipo === "exito" ? CircleCheck : CircleAlert;
          return (
            <div
              key={aviso.id}
              role="status"
              className="border-borde bg-superficie text-texto flex items-start gap-3 rounded-lg border p-3 text-sm shadow-lg"
            >
              <Icono
                aria-hidden="true"
                className={`mt-0.5 size-4 shrink-0 ${aviso.tipo === "exito" ? "text-ingreso" : "text-gasto"}`}
              />
              <p className="flex-1">{aviso.mensaje}</p>
              {aviso.accion ? (
                <button
                  type="button"
                  className="text-acento focus-visible:outline-acento shrink-0 rounded font-medium hover:underline focus-visible:outline-2"
                  onClick={() => {
                    aviso.accion?.hacer();
                    cerrar(aviso.id);
                  }}
                >
                  {aviso.accion.etiqueta}
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Cerrar aviso"
                onClick={() => cerrar(aviso.id)}
                className="text-texto-3 hover:text-texto focus-visible:outline-acento shrink-0 rounded focus-visible:outline-2"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ContextoAvisos.Provider>
  );
}

export function useAvisos(): Contexto {
  const contexto = useContext(ContextoAvisos);
  if (!contexto) throw new Error("useAvisos debe usarse dentro de ProveedorAvisos");
  return contexto;
}
