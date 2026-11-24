import type { ReactNode } from "react";

import type { Estado, TextosLanding } from "@/lib/landing/textos";

/** Titular que el controlador revela palabra por palabra. El texto completo queda para lectores de pantalla. */
export function Titular({
  texto,
  como: Etiqueta = "h2",
  className = "",
}: {
  texto: string;
  como?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Etiqueta data-titular className={`k-titular ${className}`} aria-label={texto}>
      {texto.split(" ").map((palabra, i) => (
        <span key={i} aria-hidden="true">
          <span className="palabra">
            <span>{palabra}</span>
          </span>{" "}
        </span>
      ))}
    </Etiqueta>
  );
}

/** Marca: una moneda pequeña con la K, y el nombre. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <defs>
          <linearGradient id="logo-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e9eef4" />
            <stop offset="0.5" stopColor="#a9b6c5" />
            <stop offset="1" stopColor="#6c8199" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="15" fill="url(#logo-metal)" />
        <circle cx="16" cy="16" r="12.2" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" />
        <path
          d="M12 9.5v13M12 16.4l7-6.9M14.6 13.9l5 8.6"
          stroke="#0e1116"
          strokeWidth="2.1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="text-[1.05rem] font-semibold tracking-[-0.03em]">Kanomics</span>
    </span>
  );
}

export function EtiquetaEstado({ estado, textos }: { estado: Estado; textos: TextosLanding }) {
  const disponible = estado === "disponible";
  return (
    <span
      className={`k-rotulo inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] ${
        disponible ? "bg-k-acento-suave text-k-acento-texto" : "bg-k-fondo-2 text-k-tinta-2"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${disponible ? "bg-k-acento" : "border-k-tinta-3 border"}`}
      />
      {textos.estados[estado]}
    </span>
  );
}

/** Marco de una pantalla de muestra: barra superior y la etiqueta de datos de ejemplo. */
function Pantalla({
  titulo,
  textos,
  children,
}: {
  titulo: string;
  textos: TextosLanding;
  children: ReactNode;
}) {
  return (
    <figure className="border-k-linea bg-k-fondo relative w-full overflow-hidden rounded-[1.4rem] border shadow-[0_1px_0_rgba(14,17,22,0.04),0_40px_80px_-40px_rgba(30,45,70,0.35)]">
      <figcaption className="border-k-linea flex items-center justify-between border-b px-5 py-3.5">
        <span className="text-sm font-medium">{titulo}</span>
        <span className="k-rotulo text-k-tinta-3 text-[0.62rem]">{textos.ejemplo}</span>
      </figcaption>
      <div className="p-5 sm:p-6">{children}</div>
    </figure>
  );
}

