"use client";

import { Lightbulb } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { formatearDolares, formatearPorcentaje, porcentaje } from "@/lib/dinero";

import {
  DISPONIBLE_EJEMPLO_CENTAVOS,
  GAJO_RECOMENDACION,
  GASTO_TOTAL_EJEMPLO_CENTAVOS,
  GASTOS_EJEMPLO,
  INGRESO_EJEMPLO_CENTAVOS,
  PROMEDIO_RECOMENDACION_CENTAVOS,
} from "./datos-ejemplo";
import { AnclaMoneda } from "./ancla-moneda";
import { MonedaAbierta } from "./moneda-abierta";

/** Progreso de la moneda que muestra cada acto cuando no hay animación. */
const PROGRESO_DE_ACTO = [0.1, 0.5, 0.85];

const recomendado = GASTOS_EJEMPLO[GAJO_RECOMENDACION];
const aumento = porcentaje(
  recomendado.centavos - PROMEDIO_RECOMENDACION_CENTAVOS,
  PROMEDIO_RECOMENDACION_CENTAVOS,
);

const ACTOS: { titulo: string; contenido: ReactNode }[] = [
  {
    titulo: "¿Cuánto me queda?",
    contenido: (
      <>
        <p>
          Antes de cualquier gráfico, la respuesta que buscas: lo que te queda este mes, con tus ingresos y
          tus gastos ya contados.
        </p>
        <p className="text-m-texto">
          Ingresaste {formatearDolares(INGRESO_EJEMPLO_CENTAVOS)} y te quedan{" "}
          <strong className="font-medium">{formatearDolares(DISPONIBLE_EJEMPLO_CENTAVOS)}</strong>.
        </p>
      </>
    ),
  },
  {
    titulo: "¿En qué se me va?",
    contenido: (
      <>
        <p>Cada gasto cae en su categoría. La moneda se abre y ves qué parte se lleva cada una.</p>
        {/* Las nueve categorías, en el orden del anillo: Entretenimiento queda nombrada antes de que
            el tercer acto la levante. Los nombres largos se parten en dos líneas, nunca se cortan. */}
        <ul className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-sm leading-snug">
          {GASTOS_EJEMPLO.map((gajo) => (
            <li key={gajo.categoria} className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                style={{ background: gajo.color }}
              />
              <span className="text-m-texto">{gajo.categoria}</span>
              <span className="ml-auto tabular-nums">
                {formatearPorcentaje(porcentaje(gajo.centavos, GASTO_TOTAL_EJEMPLO_CENTAVOS))}
              </span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    titulo: "¿Qué debería hacer?",
    contenido: (
      <>
        <p>La app compara con tus meses anteriores y te dice qué cambiar, junto al dato que lo disparó.</p>
        <div className="border-m-linea bg-m-superficie text-m-texto flex gap-3 rounded-xl border p-4">
          <Lightbulb aria-hidden="true" className="text-m-laton mt-0.5 size-5 shrink-0" />
          <p>
            Gastaste {formatearDolares(recomendado.centavos)} en{" "}
            <span
              aria-hidden="true"
              className="mx-0.5 inline-block size-2.5 rounded-full align-middle"
              style={{ background: recomendado.color }}
            />{" "}
            {recomendado.categoria}, {formatearPorcentaje(aumento)} más que tu promedio. Un presupuesto de{" "}
            {formatearDolares(PROMEDIO_RECOMENDACION_CENTAVOS)} al mes te devuelve ese dinero.
          </p>
        </div>
      </>
    ),
  },
];

function Acto({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="titular text-m-texto text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">{titulo}</h3>
      <div className="text-m-texto-2 flex max-w-[46ch] flex-col gap-4 text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}

const CONSULTA_MOVIMIENTO = "(prefers-reduced-motion: reduce)";

function suscribirMovimiento(avisar: () => void) {
  const consulta = window.matchMedia(CONSULTA_MOVIMIENTO);
  consulta.addEventListener("change", avisar);
  return () => consulta.removeEventListener("change", avisar);
}

function movimientoPermitido() {
  return !window.matchMedia(CONSULTA_MOVIMIENTO).matches;
}

const ETIQUETA_EJEMPLO = <p className="grabado text-m-texto-3 text-center text-[11px]">Datos de ejemplo</p>;

/**
 * La interacción firma de la landing: al bajar, la moneda pasa por tres actos. Arranca estática
 * (así se ve sin JavaScript y con "reducir movimiento") y, si se permite movimiento, se convierte en
 * una escena fija que avanza con el scroll.
 */
export function SecuenciaMoneda() {
  // En el servidor y sin JavaScript la secuencia es estática; en el navegador, animada si se permite.
  const animada = useSyncExternalStore(suscribirMovimiento, movimientoPermitido, () => false);
  const [progreso, setProgreso] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animada) return;
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const caja = contenedor.current?.getBoundingClientRect();
      if (!caja) return;
      const recorrido = caja.height - window.innerHeight;
      setProgreso(Math.min(1, Math.max(0, -caja.top / recorrido)));
    };
    const alMover = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    cuadro = requestAnimationFrame(medir);
    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);
    return () => {
      window.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", alMover);
      cancelAnimationFrame(cuadro);
    };
  }, [animada]);

  if (!animada) {
    return (
      <div className="flex flex-col gap-24">
        {ACTOS.map((acto, i) => (
          <div key={acto.titulo} className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr]">
            <Acto titulo={acto.titulo}>{acto.contenido}</Acto>
            <figure className="flex flex-col gap-3">
              <MonedaAbierta progreso={PROGRESO_DE_ACTO[i]} className="mx-auto w-full max-w-[420px]" />
              <figcaption>{ETIQUETA_EJEMPLO}</figcaption>
            </figure>
          </div>
        ))}
      </div>
    );
  }

  const actoActual = progreso < 0.3 ? 0 : progreso < 0.64 ? 1 : 2;
  // Al terminar la secuencia, la leyenda y la barra se desvanecen antes de que la moneda se vaya.
  const salidaSecuencia = Math.min(1, Math.max(0, (1 - progreso) / 0.08));

  return (
    <div ref={contenedor} data-secuencia className="relative h-[360vh]">
      <div className="sticky top-16 grid h-[calc(100svh-4rem)] grid-rows-[auto_1fr] items-center gap-6 py-10 md:grid-cols-[1fr_1.1fr] md:grid-rows-1 md:gap-12">
        <div className="relative order-2 grid md:order-1">
          {ACTOS.map((acto, i) => (
            <div
              key={acto.titulo}
              aria-hidden={i !== actoActual}
              className="col-start-1 row-start-1 transition-[opacity,translate,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                opacity: i === actoActual ? 1 : 0,
                translate: `0 ${i === actoActual ? 0 : i < actoActual ? -24 : 24}px`,
                filter: i === actoActual ? "none" : "blur(6px)",
              }}
            >
              <Acto titulo={acto.titulo}>{acto.contenido}</Acto>
            </div>
          ))}
        </div>
        <figure className="order-1 flex flex-col gap-3 md:order-2">
          {/* Aquí se posa la moneda viajera, que se abre siguiendo este mismo progreso. */}
          <AnclaMoneda
            nombre="actos"
            className="mx-auto w-full max-w-[min(400px,36svh)] md:max-w-[min(440px,58svh)]"
          />
          {/* La moneda abierta dibuja un poco más grande que su ancla: la leyenda le deja espacio. */}
          <figcaption className="mt-[12%] transition-opacity" style={{ opacity: salidaSecuencia }}>
            {ETIQUETA_EJEMPLO}
          </figcaption>
          <div
            style={{ opacity: salidaSecuencia }}
            className="bg-m-linea mx-auto h-0.5 w-40 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <div className="bg-m-laton h-full origin-left" style={{ transform: `scaleX(${progreso})` }} />
          </div>
        </figure>
      </div>
    </div>
  );
}
