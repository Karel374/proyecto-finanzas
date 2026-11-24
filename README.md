# Finanzas personales

Aplicación web para llevar las finanzas personales en Ecuador: registrar gastos e ingresos en
dólares, controlar presupuestos y metas, conocer el patrimonio, salir de deudas, preparar los
gastos deducibles del SRI y recibir recomendaciones que siempre explican de dónde salen.

`Next.js 16` · `TypeScript estricto` · `PostgreSQL 18` · `Prisma 7` · `Costo de operación: $0`

> Proyecto personal en construcción. Se desarrolla por fases (ver [Hoja de ruta](#hoja-de-ruta)).
> Hoy están terminadas las fases **1 a 4b**: una landing pública con una moneda que se abre en
> tus gastos, y dentro de la app ya se puede registrar gastos, ingresos y transferencias, llevar
> varias cuentas con sus saldos, cuadrarlas con el banco y programar movimientos recurrentes. El
> panel de inicio, los presupuestos y el resto de módulos llegan en las fases siguientes. Las recomendaciones de la app serán educativas y no reemplazan la asesoría
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

| Fase                       | Estado        |
| -------------------------- | ------------- |
| 1. Base                    | **Terminada** |
| 2. Autenticación y siembra | **Terminada** |
| 3. Núcleo                  | **Terminada** |
| 4. Cuentas y movimientos   | **Terminada** |
| 4b. Landing pública        | **Terminada** |
| 5 a 16                     | Pendientes    |

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

### Qué incluye la fase 2

| Pieza                    | Qué hace                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inicio de sesión**     | NextAuth v4 con sesiones JWT. Entra con Google si `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` están configuradas, o con el acceso de desarrollo en tu computadora.              |
| **Acceso de desarrollo** | El botón "Entrar como desarrollador" entra con un usuario de prueba. Solo existe con `NODE_ENV=development` y `ACCESO_DESARROLLO=true`; si no, su ruta responde 404.            |
| **Protección de rutas**  | `proxy.ts` manda a `/ingresar` a quien no tiene sesión, y al inicio a quien ya la tiene.                                                                                        |
| **Siembra por usuario**  | Al crearse un usuario recibe, en una sola transacción, 15 categorías, sus ajustes por defecto, la cuenta Efectivo y 71 ideas de ingreso. Si algo falla, no queda nada a medias. |
| **Menú lateral**         | Los cinco bloques de la especificación (Día a día, Futuro, Crecer, Entender y Herramientas), con el botón "Registrar" arriba. Por debajo de 1280 px se reduce a íconos.         |
| **Tema**                 | Claro, oscuro o según el sistema. Se guarda en Ajustes y en una cookie, y se aplica antes de pintar la página para que no parpadee.                                             |

Las secciones del menú muestran por ahora en qué fase se construyen.

#### Por qué un adaptador de autenticación propio

El adaptador oficial de Prisma para NextAuth crea el usuario y termina ahí. La especificación pide
que el usuario y sus datos iniciales se creen juntos, así que `lib/datos/adaptador-auth.ts` crea el
usuario y lo siembra dentro de la misma transacción. Con sesiones JWT solo hacen falta los métodos
de usuario y de cuenta vinculada.

### Qué incluye la fase 3

| Pieza                   | Qué hace                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`lib/dinero.ts`**     | Formato `$1.234,50` de Ecuador, signo − o + según el tipo, porcentajes con un decimal (`12,5 %`), divisiones redondeadas al centavo, "Sin datos" al dividir para cero, y la lectura de lo que escribe el usuario a centavos.    |
| **`lib/fechas.ts`**     | "Hoy" en la hora de Ecuador, semanas de lunes a domingo, los períodos Hoy, Esta semana, Este mes, Este año y Rango, días transcurridos y restantes, el período anterior para comparar y el ajuste del día 31 al último del mes. |
| **Cliente del usuario** | `lib/datos/cliente.ts` agrega `usuarioId` a toda lectura, actualización y borrado, y lo fuerza en toda creación. Un id de otro usuario se comporta como si no existiera.                                                        |
| **Acciones tipadas**    | `lib/acciones.ts` valida cada Server Action con Zod y responde siempre con un resultado tipado: los datos, o un código de error con su mensaje en español y el error de cada campo.                                             |

#### Cómo se lee un monto

El usuario puede escribir el monto como lo hace en Ecuador o como lo copió de otro lado. La regla
es fija y está probada:

| Escribe    | Se guarda        | Por qué                                                   |
| ---------- | ---------------- | --------------------------------------------------------- |
| `45,50`    | 4.550 centavos   | Solo con coma, la coma es decimal.                        |
| `45.50`    | 4.550 centavos   | Solo con punto y sin grupos de tres, el punto es decimal. |
| `1.234`    | 123.400 centavos | Solo con punto y en grupos de tres, el punto es de miles. |
| `1.234,56` | 123.456 centavos | Con los dos, el último que aparece es el decimal.         |
| `12,345`   | Se rechaza       | Serían tres decimales.                                    |

#### Por qué un cliente del usuario y no un filtro en cada consulta

Escribir `where: { usuarioId }` a mano en cada consulta funciona hasta el día en que alguien lo
olvida. El cliente del usuario lo agrega solo, y una regla de ESLint impide que los módulos de
`lib/datos/` usen el cliente crudo de Prisma. Solo cinco archivos de infraestructura pueden
hacerlo: el propio cliente, la conexión, la siembra, el adaptador de autenticación y las tareas
del cron.

### Qué incluye la fase 4

| Pieza                  | Qué hace                                                                                                                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Panel de registro**  | Se abre con el botón "Registrar" o la tecla `N` desde cualquier pantalla, con el cursor en el monto y la última categoría ya elegida. `Enter` guarda y cierra; `Shift + Enter` guarda y deja el panel abierto.   |
| **Gastos e ingresos**  | Monto, categoría con su color, fecha (con atajos Hoy y Ayer), cuenta y nota. El método de pago sale del tipo de cuenta. Un gasto de más de 5 veces el promedio de su categoría pide confirmación.                |
| **Transferencias**     | Entre cuentas propias, desde el mismo panel. Mueven los saldos pero no cuentan como ingreso ni gasto.                                                                                                            |
| **Plantillas**         | Hasta 6 accesos directos ("Almuerzo, $3,50, Alimentación, Efectivo") que registran con un clic y la fecha de hoy.                                                                                                |
| **Página Movimientos** | Filtros por período, tipo, categorías, cuentas y texto; ingresos, gastos y balance del resultado; tabla agrupada por día con su subtotal; 50 por página; editar y borrar con "Deshacer". `/` enfoca el buscador. |
| **Recurrentes**        | Reglas semanales, mensuales o anuales. El día 31 cae el último día de los meses cortos. Se pueden pausar, editar (solo afecta lo futuro) y borrar.                                                               |
| **Cron diario**        | `api/cron/diario`, a las 00:05 de Ecuador según `vercel.json`, protegido con `CRON_SECRET`. Al abrir la app corre la misma generación como respaldo. Correrlo de más nunca duplica.                              |
| **Página Cuentas**     | Saldo de cada cuenta (la tarjeta como deuda), total disponible, lo que se debe en tarjetas, próximos pagos, transferencias recientes y el botón "Cuadrar" para comparar con el saldo real del banco.             |

#### Cómo se calcula el saldo

Saldo inicial + ingresos − gastos + transferencias que entran − transferencias que salen, contando
desde la fecha del saldo inicial. En una tarjeta de crédito el saldo es la deuda, así que los signos
se invierten: un gasto con la tarjeta la sube y un pago desde el banco la baja.

#### Por qué el cron no puede duplicar

Cada recurrente guarda la última fecha que generó y solo avanza desde ahí. Además, la base tiene un
índice único por recurrente y fecha, y la generación inserta con "saltar duplicados". Así, aunque
el cron corra dos veces, o el cron y el respaldo corran al mismo tiempo, cada ocurrencia existe una
sola vez. Hay pruebas para los dos casos.

### Qué incluye la fase 4b: la landing pública

Quien entra a `/` sin sesión ve la landing; quien ya entró va directo a su panel, ahora en `/panel`.

| Pieza                       | Qué hace                                                                                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **La moneda viajera**       | Una sola moneda de la marca, dibujada en SVG con canto estriado y leyenda grabada, baja contigo por toda la página: cambia de lugar, tamaño, giro e inclinación según la sección, y el giro sigue al scroll. No usa librerías de animación. |
| **Tres actos**              | En "Una moneda, tres preguntas" la moneda se detiene y, mientras bajas, muestra el saldo grabado, se abre en los gajos de colores de cada categoría y levanta el gajo de la recomendación con su porqué.                                    |
| **Casa de moneda de noche** | Fondo negro cálido, texto marfil y el latón como único color. Los colores de categoría aparecen solo cuando la moneda se abre. Títulos en Archivo, cuyo eje de anchura da las leyendas expandidas del canto.                                |
| **Honestidad**              | Todo monto de la demostración dice "Datos de ejemplo", y lo que todavía no existe dice en qué fase llega. Sin testimonios ni cifras inventadas.                                                                                             |
| **Accesibilidad**           | Con "reducir movimiento" o sin JavaScript, cada sección muestra su moneda quieta y los tres actos uno debajo del otro. Enlace para saltar al contenido, foco visible y contraste AA.                                                        |
| **Pantalla de ingreso**     | Comparte el mismo mundo: la moneda girando a un lado y el acceso al otro.                                                                                                                                                                   |

#### Cómo viaja la moneda

Cada sección reserva un ancla, un espacio vacío donde la moneda debe posarse. Una capa fija dibuja
la única moneda y, en cada cuadro, mide dónde están las anclas en la pantalla y la lleva de una a la
siguiente según el centro de la vista. Así la página se acomoda alrededor de la moneda, y si cambia
el diseño de una sección, la moneda la sigue sola. Entre secciones de texto viaja atenuada para no
tapar lo que se lee.

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
| 4b. Landing pública            | Landing con la moneda que viaja y se abre, panel en `/panel` e ingreso con el mismo mundo    |
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

Es un **monolito modular**: una sola aplicación que se despliega como una unidad, con una sola
base de datos, separada por dentro en capas con responsabilidades claras (páginas, capa de datos,
fórmulas puras y autenticación). Para una app de un usuario, con costo cero como regla, es más
simple y barato que repartirla en microservicios, y las capas dejan marcado dónde se podría
separar algo si algún día hiciera falta.

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

| Tecnología              | Versión        | Uso en el proyecto                                                                 | Documentación                        |
| ----------------------- | -------------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| Node.js                 | 24             | Entorno de ejecución.                                                              | https://nodejs.org/docs/             |
| Next.js                 | 16.4.6         | Interfaz, Server Components, Server Actions y rutas de API en un solo proyecto.    | https://nextjs.org/docs              |
| React                   | 19.3.1         | Componentes de la interfaz.                                                        | https://react.dev/                   |
| TypeScript              | 6.0.3          | Tipado estricto en todo el código.                                                 | https://www.typescriptlang.org/docs/ |
| Tailwind CSS            | 4.3.5          | Estilos a partir de los tokens de color del diseño.                                | https://tailwindcss.com/docs         |
| PostgreSQL              | 18             | Base de datos, con `DATE`, `ENUM`, `TIMESTAMPTZ`, restricciones e índices.         | https://www.postgresql.org/docs/     |
| Prisma ORM              | 7.10.1         | Esquema tipado, migraciones versionadas y acceso a datos.                          | https://www.prisma.io/docs           |
| node-postgres           | 8.23.1         | Controlador de PostgreSQL que usa Prisma.                                          | https://node-postgres.com/           |
| Zod                     | 4.6.7          | Validación de variables de entorno, formularios y acciones.                        | https://zod.dev/                     |
| NextAuth                | 4.24.15        | Inicio de sesión con Google y acceso de desarrollo, con sesiones JWT.              | https://next-auth.js.org/            |
| Lucide                  | 1.77.0         | Íconos del menú y de los botones.                                                  | https://lucide.dev/                  |
| date-fns y @date-fns/tz | 4.4.0 y 1.5.0  | Aritmética de fechas, semanas de lunes a domingo y la zona de Ecuador.             | https://date-fns.org/                |
| Radix UI                | 1.8.1          | Paneles y diálogos accesibles: foco atrapado, Esc para cerrar, lector de pantalla. | https://www.radix-ui.com/            |
| React Hook Form         | 7.92.0         | Formularios, validados con los mismos esquemas de Zod que las acciones.            | https://react-hook-form.com/         |
| Playwright              | 1.65.1         | Pruebas de extremo a extremo con un navegador real.                                | https://playwright.dev/              |
| Vitest                  | 5.1.0          | Pruebas unitarias y de integración.                                                | https://vitest.dev/                  |
| ESLint                  | 10.15.0        | Análisis estático del código.                                                      | https://eslint.org/docs/latest/      |
| Prettier                | 3.10.1         | Formato uniforme del código.                                                       | https://prettier.io/docs/            |
| Husky y lint-staged     | 9.1.7 y 17.6.1 | Revisión automática antes de cada commit.                                          | https://typicode.github.io/husky/    |
| Docker Compose          | 5              | PostgreSQL local, igual al de CI y producción.                                     | https://docs.docker.com/compose/     |
| GitHub Actions          | —              | Integración continua en cada push.                                                 | https://docs.github.com/actions      |

Las versiones son las estables vigentes al crear el proyecto. Tres decisiones merecen explicación:

- **TypeScript 6.0 y no 7.** La versión 7 ya existe, pero `typescript-eslint` todavía no la
  soporta.
- **Prisma 7.10.1.** La etiqueta `latest` de npm apuntaba a una versión candidata (8.0 rc), no a una
  estable.

- **NextAuth 4 y no Auth.js 5.** La versión 5 sigue en beta; la 4 es la rama estable y ya
  soporta Next.js 16 y React 19.

- **Radix directo y no el generador de shadcn/ui.** El generador reescribe `globals.css` con sus
  propios tokens de color. Los componentes de `components/ui/` siguen el estilo de shadcn/ui
  (Radix por dentro para el foco y el teclado), pero con los tokens de la sección 3.

Llegarán en las fases siguientes: Apache ECharts (gráficos) y Sentry (monitoreo opcional).

---

## Estructura del proyecto

```text
proyecto-finanzas/
├── app/                          # Rutas de Next.js (App Router)
│   ├── layout.tsx                # Idioma, tipografía, estilos y script del tema
│   ├── globals.css               # Tokens de color en modo claro y oscuro
│   ├── (publico)/                # Landing pública con la moneda viajera
│   ├── (auth)/ingresar/          # Pantalla de inicio de sesión, en el mismo mundo
│   ├── (app)/                    # Todo lo que requiere sesión: menú lateral y secciones
│   │   ├── layout.tsx            # Menú lateral + contenido de hasta 1280 px
│   │   ├── panel/                # Inicio provisional con lo que dejó la siembra (fase 5)
│   │   ├── acciones.ts           # Server Action del tema
│   │   ├── movimientos/          # Página y acciones de movimientos, plantillas y recurrentes
│   │   └── cuentas/              # Página y acciones de cuentas, cuadrar y transferencias
│   └── api/
│       ├── auth/[...nextauth]/   # Rutas de NextAuth (404 para el proveedor de desarrollo fuera de él)
│       └── cron/diario/          # Cron diario, protegido con CRON_SECRET
├── components/
│   ├── landing/                  # Moneda (SVG), moneda viajera, tres actos y demostración
│   ├── ui/                       # Botón, campos, panel lateral, diálogo y avisos (sobre Radix)
│   ├── registro/                 # Panel de registro, formularios y atajo N
│   ├── movimientos/              # Filtros, tabla por día y recurrentes
│   ├── cuentas/                  # Vista de cuentas, cuadrar y transferencias
│   ├── menu/                     # Menú lateral, bloques, selector de tema y cerrar sesión
│   └── en-construccion.tsx       # Página provisional de cada sección
├── lib/
│   ├── env.ts                    # Validación de variables de entorno
│   ├── dinero.ts                 # Centavos, formato de montos y porcentajes, lectura de montos
│   ├── fechas.ts                 # Hoy en Ecuador, semanas, meses, períodos y comparación
│   ├── acciones.ts               # Server Actions validadas con Zod y errores tipados
│   ├── esquemas.ts               # Esquemas de Zod compartidos por formularios y acciones
│   ├── colores.ts                # Color de cada categoría según el tema
│   ├── calculos/                 # Fórmulas puras: saldos, recurrentes y listas de movimientos
│   ├── tema.ts                   # Temas, cookie y script que evita el parpadeo
│   ├── auth/                     # Opciones de NextAuth, sesión y regla del acceso de desarrollo
│   ├── semillas/                 # Datos iniciales: categorías, ajustes e ideas de ingreso
│   └── datos/                    # Única capa que consulta la base
│       ├── prisma.ts             # Conexión única a la base (cliente crudo)
│       ├── cliente.ts            # Cliente del usuario: pone usuarioId en toda operación
│       ├── siembra.ts            # Crea el usuario y siembra sus datos en una transacción
│       ├── adaptador-auth.ts     # Adaptador de NextAuth que siembra al crear el usuario
│       ├── tareas.ts             # Tareas del cron, recorriendo a cada usuario
│       └── ...                   # Una por entidad: cuentas, movimientos, recurrentes, plantillas…
├── proxy.ts                      # Manda a /ingresar a quien no tiene sesión
├── prisma/
│   ├── schema.prisma             # Esquema completo de la base
│   ├── migrations/               # Migraciones versionadas, con el SQL de las restricciones
│   └── seed.ts                   # Datos globales: parámetros del SRI 2026
├── tests/
│   ├── *.test.ts                 # Pruebas unitarias
│   ├── integracion/              # Pruebas contra PostgreSQL real
│   ├── calculos/                 # Pruebas de las fórmulas puras
│   └── produccion/               # Prueba sobre el build de producción
├── e2e/                          # Pruebas de extremo a extremo con Playwright
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

A medida que avancen las fases se sumarán `lib/reglas/` (recomendaciones) y `lib/insights/`
(panel de análisis). `vercel.json` programa el cron diario y `playwright.config.ts` configura las
pruebas de extremo a extremo.

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

Con `ACCESO_DESARROLLO=true` en `.env`, la pantalla de ingreso muestra **"Entrar como
desarrollador"**. La primera vez crea el usuario de prueba y le siembra sus datos; el inicio
muestra entonces 15 categorías, la cuenta Efectivo y 71 ideas de ingreso.

### Inicio de sesión con Google (opcional)

1. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crea un ID de
   cliente de OAuth de tipo **Aplicación web**. Es gratis.
2. En **URI de redireccionamiento autorizados** agrega
   `http://localhost:3000/api/auth/callback/google` (y la de producción cuando despliegues).
3. Copia el ID y el secreto en `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` y reinicia `npm run dev`.

PostgreSQL usa el puerto **5433** para no chocar con una instalación nativa de PostgreSQL que
ocupe el 5432. Si quieres otro, cámbialo en `POSTGRES_PORT` y en `DATABASE_URL`.

### Comandos disponibles

| Comando                   | Qué hace                                                               |
| ------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`             | Servidor de desarrollo en `http://localhost:3000`.                     |
| `npm run build`           | Build de producción.                                                   |
| `npm start`               | Sirve el build de producción.                                          |
| `npm run lint`            | ESLint, sin advertencias permitidas.                                   |
| `npm run typecheck`       | Genera los tipos de las rutas y revisa TypeScript.                     |
| `npm run format`          | Da formato a todo el código con Prettier.                              |
| `npm run format:check`    | Verifica el formato sin modificar archivos.                            |
| `npm test`                | Pruebas unitarias.                                                     |
| `npm run test:cobertura`  | Pruebas unitarias con informe de cobertura.                            |
| `npm run test:db`         | Pruebas de integración contra PostgreSQL (requiere la base levantada). |
| `npm run test:produccion` | Prueba del build de producción (requiere `npm run build` antes).       |
| `npm run test:e2e`        | Pruebas de extremo a extremo con Playwright (levanta `next dev`).      |
| `npm run db:migrar`       | Crea y aplica migraciones en desarrollo.                               |
| `npm run db:desplegar`    | Aplica las migraciones pendientes, sin crear nuevas (CI y producción). |
| `npm run db:sembrar`      | Carga los datos globales. Se puede correr varias veces.                |

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
npm test                                  # unitarias
npm run test:db                           # integración (con docker compose up)
npm run build && npm run test:produccion  # build de producción
npm run test:e2e                          # extremo a extremo con Playwright
```

Las pruebas están separadas en tres proyectos de Vitest y uno de Playwright: las **unitarias** no
necesitan base de datos y corren en milisegundos, las **de integración** se conectan a un
PostgreSQL real para comprobar lo que solo la base puede garantizar, la **de producción** levanta
el build real y las **de extremo a extremo** manejan la app con un navegador. Para estas últimas,
la primera vez hay que descargar Chromium con `npx playwright install chromium`.

| Grupo                     | Archivo                                      |   Casos | Qué garantiza                                                                                                                                                                                                                                                                             |
| ------------------------- | -------------------------------------------- | ------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entorno**               | `tests/env.test.ts`                          |       7 | Que la app no arranque con una configuración inválida: clave faltante o vacía, URL que no es de PostgreSQL, secretos cortos, `ACCESO_DESARROLLO` con un valor distinto de `true` o `false`, y Google con una sola de sus dos claves.                                                      |
| **Restricciones**         | `tests/integracion/restricciones.test.ts`    |      12 | Que la base rechace montos en cero o de más de $1.000.000, transferencias inválidas, recurrentes duplicados, un segundo fondo de emergencia y una segunda foto automática del mes; que no se pueda borrar una categoría con movimientos, y que borrar un usuario elimine todos sus datos. |
| **Semillas**              | `tests/semillas.test.ts`                     |      14 | Que las 15 categorías, las 71 ideas (12 de tecnología, 3 generales y 4 por cada una de las 14 áreas) y los ajustes iniciales coincidan con la especificación, sin montos inventados en ninguna idea.                                                                                      |
| **Autenticación**         | `tests/auth.test.ts`                         |       7 | Que el acceso de desarrollo solo exista con `NODE_ENV=development` y `ACCESO_DESARROLLO=true`, y que el tema solo acepte valores válidos.                                                                                                                                                 |
| **Fechas**                | `tests/fechas.test.ts`                       |      53 | Los tres criterios de la fase 3: semanas de lunes a domingo (también cruzando de mes y de año), "hoy" en Ecuador a las 23:59 y a las 00:00, y meses de 28, 29, 30 y 31 días con el día 31 ajustado. Además, los períodos y su comparación con el anterior.                                |
| **Dinero**                | `tests/dinero.test.ts`                       |      45 | El formato `$1.234,50` de Ecuador, el signo − y +, los porcentajes con un decimal, el redondeo al centavo, "Sin datos" al dividir para cero, y cómo se lee cada forma de escribir un monto.                                                                                               |
| **Acciones**              | `tests/acciones.test.ts`                     |       9 | Que una Server Action rechace datos inválidos con el mensaje de cada campo, traduzca los errores de la base y nunca deje escapar detalles internos.                                                                                                                                       |
| **Siembra**               | `tests/integracion/siembra.test.ts`          |       6 | Que un usuario nuevo, por Google o por el acceso de desarrollo, reciba todos sus datos iniciales; que sembrar dos veces no duplique nada, y que un fallo no deje un usuario a medias.                                                                                                     |
| **Aislamiento**           | `tests/integracion/aislamiento.test.ts`      |       4 | Que un usuario no pueda leer ni modificar datos de otro, aunque conozca sus identificadores.                                                                                                                                                                                              |
| **Cliente del usuario**   | `tests/integracion/cliente-usuario.test.ts`  |      12 | Que cada operación de la base (leer, contar, agrupar, crear, actualizar, borrar y upsert) quede atada al usuario, aunque el código pida a propósito el `usuarioId` de otro.                                                                                                               |
| **Cuentas**               | `tests/calculos/cuentas.test.ts`             |      18 | El saldo de cada tipo de cuenta (la tarjeta como deuda), que una transferencia no cambie el total del dinero, el método de pago automático, el próximo pago de tarjeta y que el ajuste de cuadrar deje el saldo igual al real.                                                            |
| **Recurrentes**           | `tests/calculos/recurrentes.test.ts`         |      16 | Que un recurrente del día 31 caiga el 30 de noviembre, que el 29 de febrero pase al 28, que no genere fuera de sus fechas ni en pausa, y que correr dos veces no repita nada.                                                                                                             |
| **Listas de movimientos** | `tests/calculos/movimientos.test.ts`         |       6 | Los totales, la agrupación por día con su subtotal y el aviso de gasto inusual justo en su borde de 5 veces el promedio.                                                                                                                                                                  |
| **Fase 4**                | `tests/integracion/fase4.test.ts`            |      17 | Contra la base real: una transferencia no cambia ingresos ni gastos; el cron dos veces, o dos a la vez, no duplica; el día 31 cae el 30; deshacer un borrado; filtros y totales; plantillas; cuadrar con ajuste; y que no se pueda apuntar a categorías o cuentas de otro usuario.        |
| **Producción**            | `tests/produccion/acceso-desarrollo.test.ts` |       7 | Que en el build de producción el botón de desarrollo no aparezca y su ruta responda 404, aunque `ACCESO_DESARROLLO` valga `true`; que sin sesión `/` muestre la landing y el panel mande a `/ingresar`; y que el cron rechace a quien no trae `CRON_SECRET`.                              |
| **Extremo a extremo**     | `e2e/registro.spec.ts`                       |       5 | Con un navegador real: un gasto se registra solo con teclado en menos de 10 segundos, Shift + Enter deja el panel abierto, Esc lo cierra, un monto inválido muestra su mensaje, borrar ofrece Deshacer y `/` enfoca el buscador.                                                          |
| **Landing**               | `e2e/landing.spec.ts`                        |       5 | Que la landing diga qué es y su acción lleve a entrar, que con "reducir movimiento" se vean los tres actos, que los montos digan que son de ejemplo, que el primer Tab salte al contenido y que con sesión `/` lleve al panel.                                                            |
| **Total**                 |                                              | **243** |                                                                                                                                                                                                                                                                                           |

### Por qué importan las pruebas de integración

Una restricción escrita como SQL dentro de una migración es fácil de perder sin que nadie lo note:
basta con regenerar la migración. Estas pruebas intentan guardar datos inválidos de verdad y
esperan que PostgreSQL los rechace. Si alguna restricción desaparece, la prueba falla.

### Cobertura

La definición de terminado exige al menos **80 % de cobertura** en `lib/calculos/` y
`lib/reglas/`. El umbral está configurado en `vitest.config.mts` y la CI falla si no se cumple.
Hoy `lib/calculos/` tiene 100 % de líneas cubiertas.

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
10. Prueba de que el acceso de desarrollo no existe en ese build y de que el cron pide su secreto.
11. Pruebas de extremo a extremo con Chromium.

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
  cualquier otro caso su ruta responde 404, y una prueba lo verifica en el build de producción.
- Cada usuario solo ve sus datos: la capa `lib/datos/` toma el usuario de la sesión, nunca de la
  pantalla, y una prueba intenta leer los datos de otro usuario por su id.

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
