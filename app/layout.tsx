import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Finanzas personales",
  description: "Registra tus gastos e ingresos, controla presupuestos y metas, y entiende tus finanzas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${plexSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
