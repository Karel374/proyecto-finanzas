import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import { SCRIPT_TEMA } from "@/lib/tema";

import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kanomics",
  description: "Registra tus gastos e ingresos, controla presupuestos y metas, y entiende tus finanzas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: el script del tema pone data-tema en el <html> antes de que React hidrate.
    <html lang="es" className={`${plexSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