export function PantallaRegistro({ textos, idioma }: { textos: TextosLanding; idioma: "es" | "en" }) {
  const t = textos.registro;
  return (
    <Pantalla titulo={t.titulo} textos={textos}>
      <p className="k-rotulo text-k-tinta-3 text-[0.65rem]">{t.monto}</p>
      <p className="k-cifra mt-2 flex items-baseline gap-1 text-[clamp(2.5rem,5vw,3.5rem)] leading-none font-light tracking-[-0.04em]">
        <span className="text-k-tinta-3">$</span>4{idioma === "en" ? "." : ","}50
        <span
          aria-hidden="true"
          className="k-cursor bg-k-tinta ml-1 inline-block h-[0.8em] w-[2px] self-center"
        />
      </p>
      <p className="k-rotulo text-k-tinta-3 mt-6 text-[0.65rem]">{t.categoria}</p>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {t.categorias.map((c, i) => (
          <li
            key={c}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${
              i === 0 ? "bg-k-tinta border-k-tinta text-k-sobre-tinta" : "border-k-linea text-k-tinta-2"
            }`}
          >
            {c}
          </li>
        ))}
      </ul>
      <div className="border-k-linea mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-k-tinta-2 text-sm">{t.cuenta}</span>
        <span className="flex items-center gap-2">
          <kbd className="k-rotulo border-k-linea text-k-tinta-2 rounded-md border px-1.5 py-0.5 text-[0.62rem]">
            Enter ↵
          </kbd>
          <span className="bg-k-tinta text-k-sobre-tinta rounded-full px-4 py-1.5 text-sm">{t.guardar}</span>
        </span>
      </div>
    </Pantalla>
  );
}

/** Anillo de gastos y barras por semana, con montos de ejemplo. */
export function PantallaPanel({ textos, idioma }: { textos: TextosLanding; idioma: "es" | "en" }) {
  const t = textos.panel;
  const partes = [0.34, 0.24, 0.17, 0.14, 0.11];
  const colores = ["var(--k-cat-1)", "var(--k-cat-2)", "var(--k-cat-3)", "var(--k-cat-4)", "var(--k-cat-5)"];
  const radio = 44;
  const largo = 2 * Math.PI * radio;
  const separacion = 3;
  let acumulado = 0;
  const semanas = [0.62, 0.9, 0.48, 0.74];

  return (
    <Pantalla titulo={t.titulo} textos={textos}>
      <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        <div className="relative mx-auto size-40">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={radio} fill="none" stroke="var(--k-fondo-2)" strokeWidth="12" />
            {partes.map((p, i) => {
              const tramo = p * largo - separacion;
              const desfase = -acumulado * largo;
              acumulado += p;
              return (
                <circle
                  key={i}
                  className="k-gajo"
                  cx="60"
                  cy="60"
                  r={radio}
                  fill="none"
                  stroke={colores[i]}
                  strokeWidth="12"
                  strokeDasharray={`${tramo} ${largo}`}
                  strokeDashoffset={desfase}
                  style={{ ["--largo" as string]: `${desfase + tramo}`, transitionDelay: `${i * 90}ms` }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <span className="k-rotulo text-k-tinta-3 text-[0.58rem]">{t.queda}</span>
            <span className="k-cifra text-xl font-medium tracking-[-0.03em]">
              {idioma === "es" ? "$642,30" : "$642.30"}
            </span>
          </div>
        </div>
        <ul className="grid gap-2 text-sm">
          {t.categorias.map((c, i) => (
            <li key={c} className="flex items-center justify-between gap-4">
              <span className="text-k-tinta-2 flex items-center gap-2">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ background: colores[i] }} />
                {c}
              </span>
              <span className="k-cifra">{Math.round(partes[i]! * 100)} %</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-k-linea mt-6 border-t pt-4">
        <p className="k-rotulo text-k-tinta-3 text-[0.62rem]">{t.gastado}</p>
        <div className="mt-3 flex h-20 items-end gap-3">
          {semanas.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`k-barra w-full rounded-md ${i === 1 ? "bg-k-tinta" : "bg-k-fondo-3"}`}
                style={{ height: `${h * 100}%`, transitionDelay: `${300 + i * 80}ms` }}
              />
              <span className="k-rotulo text-k-tinta-3 text-[0.58rem]">{t.semanas[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </Pantalla>
  );
}

export function PantallaConsejo({ textos }: { textos: TextosLanding }) {
  const t = textos.consejo;
  return (
    <Pantalla titulo={t.titulo} textos={textos}>
      <p className="text-[1.35rem] leading-snug tracking-[-0.02em]">{t.texto}</p>
      <div className="bg-k-fondo-2 mt-5 rounded-2xl p-4">
        <p className="k-rotulo text-k-tinta-3 text-[0.62rem]">{t.porque}</p>
        <p className="text-k-tinta-2 mt-1.5 text-sm leading-relaxed">{t.dato}</p>
        <div className="mt-4 grid gap-2" aria-hidden="true">
          <div className="flex items-center gap-3">
            <div className="bg-k-fondo-3 h-2 flex-1 overflow-hidden rounded-full">
              <div className="k-barra bg-k-pizarra h-full w-[60%] origin-left rounded-full" />
            </div>
            <span className="k-cifra text-k-tinta-3 w-10 text-right text-xs">$60</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-k-fondo-3 h-2 flex-1 overflow-hidden rounded-full">
              <div className="k-barra bg-k-tinta h-full w-[84%] origin-left rounded-full" />
            </div>
            <span className="k-cifra w-10 text-right text-xs">$84</span>
          </div>
        </div>
      </div>
    </Pantalla>
  );
}
