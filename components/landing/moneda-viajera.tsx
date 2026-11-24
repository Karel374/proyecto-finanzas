"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { CaraMoneda } from "./cara-moneda";
import { MonedaAbierta } from "./moneda-abierta";

/**
 * La moneda que viaja por la landing. Una sola moneda, fija en la pantalla, que con el scroll se
 * desplaza de un ancla a la siguiente: cambia de lugar, tamaño, giro e inclinación, y al llegar a
 * los tres actos se abre en gajos. Las anclas dicen dónde y cómo debe estar en cada sección.
 */

type Pose = { giro: number; inclinacion: number; abierta: number };

/** Cómo se comporta la moneda en cada ancla: cuánto gira y cuánto se abre. */
const POSES: Record<string, Pose> = {
  hero: { giro: 1, inclinacion: 10, abierta: 0 },
  actos: { giro: 0, inclinacion: 0, abierta: 1 },
  registro: { giro: 0.6, inclinacion: 18, abierta: 0 },
  ecuador: { giro: 0.35, inclinacion: -14, abierta: 0 },
  cierre: { giro: 1, inclinacion: 8, abierta: 0 },
};

const CAPAS_CANTO = Array.from({ length: 12 }, (_, i) => i - 6);
/** Ancho de la columna de texto de la landing (max-w-6xl): fuera de ella queda el canal libre. */
const COLUMNA_TEXTO = 1152;
const CONSULTA = "(prefers-reduced-motion: reduce)";

const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;
/** Curva suave entre anclas: arranca y llega despacio, como una moneda que se posa. */
const suavizar = (t: number) => t * t * (3 - 2 * t);

function suscribir(avisar: () => void) {
  const consulta = window.matchMedia(CONSULTA);
  consulta.addEventListener("change", avisar);
  return () => consulta.removeEventListener("change", avisar);
}

/** Progreso de la secuencia de tres actos, con la misma cuenta que usa su texto. */
function progresoSecuencia(): number {
  const secuencia = document.querySelector<HTMLElement>("[data-secuencia]");
  if (!secuencia) return 0;
  const caja = secuencia.getBoundingClientRect();
  const recorrido = caja.height - window.innerHeight;
  return recorrido > 0 ? Math.min(1, Math.max(0, -caja.top / recorrido)) : 0;
}

