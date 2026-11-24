import { ArrowDown, ArrowUpRight, CodeXml, ShieldCheck, Unplug } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { proveedoresActivos } from "@/lib/auth/opciones";
import { type Idioma, TEXTOS } from "@/lib/landing/textos";

import { BotonEntrar, CLASE_BOTON_SECUNDARIO } from "./boton-entrar";
import { ControladorLanding } from "./controlador-landing";
import { EtiquetaEstado, Logo, PantallaConsejo, PantallaPanel, PantallaRegistro, Titular } from "./piezas";

const REPOSITORIO = "https://github.com/Karel374/proyecto-finanzas";

/**
 * La historia del creador, con sus propias palabras. Queda vacía hasta que Karel la escriba:
 * no se inventa. Cuando tenga texto, aparece en el capítulo "Quién la hace".
 */
const HISTORIA_CREADOR: Record<Idioma, string | null> = { es: null, en: null };

/** Lema grabado en el canto de la cara de la moneda. */
const LEMA: Record<Idioma, string> = {
  es: "KANOMICS · CADA DÓLAR CUENTA · ",
  en: "KANOMICS · EVERY DOLLAR COUNTS · ",
};

/**
 * Antes de pintar, decide si el nombre del hero espera a la moneda. Si algo falla, a los 5 s
 * se muestra igual: el contenido nunca depende de la animación.
 */
const SCRIPT_ENTRADA = `try{var r=matchMedia("(prefers-reduced-motion: reduce)").matches;if(!r&&sessionStorage.getItem("kanomics-entrada-vista")!=="1"){var h=document.documentElement;h.dataset.entrada="pendiente";setTimeout(function(){delete h.dataset.entrada},5000)}}catch(e){}`;

/** Rejilla de los capítulos: texto a un lado, el carril de la moneda al centro y el otro lado libre. */
const REJILLA =
  "mx-auto grid w-full max-w-[90rem] gap-x-0 gap-y-12 pr-5 pl-14 sm:pr-8 lg:grid-cols-[minmax(0,1fr)_minmax(10rem,16vw)_minmax(0,1fr)] lg:px-10";

