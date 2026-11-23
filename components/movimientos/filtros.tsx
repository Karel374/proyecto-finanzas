"use client";

import { ChevronDown, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Entrada, PuntoColor, Selector } from "@/components/ui/campos";
import { colorDeCategoria } from "@/lib/colores";
import type { FiltrosMovimientos as Filtros } from "@/lib/esquemas";
import { ETIQUETAS_PERIODO, TIPOS_PERIODO, type Periodo } from "@/lib/fechas";

type Categoria = {
  id: string;
  nombre: string;
  tipo: "GASTO" | "INGRESO";
  colorSlot: number | null;
  sistema: "INTERESES_COMISIONES" | "RENDIMIENTOS" | null;
};
type Cuenta = { id: string; nombre: string };

/**
 * Filtros en una sola fila (sección 7): período, tipo, categorías y cuentas (varias a la vez) y
 * texto de la nota. Viven en la URL, así un filtro se puede recargar y compartir con el navegador.
 * La tecla / enfoca el buscador.
 */
export function FiltrosMovimientos({
  filtros,
  rango,
  categorias,
  cuentas,
}: {
  filtros: Filtros;
  rango: Periodo;
  categorias: Categoria[];
  cuentas: Cuenta[];
}) {
  const router = useRouter();
  const ruta = usePathname();
  const [, iniciar] = useTransition();
  const [texto, setTexto] = useState(filtros.texto ?? "");
  const buscador = useRef<HTMLInputElement>(null);

  function aplicar(
    cambios: Partial<Record<"periodo" | "desde" | "hasta" | "tipo" | "texto", string | null>> & {
      categorias?: string[];
      cuentas?: string[];
    },
  ) {
    const siguiente = new URLSearchParams();
    const valores = {
      periodo: filtros.periodo as string,
      desde: filtros.periodo === "RANGO" ? (filtros.desde ?? rango.desde) : null,
      hasta: filtros.periodo === "RANGO" ? (filtros.hasta ?? rango.hasta) : null,
      tipo: filtros.tipo as string,
      texto: filtros.texto ?? null,
      ...cambios,
    };
    if (valores.periodo && valores.periodo !== "MES") siguiente.set("periodo", valores.periodo);
    if (valores.periodo === "RANGO") {
      siguiente.set("desde", valores.desde ?? rango.desde);
      siguiente.set("hasta", valores.hasta ?? rango.hasta);
    }
    if (valores.tipo && valores.tipo !== "TODOS") siguiente.set("tipo", valores.tipo);
    for (const id of cambios.categorias ?? filtros.categorias) siguiente.append("categoria", id);
    for (const id of cambios.cuentas ?? filtros.cuentas) siguiente.append("cuenta", id);
    if (valores.texto) siguiente.set("texto", valores.texto);
    // Cambiar un filtro vuelve a la primera página.
    iniciar(() => router.replace(`${ruta}${siguiente.size ? `?${siguiente}` : ""}`, { scroll: false }));
  }

  // El texto se aplica cuando el usuario deja de escribir.
  useEffect(() => {
    if (texto === (filtros.texto ?? "")) return;
    const espera = window.setTimeout(() => aplicar({ texto: texto.trim() || null }), 350);
    return () => window.clearTimeout(espera);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar al texto
  }, [texto]);

  // "/" enfoca el buscador (sección 3).
  useEffect(() => {
    function alPulsar(evento: KeyboardEvent) {
      if (evento.key !== "/" || evento.ctrlKey || evento.metaKey) return;
      const objetivo = evento.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(objetivo.tagName) ||
        document.querySelector('[role="dialog"]')
      )
        return;
      evento.preventDefault();
      buscador.current?.focus();
    }
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, []);

  const categoriasVisibles =
    filtros.tipo === "TODOS" ? categorias : categorias.filter((c) => c.tipo === filtros.tipo);

  return (
    <div role="search" className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-texto-3 text-xs">Período</span>
        <Selector
          className="w-44"
          value={filtros.periodo}
          onChange={(evento) => aplicar({ periodo: evento.target.value })}
        >
          {TIPOS_PERIODO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {ETIQUETAS_PERIODO[tipo]}
            </option>
          ))}
        </Selector>
      </label>

      {filtros.periodo === "RANGO" ? (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-texto-3 text-xs">Desde</span>
            <Entrada
              type="date"
              className="w-40"
              value={rango.desde}
              onChange={(evento) => evento.target.value && aplicar({ desde: evento.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-texto-3 text-xs">Hasta</span>
            <Entrada
              type="date"
              className="w-40"
              value={rango.hasta}
              onChange={(evento) => evento.target.value && aplicar({ hasta: evento.target.value })}
            />
          </label>
        </>
      ) : null}

      <label className="flex flex-col gap-1">
        <span className="text-texto-3 text-xs">Tipo</span>
        <Selector
          className="w-32"
          value={filtros.tipo}
          onChange={(evento) => aplicar({ tipo: evento.target.value, categorias: [] })}
        >
          <option value="TODOS">Todos</option>
          <option value="GASTO">Gastos</option>
          <option value="INGRESO">Ingresos</option>
        </Selector>
      </label>

      <SelectorMultiple
        etiqueta="Categorías"
        opciones={categoriasVisibles.map((c) => ({ id: c.id, nombre: c.nombre, color: colorDeCategoria(c) }))}
        elegidas={filtros.categorias}
        alCambiar={(elegidas) => aplicar({ categorias: elegidas })}
      />
      <SelectorMultiple
        etiqueta="Cuentas"
        opciones={cuentas.map((c) => ({ id: c.id, nombre: c.nombre }))}
        elegidas={filtros.cuentas}
        alCambiar={(elegidas) => aplicar({ cuentas: elegidas })}
      />

      <label className="flex min-w-56 flex-1 flex-col gap-1">
        <span className="text-texto-3 text-xs">Buscar en la nota</span>
        <span className="relative">
          <Search
            aria-hidden="true"
            className="text-texto-3 absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Entrada
            ref={buscador}
            type="search"
            className="pl-9"
            placeholder="Escribe o pulsa /"
            aria-keyshortcuts="/"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
        </span>
      </label>
    </div>
  );
}

function SelectorMultiple({
  etiqueta,
  opciones,
  elegidas,
  alCambiar,
}: {
  etiqueta: string;
  opciones: { id: string; nombre: string; color?: string }[];
  elegidas: string[];
  alCambiar: (elegidas: string[]) => void;
}) {
  const resumen =
    elegidas.length === 0
      ? "Todas"
      : elegidas.length === 1
        ? (opciones.find((o) => o.id === elegidas[0])?.nombre ?? "1")
        : `${elegidas.length} elegidas`;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-texto-3 text-xs">{etiqueta}</span>
      <details className="relative">
        <summary className="border-borde bg-superficie-2 text-texto focus-visible:outline-acento flex w-44 cursor-pointer list-none items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm focus-visible:outline-2">
          <span className="truncate">{resumen}</span>
          <ChevronDown aria-hidden="true" className="text-texto-3 size-4 shrink-0" />
        </summary>
        <fieldset className="border-borde bg-superficie absolute z-20 mt-1 flex max-h-72 w-60 flex-col gap-0.5 overflow-y-auto rounded-md border p-2 shadow-lg">
          <legend className="sr-only">{etiqueta}</legend>
          {opciones.map((opcion) => (
            <label
              key={opcion.id}
              className="hover:bg-superficie-2 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm"
            >
              <input
                type="checkbox"
                className="accent-acento"
                checked={elegidas.includes(opcion.id)}
                onChange={(evento) =>
                  alCambiar(
                    evento.target.checked
                      ? [...elegidas, opcion.id]
                      : elegidas.filter((id) => id !== opcion.id),
                  )
                }
              />
              {opcion.color ? <PuntoColor color={opcion.color} /> : null}
              <span className="truncate">{opcion.nombre}</span>
            </label>
          ))}
          {elegidas.length ? (
            <button
              type="button"
              onClick={() => alCambiar([])}
              className="text-acento mt-1 self-start px-2 text-xs hover:underline"
            >
              Quitar filtro
            </button>
          ) : null}
        </fieldset>
      </details>
    </div>
  );
}
