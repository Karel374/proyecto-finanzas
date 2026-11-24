import { Archivo } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** La pantalla de ingreso comparte el mundo de la landing: es la puerta de la misma casa. */
export default function LayoutAuth({ children }: LayoutProps<"/">) {
  return (
    <div data-mundo="moneda" className={`${archivo.variable} flex min-h-svh flex-col`}>
      {children}
    </div>
  );
}
