import { formatearDolares } from "@/lib/dinero";

import {
  DISPONIBLE_EJEMPLO_CENTAVOS,
  GAJO_RECOMENDACION,
  GASTO_TOTAL_EJEMPLO_CENTAVOS,
  GASTOS_EJEMPLO,
} from "./datos-ejemplo";

const C = 200;
const RADIO = 176;
const RADIO_INTERIOR_ANILLO = 112;

const limitar = (valor: number) => Math.min(1, Math.max(0, valor));
/** Salida exponencial: arranca rápido y se asienta suave. */
const salida = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function punto(radio: number, angulo: number, dx: number, dy: number) {
  return `${(C + dx + radio * Math.cos(angulo)).toFixed(2)} ${(C + dy + radio * Math.sin(angulo)).toFixed(2)}`;
}

/** Trazo de un gajo entre dos ángulos, con radio interior (0 = gajo macizo) y desplazamiento. */
function trazoGajo(r0: number, r1: number, a0: number, a1: number, dx: number, dy: number) {
  const grande = a1 - a0 > Math.PI ? 1 : 0;
  if (r0 <= 0.5) {
    return `M ${C + dx} ${C + dy} L ${punto(r1, a0, dx, dy)} A ${r1} ${r1} 0 ${grande} 1 ${punto(r1, a1, dx, dy)} Z`;
  }
  return [
    `M ${punto(r1, a0, dx, dy)}`,
    `A ${r1} ${r1} 0 ${grande} 1 ${punto(r1, a1, dx, dy)}`,
    `L ${punto(r0, a1, dx, dy)}`,
    `A ${r0} ${r0} 0 ${grande} 0 ${punto(r0, a0, dx, dy)}`,
    "Z",
  ].join(" ");
}

/** Ángulos de cada gajo, en el orden de la sección 4 y empezando arriba. Se calculan una vez. */
const GAJOS_CON_ANGULOS = GASTOS_EJEMPLO.reduce<
  ((typeof GASTOS_EJEMPLO)[number] & { a0: number; a1: number })[]
>((lista, gajo) => {
  const a0 = lista.at(-1)?.a1 ?? -Math.PI / 2;
  const a1 = a0 + (gajo.centavos / GASTO_TOTAL_EJEMPLO_CENTAVOS) * Math.PI * 2;
  return [...lista, { ...gajo, a0, a1 }];
}, []);

/**
 * La moneda en un punto de la secuencia (0 a 1): entera con el saldo grabado, abierta en los gajos
 * de las categorías (que toman su color) y, al final, con el gajo de la recomendación levantado.
 */
export function MonedaAbierta({ progreso, className = "" }: { progreso: number; className?: string }) {
  // Tiempos sincronizados con el texto de los actos (cambian en 0,3 y 0,64).
  const apertura = salida(limitar((progreso - 0.3) / 0.2));
  const levantar = salida(limitar((progreso - 0.66) / 0.14));
  const radioInterior = RADIO_INTERIOR_ANILLO * apertura;
  const separacion = 7 * apertura;

  const gajos = GAJOS_CON_ANGULOS.map(({ a0, a1, ...gajo }, i) => {
    const medio = (a0 + a1) / 2;
    const empuje = separacion + (i === GAJO_RECOMENDACION ? 24 * levantar : 0);
    // Cuando se levanta el gajo de la recomendación, los demás se apagan un poco.
    const apagado = i === GAJO_RECOMENDACION ? 1 : 1 - 0.55 * levantar;
    return {
      ...gajo,
      d: trazoGajo(radioInterior, RADIO, a0, a1, Math.cos(medio) * empuje, Math.sin(medio) * empuje),
      apagado,
    };
  });

  return (
    <svg
      viewBox="-20 -20 440 440"
      className={className}
      role="img"
      aria-label="Moneda abierta en gastos por categoría, con datos de ejemplo"
    >
      <defs>
        {/* En coordenadas del dibujo: todos los gajos comparten una sola luz, como una sola pieza de metal. */}
        <radialGradient id="metal-abierta" gradientUnits="userSpaceOnUse" cx="133" cy="106" r="300">
          <stop offset="0" stopColor="var(--m-laton-luz)" />
          <stop offset="0.5" stopColor="var(--m-laton)" />
          <stop offset="1" stopColor="var(--m-laton-sombra)" />
        </radialGradient>
      </defs>

      {/* Canto estriado: se desvanece cuando la moneda se abre */}
      <circle
        cx={C}
        cy={C}
        r={RADIO + 4}
        fill="none"
        stroke="var(--m-laton)"
        strokeWidth="9"
        strokeDasharray="2.2 2.8"
        opacity={1 - apertura}
      />

      {gajos.map((gajo) => (
        <g key={gajo.categoria} opacity={gajo.apagado}>
          <path d={gajo.d} fill="url(#metal-abierta)" />
          <path d={gajo.d} fill={gajo.color} opacity={apertura} />
          <path d={gajo.d} fill="none" stroke="var(--m-fondo)" strokeWidth={1.5 * apertura} />
        </g>
      ))}

      {/* La cara de la moneda entera, encima de los gajos: la misma moneda del inicio, con su aro
          y su leyenda. Se desvanece cuando la moneda se abre. */}
      <g opacity={limitar(1 - apertura * 1.6)}>
        <circle cx={C} cy={C} r={RADIO} fill="url(#metal-abierta)" />
        <circle
          cx={C}
          cy={C}
          r={RADIO - 14}
          fill="none"
          stroke="#5a421a"
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        <circle
          cx={C}
          cy={C}
          r={RADIO - 16}
          fill="none"
          stroke="#fff3c9"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <path
          id="curva-abierta"
          d={`M ${C} ${C} m -142 0 a 142 142 0 1 1 284 0 a 142 142 0 1 1 -284 0`}
          fill="none"
        />
        <text className="grabado" fontSize="13" fill="#4a3612" fillOpacity="0.8">
          <textPath href="#curva-abierta" startOffset="25%" textAnchor="middle">
            Finanzas · Hecha en Ecuador · 2026 ·
          </textPath>
        </text>
      </g>

      {/* Centro: el saldo grabado en la moneda entera; el total de gastos en el anillo */}
      <g opacity={limitar(1 - apertura * 2)} className="grabado" textAnchor="middle" fill="#3f2e0f">
        <text x={C} y={C - 34} fontSize="13">
          Te quedan
        </text>
        <text
          x={C}
          y={C + 18}
          fontSize="44"
          fontWeight="500"
          style={{ fontVariationSettings: '"wdth" 100', letterSpacing: "-0.02em", textTransform: "none" }}
        >
          {formatearDolares(DISPONIBLE_EJEMPLO_CENTAVOS)}
        </text>
        <text x={C} y={C + 46} fontSize="11">
          este mes
        </text>
      </g>
      <g opacity={limitar(apertura * 2 - 1) * (1 - 0.6 * levantar)} textAnchor="middle">
        <text x={C} y={C - 8} fontSize="12" fill="var(--m-texto-2)" className="grabado">
          Gastos del mes
        </text>
        <text
          x={C}
          y={C + 26}
          fontSize="30"
          fontWeight="400"
          fill="var(--m-texto)"
          style={{ letterSpacing: "-0.02em" }}
        >
          {formatearDolares(GASTO_TOTAL_EJEMPLO_CENTAVOS)}
        </text>
      </g>
    </svg>
  );
}
