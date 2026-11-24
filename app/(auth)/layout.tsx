import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

/** La pantalla de ingreso comparte el mundo de la landing: es la puerta de la misma casa. */
export default function LayoutAuth({ children }: LayoutProps<"/">) {
  return (
    <div data-mundo="kanomics" className={`${geist.variable} ${geistMono.variable} flex min-h-svh flex-col`}>
      {children}
    </div>
  );
}
