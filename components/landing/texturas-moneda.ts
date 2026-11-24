import { CanvasTexture, LinearSRGBColorSpace, RepeatWrapping, SRGBColorSpace } from "three";

/**
 * Texturas de la moneda de Kanomics, dibujadas en código: un mapa de alturas de la cara
 * (monograma K, leyenda en círculo, guilloché y canto) que se convierte en mapa de normales.
 * La moneda es de la marca: no reproduce ninguna moneda de curso legal.
 * Acabado "proof": el campo es espejo y el relieve queda escarchado, como en las monedas de colección.
 */

const LADO = 1024;

function lienzo(ancho: number, alto: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = ancho;
  c.height = alto;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Sin contexto 2D");
  return [c, ctx];
}

function gris(v: number): string {
  return `rgb(${v},${v},${v})`;
}

/** Escribe `texto` siguiendo un círculo de radio `radio`, centrado arriba. */
function textoEnCirculo(ctx: CanvasRenderingContext2D, texto: string, radio: number, tamano: number) {
  ctx.save();
  ctx.translate(LADO / 2, LADO / 2);
  ctx.font = `600 ${tamano}px Geist, "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const letras = [...texto];
  const paso = (Math.PI * 2) / letras.length;
  letras.forEach((letra, i) => {
    ctx.save();
    ctx.rotate(i * paso);
    ctx.translate(0, -radio);
    ctx.fillText(letra, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

/** Mapa de alturas de la cara: blanco es relieve alto, gris medio es el campo. */
function alturasCara(lema: string): HTMLCanvasElement {
  const [c, ctx] = lienzo(LADO, LADO);
  const centro = LADO / 2;
  const R = LADO / 2;

  ctx.fillStyle = gris(0);
  ctx.fillRect(0, 0, LADO, LADO);

  // Campo
  ctx.fillStyle = gris(96);
  ctx.beginPath();
  ctx.arc(centro, centro, R, 0, Math.PI * 2);
  ctx.fill();

  // Borde elevado con bisel interior suave
  const bisel = ctx.createRadialGradient(centro, centro, R * 0.88, centro, centro, R * 0.97);
  bisel.addColorStop(0, gris(96));
  bisel.addColorStop(0.55, gris(210));
  bisel.addColorStop(1, gris(225));
  ctx.fillStyle = bisel;
  ctx.beginPath();
  ctx.arc(centro, centro, R, 0, Math.PI * 2);
  ctx.arc(centro, centro, R * 0.88, 0, Math.PI * 2, true);
  ctx.fill();

  ctx.filter = "blur(1.2px)";

  // Línea fina de perlas bajo el borde
  ctx.fillStyle = gris(170);
  const perlas = 120;
  for (let i = 0; i < perlas; i++) {
    const a = (i / perlas) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(centro + Math.cos(a) * R * 0.835, centro + Math.sin(a) * R * 0.835, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Leyenda
  ctx.fillStyle = gris(200);
  textoEnCirculo(ctx, lema, R * 0.72, 50);

  // Guilloché: anillos finos y concéntricos alrededor del monograma
  ctx.strokeStyle = gris(122);
  ctx.lineWidth = 1.6;
  for (let r = R * 0.22; r < R * 0.6; r += 9) {
    ctx.beginPath();
    ctx.arc(centro, centro, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Disco liso detrás del monograma
  ctx.fillStyle = gris(96);
  ctx.beginPath();
  ctx.arc(centro, centro, R * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = gris(180);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(centro, centro, R * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // Monograma
  ctx.filter = "blur(2.2px)";
  ctx.fillStyle = gris(240);
  ctx.font = `700 ${Math.round(R * 0.62)}px Geist, "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("K", centro, centro + R * 0.03);
  ctx.filter = "none";

  return c;
}

