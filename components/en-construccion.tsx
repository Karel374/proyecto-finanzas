import { buscarSeccion } from "@/components/menu/secciones";

/** Página provisional de una sección que se construye en una fase posterior. */
export function EnConstruccion({ ruta }: { ruta: string }) {
  const { titulo, fase } = buscarSeccion(ruta);
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-[28px] font-semibold">{titulo}</h1>
      <p className="text-texto-2 text-base">Esta sección se construye en la fase {fase}.</p>
    </section>
  );
}
