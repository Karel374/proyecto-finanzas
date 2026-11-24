import { CaraMoneda } from "./cara-moneda";

/** Capas del canto: dan grosor real a la moneda cuando gira de perfil. */
const CAPAS_CANTO = Array.from({ length: 12 }, (_, i) => i - 6);

/**
 * La moneda del hero: gira lento sobre su eje vertical, con canto de grosor real.
 * Sin librerías: transformaciones 3D de CSS. Con "reducir movimiento" queda quieta y ladeada.
 */
export function MonedaGiratoria({ className = "" }: { className?: string }) {
  return (
    <div className={`moneda-escena ${className}`}>
      <div className="moneda-3d">
        <div className="moneda-cara">
          <CaraMoneda className="size-full" />
        </div>
        {CAPAS_CANTO.map((z) => (
          <div key={z} className="moneda-canto" style={{ transform: `translateZ(${z}px)` }} />
        ))}
        <div className="moneda-cara moneda-cara-reverso">
          <CaraMoneda reverso className="size-full" />
        </div>
      </div>
      <div className="moneda-sombra" aria-hidden="true" />
    </div>
  );
}
