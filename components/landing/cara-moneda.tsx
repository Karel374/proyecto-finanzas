import { useId } from "react";

/**
 * Cara de la moneda de la marca, dibujada en SVG: canto estriado, leyenda grabada en círculo
 * y el símbolo en relieve. No reproduce ninguna moneda de curso legal.
 * `reverso` dibuja el otro lado: anillos guilloché y el lema.
 */
export function CaraMoneda({ reverso = false, className = "" }: { reverso?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  const metal = `metal-${id}`;
  const brillo = `brillo-${id}`;
  const campo = `campo-${id}`;
  const curva = `curva-${id}`;

  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={metal} cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="var(--m-laton-luz)" />
          <stop offset="0.45" stopColor="var(--m-laton)" />
          <stop offset="1" stopColor="var(--m-laton-sombra)" />
        </radialGradient>
        <radialGradient id={campo} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#e9cf8c" />
          <stop offset="0.6" stopColor="#b8913f" />
          <stop offset="1" stopColor="#6d5020" />
        </radialGradient>
        <linearGradient id={brillo} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff8dc" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#fff8dc" stopOpacity="0" />
        </linearGradient>
        <path id={curva} d="M 200 200 m -150 0 a 150 150 0 1 1 300 0 a 150 150 0 1 1 -300 0" />
      </defs>

      {/* Canto estriado */}
      <circle cx="200" cy="200" r="196" fill="var(--m-laton-sombra)" />
      <circle
        cx="200"
        cy="200"
        r="191"
        fill="none"
        stroke="var(--m-laton)"
        strokeWidth="9"
        strokeDasharray="2.2 2.8"
      />
      {/* Bisel y campo */}
      <circle cx="200" cy="200" r="184" fill={`url(#${metal})`} />
      <circle cx="200" cy="200" r="168" fill={`url(#${campo})`} />
      <circle cx="200" cy="200" r="168" fill="none" stroke="#5a421a" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="166" fill="none" stroke="#fff3c9" strokeOpacity="0.35" strokeWidth="1" />

      {reverso ? (
        <g>
          {[132, 116, 100, 84, 68].map((radio) => (
            <circle
              key={radio}
              cx="200"
              cy="200"
              r={radio}
              fill="none"
              stroke="#5a421a"
              strokeOpacity="0.45"
              strokeWidth="1"
              strokeDasharray="1 3"
            />
          ))}
          <text
            x="200"
            y="192"
            textAnchor="middle"
            className="grabado"
            fontSize="17"
            fill="#4a3612"
            fillOpacity="0.85"
          >
            Cada centavo
          </text>
          <text
            x="200"
            y="222"
            textAnchor="middle"
            className="grabado"
            fontSize="17"
            fill="#4a3612"
            fillOpacity="0.85"
          >
            cuenta
          </text>
        </g>
      ) : (
        <g>
          <text className="grabado" fontSize="15" fill="#4a3612" fillOpacity="0.8">
            <textPath href={`#${curva}`} startOffset="25%" textAnchor="middle">
              Finanzas · Hecha en Ecuador · 2026 ·
            </textPath>
          </text>
          {/* Símbolo en relieve: sombra, luz y cuerpo */}
          <text
            x="203"
            y="262"
            textAnchor="middle"
            fontSize="170"
            fontWeight="300"
            fill="#4a3612"
            fillOpacity="0.55"
          >
            $
          </text>
          <text
            x="197"
            y="256"
            textAnchor="middle"
            fontSize="170"
            fontWeight="300"
            fill="#fff4cf"
            fillOpacity="0.6"
          >
            $
          </text>
          <text x="200" y="259" textAnchor="middle" fontSize="170" fontWeight="300" fill="#b18a3a">
            $
          </text>
        </g>
      )}

      {/* Luz de lámpara sobre el metal */}
      <circle cx="200" cy="200" r="184" fill={`url(#${brillo})`} />
    </svg>
  );
}
