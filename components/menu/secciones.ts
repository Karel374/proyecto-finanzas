import {
  ArrowLeftRight,
  Briefcase,
  CalendarCheck,
  ChartColumn,
  ChartPie,
  CreditCard,
  HandCoins,
  Handshake,
  House,
  Landmark,
  Lightbulb,
  Receipt,
  Settings,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type Seccion = { titulo: string; ruta: string; icono: LucideIcon; fase: number };
export type Bloque = { titulo: string; secciones: Seccion[] };

/** Menú lateral en cinco bloques (sección 3). `fase` dice en qué fase se construye cada página. */
export const BLOQUES_MENU: Bloque[] = [
  {
    titulo: "Día a día",
    secciones: [
      { titulo: "Inicio", ruta: "/panel", icono: House, fase: 5 },
      { titulo: "Movimientos", ruta: "/movimientos", icono: ArrowLeftRight, fase: 4 },
      { titulo: "Cuentas", ruta: "/cuentas", icono: Wallet, fase: 4 },
      { titulo: "Presupuestos", ruta: "/presupuestos", icono: ChartPie, fase: 6 },
    ],
  },
  {
    titulo: "Futuro",
    secciones: [
      { titulo: "Metas y plan", ruta: "/metas", icono: Target, fase: 7 },
      { titulo: "Patrimonio", ruta: "/patrimonio", icono: Landmark, fase: 8 },
      { titulo: "Deudas", ruta: "/deudas", icono: CreditCard, fase: 8 },
      { titulo: "Inversión", ruta: "/inversion", icono: TrendingUp, fase: 9 },
    ],
  },
  {
    titulo: "Crecer",
    secciones: [
      { titulo: "Ingresos", ruta: "/ingresos", icono: HandCoins, fase: 10 },
      { titulo: "Empleo", ruta: "/empleo", icono: Briefcase, fase: 11 },
    ],
  },
  {
    titulo: "Entender",
    secciones: [
      { titulo: "Análisis", ruta: "/analisis", icono: ChartColumn, fase: 14 },
      { titulo: "Recomendaciones", ruta: "/recomendaciones", icono: Lightbulb, fase: 13 },
    ],
  },
  {
    titulo: "Herramientas",
    secciones: [
      { titulo: "Revisión mensual", ruta: "/revision", icono: CalendarCheck, fase: 15 },
      { titulo: "Préstamos", ruta: "/prestamos", icono: Handshake, fase: 12 },
      { titulo: "Impuestos", ruta: "/impuestos", icono: Receipt, fase: 12 },
      { titulo: "Ajustes", ruta: "/ajustes", icono: Settings, fase: 16 },
    ],
  },
];

export function buscarSeccion(ruta: string): Seccion {
  const seccion = BLOQUES_MENU.flatMap((bloque) => bloque.secciones).find((s) => s.ruta === ruta);
  if (!seccion) throw new Error(`No hay sección para la ruta ${ruta}`);
  return seccion;
}
