"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleGeometry,
  DoubleSide,
  type Group,
  LatheGeometry,
  type Mesh,
  MeshPhysicalMaterial,
  PMREMGenerator,
  type PerspectiveCamera,
  Vector2,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { EVENTO_ESCENA_LISTA, EVENTO_FIN_ENTRADA, EVENTO_TITULO, moneda } from "./estado-moneda";
import { crearTexturasMoneda, type TexturasMoneda } from "./texturas-moneda";

const GROSOR = 0.075; // mitad del grosor, con radio 1
const RADIO_CARA = 0.935;
const TITANIO = "#c9d1db";

/** Tiempos de la entrada, en segundos. */
const CAIDA = 0.62;
const REBOTE = 0.3;
const GIRO = 2.1;
const VUELTAS = 5;

const facilSalida = (t: number) => 1 - (1 - t) ** 3;
const facilEntrada = (t: number) => t * t;

/** Perfil del canto: bisel redondeado arriba y abajo, como una moneda acuñada. */
function geometriaCanto(): LatheGeometry {
  const perfil = [
    [RADIO_CARA - 0.005, GROSOR],
    [0.962, GROSOR - 0.002],
    [0.985, GROSOR - 0.012],
    [0.997, GROSOR - 0.03],
    [1, GROSOR - 0.045],
    [1, -GROSOR + 0.045],
    [0.997, -GROSOR + 0.03],
    [0.985, -GROSOR + 0.012],
    [0.962, -GROSOR + 0.002],
    [RADIO_CARA - 0.005, -GROSOR],
  ].map(([x, y]) => new Vector2(x, y));
  return new LatheGeometry(perfil, 180);
}

/** Entorno de estudio generado en código: reflejos de softbox sin descargar ningún HDRI. */
function Entorno() {
  const gl = useThree((s) => s.gl);
  const mapa = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const ambiente = new RoomEnvironment();
    const textura = pmrem.fromScene(ambiente, 0.03).texture;
    ambiente.dispose();
    pmrem.dispose();
    return textura;
  }, [gl]);
  useEffect(() => () => mapa.dispose(), [mapa]);
  // R3F lo cuelga de la escena como `scene.environment`.
  return <primitive object={mapa} attach="environment" />;
}

