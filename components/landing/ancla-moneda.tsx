import type { ReactNode } from "react";

/**
 * Lugar donde la moneda viajera se detiene en cada sección. Reserva su espacio en el layout para
 * que la página se acomode alrededor de la moneda. Mientras la moneda viaja, el respaldo queda
 * oculto; sin JavaScript o con "reducir movimiento", el respaldo es una moneda quieta en su sitio.
 */
export function AnclaMoneda({
  nombre,
  respaldo,
  className = "",
}: {
  nombre: string;
  respaldo?: ReactNode;
  className?: string;
}) {
  return (
    <div data-ancla={nombre} className={`ancla-moneda relative aspect-square ${className}`}>
      {respaldo ? <div className="ancla-respaldo absolute inset-0">{respaldo}</div> : null}
    </div>
  );
}