function Capitulo({
  id,
  tramo = "recto",
  rotulo,
  titulo,
  cuerpo,
  lado = "izq",
  aparte,
}: {
  id?: string;
  tramo?: "recto" | "caotico";
  rotulo: string;
  titulo: string;
  cuerpo?: ReactNode;
  lado?: "izq" | "der";
  aparte?: ReactNode;
}) {
  const texto = (
    <div
      className={`flex max-w-[34rem] flex-col ${lado === "izq" ? "lg:col-start-1 lg:justify-self-end" : "lg:col-start-3"}`}
    >
      <p data-revelar className="k-rotulo text-k-tinta-3">
        {rotulo}
      </p>
      <Titular texto={titulo} className="mt-5 text-[clamp(2.4rem,4.6vw,4.4rem)]" />
      {cuerpo ? (
        <div data-revelar="0.1" className="text-k-tinta-2 mt-7 text-lg leading-relaxed">
          {cuerpo}
        </div>
      ) : null}
    </div>
  );
  return (
    <section
      id={id}
      data-tramo={tramo}
      className="relative scroll-mt-20 py-28 lg:flex lg:min-h-[100svh] lg:items-center lg:py-40"
    >
      <div className={REJILLA}>
        {texto}
        {aparte ? (
          <div
            data-revelar="0.15"
            className={`w-full max-w-[34rem] lg:row-start-1 ${lado === "izq" ? "lg:col-start-3" : "lg:col-start-1 lg:justify-self-end"}`}
          >
            {aparte}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Nodo del carril: se enciende cuando la moneda pasa por la estación. */
function Nodo() {
  return (
    <span
      aria-hidden="true"
      className="k-nodo border-k-linea-fuerte bg-k-fondo absolute top-2 left-[26px] z-10 size-3.5 -translate-x-1/2 rounded-full border-2 lg:left-1/2"
    />
  );
}

export function Landing({ idioma }: { idioma: Idioma }) {
  const t = TEXTOS[idioma];
  const { google } = proveedoresActivos();
  const otroIdioma = idioma === "es" ? "/en" : "/";
  const historia = HISTORIA_CREADOR[idioma];

  return (
    <div lang={idioma} className="relative flex min-h-svh flex-col overflow-x-clip">
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_ENTRADA }} />
      <a
        href="#contenido"
        className="bg-k-tinta text-k-sobre-tinta sr-only rounded-full px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        {t.nav.saltar}
      </a>

      <header className="bg-k-fondo/75 fixed inset-x-0 top-0 z-40 backdrop-blur-xl backdrop-saturate-150">
        <nav
          aria-label={idioma === "es" ? "Principal" : "Main"}
          className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center gap-4 px-5 sm:px-8 lg:px-10"
        >
          <Link href={idioma === "es" ? "/" : "/en"} className="text-k-tinta" aria-label="Kanomics">
            <Logo />
          </Link>
          <ul className="bg-k-fondo-2/80 text-k-tinta-2 absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full p-1 text-sm backdrop-blur-md md:flex">
            {[
              ["#recorrido", t.nav.recorrido],
              ["#donde", t.nav.donde],
              ["#creador", t.nav.creador],
            ].map(([href, texto]) => (
              <li key={href}>
                <a
                  href={href}
                  className="hover:text-k-tinta hover:bg-k-fondo block rounded-full px-4 py-1.5 transition-colors"
                >
                  {texto}
                </a>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href={otroIdioma}
              hrefLang={idioma === "es" ? "en" : "es"}
              className="k-rotulo text-k-tinta-2 hover:text-k-tinta rounded-full px-3 py-2 transition-colors"
            >
              {t.nav.otroIdioma}
            </Link>
            <Link
              href="/ingresar"
              className="bg-k-tinta text-k-sobre-tinta rounded-full px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#262b33]"
            >
              {t.nav.entrar}
            </Link>
          </div>
        </nav>
      </header>

      <main id="contenido" className="relative">
        <ControladorLanding lema={LEMA[idioma]} />

        {/* Primera pantalla: el nombre gigante y la moneda delante, como un producto en su vitrina. */}
        <section data-hero data-tramo="recto" className="relative h-[100svh] min-h-[38rem] overflow-hidden">
          <p
            data-tras-entrada
            className="k-rotulo text-k-tinta-3 absolute inset-x-0 top-[6.5rem] text-center sm:top-28"
          >
            {t.hero.rotulo}
          </p>
          <h1
            data-nombre-hero
            aria-label="Kanomics"
            className="k-nombre absolute inset-x-0 top-[42%] -translate-y-1/2 text-center text-[clamp(4.2rem,18.5vw,22rem)] whitespace-nowrap select-none"
          >
            {[..."Kanomics"].map((letra, i) => (
              <span key={i} data-letra aria-hidden="true" className="k-nombre-gigante inline-block">
                {letra}
              </span>
            ))}
          </h1>
          <div
            data-moneda-hero
            aria-hidden="true"
            className="absolute top-[42%] left-1/2 aspect-square w-[min(36svh,44vw)] -translate-x-1/2 -translate-y-1/2"
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto grid max-w-[90rem] items-end gap-6 px-5 pb-8 sm:px-8 md:grid-cols-[1fr_auto] lg:px-10 lg:pb-10">
            <p data-tras-entrada className="text-k-tinta-2 max-w-[38ch] text-lg leading-relaxed">
              {t.hero.bajada}
            </p>
            <div data-tras-entrada className="flex flex-wrap items-center gap-3">
              <BotonEntrar google={google} textos={t.google} />
              <a href="#recorrido" className={CLASE_BOTON_SECUNDARIO}>
                {t.hero.recorrido}
                <ArrowDown aria-hidden="true" className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <Capitulo
          id="recorrido"
          tramo="caotico"
          rotulo={t.problema.rotulo}
          titulo={t.problema.titulo}
          cuerpo={<p>{t.problema.cuerpo}</p>}
          aparte={
            <div>
              <p className="k-rotulo text-k-tinta-3">{t.problema.fugasTitulo}</p>
              <ul className="border-k-linea mt-4 border-t">
                {t.problema.fugas.map(([concepto, monto]) => (
                  <li
                    key={concepto}
                    className="border-k-linea flex items-baseline justify-between border-b py-4"
                  >
                    <span className="text-k-tinta-2">{concepto}</span>
                    <span className="k-cifra text-k-tinta-2">−{monto}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-baseline justify-between">
                <span>{t.problema.fugasTotal[0]}</span>
                <span className="k-cifra text-2xl font-medium tracking-[-0.03em]">
                  −{t.problema.fugasTotal[1]}
                </span>
              </p>
              <p className="k-rotulo text-k-tinta-3 mt-3 text-[0.62rem]">{t.ejemplo}</p>
            </div>
          }
        />

        <Capitulo
          lado="der"
          rotulo={t.mision.rotulo}
          titulo={t.mision.titulo}
          cuerpo={<p>{t.mision.cuerpo}</p>}
          aparte={
            <ol className="flex flex-col gap-6">
              {t.mision.preguntas.map((pregunta, i) => (
                <li key={pregunta} className="flex items-baseline gap-5">
                  <span className="k-rotulo text-k-tinta-3">0{i + 1}</span>
                  <span className="text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight font-light tracking-[-0.035em]">
                    {pregunta}
                  </span>
                </li>
              ))}
            </ol>
          }
        />

        {/* Cómo funciona: tres estaciones sobre el carril. */}
        <section data-tramo="recto" className="relative py-28 lg:py-40">
          <div className={REJILLA}>
            <div className="lg:col-start-1 lg:max-w-[34rem] lg:justify-self-end">
              <p data-revelar className="k-rotulo text-k-tinta-3">
                {t.funciona.rotulo}
              </p>
              <Titular texto={t.funciona.titulo} className="mt-5 text-[clamp(2.4rem,4.6vw,4.4rem)]" />
            </div>
          </div>
          <div className="mt-20 flex flex-col gap-28 lg:mt-32 lg:gap-44">
            {t.funciona.pasos.map((paso, i) => {
              const izquierda = i % 2 === 0;
              return (
                <article key={paso.nombre} data-estacion className="relative">
                  <Nodo />
                  <div className={REJILLA}>
                    <div
                      data-revelar
                      className={`flex max-w-[30rem] flex-col items-start ${izquierda ? "lg:col-start-1 lg:justify-self-end" : "lg:col-start-3"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="k-rotulo text-k-tinta">
                          {String(i + 1).padStart(2, "0")} · {paso.nombre}
                        </span>
                        <EtiquetaEstado estado={paso.estado} textos={t} />
                      </div>
                      <h3 className="k-titular mt-5 text-[clamp(1.9rem,3vw,2.8rem)]">{paso.titulo}</h3>
                      <p className="text-k-tinta-2 mt-5 text-lg leading-relaxed">{paso.cuerpo}</p>
                    </div>
                    <div
                      data-revelar="0.12"
                      className={`w-full max-w-[30rem] lg:row-start-1 ${izquierda ? "lg:col-start-3" : "lg:col-start-1 lg:justify-self-end"}`}
                    >
                      {i === 0 ? <PantallaRegistro textos={t} idioma={idioma} /> : null}
                      {i === 1 ? <PantallaPanel textos={t} idioma={idioma} /> : null}
                      {i === 2 ? <PantallaConsejo textos={t} /> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <Capitulo
          id="donde"
          rotulo={t.donde.rotulo}
          titulo={t.donde.titulo}
          cuerpo={<p>{t.donde.cuerpo}</p>}
          aparte={
            <div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium">{t.donde.pais}</p>
                <span className="k-rotulo border-k-linea text-k-tinta-2 rounded-full border px-2.5 py-1 text-[0.62rem]">
                  EC · USD
                </span>
              </div>
              <dl className="border-k-linea mt-5 border-t">
                {t.donde.filas.map((fila) => (
                  <div
                    key={fila.tema}
                    className="border-k-linea grid gap-2 border-b py-5 sm:grid-cols-[9.5rem_1fr]"
                  >
                    <dt className="font-medium">{fila.tema}</dt>
                    <dd className="flex flex-col items-start gap-2.5">
                      <span className="text-k-tinta-2 leading-relaxed">{fila.detalle}</span>
                      <EtiquetaEstado estado={fila.estado} textos={t} />
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-k-tinta-2 mt-5">{t.donde.siguiente}</p>
            </div>
          }
        />

        <Capitulo
          lado="der"
          rotulo={t.privacidad.rotulo}
          titulo={t.privacidad.titulo}
          aparte={
            <ul className="flex flex-col gap-7">
              {t.privacidad.puntos.map((punto, i) => {
                const Icono = [ShieldCheck, Unplug, CodeXml][i] ?? ShieldCheck;
                return (
                  <li key={punto.titulo} className="flex gap-4">
                    <span className="bg-k-fondo-2 grid size-11 shrink-0 place-items-center rounded-full">
                      <Icono aria-hidden="true" className="size-5" strokeWidth={1.6} />
                    </span>
                    <span>
                      <span className="block text-lg font-medium">{punto.titulo}</span>
                      <span className="text-k-tinta-2 mt-1 block leading-relaxed">{punto.cuerpo}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          }
        />

        <Capitulo
          id="creador"
          rotulo={t.creador.rotulo}
          titulo={t.creador.titulo}
          cuerpo={
            <>
              <p>{t.creador.cuerpo}</p>
              {historia ? (
                <blockquote className="border-k-linea text-k-tinta mt-8 border-l-2 pl-5 text-xl leading-snug">
                  “{historia}”
                </blockquote>
              ) : null}
              <a
                href={REPOSITORIO}
                className="text-k-tinta mt-8 inline-flex items-center gap-1.5 underline decoration-[var(--k-linea-fuerte)] decoration-1 underline-offset-[6px] transition-colors hover:decoration-[var(--k-tinta)]"
              >
                {t.creador.codigo}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </>
          }
          aparte={
            <div>
              <p className="text-lg font-medium">{t.creador.fichaTitulo}</p>
              <dl className="border-k-linea mt-5 border-t">
                {t.creador.ficha.map(([clave, valor]) => (
                  <div
                    key={clave}
                    className="border-k-linea grid gap-1 border-b py-4 sm:grid-cols-[8rem_1fr]"
                  >
                    <dt className="text-k-tinta-3">{clave}</dt>
                    <dd>{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          }
        />

        {/* Final: la moneda se posa en la tarjeta de entrada. */}
        <section data-tramo="recto" className="relative px-5 pt-16 pb-32 sm:px-8 lg:pb-44">
          <div className="bg-k-fondo relative mx-auto flex max-w-3xl flex-col items-center py-6 text-center">
            <Titular texto={t.final.titulo} className="text-[clamp(2.5rem,5.6vw,5.2rem)]" />
            <p data-revelar className="text-k-tinta-2 mt-6 text-lg">
              {t.final.cuerpo}
            </p>
          </div>
          <div
            data-revelar
            className="border-k-linea bg-k-fondo relative mx-auto mt-16 flex w-full max-w-md flex-col items-center rounded-[2rem] border px-6 pt-8 pb-8 text-center shadow-[0_50px_100px_-50px_rgba(30,45,70,0.45)] sm:px-10"
          >
            <div
              data-ranura
              aria-hidden="true"
              className="bg-k-fondo-2 aspect-square w-28 rounded-full shadow-[inset_0_2px_10px_rgba(14,17,22,0.08)]"
            />
            <p className="mt-7 text-2xl font-medium tracking-[-0.03em]">{t.final.tarjeta}</p>
            <div className="mt-7 flex w-full flex-col gap-3">
              <BotonEntrar google={google} textos={t.google} className="w-full" />
            </div>
            <p className="text-k-tinta-3 mt-6 text-sm leading-relaxed">{t.final.privacidad}</p>
          </div>
        </section>
      </main>

      <footer className="border-k-linea relative z-20 border-t">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm sm:px-8 lg:px-10">
          <Logo />
          <div className="text-k-tinta-2 flex flex-wrap items-center gap-6">
            <Link
              href={otroIdioma}
              hrefLang={idioma === "es" ? "en" : "es"}
              className="hover:text-k-tinta transition-colors"
            >
              {idioma === "es" ? "English" : "Español"}
            </Link>
            <a href={REPOSITORIO} className="hover:text-k-tinta transition-colors">
              {t.pie.codigo}
            </a>
            <span>© 2026 Karel374. {t.pie.hecho}</span>
          </div>
        </div>
        <p
          aria-hidden="true"
          className="k-nombre-puntos overflow-hidden px-3 pb-6 text-center text-[clamp(4rem,19.5vw,24rem)] whitespace-nowrap select-none"
        >
          Kanomics
        </p>
      </footer>
    </div>
  );
}
