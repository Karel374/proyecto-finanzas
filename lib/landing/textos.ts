/**
 * Textos de la landing de Kanomics en español e inglés. Ningún monto es real: los de las
 * pantallas de muestra llevan la etiqueta de "datos de ejemplo".
 */

export type Idioma = "es" | "en";

export type Estado = "disponible" | "proximamente";

export interface TextosLanding {
  meta: { titulo: string; descripcion: string };
  nav: {
    recorrido: string;
    donde: string;
    creador: string;
    entrar: string;
    saltar: string;
    otroIdioma: string;
  };
  hero: { rotulo: string; bajada: string; recorrido: string; pista: string };
  estados: Record<Estado, string>;
  ejemplo: string;
  problema: {
    rotulo: string;
    titulo: string;
    cuerpo: string;
    fugasTitulo: string;
    fugas: [string, string][];
    fugasTotal: [string, string];
  };
  mision: { rotulo: string; titulo: string; cuerpo: string; preguntas: string[] };
  funciona: {
    rotulo: string;
    titulo: string;
    pasos: { nombre: string; titulo: string; cuerpo: string; estado: Estado }[];
  };
  registro: {
    titulo: string;
    monto: string;
    categoria: string;
    categorias: string[];
    cuenta: string;
    guardar: string;
  };
  panel: {
    titulo: string;
    queda: string;
    deMes: string;
    gastado: string;
    semanas: string[];
    categorias: string[];
  };
  consejo: { titulo: string; texto: string; porque: string; dato: string };
  donde: {
    rotulo: string;
    titulo: string;
    cuerpo: string;
    pais: string;
    filas: { tema: string; detalle: string; estado: Estado }[];
    siguiente: string;
  };
  privacidad: { rotulo: string; titulo: string; puntos: { titulo: string; cuerpo: string }[] };
  creador: {
    rotulo: string;
    titulo: string;
    cuerpo: string;
    codigo: string;
    fichaTitulo: string;
    ficha: [string, string][];
  };
  final: {
    titulo: string;
    cuerpo: string;
    tarjeta: string;
    demo: string;
    demoNota: string;
    privacidad: string;
  };
  pie: { hecho: string; codigo: string };
  google: { entrar: string; abriendo: string; sinGoogle: string };
}

