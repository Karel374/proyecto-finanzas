"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import {
  desvioEn,
  limitar,
  mezclar,
  muestrearTrayecto,
  pendienteEn,
  rutaSvg,
  type Tramo,
} from "@/lib/landing/trayecto";

import { EVENTO_ESCENA_LISTA, EVENTO_FIN_ENTRADA, EVENTO_TITULO, moneda } from "./estado-moneda";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EscenaMoneda = dynamic(() => import("./escena-moneda"), { ssr: false });

const CLAVE_ENTRADA = "kanomics-entrada-vista";
const INCLINACION_VIAJE = 0.78;

interface Medidas {
  vw: number;
  vh: number;
  movil: boolean;
  carril: number;
  amplitud: number;
  inicioMain: number;
  heroX: number;
  heroY: number;
  heroDiametro: number;
  inicioTrazo: number;
  ranuraX: number;
  ranuraY: number;
  ranuraDiametro: number;
  tramos: Tramo[];
}

function soportaWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

function leerSesion(clave: string): string | null {
  try {
    return sessionStorage.getItem(clave);
  } catch {
    return null;
  }
}

function guardarSesion(clave: string, valor: string) {
  try {
    sessionStorage.setItem(clave, valor);
  } catch {
    /* modo privado: la entrada se repetirá, no pasa nada */
  }
}

/** Muestra el nombre del hero letra por letra; con `inmediato`, sin animación. */
function revelarNombre(inmediato: boolean) {
  const raiz = document.documentElement;
  if (raiz.dataset.entrada !== "pendiente") return;
  const letras = document.querySelectorAll<HTMLElement>("[data-letra]");
  const resto = document.querySelectorAll<HTMLElement>("[data-tras-entrada]");
  if (inmediato) {
    delete raiz.dataset.entrada;
    return;
  }
  gsap.set([...letras, ...resto], { autoAlpha: 0 });
  delete raiz.dataset.entrada;
  gsap
    .timeline()
    .fromTo(
      letras,
      { autoAlpha: 0, yPercent: 38, filter: "blur(14px)" },
      { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration: 1.1, ease: "expo.out", stagger: 0.075 },
    )
    .fromTo(
      resto,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, clearProps: "transform" },
      "-=0.6",
    );
}

/**
 * Cerebro de la landing: scroll suave, la moneda que viaja y dibuja su línea, y las apariciones
 * de cada capítulo. Sin movimiento reducido ni WebGL, no anima nada y el contenido queda completo.
 */
