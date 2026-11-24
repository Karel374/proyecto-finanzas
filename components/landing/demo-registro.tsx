"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Demostración del registro con teclado: N abre el panel, se escribe 3,50 y Enter guarda.
 * Recrea el panel real de la app con sus colores. Sin movimiento permitido, muestra el resultado final.
 */
const PASOS = [
  { tecla: null, monto: "", guardado: false, panel: false },
  { tecla: "N", monto: "", guardado: false, panel: true },
  { tecla: "3", monto: "3", guardado: false, panel: true },
  { tecla: ",", monto: "3,", guardado: false, panel: true },
  { tecla: "5", monto: "3,5", guardado: false, panel: true },
  { tecla: "0", monto: "3,50", guardado: false, panel: true },
  { tecla: "Enter", monto: "3,50", guardado: true, panel: false },
  { tecla: null, monto: "3,50", guardado: true, panel: false },
] as const;
const DURACIONES = [900, 700, 380, 380, 380, 700, 600, 2600];
const FINAL = PASOS.length - 1;

const CONSULTA = "(prefers-reduced-motion: reduce)";
const suscribir = (avisar: () => void) => {
  const consulta = window.matchMedia(CONSULTA);
  consulta.addEventListener("change", avisar);
  return () => consulta.removeEventListener("change", avisar);
};

const TECLAS = ["N", "3", ",", "5", "0", "Enter"];

export function DemoRegistro() {
  const conMovimiento = useSyncExternalStore(
    suscribir,
    () => !window.matchMedia(CONSULTA).matches,
    () => false,
  );
  const [paso, setPaso] = useState<number>(FINAL);
  const [visible, setVisible] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = raiz.current;
    if (!elemento) return;
    const observador = new IntersectionObserver(([entrada]) => setVisible(entrada.isIntersecting), {
      threshold: 0.4,
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!conMovimiento || !visible) return;
    const espera = window.setTimeout(
      () => setPaso((actual) => (actual >= FINAL ? 0 : actual + 1)),
      DURACIONES[paso],
    );
    return () => window.clearTimeout(espera);
  }, [conMovimiento, visible, paso]);

  const estado = conMovimiento ? PASOS[paso] : PASOS[FINAL];

  return (
    <div ref={raiz} className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" aria-hidden="true">
        {TECLAS.map((tecla) => (
          <kbd
            key={tecla}
            className={`grabado rounded-lg border px-3 py-2 text-xs transition-[background-color,color,translate,border-color] duration-150 ${
              estado.tecla === tecla
                ? "bg-m-laton text-m-sobre-laton border-m-laton translate-y-0.5"
                : "border-m-linea bg-m-superficie text-m-texto-2"
            }`}
          >
            {tecla}
          </kbd>
        ))}
      </div>

      {/* Réplica del panel de la app, con sus propios colores */}
      {/* Marco del mundo oscuro alrededor de la réplica: es una pantalla de la app vista desde la landing. */}
      <div className="border-m-linea bg-m-superficie rounded-[22px] border p-2.5 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)] sm:p-3">
        <div
          className="relative overflow-hidden rounded-2xl border border-[#dce3ef] bg-[#eef2fa] p-4 text-[#0f172a] brightness-[0.88] sm:p-5"
          role="img"
          aria-label="Ejemplo: se registra un gasto de $3,50 en Alimentación pagado en efectivo"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Movimientos</span>
            <span className="text-[#475569]">Hoy</span>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            <li
              className={`flex items-center gap-2 rounded-lg bg-white px-3 py-2 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                estado.guardado ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
              }`}
            >
              <span className="size-2.5 rounded-full bg-[#2a78d6]" />
              Alimentación
              <span className="text-[#64748b]">· Efectivo</span>
              <span className="ml-auto font-medium text-[#b91c1c]">−$3,50</span>
            </li>
            <li className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
              <span className="size-2.5 rounded-full bg-[#eb6834]" />
              Transporte
              <span className="text-[#64748b]">· Efectivo</span>
              <span className="ml-auto font-medium text-[#b91c1c]">−$0,45</span>
            </li>
            <li className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
              <span className="size-2.5 rounded-full bg-[#2a78d6]" />
              Pasantía o sueldo
              <span className="text-[#64748b]">· Banco</span>
              <span className="ml-auto font-medium text-[#15803d]">+$482,00</span>
            </li>
          </ul>

          <div
            className={`absolute inset-y-0 right-0 flex w-[62%] flex-col gap-3 border-l border-[#dce3ef] bg-white p-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              estado.panel ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <span className="text-sm font-semibold">Registrar</span>
            <span className="text-xs text-[#475569]">Monto</span>
            <span className="rounded-md border-2 border-[#2563eb] bg-[#f5f7fc] px-2.5 py-1.5 text-lg font-semibold tabular-nums">
              {estado.monto || <span className="text-[#64748b]">0,00</span>}
              <span className="ml-px inline-block h-5 w-px translate-y-0.5 animate-pulse bg-[#0f172a]" />
            </span>
            <span className="flex items-center gap-2 rounded-md border border-[#2563eb] bg-[#dbeafe] px-2 py-1 text-xs">
              <span className="size-2 rounded-full bg-[#2a78d6]" />
              Alimentación
            </span>
          </div>
        </div>
      </div>
      <p className="grabado text-m-texto-3 text-[11px]">Datos de ejemplo</p>
    </div>
  );
}
