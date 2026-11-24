import type { Metadata } from "next";

import { Landing } from "@/components/landing/landing";
import { TEXTOS } from "@/lib/landing/textos";

export const metadata: Metadata = {
  title: TEXTOS.en.meta.titulo,
  description: TEXTOS.en.meta.descripcion,
  alternates: { languages: { es: "/", en: "/en" } },
};

export default function PaginaPublicaIngles() {
  return <Landing idioma="en" />;
}
