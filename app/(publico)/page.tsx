import type { Metadata } from "next";

import { Landing } from "@/components/landing/landing";
import { TEXTOS } from "@/lib/landing/textos";

export const metadata: Metadata = {
  title: TEXTOS.es.meta.titulo,
  description: TEXTOS.es.meta.descripcion,
  alternates: { languages: { es: "/", en: "/en" } },
};

export default function PaginaPublica() {
  return <Landing idioma="es" />;
}