export function MonedaViajera() {
  const conMovimiento = useSyncExternalStore(
    suscribir,
    () => !window.matchMedia(CONSULTA).matches,
    () => false,
  );
  const capa = useRef<HTMLDivElement>(null);
  const cuerpo = useRef<HTMLDivElement>(null);
  const cantos = useRef<HTMLDivElement>(null);
  const caraEntera = useRef<HTMLDivElement>(null);
  const caraAbierta = useRef<HTMLDivElement>(null);
  const [progresoActos, setProgresoActos] = useState(0);

  useEffect(() => {
    if (!conMovimiento) return;
    const raiz = document.documentElement;
    raiz.dataset.monedaViajera = "activa";

    let cuadro = 0;
    let ultimoProgreso = -1;
    const inicio = performance.now();

    const pintar = (ahora: number) => {
      cuadro = requestAnimationFrame(pintar);
      const anclas = [...document.querySelectorAll<HTMLElement>("[data-ancla]")]
        .map((elemento) => ({ nombre: elemento.dataset.ancla ?? "", caja: elemento.getBoundingClientRect() }))
        .filter((ancla) => ancla.caja.width > 0);
      if (!anclas.length || !capa.current || !cuerpo.current) return;

      // El foco es la altura de la pantalla donde la moneda "llega" a un ancla. Se toma la altura a la
      // que queda fijada el ancla de los actos: así, mientras esa escena está fija, la moneda queda
      // clavada en su ancla en cualquier pantalla (en el celular el ancla queda arriba del centro).
      const actos = document.querySelector<HTMLElement>('[data-ancla="actos"]');
      const etapa = actos?.closest<HTMLElement>(".sticky");
      const foco =
        actos && etapa
          ? actos.getBoundingClientRect().top - etapa.getBoundingClientRect().top + actos.offsetHeight / 2
          : window.innerHeight / 2;
      const centro = (caja: DOMRect) => caja.top + caja.height / 2;
      let i = anclas.findIndex((ancla, k) => k === anclas.length - 1 || centro(anclas[k + 1].caja) > foco);
      if (i < 0) i = anclas.length - 1;
      const desde = anclas[i];
      const hacia = anclas[Math.min(i + 1, anclas.length - 1)];
      const tramo = centro(hacia.caja) - centro(desde.caja);
      const t =
        desde === hacia || tramo <= 0
          ? 0
          : suavizar(Math.min(1, Math.max(0, (foco - centro(desde.caja)) / tramo)));
      const t0 = centro(desde.caja) > foco ? 0 : t;

      // En pleno viaje la moneda se achica (conserva todo su brillo) y, si la pantalla deja un margen
      // libre a la derecha de la columna de texto, viaja por ese canal: así no pasa sobre lo que se lee.
      // Al posarse en un ancla recupera su tamaño y su lugar.
      const vuelo = desde === hacia ? 0 : Math.sin(Math.PI * t0);
      const lado = mezclar(desde.caja.width, hacia.caja.width, t0) * (1 - 0.5 * vuelo);
      const centroX = mezclar(
        desde.caja.left + desde.caja.width / 2,
        hacia.caja.left + hacia.caja.width / 2,
        t0,
      );
      const centroY = mezclar(centro(desde.caja), centro(hacia.caja), t0);
      const anchoColumna = Math.min(COLUMNA_TEXTO, window.innerWidth);
      const margenDerecho = (window.innerWidth - anchoColumna) / 2;
      const canalX = window.innerWidth - margenDerecho / 2;
      const usaCanal = desde.nombre !== "hero" && margenDerecho >= lado + 16;
      // Se desplaza al canal apenas despega, y vuelve a su ancla recién al posarse.
      const x = mezclar(centroX, usaCanal ? canalX : centroX, Math.min(1, vuelo * 2.2)) - lado / 2;
      const y = centroY - lado / 2;
      const poseA = POSES[desde.nombre] ?? POSES.hero;
      const poseB = POSES[hacia.nombre] ?? POSES.hero;
      const giro = mezclar(poseA.giro, poseB.giro, t0);
      const inclinacion = mezclar(poseA.inclinacion, poseB.inclinacion, t0);
      const abierta = mezclar(poseA.abierta, poseB.abierta, t0);

      // El giro sigue al scroll y, cuando la moneda descansa, avanza solo, despacio.
      const vueltas = (window.scrollY * 0.22 + ((ahora - inicio) / 1000) * 16) * giro;
      // Entre -180° y 180°: al ponerse de frente gira por el camino corto.
      const angulo = ((((vueltas + 180) % 360) + 360) % 360) - 180;

      // Primero se pone de frente (sin giro ni inclinación) y recién entonces cambia de cara,
      // en un tramo corto: así nunca se ven las dos caras encimadas.
      const enFrente = Math.min(1, abierta / 0.45);
      const entera = Math.min(1, Math.max(0, (0.62 - abierta) / 0.04));
      capa.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      capa.current.style.width = `${lado}px`;
      cuerpo.current.style.transform = `rotateX(${inclinacion * (1 - enFrente)}deg) rotateY(${angulo * (1 - enFrente)}deg)`;
      if (cantos.current) cantos.current.style.opacity = String(entera);
      if (caraEntera.current) caraEntera.current.style.opacity = String(entera);
      if (caraAbierta.current) caraAbierta.current.style.opacity = String(1 - entera);

      // La moneda abierta solo se vuelve a dibujar cuando su progreso cambia.
      const progreso = abierta > 0 ? progresoSecuencia() : 0;
      if (Math.abs(progreso - ultimoProgreso) > 0.002) {
        ultimoProgreso = progreso;
        setProgresoActos(progreso);
      }
    };
    cuadro = requestAnimationFrame(pintar);

    return () => {
      cancelAnimationFrame(cuadro);
      delete raiz.dataset.monedaViajera;
    };
  }, [conMovimiento]);

  if (!conMovimiento) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        ref={capa}
        className="absolute top-0 left-0 aspect-square will-change-transform"
        style={{ perspective: "1400px" }}
      >
        <div ref={cuerpo} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          <div ref={caraEntera} className="moneda-cara">
            <CaraMoneda className="size-full" />
          </div>
          {/* La moneda abierta dibuja su anillo con margen: se agranda para calzar con la entera. */}
          <div
            ref={caraAbierta}
            className="absolute inset-0"
            style={{ opacity: 0, transform: "scale(1.16)" }}
          >
            <MonedaAbierta progreso={progresoActos} className="size-full" />
          </div>
          <div ref={cantos} style={{ transformStyle: "preserve-3d" }} className="absolute inset-0">
            {CAPAS_CANTO.map((z) => (
              <div key={z} className="moneda-canto" style={{ transform: `translateZ(${z}px)` }} />
            ))}
          </div>
          <div className="moneda-cara moneda-cara-reverso">
            <CaraMoneda reverso className="size-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
