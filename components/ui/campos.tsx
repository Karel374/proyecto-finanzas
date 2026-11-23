import { CircleAlert } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes } from "react";

const CLASE_CONTROL =
  "w-full rounded-md border border-borde bg-superficie-2 px-3 py-2 text-sm text-texto placeholder:text-texto-3 focus-visible:border-acento focus-visible:outline-2 focus-visible:outline-acento aria-invalid:border-gasto";

/** Campo con su etiqueta y, si hay, el mensaje de error debajo (con ícono, nunca solo color). */
export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  children,
  className = "",
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-texto-2 text-sm font-medium">
        {etiqueta}
      </label>
      {children}
      {error ? <MensajeError id={`${id}-error`}>{error}</MensajeError> : null}
      {!error && ayuda ? (
        <p id={`${id}-ayuda`} className="text-texto-3 text-xs">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

export function MensajeError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-gasto flex items-start gap-1.5 text-xs">
      <CircleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0" />
      {children}
    </p>
  );
}

export function Entrada({
  invalido,
  className = "",
  ref,
  ...resto
}: InputHTMLAttributes<HTMLInputElement> & { invalido?: boolean; ref?: Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      aria-invalid={invalido || undefined}
      aria-describedby={invalido && resto.id ? `${resto.id}-error` : undefined}
      className={`${CLASE_CONTROL} ${className}`}
      {...resto}
    />
  );
}

export function Selector({
  invalido,
  className = "",
  ref,
  children,
  ...resto
}: SelectHTMLAttributes<HTMLSelectElement> & { invalido?: boolean; ref?: Ref<HTMLSelectElement> }) {
  return (
    <select
      ref={ref}
      aria-invalid={invalido || undefined}
      aria-describedby={invalido && resto.id ? `${resto.id}-error` : undefined}
      className={`${CLASE_CONTROL} ${className}`}
      {...resto}
    >
      {children}
    </select>
  );
}

/** Punto de color de una categoría, junto a su nombre (sección 4). */
export function PuntoColor({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ background: color }}
    />
  );
}
