import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AnclaMoneda } from "@/components/landing/ancla-moneda";
import { BotonEntrar } from "@/components/landing/boton-entrar";
import { DemoRegistro } from "@/components/landing/demo-registro";
import { MonedaGiratoria } from "@/components/landing/moneda-giratoria";
import { MonedaViajera } from "@/components/landing/moneda-viajera";
import { SecuenciaMoneda } from "@/components/landing/secuencia-moneda";
import { proveedoresActivos } from "@/lib/auth/opciones";
import { formatearDolares } from "@/lib/dinero";

export const metadata: Metadata = {
  title: "Finanzas · Cada dólar, abierto en partes",
  description:
    "App de finanzas personales hecha para Ecuador: registra un gasto en segundos, mira en qué se te va cada dólar y recibe consejos con su porqué. Gratis.",
};

const REPOSITORIO = "https://github.com/Karel374/proyecto-finanzas";

/**
 * La historia del creador, con sus propias palabras. Queda vacía hasta que Karel la escriba:
 * no se inventa. Cuando tenga texto, aparece en "Cómo está hecha".
 */
const HISTORIA_CREADOR: string | null = null;

/** Datos de la sección 22 y de la siembra (2026). */
const CANASTA_2026 = 82_180;

/** `fase`: la fase de la sección 24 en que llega; null si ya funciona. */
const ECUADOR: { tema: string; fase: number | null; detalle: ReactNode }[] = [
  {
    tema: "Deducibles del SRI",
    fase: 12,
    detalle: (
      <>
        Marca cada gasto por rubro y la app suma tu tope: de 7 a 20 canastas según tus cargas familiares, con
        la canasta de 2026 en {formatearDolares(CANASTA_2026)}.
      </>
    ),
  },
  {
    tema: "Aporte al IESS",
    fase: 11,
    detalle: (
      <>
        El comparador de ofertas de empleo descuenta el 9,45 % y te muestra el sueldo que de verdad te llega.
      </>
    ),
  },
  {
    tema: "Seguro de Cosede",
    fase: 9,
    detalle: (
      <>Al registrar una póliza, te avisa si pasas de los $32.000 cubiertos en un banco o mutualista.</>
    ),
  },
  {
    tema: "Dólares y hora de Ecuador",
    fase: null,
    detalle: <>Todo en dólares, y el día cierra a la medianoche de Guayaquil, no a la del servidor.</>,
  },
  {
    tema: "Ingresos extra para tu carrera",
    fase: 10,
    detalle: <>71 ideas para ganar más, de programación a enfermería, ordenadas según lo que sabes hacer.</>,
  },
];

const CONSTRUCCION = [
  ["Next.js 16 y TypeScript estricto", "Interfaz y servidor en un solo proyecto, sin un solo any."],
  ["PostgreSQL con Prisma", "El dinero se guarda en centavos enteros; la base rechaza montos imposibles."],
  [
    "Datos separados por usuario",
    "Cada consulta queda atada a tu sesión, y hay pruebas que intentan leer datos ajenos.",
  ],
  [
    "Más de 230 pruebas automáticas",
    "Unitarias, contra la base real y con un navegador, en cada cambio, con GitHub Actions.",
  ],
] as const;

function Seccion({
  id,
  titulo,
  ancla,
  children,
}: {
  id?: string;
  titulo: ReactNode;
  /** Si la sección tiene un ancla, la moneda viajera se posa junto a su título. */
  ancla?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 md:py-32">
      <div className="flex items-end justify-between gap-8">
        <h2 className="titular text-m-texto max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.02]">
          {titulo}
        </h2>
        {ancla ? (
          <AnclaMoneda
            nombre={ancla}
            className="w-[clamp(5rem,13vw,10rem)] shrink-0"
            respaldo={<MonedaGiratoria className="size-full" />}
          />
        ) : null}
      </div>
      <div className="mt-12 md:mt-16">{children}</div>
    </section>
  );
}

