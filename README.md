# Finanzas personales

Aplicación web para llevar las finanzas personales en Ecuador: registrar gastos e ingresos en
dólares, controlar presupuestos y metas, conocer el patrimonio, salir de deudas, preparar los
gastos deducibles del SRI y recibir recomendaciones que siempre explican de dónde salen.

`Next.js 16` · `TypeScript estricto` · `PostgreSQL 18` · `Prisma 7` · `Costo de operación: $0`

> Proyecto personal en construcción. Se desarrolla por fases (ver [Hoja de ruta](#hoja-de-ruta)).
> Hoy está terminada la **fase 1, base del proyecto**: no tiene todavía pantallas de uso, inicio
> de sesión ni cálculos. Las recomendaciones de la app serán educativas y no reemplazan la asesoría
> de un profesional ni la consulta al SRI.

---

## Contenido

- [Qué resuelve](#qué-resuelve)
- [Principios del diseño](#principios-del-diseño)
- [Estado del proyecto](#estado-del-proyecto)
- [Hoja de ruta](#hoja-de-ruta)
- [Arquitectura](#arquitectura)
- [Modelo de datos](#modelo-de-datos)
- [Reglas del dinero y las fechas](#reglas-del-dinero-y-las-fechas)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo ejecutarlo](#cómo-ejecutarlo)
- [Variables de entorno](#variables-de-entorno)
- [Pruebas](#pruebas)
- [Calidad e integración continua](#calidad-e-integración-continua)
- [Costo cero](#costo-cero)
- [Privacidad y seguridad](#privacidad-y-seguridad)
- [Alcance y limitaciones](#alcance-y-limitaciones)
- [Autor](#autor)
- [Licencia](#licencia)

---

## Qué resuelve

La mayoría de las apps de finanzas solo cuentan cuánto entra y cuánto sale. Esta busca responder,
en este orden, tres preguntas: **cuánto me queda, en qué se me va el dinero y qué debería hacer**.
Para eso reúne en un mismo lugar módulos que normalmente están separados:

| Módulo              | Qué permite hacer                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Movimientos**     | Registrar un gasto en menos de 10 segundos, con plantillas, recurrentes automáticos e importación desde CSV. |
| **Cuentas**         | Saber cuánto hay en efectivo, banco, billeteras y tarjetas, con transferencias y cuadre contra el banco.     |
| **Presupuestos**    | Poner límites por categoría con avisos al 80 % y al 100 %, y proyección de cuándo se pasaría el límite.      |
| **Metas**           | Ahorrar para objetivos con fecha, con un fondo de emergencia que se calcula solo.                            |
| **Patrimonio**      | Ver activos menos pasivos, con una foto mensual automática para medir el crecimiento.                        |
| **Deudas**          | Separar interés y capital de cada cuota y comparar las estrategias avalancha y bola de nieve.                |
| **Inversión**       | Perfil de riesgo, escalera de pasos y calculadora de interés compuesto, con fines educativos.                |
| **Ingresos extra**  | Ideas según el perfil profesional, calculadora de tarifa, embudo de clientes, cobros y horas.                |
| **Empleo**          | Seguimiento de postulaciones, habilidades más pedidas y comparador de ofertas por su efecto en las finanzas. |
| **Impuestos**       | Gastos deducibles por rubro del SRI, tope según cargas familiares y rebaja estimada.                         |
| **Análisis**        | 22 gráficos, cada uno con su conclusión escrita, un puntaje de salud financiera y un simulador.              |
| **Recomendaciones** | 28 reglas fijas (R1 a R28) que muestran el consejo junto al dato que lo disparó.                             |

---

## Principios del diseño

Estas reglas guían todo el código y no se negocian:

- **Registrar debe tomar menos de 10 segundos.** El formulario rápido está siempre a una tecla
  (`N`) y recuerda la última categoría y la última cuenta usadas.
- **Ningún número se inventa.** Las tasas de interés, rendimientos y tarifas los ingresa el
  usuario. La app calcula con lo que el usuario da y nunca muestra cifras de mercado fijas.
- **Cada recomendación muestra su porqué.** Junto al consejo aparece el dato que lo disparó, por
  ejemplo: "Gastaste $84 en Entretenimiento, 40 % más que tu promedio".
- **Las recomendaciones salen de reglas fijas.** No hay servicios externos que reciban datos
  financieros: cada consejo y cada frase del análisis se calculan con fórmulas propias.
- **Los datos son privados.** Cada usuario solo ve los suyos, y la separación se impone en la capa
  de datos, no en cada pantalla.
- **El color nunca es el único mensaje.** Un gasto lleva signo − y un ingreso signo +, y toda
  alerta lleva ícono y texto.

---

## Estado del proyecto

| Fase    | Estado        |
| ------- | ------------- |
| 1. Base | **Terminada** |
| 2 a 16  | Pendientes    |

### Qué incluye la fase 1

- Proyecto Next.js con TypeScript en modo estricto, Tailwind CSS y la tipografía IBM Plex Sans.
- Los tokens de color del diseño, en modo claro y oscuro, definidos una sola vez como variables CSS.
- PostgreSQL local con Docker Compose.
- El **esquema completo de la base**: 31 entidades propias más las 4 de autenticación, con su
  migración inicial, restricciones `CHECK`, índices únicos parciales y borrado en cascada.
- Validación de las variables de entorno al arrancar: si falta una clave, la app no inicia y
  explica cuál falta.
- Una regla de ESLint que impide consultar la base fuera de `lib/datos/`.
- Pruebas unitarias y de integración, ganchos de Git e integración continua en GitHub Actions.

---

## Hoja de ruta

El proyecto se construye en 16 fases encadenadas. Cada fase empieza solo cuando la anterior cumple
sus criterios de aceptación y la integración continua está en verde.

| Fase                           | Qué se construye                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| 1. Base                        | Proyecto, calidad de código, base de datos, esquema completo, entorno y CI                   |
| 2. Autenticación y siembra     | Inicio de sesión con Google y acceso de desarrollo, datos iniciales por usuario, menú y tema |
| 3. Núcleo                      | Manejo de dinero en centavos, fechas en la zona de Ecuador y la capa de datos                |
| 4. Cuentas y movimientos       | Cuentas, transferencias, registro rápido, plantillas, recurrentes y su tarea diaria          |
| 5. Panel de inicio             | Tarjetas de resumen, fórmulas de ahorro y proyección, y los tres gráficos principales        |
| 6. Presupuestos                | Estados, avisos y presupuestos sugeridos                                                     |
| 7. Metas y plan a largo plazo  | Metas, fondo de emergencia, proyecciones a 1, 5 y 10 años e independencia financiera         |
| 8. Patrimonio, bienes y deudas | Patrimonio neto, fotos mensuales, pagos de deuda y simulador de salida                       |
| 9. Inversión                   | Perfil de riesgo, escalera de pasos, calculadora y control de cobertura de depósitos         |
| 10. Ingresos                   | Perfil profesional, catálogo de ideas, tarifa mínima, oportunidades, cobros y horas          |
| 11. Empleo                     | Postulaciones, habilidades más pedidas, versiones de CV y comparador de ofertas              |
| 12. Préstamos e impuestos      | Préstamos a conocidos, gastos deducibles y reporte anual del SRI                             |
| 13. Recomendaciones            | Las reglas R1 a R28 con su orden, descarte y acción                                          |
| 14. Panel de análisis          | Los 22 gráficos, sus frases automáticas, el puntaje de salud y el simulador                  |
| 15. Revisión mensual           | Cierre de mes guiado en 9 pasos, con pausa y racha                                           |
| 16. Ajustes y cierre           | Ajustes, importación y exportación, pruebas de extremo a extremo, accesibilidad y despliegue |

La especificación completa, con fórmulas, umbrales y criterios de aceptación de cada fase, está en
[`docs/ESPECIFICACION.md`](docs/ESPECIFICACION.md). Es la fuente de verdad del proyecto.

---

## Arquitectura

```text
Navegador  ──HTTPS──▶  Servidor Next.js  ──Prisma──▶  PostgreSQL
(interfaz en español)  Server Components              Docker en local
                       Server Actions                 Neon en producción
                       lib/datos
                            ▲
Tarea diaria 00:05 ─────────┘  recurrentes, foto mensual del patrimonio y avisos
```

El navegador solo habla con el servidor, y el servidor es el único que consulta la base.

### Reglas de arquitectura

| Regla                      | Cómo se cumple                                                                                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Separación por usuario** | Toda tabla con datos del usuario lleva `usuarioId`. Ninguna consulta se hace fuera de `lib/datos/`, y esa capa siempre filtra por el usuario de la sesión. ESLint rechaza cualquier import de Prisma en otra carpeta. |
| **Lógica pura**            | Toda fórmula vive en `lib/calculos/`, `lib/reglas/` o `lib/insights/` como función pura: recibe datos y devuelve resultados, sin tocar la base. Así se prueba sin base de datos.                                      |
| **Lecturas y escrituras**  | Las lecturas se hacen en Server Components. Las escrituras van por Server Actions validadas con Zod.                                                                                                                  |
| **Validación compartida**  | Las mismas reglas de Zod validan el formulario en el navegador y la acción en el servidor.                                                                                                                            |
| **Entorno validado**       | `lib/env.ts` valida las variables al arrancar `next dev` y `next build`.                                                                                                                                              |

---

## Modelo de datos

El esquema está en [`prisma/schema.prisma`](prisma/schema.prisma) y se crea completo desde la
primera migración, para que las fases siguientes construyan sobre una base estable.

| Grupo                | Entidades                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Autenticación        | `User`, `Account`, `Session`, `VerificationToken`                                          |
| Movimientos          | `Categoria`, `Movimiento`, `Recurrente`, `Presupuesto`                                     |
| Cuentas y patrimonio | `Cuenta`, `Transferencia`, `Conciliacion`, `Bien`, `FotoPatrimonio`                        |
| Metas                | `Meta`, `AporteMeta`                                                                       |
| Deudas               | `Deuda`, `PagoDeuda`                                                                       |
| Inversión            | `Inversion`, `PerfilRiesgo`                                                                |
| Ingresos extra       | `PerfilProfesional`, `IdeaIngreso`, `PlanIngreso`, `Oportunidad`, `Cobro`, `RegistroHoras` |
| Empleo               | `Postulacion`, `OfertaLaboral`, `VersionCV`                                                |
| Herramientas         | `RevisionMensual`, `Prestamo`, `AbonoPrestamo`, `Escenario`, `Aviso`, `Ajustes`            |
| Global               | `ParametrosSRI` (uno por año, compartido por todos los usuarios)                           |

Las tablas de autenticación conservan sus nombres en inglés porque así las espera el adaptador de
Auth.js, y para no chocar con la entidad `Cuenta`.

### Restricciones que protege la propia base

Prisma no declara restricciones `CHECK` ni índices parciales, así que se escriben como SQL dentro de
la migración. La base rechaza el dato aunque un error de código intente guardarlo:

| Restricción                                     | Qué evita                                                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Montos mayores que cero                         | Movimientos, recurrentes, presupuestos, transferencias, préstamos y cobros en cero o negativos.          |
| Monto máximo de $1.000.000 por movimiento       | Errores de tipeo como escribir 4500000 en lugar de 45000.                                                |
| Único por recurrente y fecha                    | Que la tarea diaria genere dos veces el mismo movimiento si corre dos veces.                             |
| Un solo fondo de emergencia por usuario         | Dos metas compitiendo por el mismo papel (índice único parcial).                                         |
| Una sola foto automática del patrimonio por mes | Fotos duplicadas; las manuales no tienen límite (índice único parcial).                                  |
| Reglas de la transferencia                      | Transferir a la misma cuenta, o tener una sola cuenta sin una deuda, préstamo o inversión del otro lado. |
| Rangos de días y meses                          | Días de pago fuera de 1 a 31, meses fuera de 1 a 12 y fechas `AAAA-MM` mal escritas.                     |
| Borrado en cascada desde el usuario             | Datos huérfanos al eliminar una cuenta de usuario.                                                       |
| Categorías y cuentas con movimientos            | Borrarlas por accidente: se archivan y conservan su historial.                                           |

---

## Reglas del dinero y las fechas

- **Centavos enteros.** Todo monto se guarda y se calcula como entero en centavos
  (`montoCentavos`). Solo se convierte a dólares al mostrarlo. Nunca se usan decimales de punto
  flotante para dinero.
- **Formato.** Los montos se muestran en dólares con formato de Ecuador (`es-EC`) y siempre con dos
  decimales. Los porcentajes llevan un decimal.
- **Redondeo.** Toda división de dinero redondea al centavo más cercano.
- **Sin datos.** Si una métrica divide para cero, la pantalla muestra "Sin datos" en lugar de un
  número engañoso.
- **Zona horaria fija.** "Hoy" se calcula siempre en `America/Guayaquil`, nunca con la hora del
  servidor.
- **Semanas de lunes a domingo**, meses y años calendario.
- **Fechas de calendario como `DATE`** de PostgreSQL y marcas de tiempo como `TIMESTAMPTZ`.

---

## Tecnologías utilizadas

| Tecnología          | Versión        | Uso en el proyecto                                                              | Documentación                        |
| ------------------- | -------------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| Node.js             | 24             | Entorno de ejecución.                                                           | https://nodejs.org/docs/             |
| Next.js             | 16.4.6         | Interfaz, Server Components, Server Actions y rutas de API en un solo proyecto. | https://nextjs.org/docs              |
| React               | 19.3.1         | Componentes de la interfaz.                                                     | https://react.dev/                   |
| TypeScript          | 6.0.3          | Tipado estricto en todo el código.                                              | https://www.typescriptlang.org/docs/ |
| Tailwind CSS        | 4.3.5          | Estilos a partir de los tokens de color del diseño.                             | https://tailwindcss.com/docs         |
| PostgreSQL          | 18             | Base de datos, con `DATE`, `ENUM`, `TIMESTAMPTZ`, restricciones e índices.      | https://www.postgresql.org/docs/     |
| Prisma ORM          | 7.10.1         | Esquema tipado, migraciones versionadas y acceso a datos.                       | https://www.prisma.io/docs           |
| node-postgres       | 8.23.1         | Controlador de PostgreSQL que usa Prisma.                                       | https://node-postgres.com/           |
| Zod                 | 4.6.7          | Validación de variables de entorno, formularios y acciones.                     | https://zod.dev/                     |
| Vitest              | 5.1.0          | Pruebas unitarias y de integración.                                             | https://vitest.dev/                  |
| ESLint              | 10.15.0        | Análisis estático del código.                                                   | https://eslint.org/docs/latest/      |
| Prettier            | 3.10.1         | Formato uniforme del código.                                                    | https://prettier.io/docs/            |
| Husky y lint-staged | 9.1.7 y 17.6.1 | Revisión automática antes de cada commit.                                       | https://typicode.github.io/husky/    |
| Docker Compose      | 5              | PostgreSQL local, igual al de CI y producción.                                  | https://docs.docker.com/compose/     |
| GitHub Actions      | —              | Integración continua en cada push.                                              | https://docs.github.com/actions      |

Las versiones son las estables vigentes al crear el proyecto. Dos decisiones merecen explicación:

- **TypeScript 6.0 y no 7.** La versión 7 ya existe, pero `typescript-eslint` todavía no la
  soporta.
- **Prisma 7.10.1.** La etiqueta `latest` de npm apuntaba a una versión candidata (8.0 rc), no a una
  estable.

Llegarán en las fases siguientes: NextAuth (autenticación), shadcn/ui sobre Radix (componentes
accesibles), React Hook Form (formularios), date-fns (fechas), Apache ECharts (gráficos),
Playwright (pruebas de extremo a extremo) y Sentry (monitoreo opcional).

---

## Estructura del proyecto

```text
proyecto-finanzas/
├── app/                          # Rutas de Next.js (App Router)
│   ├── layout.tsx                # Idioma, tipografía y estilos globales
│   ├── page.tsx                  # Página de inicio provisional
│   └── globals.css               # Tokens de color en modo claro y oscuro
├── lib/
│   ├── env.ts                    # Validación de variables de entorno
│   └── datos/
│       └── prisma.ts             # Cliente único de la base (solo lo usa lib/datos/)
├── prisma/
│   ├── schema.prisma             # Esquema completo de la base
│   ├── migrations/               # Migraciones versionadas, con el SQL de las restricciones
│   └── seed.ts                   # Datos globales: parámetros del SRI 2026
├── tests/
│   ├── env.test.ts               # Pruebas unitarias del entorno
│   └── integracion/
│       └── restricciones.test.ts # Pruebas contra PostgreSQL real
├── docs/
│   └── ESPECIFICACION.md         # Especificación completa: la fuente de verdad
├── .github/workflows/ci.yml      # Integración continua
├── .husky/pre-commit             # Revisión antes de cada commit
├── docker-compose.yml            # PostgreSQL local
├── prisma.config.ts              # Configuración de Prisma (esquema, migraciones, semilla)
├── next.config.ts                # Configuración de Next.js (valida el entorno al arrancar)
├── vitest.config.mts             # Proyectos de prueba y umbrales de cobertura
├── eslint.config.mjs             # Reglas de lint, incluida la de lib/datos/
├── .env.example                  # Plantilla de variables, sin valores reales
└── package.json
```

A medida que avancen las fases se sumarán `app/(app)/` con las pantallas, `components/`,
`lib/calculos/`, `lib/reglas/`, `lib/insights/`, `lib/dinero.ts`, `lib/fechas.ts` y `e2e/`.

---

## Cómo ejecutarlo

### Requisitos

- Node.js 24 o superior.
- Docker Desktop (o Docker Engine) con Docker Compose.

### Primera vez

```bash
git clone https://github.com/Karel374/proyecto-finanzas.git
cd proyecto-finanzas
cp .env.example .env          # completa las claves; ver la sección siguiente
docker compose up -d          # levanta PostgreSQL en el puerto 5433
npm install                   # instala dependencias y genera el cliente de Prisma
npm run db:migrar             # crea las tablas
npm run db:sembrar            # carga los parámetros del SRI 2026
npm run dev                   # abre http://localhost:3000
```

PostgreSQL usa el puerto **5433** para no chocar con una instalación nativa de PostgreSQL que
ocupe el 5432. Si quieres otro, cámbialo en `POSTGRES_PORT` y en `DATABASE_URL`.

### Comandos disponibles

| Comando                  | Qué hace                                                               |
| ------------------------ | ---------------------------------------------------------------------- |
| `npm run dev`            | Servidor de desarrollo en `http://localhost:3000`.                     |
| `npm run build`          | Build de producción.                                                   |
| `npm start`              | Sirve el build de producción.                                          |
| `npm run lint`           | ESLint, sin advertencias permitidas.                                   |
| `npm run typecheck`      | Genera los tipos de las rutas y revisa TypeScript.                     |
| `npm run format`         | Da formato a todo el código con Prettier.                              |
| `npm run format:check`   | Verifica el formato sin modificar archivos.                            |
| `npm test`               | Pruebas unitarias.                                                     |
| `npm run test:cobertura` | Pruebas unitarias con informe de cobertura.                            |
| `npm run test:db`        | Pruebas de integración contra PostgreSQL (requiere la base levantada). |
| `npm run db:migrar`      | Crea y aplica migraciones en desarrollo.                               |
| `npm run db:desplegar`   | Aplica las migraciones pendientes, sin crear nuevas (CI y producción). |
| `npm run db:sembrar`     | Carga los datos globales. Se puede correr varias veces.                |

---

## Variables de entorno

Se validan con Zod al arrancar. Si falta una obligatoria, la app no inicia y el mensaje dice cuál
falta. La plantilla está en [`.env.example`](.env.example).

| Variable                                                             | Obligatoria | Para qué sirve                                                              |
| -------------------------------------------------------------------- | :---------: | --------------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Solo local  | Credenciales del PostgreSQL de Docker Compose.                              |
| `DATABASE_URL`                                                       |     Sí      | Conexión de la app y de Prisma a PostgreSQL.                                |
| `NEXTAUTH_SECRET`                                                    |     Sí      | Firma de las sesiones. Al menos 32 caracteres.                              |
| `NEXTAUTH_URL`                                                       |     No      | Dirección pública de la app.                                                |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                           |     No      | Inicio de sesión con Google. Van juntas o ninguna.                          |
| `ACCESO_DESARROLLO`                                                  |     No      | `true` habilita el acceso de desarrollo, y solo con `NODE_ENV=development`. |
| `CRON_SECRET`                                                        |     Sí      | Protege la ruta de la tarea diaria. Al menos 16 caracteres.                 |
| `SENTRY_DSN`                                                         |     No      | Monitoreo de errores, si se activa.                                         |

Para generar los secretos:

```bash
openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -hex 24      # CRON_SECRET
```

---

## Pruebas

```bash
npm test          # unitarias
npm run test:db   # integración (con docker compose up)
```

Las pruebas están separadas en dos proyectos de Vitest: las **unitarias** no necesitan base de
datos y corren en milisegundos, y las **de integración** se conectan a un PostgreSQL real para
comprobar lo que solo la base puede garantizar.

| Grupo             | Archivo                                   |  Casos | Qué garantiza                                                                                                                                                                                                                                                                             |
| ----------------- | ----------------------------------------- | -----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entorno**       | `tests/env.test.ts`                       |      7 | Que la app no arranque con una configuración inválida: clave faltante o vacía, URL que no es de PostgreSQL, secretos cortos, `ACCESO_DESARROLLO` con un valor distinto de `true` o `false`, y Google con una sola de sus dos claves.                                                      |
| **Restricciones** | `tests/integracion/restricciones.test.ts` |     12 | Que la base rechace montos en cero o de más de $1.000.000, transferencias inválidas, recurrentes duplicados, un segundo fondo de emergencia y una segunda foto automática del mes; que no se pueda borrar una categoría con movimientos, y que borrar un usuario elimine todos sus datos. |
| **Total**         |                                           | **19** |                                                                                                                                                                                                                                                                                           |

### Por qué importan las pruebas de integración

Una restricción escrita como SQL dentro de una migración es fácil de perder sin que nadie lo note:
basta con regenerar la migración. Estas pruebas intentan guardar datos inválidos de verdad y
esperan que PostgreSQL los rechace. Si alguna restricción desaparece, la prueba falla.

### Cobertura

La definición de terminado exige al menos **80 % de cobertura** en `lib/calculos/` y
`lib/reglas/`. El umbral ya está configurado en `vitest.config.mts` y se aplicará cuando esas
carpetas tengan código, a partir de la fase 3.

---

## Calidad e integración continua

### Antes de cada commit

Husky ejecuta lint-staged sobre los archivos modificados: ESLint corrige lo que puede y Prettier da
formato. Si queda un error, el commit no se crea.

### En cada push

GitHub Actions ejecuta, en este orden, sobre un PostgreSQL 18 temporal:

1. Lint, sin advertencias.
2. Formato.
3. Tipos de TypeScript.
4. Pruebas unitarias con cobertura.
5. Migraciones sobre una base vacía.
6. Comprobación de que el esquema y las migraciones coinciden: si alguien cambia el esquema sin
   crear su migración, la CI falla.
7. Semilla.
8. Pruebas de integración.
9. Build de producción.

Los secretos de la CI no están escritos en el código: se toman de los secretos de GitHub si
existen y, si no, se generan al azar en cada ejecución.

### Definición de terminado

Ninguna fase se da por cerrada sin cumplir todo esto:

- Sin `any` en TypeScript y sin errores de lint.
- Cobertura de al menos 80 % en `lib/calculos/` y `lib/reglas/`.
- Ninguna consulta a la base fuera de `lib/datos/`.
- Todo texto visible en español y con contraste AA en los dos temas.
- Todo botón y campo usable con teclado y con foco visible.

---

## Costo cero

La app está pensada para costar $0 de punta a punta:

| Servicio | Plan                | Uso                                                                     |
| -------- | ------------------- | ----------------------------------------------------------------------- |
| GitHub   | Repositorio público | Código y GitHub Actions gratis e ilimitado.                             |
| Vercel   | Hobby               | Despliegue, con la dirección gratuita `.vercel.app` y una tarea diaria. |
| Neon     | Free                | PostgreSQL en producción, 1 GB por proyecto.                            |
| Sentry   | Developer           | Monitoreo de errores, opcional.                                         |

No se usa dominio propio ni envío de correos: el inicio de sesión es con Google y todos los avisos
viven dentro de la app. Si un servicio cambia sus condiciones, la app sigue funcionando sin él.

---

## Privacidad y seguridad

- El archivo `.env` nunca se sube al repositorio. Solo se versiona `.env.example`, sin valores
  reales.
- Ningún dato financiero se envía a servicios de terceros.
- Las semillas y las pruebas usan datos ficticios, nunca datos reales.
- El acceso de desarrollo solo existe con `NODE_ENV=development` y `ACCESO_DESARROLLO=true`. En
  cualquier otro caso su ruta responde 404, y una prueba lo verificará en el build de producción.

---

## Alcance y limitaciones

- **Moneda única:** dólar estadounidense.
- **Pensada para escritorio:** el ancho mínimo soportado es de 1024 px.
- **Inversión educativa:** la app no da asesoría financiera ni muestra tasas de mercado. Toda
  pantalla de inversión lleva el aviso "Información educativa, no es asesoría financiera".
- **Impuestos orientativos:** la rebaja estimada ayuda a preparar los formularios, pero no
  reemplaza la declaración ni la consulta al SRI. Los parámetros de 2026 provienen de la prensa de
  febrero de 2026 y deben confirmarse cada año en la web del SRI.
- **Un usuario por ahora:** arranca con un usuario, pero el modelo ya separa los datos para crecer
  sin reescribir nada.

---

## Autor

Desarrollado por [Karel374](https://github.com/Karel374).

---

## Licencia

Proyecto personal. Por ahora no tiene una licencia de código abierto: el código es público para
consulta, pero no se concede permiso para reutilizarlo.