/** Convierte un mapa de alturas en mapa de normales (convención OpenGL, Y hacia arriba). */
function normalesDesde(alturas: HTMLCanvasElement, fuerza: number, envolverX = false): HTMLCanvasElement {
  const ancho = alturas.width;
  const alto = alturas.height;
  const origen = alturas.getContext("2d")!.getImageData(0, 0, ancho, alto).data;
  const [c, ctx] = lienzo(ancho, alto);
  const salida = ctx.createImageData(ancho, alto);
  const h = (x: number, y: number) => {
    const xx = envolverX ? (x + ancho) % ancho : Math.min(ancho - 1, Math.max(0, x));
    const yy = Math.min(alto - 1, Math.max(0, y));
    return origen[(yy * ancho + xx) * 4]! / 255;
  };
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * fuerza;
      const dy = (h(x, y + 1) - h(x, y - 1)) * fuerza;
      const nx = -dx;
      const ny = dy;
      const largo = Math.hypot(nx, ny, 1);
      const i = (y * ancho + x) * 4;
      salida.data[i] = ((nx / largo) * 0.5 + 0.5) * 255;
      salida.data[i + 1] = ((ny / largo) * 0.5 + 0.5) * 255;
      salida.data[i + 2] = ((1 / largo) * 0.5 + 0.5) * 255;
      salida.data[i + 3] = 255;
    }
  }
  ctx.putImageData(salida, 0, 0);
  return c;
}

/** Rugosidad: el relieve escarchado, el campo espejo con un pulido concéntrico apenas visible. */
function rugosidadDesde(alturas: HTMLCanvasElement): HTMLCanvasElement {
  const ancho = alturas.width;
  const alto = alturas.height;
  const origen = alturas.getContext("2d")!.getImageData(0, 0, ancho, alto).data;
  const [c, ctx] = lienzo(ancho, alto);
  const salida = ctx.createImageData(ancho, alto);
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const i = (y * ancho + x) * 4;
      const altura = origen[i]!;
      const radio = Math.hypot(x - ancho / 2, y - alto / 2);
      const pulido = 0.5 + 0.5 * Math.sin(radio * 1.7);
      const relieve = altura > 150 ? 1 : altura > 110 ? 0.5 : 0;
      const valor = 0.13 + pulido * 0.05 + relieve * 0.3;
      salida.data[i] = salida.data[i + 1] = salida.data[i + 2] = valor * 255;
      salida.data[i + 3] = 255;
    }
  }
  ctx.putImageData(salida, 0, 0);
  return c;
}

/** Canto estriado: franjas verticales que se repiten alrededor. */
function alturasCanto(): HTMLCanvasElement {
  const [c, ctx] = lienzo(2048, 32);
  const estrias = 220;
  const imagen = ctx.createImageData(2048, 32);
  for (let x = 0; x < 2048; x++) {
    const v = 0.5 + 0.5 * Math.cos(((x / 2048) * estrias * Math.PI * 2) % (Math.PI * 2));
    for (let y = 0; y < 32; y++) {
      const i = (y * 2048 + x) * 4;
      imagen.data[i] = imagen.data[i + 1] = imagen.data[i + 2] = v * 255;
      imagen.data[i + 3] = 255;
    }
  }
  ctx.putImageData(imagen, 0, 0);
  return c;
}

export interface TexturasMoneda {
  caraNormal: CanvasTexture;
  caraRugosidad: CanvasTexture;
  cantoNormal: CanvasTexture;
  sombra: CanvasTexture;
  liberar: () => void;
}

/** Sombra suave: un degradado radial que se estira bajo la moneda. */
function texturaSombra(): HTMLCanvasElement {
  const [c, ctx] = lienzo(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(20,28,40,0.55)");
  g.addColorStop(0.45, "rgba(20,28,40,0.22)");
  g.addColorStop(1, "rgba(20,28,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return c;
}

export function crearTexturasMoneda(lema: string): TexturasMoneda {
  const alturas = alturasCara(lema);

  const caraNormal = new CanvasTexture(normalesDesde(alturas, 9));
  caraNormal.colorSpace = LinearSRGBColorSpace;
  caraNormal.anisotropy = 8;

  const caraRugosidad = new CanvasTexture(rugosidadDesde(alturas));
  caraRugosidad.colorSpace = LinearSRGBColorSpace;

  const cantoNormal = new CanvasTexture(normalesDesde(alturasCanto(), 3, true));
  cantoNormal.colorSpace = LinearSRGBColorSpace;
  cantoNormal.wrapS = RepeatWrapping;

  const sombra = new CanvasTexture(texturaSombra());
  sombra.colorSpace = SRGBColorSpace;

  return {
    caraNormal,
    caraRugosidad,
    cantoNormal,
    sombra,
    liberar() {
      caraNormal.dispose();
      caraRugosidad.dispose();
      cantoNormal.dispose();
      sombra.dispose();
    },
  };
}