function Moneda({ texturas }: { texturas: TexturasMoneda }) {
  const posicion = useRef<Group>(null);
  const rumbo = useRef<Group>(null);
  const inclinacion = useRef<Group>(null);
  const rodado = useRef<Group>(null);
  const sombra = useRef<Mesh>(null);
  const inicio = useRef<number | null>(null);
  const avisos = useRef({ titulo: false, fin: false });
  const { camera, size, invalidate } = useThree();

  const { canto, cara, materialCanto, materialCara } = useMemo(() => {
    const materialCara = new MeshPhysicalMaterial({
      color: TITANIO,
      metalness: 1,
      roughness: 1,
      roughnessMap: texturas.caraRugosidad,
      normalMap: texturas.caraNormal,
      normalScale: new Vector2(1.15, 1.15),
      clearcoat: 0.35,
      clearcoatRoughness: 0.12,
    });
    const materialCanto = new MeshPhysicalMaterial({
      color: TITANIO,
      metalness: 1,
      roughness: 0.26,
      normalMap: texturas.cantoNormal,
      normalScale: new Vector2(0.9, 0.9),
      clearcoat: 0.25,
      side: DoubleSide,
    });
    return {
      canto: geometriaCanto(),
      cara: new CircleGeometry(RADIO_CARA, 160),
      materialCanto,
      materialCara,
    };
  }, [texturas]);

  useEffect(() => {
    moneda.redibujar = invalidate;
    invalidate();
    return () => {
      moneda.redibujar = () => {};
    };
  }, [invalidate]);

  useEffect(
    () => () => {
      canto.dispose();
      cara.dispose();
      materialCanto.dispose();
      materialCara.dispose();
    },
    [canto, cara, materialCanto, materialCara],
  );

  useFrame((estado) => {
    if (!moneda.listo || !posicion.current || !rumbo.current || !inclinacion.current || !rodado.current)
      return;
    const cam = camera as PerspectiveCamera;
    const pxAMundo = (2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z) / size.height;
    const radio = (moneda.diametro / 2) * pxAMundo;

    // Entrada: caída, rebote, giro que se frena y se detiene de frente.
    let alturaExtra = 0;
    let giroExtra = 0;
    let tambaleo = 0;
    let volteo = 0;
    if (moneda.conEntrada && !avisos.current.fin) {
      inicio.current ??= estado.clock.elapsedTime;
      let t = estado.clock.elapsedTime - inicio.current;
      if (moneda.saltarEntrada) t = CAIDA + GIRO;
      const total = CAIDA + GIRO;
      if (t < CAIDA) {
        const u = t / CAIDA;
        alturaExtra = (1 - facilEntrada(u)) * (moneda.y + moneda.diametro) * pxAMundo;
        volteo = (1 - u) * Math.PI * 3;
      } else if (t < total) {
        const r = t - CAIDA;
        if (r < REBOTE) alturaExtra = Math.sin((r / REBOTE) * Math.PI) * radio * 0.16;
        const u = r / GIRO;
        const amortiguado = (1 - u) ** 2;
        giroExtra = -VUELTAS * Math.PI * 2 * (1 - facilSalida(u));
        tambaleo = 0.22 * amortiguado * Math.sin(r * 9);
        if (!avisos.current.titulo && u > 0.18) {
          avisos.current.titulo = true;
          window.dispatchEvent(new Event(EVENTO_TITULO));
        }
      } else {
        avisos.current.fin = true;
        if (!avisos.current.titulo) window.dispatchEvent(new Event(EVENTO_TITULO));
        window.dispatchEvent(new Event(EVENTO_FIN_ENTRADA));
      }
    }

    const x = (moneda.x - size.width / 2) * pxAMundo;
    const y = -(moneda.y - size.height / 2) * pxAMundo + alturaExtra;
    posicion.current.position.set(x, y, 0);
    posicion.current.scale.setScalar(Math.max(radio, 0.0001));
    rumbo.current.rotation.z = moneda.rumbo + tambaleo;
    inclinacion.current.rotation.y = moneda.inclinacion + giroExtra;
    inclinacion.current.rotation.x = volteo;
    rodado.current.rotation.y = moneda.rodado;

    if (sombra.current) {
      const m = moneda.modoSombra;
      const elevada = alturaExtra / Math.max(radio, 0.0001);
      const piso = Math.max(0, 1 - elevada * 0.25);
      sombra.current.position.set(
        x + radio * 0.22 * m,
        -(moneda.y - size.height / 2) * pxAMundo - radio * (1.02 - 1.26 * m),
        -0.6,
      );
      sombra.current.scale.set(radio * (2.3 - 0.4 * m), radio * (0.34 + 1.6 * m), 1);
      (sombra.current.material as MeshPhysicalMaterial).opacity = (0.8 - 0.5 * m) * piso;
    }
    // Solo la entrada necesita cuadros seguidos; el resto lo pide el controlador al moverse.
    if (moneda.conEntrada && !avisos.current.fin) invalidate();
  });

  return (
    <>
      <mesh ref={sombra} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texturas.sombra} transparent depthWrite={false} />
      </mesh>
      <group ref={posicion}>
        <group ref={rumbo}>
          <group ref={inclinacion}>
            {/* El eje de la moneda pasa de vertical a horizontal: así "inclinación" la pone de frente. */}
            <group rotation={[0, 0, Math.PI / 2]}>
              <group ref={rodado}>
                <mesh geometry={canto} material={materialCanto} />
                <mesh
                  geometry={cara}
                  material={materialCara}
                  position={[0, GROSOR, 0]}
                  rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                />
                <mesh
                  geometry={cara}
                  material={materialCara}
                  position={[0, -GROSOR, 0]}
                  rotation={[Math.PI / 2, 0, Math.PI / 2]}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </>
  );
}

function Contenido({ lema }: { lema: string }) {
  const [texturas, setTexturas] = useState<TexturasMoneda | null>(null);

  useEffect(() => {
    let vivo = true;
    let creadas: TexturasMoneda | null = null;
    // Se espera a la fuente para que el monograma y la leyenda salgan en Geist.
    void document.fonts.ready.then(() => {
      if (!vivo) return;
      creadas = crearTexturasMoneda(lema);
      setTexturas(creadas);
      window.dispatchEvent(new Event(EVENTO_ESCENA_LISTA));
    });
    return () => {
      vivo = false;
      creadas?.liberar();
    };
  }, [lema]);

  return (
    <>
      <Entorno />
      <directionalLight position={[-6, 8, 10]} intensity={1.6} />
      <directionalLight position={[8, -4, 6]} intensity={0.5} color="#dfe8f5" />
      {texturas ? <Moneda texturas={texturas} /> : null}
    </>
  );
}

/** Lienzo fijo que cubre la ventana, transparente y sin capturar el puntero. */
export default function EscenaMoneda({ lema }: { lema: string }) {
  return (
    <Canvas
      className="escena-moneda"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, position: [0, 0, 20], near: 0.1, far: 100 }}
      frameloop="demand"
      aria-hidden="true"
    >
      <Contenido lema={lema} />
    </Canvas>
  );
}
