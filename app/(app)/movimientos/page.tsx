import Link from "next/link";
import { Suspense } from "react";

import { FiltrosMovimientos } from "@/components/movimientos/filtros";
import { ListaRecurrentes } from "@/components/movimientos/lista-recurrentes";
import { TablaMovimientos } from "@/components/movimientos/tabla-movimientos";
import { datosDelFormulario, listarMovimientos } from "@/lib/datos/movimientos";
import { listarRecurrentes } from "@/lib/datos/recurrentes";
import { formatearDolares, formatearMovimiento } from "@/lib/dinero";
import { esquemaFiltrosMovimientos } from "@/lib/esquemas";

type Parametros = Record<string, string | string[] | undefined>;

const lista = (valor: string | string[] | undefined) =>
  valor === undefined ? [] : Array.isArray(valor) ? valor : [valor];
const uno = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor);

export default function PaginaMovimientos({ searchParams }: PageProps<"/movimientos">) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-[28px] font-semibold">Movimientos</h1>
      <Suspense fallback={<p className="text-texto-2 text-sm">Cargando movimientos…</p>}>
        <Contenido parametros={searchParams} />
      </Suspense>
    </section>
  );
}

async function Contenido({ parametros }: { parametros: Promise<Parametros> }) {
  const crudos = await parametros;
  const vista = uno(crudos.vista) === "recurrentes" ? "recurrentes" : "movimientos";

  return (
    <>
      <nav aria-label="Vistas de movimientos" className="border-borde flex gap-1 border-b">
        {(
          [
            ["movimientos", "Movimientos", "/movimientos"],
            ["recurrentes", "Recurrentes", "/movimientos?vista=recurrentes"],
          ] as const
        ).map(([valor, etiqueta, href]) => (
          <Link
            key={valor}
            href={href}
            aria-current={vista === valor ? "page" : undefined}
            className={`focus-visible:outline-acento -mb-px border-b-2 px-4 py-2 text-sm font-medium focus-visible:outline-2 ${
              vista === valor
                ? "border-acento text-texto"
                : "text-texto-2 hover:text-texto border-transparent"
            }`}
          >
            {etiqueta}
          </Link>
        ))}
      </nav>
      {vista === "recurrentes" ? <VistaRecurrentes /> : <VistaMovimientos crudos={crudos} />}
    </>
  );
}

async function VistaMovimientos({ crudos }: { crudos: Parametros }) {
  const filtros = esquemaFiltrosMovimientos.parse({
    periodo: uno(crudos.periodo),
    desde: uno(crudos.desde),
    hasta: uno(crudos.hasta),
    tipo: uno(crudos.tipo),
    categorias: lista(crudos.categoria),
    cuentas: lista(crudos.cuenta),
    texto: uno(crudos.texto),
    pagina: uno(crudos.pagina),
  });
  const [pagina, formulario] = await Promise.all([listarMovimientos(filtros), datosDelFormulario()]);

  return (
    <div className="flex flex-col gap-6">
      <FiltrosMovimientos
        filtros={filtros}
        rango={pagina.rango}
        categorias={formulario.categorias}
        cuentas={formulario.cuentas}
      />

      <dl className="grid grid-cols-3 gap-6">
        <Cifra
          etiqueta="Ingresos"
          valor={formatearMovimiento(pagina.resumen.ingresosCentavos, "INGRESO")}
          clase="text-ingreso"
        />
        <Cifra
          etiqueta="Gastos"
          valor={formatearMovimiento(pagina.resumen.gastosCentavos, "GASTO")}
          clase="text-gasto"
        />
        <Cifra
          etiqueta="Balance"
          valor={formatearDolares(pagina.resumen.balanceCentavos)}
          clase="text-texto"
        />
      </dl>

      <TablaMovimientos movimientos={pagina.movimientos} />

      {pagina.paginas > 1 ? (
        <Paginacion
          actual={filtros.pagina}
          total={pagina.paginas}
          crudos={crudos}
          cantidad={pagina.cantidad}
        />
      ) : null}
    </div>
  );
}

function Cifra({ etiqueta, valor, clase }: { etiqueta: string; valor: string; clase: string }) {
  return (
    <div className="border-borde bg-superficie flex flex-col gap-1 rounded-lg border p-4">
      <dt className="text-texto-2 text-sm">{etiqueta}</dt>
      <dd className={`text-xl font-semibold ${clase}`}>{valor}</dd>
    </div>
  );
}

function Paginacion({
  actual,
  total,
  crudos,
  cantidad,
}: {
  actual: number;
  total: number;
  crudos: Parametros;
  cantidad: number;
}) {
  const enlace = (pagina: number) => {
    const parametros = new URLSearchParams();
    for (const [clave, valor] of Object.entries(crudos)) {
      if (clave === "pagina") continue;
      for (const v of lista(valor)) parametros.append(clave, v);
    }
    parametros.set("pagina", String(pagina));
    return `/movimientos?${parametros}`;
  };
  const clase =
    "border-borde bg-superficie hover:bg-superficie-2 focus-visible:outline-acento rounded-md border px-3 py-1.5 text-sm focus-visible:outline-2";
  return (
    <nav aria-label="Páginas" className="flex items-center justify-between">
      <p className="text-texto-3 text-sm">
        Página {actual} de {total} · {cantidad} movimientos
      </p>
      <div className="flex gap-2">
        {actual > 1 ? (
          <Link className={clase} href={enlace(actual - 1)}>
            Anterior
          </Link>
        ) : null}
        {actual < total ? (
          <Link className={clase} href={enlace(actual + 1)}>
            Siguiente
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

async function VistaRecurrentes() {
  const [recurrentes, formulario] = await Promise.all([listarRecurrentes(), datosDelFormulario()]);
  return (
    <ListaRecurrentes
      recurrentes={recurrentes}
      categorias={formulario.categorias}
      cuentas={formulario.cuentas}
    />
  );
}
