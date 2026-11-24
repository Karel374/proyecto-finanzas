import { Archivo } from "next/font/google";

/** Archivo con su eje de anchura: expandida para rótulos grabados, normal para titulares. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Mundo de la landing pública: casa de moneda de noche (sección 3). */
export default function LayoutPublico({ children }: LayoutProps<"/">) {
  return (
    <div data-mundo="moneda" className={`${archivo.variable} flex min-h-svh flex-col`}>
      {children}
    </div>
  );
}