export default function PaginaPublica() {
  const { google } = proveedoresActivos();

  return (
    <>
      <a
        href="#contenido"
        className="bg-m-laton text-m-sobre-laton sr-only rounded-full px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Saltar al contenido
      </a>

      <header className="bg-m-fondo/95 border-m-linea sticky top-0 z-40 border-b">
        <nav aria-label="Principal" className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
          <Link href="/" className="text-m-texto flex items-center gap-2.5 text-base font-medium">
            <span
              aria-hidden="true"
              className="border-m-laton text-m-laton grid size-7 place-items-center rounded-full border text-sm"
            >
              $
            </span>
            Finanzas
          </Link>
          <ul className="text-m-texto-2 ml-auto hidden items-center gap-6 text-sm md:flex">
            <li>
              <a href="#como-funciona" className="hover:text-m-texto transition-colors">
                Cómo funciona
              </a>
            </li>
            <li>
              <a href="#ecuador" className="hover:text-m-texto transition-colors">
                Para Ecuador
              </a>
            </li>
            <li>
              <a href="#proyecto" className="hover:text-m-texto transition-colors">
                El proyecto
              </a>
            </li>
          </ul>
          <Link
            href="/ingresar"
            className="border-m-linea text-m-texto hover:border-m-laton ml-auto rounded-full border px-4 py-1.5 text-sm transition-colors md:ml-0"
          >
            Entrar
          </Link>
        </nav>
      </header>

      <MonedaViajera />

      <main id="contenido" className="relative z-10">
        {/* Primera pantalla: la promesa, la acción y la moneda */}
        <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center overflow-hidden px-5 pt-14 text-center sm:px-8 md:pt-20">
          <h1 className="titular text-m-texto max-w-[16ch] text-[clamp(2.75rem,8vw,6rem)] leading-[0.98]">
            Cada dólar, abierto en partes.
          </h1>
          <p className="text-m-texto-2 mt-6 max-w-[52ch] text-lg leading-relaxed">
            Registra un gasto en segundos y mira en qué se te va cada dólar. Hecha para Ecuador, gratis, y tus
            datos son solo tuyos.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <BotonEntrar google={google} />
            <a
              href="#como-funciona"
              className="border-m-linea text-m-texto hover:border-m-laton rounded-full border px-6 py-3 text-sm transition-colors"
            >
              Ver cómo funciona
            </a>
          </div>
          <AnclaMoneda
            nombre="hero"
            className="mt-14 w-[min(62svh,82vw)] translate-y-[18%]"
            respaldo={<MonedaGiratoria className="size-full" />}
          />
        </section>

        <Seccion id="como-funciona" titulo="Una moneda, tres preguntas.">
          <p className="text-m-texto-3 -mt-6 mb-12 max-w-[60ch] text-base md:-mt-10">
            Así se verá tu panel. El anillo de gastos llega en la fase 5 y los consejos en la 13; el registro
            ya funciona.
          </p>
          <SecuenciaMoneda />
        </Seccion>

        <Seccion titulo="Un gasto en menos de 10 segundos." ancla="registro">
          <div className="grid items-center gap-12 md:grid-cols-[0.8fr_1.2fr]">
            <div className="text-m-texto-2 flex max-w-[44ch] flex-col gap-4 text-lg leading-relaxed">
              <p>
                Pulsa <kbd className="border-m-linea text-m-texto rounded border px-1.5 text-base">N</kbd>{" "}
                desde cualquier pantalla, escribe el monto y presiona Enter. La categoría que más usas ya está
                elegida.
              </p>
              <p>
                Los gastos que se repiten, como el arriendo o el plan del celular, se registran solos cada día
                a las 00:05.
              </p>
            </div>
            <DemoRegistro />
          </div>
        </Seccion>

        <Seccion id="ecuador" titulo="Hecha para Ecuador, no traducida." ancla="ecuador">
          <dl className="border-m-linea border-t">
            {ECUADOR.map((fila) => (
              <div
                key={fila.tema}
                className="border-m-linea grid gap-2 border-b py-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] md:gap-10"
              >
                <dt className="flex flex-col items-start gap-2">
                  <span className="grabado text-m-laton text-sm">{fila.tema}</span>
                  <span className="text-m-texto-3 text-sm">
                    {fila.fase ? `Llega en la fase ${fila.fase}` : "Ya funciona"}
                  </span>
                </dt>
                <dd className="text-m-texto-2 max-w-[60ch] text-lg leading-relaxed">{fila.detalle}</dd>
              </div>
            ))}
          </dl>
        </Seccion>

        <Seccion titulo="Tus datos son tuyos.">
          <div className="text-m-texto-2 grid gap-10 text-lg leading-relaxed md:grid-cols-3">
            <p>
              <strong className="text-m-texto font-medium">Separados por usuario.</strong> Nadie más ve tus
              movimientos, y la app no puede mezclar los tuyos con los de otra persona.
            </p>
            <p>
              <strong className="text-m-texto font-medium">Sin terceros.</strong> Ningún dato financiero sale
              hacia otros servicios. Los consejos salen de reglas fijas que muestran el dato que los disparó.
            </p>
            <p>
              <strong className="text-m-texto font-medium">Gratis.</strong> Funciona sobre planes gratuitos, y
              el código es público para que cualquiera lo revise.
            </p>
          </div>
        </Seccion>

        <Seccion id="proyecto" titulo="Cómo está hecha.">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
            <p className="text-m-texto-2 max-w-[42ch] text-lg leading-relaxed">
              Un proyecto de <span className="text-m-texto">Karel374</span>, construido por fases con una
              especificación escrita antes del código. Ya funcionan el registro, las cuentas, las
              transferencias y los recurrentes; el panel con la moneda abierta y los consejos llegan en las
              próximas fases. Todo está en GitHub.
            </p>
            <ul className="border-m-linea border-t">
              {CONSTRUCCION.map(([titulo, detalle]) => (
                <li key={titulo} className="border-m-linea flex flex-col gap-1 border-b py-5">
                  <span className="text-m-texto text-lg">{titulo}</span>
                  <span className="text-m-texto-2">{detalle}</span>
                </li>
              ))}
            </ul>
          </div>
          {HISTORIA_CREADOR ? (
            <blockquote className="border-m-linea text-m-texto mt-14 max-w-[52ch] border-t pt-8 text-[clamp(1.375rem,2.6vw,1.875rem)] leading-snug font-light">
              “{HISTORIA_CREADOR}”<footer className="text-m-texto-3 mt-4 text-base">Karel374</footer>
            </blockquote>
          ) : null}
          <a
            href={REPOSITORIO}
            className="text-m-laton hover:text-m-laton-luz mt-10 inline-block text-lg underline decoration-1 underline-offset-[6px]"
          >
            Ver el código en GitHub
          </a>
        </Seccion>

        <section className="border-m-linea border-t">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-28 text-center sm:px-8">
            <AnclaMoneda
              nombre="cierre"
              className="w-40"
              respaldo={<MonedaGiratoria className="size-full" />}
            />
            <h2 className="titular text-m-texto max-w-[18ch] text-[clamp(2.25rem,5vw,4rem)] leading-[1.02]">
              Empieza con lo que tienes en el bolsillo.
            </h2>
            <BotonEntrar google={google} />
          </div>
        </section>
      </main>

      <footer className="border-m-linea text-m-texto-3 border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm sm:px-8">
          <p>© 2026 Karel374. Hecha en Ecuador.</p>
          <a href={REPOSITORIO} className="hover:text-m-texto transition-colors">
            Código en GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