const es: TextosLanding = {
  meta: {
    titulo: "Kanomics · Tu dinero, contado con claridad",
    descripcion:
      "Finanzas personales sin ruido: registra un gasto en segundos, mira en qué se te va cada dólar y decide con datos. Gratis y privada. Hecha en Ecuador.",
  },
  nav: {
    recorrido: "Recorrido",
    donde: "Dónde funciona",
    creador: "Quién la hace",
    entrar: "Entrar",
    saltar: "Saltar al contenido",
    otroIdioma: "EN",
  },
  hero: {
    rotulo: "Finanzas personales · Hecha en Ecuador",
    bajada:
      "Registra en segundos, entiende en qué se te va y decide con datos, no con corazonadas. Gratis, privada y sin letra chica.",
    recorrido: "Ver el recorrido",
    pista: "Desliza. La moneda te guía.",
  },
  estados: { disponible: "Disponible", proximamente: "Próximamente" },
  ejemplo: "Datos de ejemplo",
  problema: {
    rotulo: "01 · El problema",
    titulo: "El dinero no se pierde. Se escapa.",
    cuerpo:
      "Un café aquí, una suscripción que olvidaste allá, el delivery de las once de la noche. Ningún gasto parece grande y, aun así, el mes se acaba antes que el sueldo.",
    fugasTitulo: "Fugas típicas de un mes",
    fugas: [
      ["Café de la mañana", "$2,50"],
      ["Suscripción olvidada", "$10,99"],
      ["Delivery nocturno", "$8,75"],
      ["Comisión del banco", "$1,20"],
    ],
    fugasTotal: ["Se fueron sin que lo notaras", "$23,44"],
  },
  mision: {
    rotulo: "02 · La misión",
    titulo: "Que cada dólar tenga un destino.",
    cuerpo:
      "Kanomics existe para responder tres preguntas en cualquier momento. Sin hojas de cálculo, sin culpa y sin fórmulas que tengas que armar tú.",
    preguntas: ["¿Cuánto me queda?", "¿En qué se me va?", "¿Qué debería hacer?"],
  },
  funciona: {
    rotulo: "03 · Cómo funciona",
    titulo: "Tres pasos. Cero fricción.",
    pasos: [
      {
        nombre: "Registrar",
        titulo: "Un gasto en menos de 10 segundos.",
        cuerpo:
          "Pulsa N desde cualquier pantalla, escribe el monto y presiona Enter. Tu categoría habitual ya viene elegida, y los pagos fijos como el arriendo se registran solos.",
        estado: "disponible",
      },
      {
        nombre: "Entender",
        titulo: "Tu mes, de un vistazo.",
        cuerpo:
          "Ingresos, gastos y lo que te queda, por categoría, semana y mes. La app hace las cuentas; tú solo miras.",
        estado: "proximamente",
      },
      {
        nombre: "Decidir",
        titulo: "Consejos que muestran su porqué.",
        cuerpo:
          "Reglas fijas revisan tus números y te dicen qué hacer, junto al dato exacto que las disparó. Nada de cajas negras.",
        estado: "proximamente",
      },
    ],
  },
  registro: {
    titulo: "Nuevo gasto",
    monto: "Monto",
    categoria: "Categoría",
    categorias: ["Comida", "Transporte", "Hogar", "Ocio"],
    cuenta: "Cuenta corriente",
    guardar: "Guardar",
  },
  panel: {
    titulo: "Noviembre",
    queda: "Te quedan",
    deMes: "de tu mes",
    gastado: "Gastado por semana",
    semanas: ["S1", "S2", "S3", "S4"],
    categorias: ["Hogar", "Comida", "Transporte", "Ocio", "Otros"],
  },
  consejo: {
    titulo: "Consejo",
    texto: "Baja Ocio a $60 este mes y ahorras $24.",
    porque: "Por qué",
    dato: "Gastaste $84 en Ocio, 40 % más que tu promedio.",
  },
  donde: {
    rotulo: "04 · Dónde funciona",
    titulo: "Empieza en Ecuador. No se queda ahí.",
    cuerpo:
      "Lo general sirve en cualquier país: registrar, presupuestar, ahorrar. Lo local llega como un paquete por país, con sus impuestos, su moneda y su hora. Ecuador es el primero.",
    pais: "Paquete Ecuador",
    filas: [
      {
        tema: "Moneda y hora",
        detalle: "Dólares, y el día cierra a la medianoche de Guayaquil.",
        estado: "disponible",
      },
      {
        tema: "Deducibles del SRI",
        detalle: "Gastos por rubro y tu tope, de 7 a 20 canastas.",
        estado: "proximamente",
      },
      {
        tema: "Aporte al IESS",
        detalle: "El sueldo que de verdad te llega, con el 9,45 % descontado.",
        estado: "proximamente",
      },
      {
        tema: "Seguro de Cosede",
        detalle: "Aviso si pasas de los $32.000 cubiertos en un banco.",
        estado: "proximamente",
      },
    ],
    siguiente: "Siguientes países: el mismo motor, otro paquete.",
  },
  privacidad: {
    rotulo: "05 · Privacidad",
    titulo: "Tus números son tuyos.",
    puntos: [
      {
        titulo: "Separados por usuario",
        cuerpo: "Cada consulta queda atada a tu sesión. Hay pruebas que intentan leer datos ajenos y fallan.",
      },
      {
        titulo: "Sin terceros",
        cuerpo:
          "Ningún dato financiero sale hacia otros servicios. Ni anuncios, ni rastreadores, ni IA externa.",
      },
      {
        titulo: "Código abierto",
        cuerpo: "Todo el código está en GitHub para que cualquiera revise cómo se guarda tu dinero.",
      },
    ],
  },
  creador: {
    rotulo: "06 · Quién la hace",
    titulo: "Hecha por una persona, no por un banco.",
    cuerpo:
      "Kanomics es un proyecto de Karel, construido por fases con una especificación escrita antes del código y cada cambio probado antes de publicarse.",
    codigo: "Ver el código en GitHub",
    fichaTitulo: "Ficha técnica",
    ficha: [
      ["Interfaz", "Next.js 16 · React 19 · TypeScript estricto"],
      ["Datos", "PostgreSQL · Prisma · dinero en centavos enteros"],
      ["Acceso", "Google OAuth · datos separados por usuario"],
      ["Calidad", "Más de 230 pruebas automáticas · CI en cada cambio"],
      ["Movimiento", "Three.js · React Three Fiber · GSAP · Lenis"],
      ["Idiomas", "Español · English"],
      ["Costo", "$0 al mes · Vercel · Neon · GitHub Actions"],
    ],
  },
  final: {
    titulo: "Lo que se te escapaba, ahora se queda.",
    cuerpo: "Empieza con lo que tienes en el bolsillo. Es gratis.",
    tarjeta: "Abre tu cuenta",
    demo: "Probar la demo",
    demoNota: "Sin registrarte. Se borra en 24 horas.",
    privacidad: "Tus datos se guardan separados y no se envían a terceros.",
  },
  pie: { hecho: "Hecha en Ecuador.", codigo: "Código en GitHub" },
  google: { entrar: "Entrar con Google", abriendo: "Abriendo Google…", sinGoogle: "Entrar" },
};

