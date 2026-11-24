import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

/** Mundo de Kanomics (sección 3): blanco, tinta y un solo acento. */
export default function LayoutPublico({ children }: LayoutProps<"/">) {
  return (
    <div data-mundo="kanomics" className={`${geist.variable} ${geistMono.variable} flex min-h-svh flex-col`}>
      {children}
    </div>
  );
}
