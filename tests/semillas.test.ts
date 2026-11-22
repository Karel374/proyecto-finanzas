import { describe, expect, it } from "vitest";

import { DISTRIBUCION_OBJETIVO_SEMILLA, PLANTILLAS_MENSAJE_SEMILLA } from "@/lib/semillas/ajustes";
import { CATEGORIAS_SEMILLA } from "@/lib/semillas/categorias";
import { AREA_GENERAL, AREA_TECNOLOGIA, IDEAS_SEMILLA } from "@/lib/semillas/ideas";

describe("categorías semilla (sección 4)", () => {
  it("son 15: diez de gasto y cinco de ingreso", () => {
    expect(CATEGORIAS_SEMILLA).toHaveLength(15);
    expect(CATEGORIAS_SEMILLA.filter((c) => c.tipo === "GASTO")).toHaveLength(10);
    expect(CATEGORIAS_SEMILLA.filter((c) => c.tipo === "INGRESO")).toHaveLength(5);
  });

  it("incluyen las dos categorías de sistema con su tipo", () => {
    const intereses = CATEGORIAS_SEMILLA.find((c) => c.sistema === "INTERESES_COMISIONES");
    const rendimientos = CATEGORIAS_SEMILLA.find((c) => c.sistema === "RENDIMIENTOS");
    expect(intereses).toMatchObject({ nombre: "Intereses y comisiones", tipo: "GASTO", clase: "NECESIDAD" });
    expect(rendimientos).toMatchObject({ nombre: "Rendimientos", tipo: "INGRESO", clase: null });
  });

  it("tienen nombre y orden únicos dentro de cada tipo", () => {
    for (const tipo of ["GASTO", "INGRESO"] as const) {
      const delTipo = CATEGORIAS_SEMILLA.filter((c) => c.tipo === tipo);
      expect(new Set(delTipo.map((c) => c.nombre)).size).toBe(delTipo.length);
      expect(new Set(delTipo.map((c) => c.orden)).size).toBe(delTipo.length);
    }
  });

  it("los gastos tienen clase 50/30/20 y los ingresos no", () => {
    for (const categoria of CATEGORIAS_SEMILLA) {
      if (categoria.tipo === "GASTO") expect(categoria.clase).not.toBeNull();
      else expect(categoria.clase).toBeNull();
    }
  });

  it("las cuatro necesidades son las de la tabla, más Intereses y comisiones", () => {
    const necesidades = CATEGORIAS_SEMILLA.filter((c) => c.clase === "NECESIDAD").map((c) => c.nombre);
    expect(necesidades).toEqual([
      "Alimentación",
      "Transporte",
      "Vivienda y servicios",
      "Salud",
      "Intereses y comisiones",
    ]);
  });

  it("los slots de color van de 1 a 8, sin repetirse dentro de cada tipo", () => {
    for (const tipo of ["GASTO", "INGRESO"] as const) {
      const slots = CATEGORIAS_SEMILLA.filter((c) => c.tipo === tipo && c.colorSlot !== null).map(
        (c) => c.colorSlot as number,
      );
      expect(new Set(slots).size).toBe(slots.length);
      for (const slot of slots) expect(slot).toBeGreaterThanOrEqual(1);
      for (const slot of slots) expect(slot).toBeLessThanOrEqual(8);
    }
  });
});

describe("ideas semilla (sección 13 y Anexo A)", () => {
  it("son 71: 12 de tecnología, 3 generales y 56 en 14 áreas de 4 ideas", () => {
    expect(IDEAS_SEMILLA).toHaveLength(71);
    expect(IDEAS_SEMILLA.filter((i) => i.area === AREA_TECNOLOGIA)).toHaveLength(12);
    expect(IDEAS_SEMILLA.filter((i) => i.area === AREA_GENERAL)).toHaveLength(3);

    const otras = IDEAS_SEMILLA.filter((i) => i.area !== AREA_TECNOLOGIA && i.area !== AREA_GENERAL);
    const porArea = new Map<string, number>();
    for (const idea of otras) porArea.set(idea.area, (porArea.get(idea.area) ?? 0) + 1);
    expect(porArea.size).toBe(14);
    for (const cantidad of porArea.values()) expect(cantidad).toBe(4);
  });

  it("no repiten título", () => {
    expect(new Set(IDEAS_SEMILLA.map((i) => i.titulo)).size).toBe(IDEAS_SEMILLA.length);
  });

  it("tienen todos los campos llenos y un rango de horas válido", () => {
    for (const idea of IDEAS_SEMILLA) {
      for (const campo of [
        idea.titulo,
        idea.descripcion,
        idea.tiempoPrimerCobro,
        idea.canales,
        idea.requisitos,
      ]) {
        expect(campo.trim(), idea.titulo).not.toBe("");
      }
      expect(idea.habilidadesRequeridas.length, idea.titulo).toBeGreaterThan(0);
      expect(idea.pasos.length, idea.titulo).toBeGreaterThanOrEqual(3);
      expect(idea.horasSemanaMin, idea.titulo).toBeGreaterThan(0);
      expect(idea.horasSemanaMax, idea.titulo).toBeGreaterThanOrEqual(idea.horasSemanaMin);
    }
  });

  it("ninguna trae montos en dólares (principio: ningún número se inventa)", () => {
    for (const idea of IDEAS_SEMILLA) {
      const texto = [
        idea.descripcion,
        idea.tiempoPrimerCobro,
        idea.canales,
        idea.requisitos,
        ...idea.pasos,
      ].join(" ");
      expect(texto, idea.titulo).not.toMatch(/\$|USD|dólares?\s+\d|\d+\s*dólares/i);
    }
  });

  it("el tiempo hasta el primer cobro va en semanas o meses", () => {
    for (const idea of IDEAS_SEMILLA) {
      expect(idea.tiempoPrimerCobro, idea.titulo).toMatch(/semanas?|mes(es)?$/);
    }
  });
});

describe("ajustes semilla", () => {
  it("cada perfil de la distribución objetivo suma 100 %", () => {
    for (const perfil of Object.values(DISTRIBUCION_OBJETIVO_SEMILLA)) {
      const suma = Object.values(perfil).reduce<number>((total, valor) => total + valor, 0);
      expect(suma).toBe(100);
    }
  });

  it("solo el perfil agresivo incluye cripto, con tope de 5 %", () => {
    expect(DISTRIBUCION_OBJETIVO_SEMILLA.CONSERVADOR.cripto).toBe(0);
    expect(DISTRIBUCION_OBJETIVO_SEMILLA.MODERADO.cripto).toBe(0);
    expect(DISTRIBUCION_OBJETIVO_SEMILLA.AGRESIVO.cripto).toBe(5);
  });

  it("las plantillas de mensaje solo usan los campos de la sección 13", () => {
    const permitidos = new Set(["cliente", "servicio", "precio", "mi_nombre", "mi_profesion", "habilidades"]);
    for (const texto of Object.values(PLANTILLAS_MENSAJE_SEMILLA)) {
      const campos = [...texto.matchAll(/\{(\w+)\}/g)].map((coincidencia) => coincidencia[1]);
      expect(campos.length).toBeGreaterThan(0);
      for (const campo of campos) expect(permitidos.has(campo), campo).toBe(true);
    }
  });
});