export function ControladorLanding({ lema }: { lema: string }) {
  const [con3D, setCon3D] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const camino = useRef<SVGPathElement>(null);
  const trazo = useRef<SVGPathElement>(null);
  const recorte = useRef<SVGRectElement>(null);
  const degradado = useRef<SVGLinearGradientElement>(null);

  // Decide si hay entrada y 3D. La entrada solo corre una vez por sesión.
  useEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const webgl = soportaWebGL();
    const yaVista = leerSesion(CLAVE_ENTRADA) === "1";
    moneda.conEntrada = webgl && !reducir && !yaVista;

    if (!moneda.conEntrada) revelarNombre(true);
    if (!webgl) return;

    // El 3D se carga cuando el navegador queda libre: el texto ya está pintado.
    const cargar = () => setCon3D(true);
    const idle = window.requestIdleCallback?.(cargar, { timeout: 900 });
    const respaldo = idle === undefined ? window.setTimeout(cargar, 200) : undefined;

    // Si la escena no llega a tiempo, el nombre aparece igual.
    const plazo = window.setTimeout(() => revelarNombre(false), 3200);
    const alTitulo = () => {
      window.clearTimeout(plazo);
      revelarNombre(false);
    };
    const alFin = () => guardarSesion(CLAVE_ENTRADA, "1");
    const alLista = () => window.clearTimeout(plazo);
    const saltar = () => {
      moneda.saltarEntrada = true;
    };

    window.addEventListener(EVENTO_TITULO, alTitulo);
    window.addEventListener(EVENTO_FIN_ENTRADA, alFin);
    window.addEventListener(EVENTO_ESCENA_LISTA, alLista);
    const opciones = { passive: true } as const;
    for (const ev of ["wheel", "touchstart", "keydown", "pointerdown"])
      window.addEventListener(ev, saltar, opciones);

    return () => {
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (respaldo !== undefined) window.clearTimeout(respaldo);
      window.clearTimeout(plazo);
      window.removeEventListener(EVENTO_TITULO, alTitulo);
      window.removeEventListener(EVENTO_FIN_ENTRADA, alFin);
      window.removeEventListener(EVENTO_ESCENA_LISTA, alLista);
      for (const ev of ["wheel", "touchstart", "keydown", "pointerdown"])
        window.removeEventListener(ev, saltar);
    };
  }, []);

  useGSAP(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const main = document.getElementById("contenido");
    const anclaHero = document.querySelector<HTMLElement>("[data-moneda-hero]");
    const ranura = document.querySelector<HTMLElement>("[data-ranura]");
    if (!main || !anclaHero || !ranura) return;

    // Scroll suave (solo con movimiento).
    let lenis: Lenis | null = null;
    const alTick = (tiempo: number) => lenis?.raf(tiempo * 1000);
    if (!reducir) {
      lenis = new Lenis({ anchors: { offset: -72 }, lerp: 0.085 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(alTick);
      gsap.ticker.lagSmoothing(0);
    }

    // Los gráficos de las pantallas de muestra se dibujan al llegar la moneda (ver globals.css).
    if (!reducir) document.documentElement.dataset.anima = "";

    let m: Medidas | null = null;

    const medir = () => {
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const movil = vw < 1024;
      const sy = window.scrollY;
      const rMain = main.getBoundingClientRect();
      const rHero = anclaHero.getBoundingClientRect();
      const rRanura = ranura.getBoundingClientRect();
      const inicioMain = rMain.top + sy;
      const heroY = rHero.top + sy + rHero.height / 2;
      const heroDiametro = rHero.width;
      const tramos: Tramo[] = [...document.querySelectorAll<HTMLElement>("[data-tramo]")].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          inicio: r.top + sy,
          fin: r.bottom + sy,
          tipo: el.dataset.tramo === "caotico" ? "caotico" : "recto",
        };
      });
      const ranuraY = rRanura.top + sy + rRanura.height / 2;
      const ranuraX = rRanura.left + rRanura.width / 2;
      const carril = movil ? 26 : vw / 2;
      const amplitud = movil ? 12 : Math.min(150, vw * 0.075);
      const inicioTrazo = heroY + heroDiametro * 0.55;

      m = {
        vw,
        vh,
        movil,
        carril,
        amplitud,
        inicioMain,
        heroX: rHero.left + rHero.width / 2,
        heroY,
        heroDiametro,
        inicioTrazo,
        ranuraX,
        ranuraY,
        ranuraDiametro: rRanura.width,
        tramos,
      };

      // La línea completa: punteada por delante, sólida por detrás (se revela con el recorte).
      const puntos = muestrearTrayecto(inicioTrazo, ranuraY, tramos, { carril, amplitud, paso: 6 }).map(
        (p) => ({
          x: p.x,
          y: p.y - inicioMain,
        }),
      );
      // El último tramo baja en curva hasta la ranura de la tarjeta final.
      const d = rutaSvg(puntos);
      camino.current?.setAttribute("d", d);
      trazo.current?.setAttribute("d", d);
      if (svg.current) {
        svg.current.setAttribute("viewBox", `0 0 ${vw} ${rMain.height}`);
        svg.current.style.height = `${rMain.height}px`;
      }
      // Colores del trazo: gris mientras se escapa, tinta cuando se ordena, verde al final.
      const caotico = tramos.find((t) => t.tipo === "caotico");
      if (degradado.current && caotico) {
        const largo = ranuraY - inicioTrazo || 1;
        const fraccion = (y: number) => String(limitar((y - inicioTrazo) / largo, 0, 1));
        const paradas = degradado.current.querySelectorAll("stop");
        degradado.current.setAttribute("y1", String(inicioTrazo - inicioMain));
        degradado.current.setAttribute("y2", String(ranuraY - inicioMain));
        paradas[1]?.setAttribute("offset", fraccion(caotico.fin - 40));
        paradas[2]?.setAttribute("offset", fraccion(caotico.fin + 220));
        paradas[3]?.setAttribute("offset", fraccion(ranuraY - vh * 1.1));
        paradas[4]?.setAttribute("offset", fraccion(ranuraY - vh * 0.5));
      }
      moneda.listo = true;
    };

    let firma = "";
    const actualizar = () => {
      if (!m) return;
      const sy = window.scrollY;
      const { vh } = m;
      const diametroViaje = m.movil ? 40 : limitar(m.vw * 0.068, 84, 124);

      // 0 en la primera pantalla, 1 cuando la moneda ya viaja por el carril.
      const k = reducir ? 0 : gsap.parseEase("power2.inOut")(limitar(sy / (vh * 0.6), 0, 1));

      const docViaje = sy + vh * 0.55;
      const docEf = Math.min(Math.max(docViaje, m.inicioTrazo), m.ranuraY);
      const llegada = limitar((docViaje - (m.ranuraY - vh * 0.42)) / (vh * 0.42), 0, 1);
      const suave = gsap.parseEase("power3.inOut")(llegada);

      const xCarril = m.carril + desvioEn(docEf, m.tramos, m.amplitud);
      const xViaje = mezclar(xCarril, m.ranuraX, suave);
      const yViaje = docEf - sy;
      const radioViaje = diametroViaje / 2;
      const recorrido = (docEf - m.inicioTrazo) / radioViaje;
      const recorridoTotal = (m.ranuraY - m.inicioTrazo) / radioViaje;
      const vueltaCompleta = Math.ceil(recorridoTotal / (Math.PI * 2)) * Math.PI * 2;

      moneda.x = mezclar(m.heroX, xViaje, k);
      moneda.y = mezclar(m.heroY - sy, yViaje, k);
      moneda.diametro = mezclar(m.heroDiametro, mezclar(diametroViaje, m.ranuraDiametro, suave), k);
      moneda.inclinacion = mezclar(Math.PI / 2, mezclar(INCLINACION_VIAJE, Math.PI / 2, suave), k);
      moneda.rodado = k * (recorrido + (vueltaCompleta - recorridoTotal) * suave);
      moneda.rumbo = k * (1 - suave) * -Math.atan(pendienteEn(docEf, m.tramos, m.amplitud)) * 1.2;
      moneda.modoSombra = k * (1 - suave * 0.6);

      const nueva = [moneda.x, moneda.y, moneda.diametro, moneda.inclinacion, moneda.rodado, moneda.rumbo]
        .map((v) => v.toFixed(2))
        .join();
      if (nueva !== firma) {
        firma = nueva;
        moneda.redibujar();
      }

      // La línea sólida llega justo hasta la moneda.
      if (recorte.current) {
        const hasta = reducir ? 0 : Math.max(0, moneda.y + sy - m.inicioMain);
        recorte.current.setAttribute("height", String(hasta));
      }
    };

    medir();
    actualizar();
    gsap.ticker.add(actualizar);
    const observador = new ResizeObserver(() => {
      medir();
      ScrollTrigger.refresh();
    });
    observador.observe(main);
    void document.fonts.ready.then(() => {
      medir();
      ScrollTrigger.refresh();
    });

    // Las estaciones se encienden cuando la moneda pasa por ellas.
    for (const estacion of document.querySelectorAll<HTMLElement>("[data-estacion]")) {
      ScrollTrigger.create({
        trigger: estacion,
        start: "top 58%",
        onEnter: () => estacion.setAttribute("data-activa", ""),
        onLeaveBack: () => estacion.removeAttribute("data-activa"),
      });
    }

    if (!reducir) {
      // Titulares palabra por palabra, como un rótulo de cine.
      for (const titular of document.querySelectorAll<HTMLElement>("[data-titular]")) {
        gsap.from(titular.querySelectorAll(".palabra > span"), {
          yPercent: 110,
          rotate: 2,
          duration: 1.05,
          ease: "expo.out",
          stagger: 0.055,
          scrollTrigger: { trigger: titular, start: "top 86%" },
        });
      }
      for (const el of document.querySelectorAll<HTMLElement>("[data-revelar]")) {
        gsap.from(el, {
          autoAlpha: 0,
          y: 32,
          duration: 1.1,
          ease: "power3.out",
          delay: Number(el.dataset.revelar || 0),
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      }
      // El nombre gigante del hero se aleja un poco al bajar.
      gsap.to("[data-nombre-hero]", {
        yPercent: -14,
        autoAlpha: 0.35,
        ease: "none",
        scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
      });
    }

    return () => {
      gsap.ticker.remove(actualizar);
      gsap.ticker.remove(alTick);
      observador.disconnect();
      lenis?.destroy();
      moneda.listo = false;
      delete document.documentElement.dataset.anima;
    };
  });

  return (
    <>
      <svg
        ref={svg}
        className="pointer-events-none absolute inset-x-0 top-0 w-full motion-reduce:hidden"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            ref={degradado}
            id="trazo-kanomics"
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop offset="0" stopColor="var(--k-pizarra)" />
            <stop offset="0.3" stopColor="var(--k-pizarra)" />
            <stop offset="0.4" stopColor="var(--k-tinta)" />
            <stop offset="0.8" stopColor="var(--k-tinta)" />
            <stop offset="1" stopColor="var(--k-acento)" />
          </linearGradient>
          <clipPath id="recorte-trazo">
            <rect ref={recorte} x="0" y="0" width="100%" height="0" />
          </clipPath>
        </defs>
        <path
          ref={camino}
          fill="none"
          stroke="var(--k-linea-fuerte)"
          strokeWidth="1.25"
          strokeDasharray="2 9"
          strokeLinecap="round"
        />
        <path
          ref={trazo}
          fill="none"
          stroke="url(#trazo-kanomics)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#recorte-trazo)"
        />
      </svg>
      {con3D ? <EscenaMoneda lema={lema} /> : null}
    </>
  );
}