const en: TextosLanding = {
  meta: {
    titulo: "Kanomics · Your money, counted clearly",
    descripcion:
      "Personal finance without the noise: log an expense in seconds, see where every dollar goes and decide with data. Free and private. Made in Ecuador.",
  },
  nav: {
    recorrido: "Tour",
    donde: "Where it works",
    creador: "Who builds it",
    entrar: "Sign in",
    saltar: "Skip to content",
    otroIdioma: "ES",
  },
  hero: {
    rotulo: "Personal finance · Made in Ecuador",
    bajada:
      "Log in seconds, understand where it goes and decide with data, not hunches. Free, private and no fine print.",
    recorrido: "Take the tour",
    pista: "Scroll. The coin leads the way.",
  },
  estados: { disponible: "Available", proximamente: "Coming soon" },
  ejemplo: "Sample data",
  problema: {
    rotulo: "01 · The problem",
    titulo: "Money doesn't get lost. It leaks.",
    cuerpo:
      "A coffee here, a subscription you forgot there, the 11 p.m. delivery. No single expense feels big, and still the month runs out before the paycheck does.",
    fugasTitulo: "Typical leaks in a month",
    fugas: [
      ["Morning coffee", "$2.50"],
      ["Forgotten subscription", "$10.99"],
      ["Late-night delivery", "$8.75"],
      ["Bank fee", "$1.20"],
    ],
    fugasTotal: ["Gone before you noticed", "$23.44"],
  },
  mision: {
    rotulo: "02 · The mission",
    titulo: "Give every dollar a destination.",
    cuerpo:
      "Kanomics exists to answer three questions at any moment. No spreadsheets, no guilt and no formulas for you to build.",
    preguntas: ["How much do I have left?", "Where is it going?", "What should I do?"],
  },
  funciona: {
    rotulo: "03 · How it works",
    titulo: "Three steps. Zero friction.",
    pasos: [
      {
        nombre: "Log",
        titulo: "An expense in under 10 seconds.",
        cuerpo:
          "Press N from any screen, type the amount and hit Enter. Your usual category is already picked, and fixed payments like rent log themselves.",
        estado: "disponible",
      },
      {
        nombre: "Understand",
        titulo: "Your month at a glance.",
        cuerpo:
          "Income, spending and what's left, by category, week and month. The app does the math; you just look.",
        estado: "proximamente",
      },
      {
        nombre: "Decide",
        titulo: "Advice that shows its why.",
        cuerpo:
          "Fixed rules review your numbers and tell you what to do, next to the exact figure that triggered them. No black boxes.",
        estado: "proximamente",
      },
    ],
  },
  registro: {
    titulo: "New expense",
    monto: "Amount",
    categoria: "Category",
    categorias: ["Food", "Transport", "Home", "Leisure"],
    cuenta: "Checking account",
    guardar: "Save",
  },
  panel: {
    titulo: "November",
    queda: "You have",
    deMes: "left this month",
    gastado: "Spent per week",
    semanas: ["W1", "W2", "W3", "W4"],
    categorias: ["Home", "Food", "Transport", "Leisure", "Other"],
  },
  consejo: {
    titulo: "Advice",
    texto: "Cut Leisure to $60 this month and save $24.",
    porque: "Why",
    dato: "You spent $84 on Leisure, 40% above your average.",
  },
  donde: {
    rotulo: "04 · Where it works",
    titulo: "It starts in Ecuador. It doesn't stay there.",
    cuerpo:
      "The core works anywhere: logging, budgeting, saving. The local parts arrive as a country pack, with its taxes, currency and time zone. Ecuador comes first.",
    pais: "Ecuador pack",
    filas: [
      {
        tema: "Currency and time",
        detalle: "US dollars, and the day ends at midnight in Guayaquil.",
        estado: "disponible",
      },
      {
        tema: "SRI deductions",
        detalle: "Expenses by category and your cap, 7 to 20 baskets.",
        estado: "proximamente",
      },
      {
        tema: "IESS contribution",
        detalle: "The salary you actually take home, 9.45% deducted.",
        estado: "proximamente",
      },
      {
        tema: "Cosede insurance",
        detalle: "A heads-up when you pass the $32,000 covered per bank.",
        estado: "proximamente",
      },
    ],
    siguiente: "Next countries: same engine, another pack.",
  },
  privacidad: {
    rotulo: "05 · Privacy",
    titulo: "Your numbers are yours.",
    puntos: [
      {
        titulo: "Isolated per user",
        cuerpo:
          "Every query is bound to your session. There are tests that try to read someone else's data, and fail.",
      },
      {
        titulo: "No third parties",
        cuerpo: "No financial data leaves for other services. No ads, no trackers, no outside AI.",
      },
      {
        titulo: "Open source",
        cuerpo: "All the code is on GitHub, so anyone can check how your money is stored.",
      },
    ],
  },
  creador: {
    rotulo: "06 · Who builds it",
    titulo: "Built by a person, not a bank.",
    cuerpo:
      "Kanomics is a project by Karel, built in phases from a specification written before the code, with every change tested before it ships.",
    codigo: "View the code on GitHub",
    fichaTitulo: "Tech specs",
    ficha: [
      ["Interface", "Next.js 16 · React 19 · strict TypeScript"],
      ["Data", "PostgreSQL · Prisma · money in integer cents"],
      ["Access", "Google OAuth · data isolated per user"],
      ["Quality", "230+ automated tests · CI on every change"],
      ["Motion", "Three.js · React Three Fiber · GSAP · Lenis"],
      ["Languages", "Español · English"],
      ["Cost", "$0 a month · Vercel · Neon · GitHub Actions"],
    ],
  },
  final: {
    titulo: "What used to slip away now stays.",
    cuerpo: "Start with what's in your pocket. It's free.",
    tarjeta: "Open your account",
    demo: "Try the demo",
    demoNota: "No sign-up. Erased after 24 hours.",
    privacidad: "Your data is stored in isolation and never sent to third parties.",
  },
  pie: { hecho: "Made in Ecuador.", codigo: "Code on GitHub" },
  google: { entrar: "Continue with Google", abriendo: "Opening Google…", sinGoogle: "Sign in" },
};

export const TEXTOS: Record<Idioma, TextosLanding> = { es, en };
