-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('GASTO', 'INGRESO');

-- CreateEnum
CREATE TYPE "ClaseCategoria" AS ENUM ('NECESIDAD', 'DESEO');

-- CreateEnum
CREATE TYPE "CategoriaSistema" AS ENUM ('INTERESES_COMISIONES', 'RENDIMIENTOS');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'DEBITO', 'CREDITO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "Frecuencia" AS ENUM ('SEMANAL', 'MENSUAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "EstadoMeta" AS ENUM ('ACTIVA', 'CUMPLIDA', 'ARCHIVADA');

-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('CUENTA_AHORRO', 'POLIZA', 'FONDO_INVERSION', 'ACCIONES_LOCALES', 'ETF', 'CRIPTO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoInstitucion" AS ENUM ('BANCO', 'MUTUALISTA', 'COOPERATIVA', 'CASA_VALORES', 'BROKER_EXTERIOR', 'EXCHANGE', 'OTRO');

-- CreateEnum
CREATE TYPE "PerfilInversor" AS ENUM ('CONSERVADOR', 'MODERADO', 'AGRESIVO');

-- CreateEnum
CREATE TYPE "NivelCapital" AS ENUM ('NINGUNO', 'BAJO', 'MEDIO');

-- CreateEnum
CREATE TYPE "NivelIdea" AS ENUM ('CUALQUIERA', 'ESTUDIANTE', 'JUNIOR', 'PROFESIONAL_TITULADO');

-- CreateEnum
CREATE TYPE "NivelProfesional" AS ENUM ('ESTUDIANTE', 'JUNIOR', 'SEMI_SENIOR', 'SENIOR');

-- CreateEnum
CREATE TYPE "PreferenciaModalidad" AS ENUM ('REMOTO', 'PRESENCIAL', 'AMBAS');

-- CreateEnum
CREATE TYPE "Alcance" AS ENUM ('ECUADOR', 'EXTERIOR', 'AMBOS');

-- CreateEnum
CREATE TYPE "EstadoPlan" AS ENUM ('ACTIVO', 'PAUSADO', 'TERMINADO');

-- CreateEnum
CREATE TYPE "Tema" AS ENUM ('CLARO', 'OSCURO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "EtapaOportunidad" AS ENUM ('PROSPECTO', 'CONTACTADO', 'PROPUESTA', 'NEGOCIACION', 'GANADA', 'PERDIDA');

-- CreateEnum
CREATE TYPE "MotivoPerdida" AS ENUM ('PRECIO', 'TIEMPO', 'NO_RESPONDIO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCobro" AS ENUM ('PENDIENTE', 'COBRADO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('EFECTIVO', 'BANCO', 'BILLETERA', 'TARJETA_CREDITO');

-- CreateEnum
CREATE TYPE "TipoBien" AS ENUM ('VEHICULO', 'EQUIPO_TECNOLOGICO', 'INMUEBLE', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoDeuda" AS ENUM ('CONSUMO', 'EDUCATIVA', 'VEHICULAR', 'HIPOTECARIA', 'FAMILIAR');

-- CreateEnum
CREATE TYPE "EtapaPostulacion" AS ENUM ('GUARDADA', 'POSTULADA', 'ENTREVISTA', 'PRUEBA_TECNICA', 'OFERTA', 'ACEPTADA', 'RECHAZADA', 'DESCARTADA');

-- CreateEnum
CREATE TYPE "FuentePostulacion" AS ENUM ('PORTAL', 'RED_PROFESIONAL', 'REFERIDO', 'OTRA');

-- CreateEnum
CREATE TYPE "ModalidadTrabajo" AS ENUM ('REMOTO', 'PRESENCIAL', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('RELACION_DEPENDENCIA', 'SERVICIOS_PROFESIONALES', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoPrestamo" AS ENUM ('ACTIVO', 'PAGADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "RubroSRI" AS ENUM ('VIVIENDA', 'EDUCACION', 'SALUD', 'VESTIMENTA', 'ALIMENTACION', 'TURISMO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMPTZ(3),
    "image" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "clase" "ClaseCategoria",
    "colorSlot" INTEGER,
    "sistema" "CategoriaSistema",
    "orden" INTEGER NOT NULL,
    "archivada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "montoCentavos" INTEGER NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "nota" VARCHAR(140),
    "metodoPago" "MetodoPago" NOT NULL,
    "recurrenteId" TEXT,
    "planIngresoId" TEXT,
    "rubroSRI" "RubroSRI",
    "conFactura" BOOLEAN NOT NULL DEFAULT false,
    "esAjuste" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recurrente" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "montoCentavos" INTEGER NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "nota" VARCHAR(140),
    "frecuencia" "Frecuencia" NOT NULL,
    "diaSemana" INTEGER,
    "diaMes" INTEGER,
    "mes" INTEGER,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimaGenerada" DATE,

    CONSTRAINT "Recurrente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presupuesto" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "montoMensualCentavos" INTEGER NOT NULL,
    "vigenteDesde" CHAR(7) NOT NULL,

    CONSTRAINT "Presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meta" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "montoObjetivoCentavos" INTEGER NOT NULL,
    "fechaObjetivo" DATE NOT NULL,
    "esFondoEmergencia" BOOLEAN NOT NULL DEFAULT false,
    "objetivoManual" BOOLEAN NOT NULL DEFAULT false,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "creadaEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoMeta" NOT NULL DEFAULT 'ACTIVA',
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AporteMeta" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "metaId" TEXT NOT NULL,
    "montoCentavos" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "nota" VARCHAR(140),

    CONSTRAINT "AporteMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inversion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoProducto" "TipoProducto" NOT NULL,
    "institucion" TEXT NOT NULL,
    "tipoInstitucion" "TipoInstitucion" NOT NULL,
    "cuentaId" TEXT,
    "coberturaCentavos" INTEGER,
    "montoCentavos" INTEGER NOT NULL,
    "tasaAnual" DECIMAL(7,4),
    "fechaInicio" DATE NOT NULL,
    "fechaVencimiento" DATE,
    "valorActualCentavos" INTEGER NOT NULL,
    "nota" TEXT,

    CONSTRAINT "Inversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilRiesgo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "respuestas" JSONB NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "perfil" "PerfilInversor" NOT NULL,
    "fecha" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerfilRiesgo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeaIngreso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "habilidadesRequeridas" TEXT[],
    "nivelMinimo" "NivelIdea" NOT NULL,
    "horasSemanaMin" INTEGER NOT NULL,
    "horasSemanaMax" INTEGER NOT NULL,
    "capital" "NivelCapital" NOT NULL,
    "modalidad" "PreferenciaModalidad" NOT NULL,
    "tiempoPrimerCobro" TEXT NOT NULL,
    "canales" TEXT NOT NULL,
    "requisitos" TEXT NOT NULL,
    "pasos" TEXT[],
    "esSemilla" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IdeaIngreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanIngreso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "estado" "EstadoPlan" NOT NULL DEFAULT 'ACTIVO',
    "pasosHechos" INTEGER[],
    "metaMensualCentavos" INTEGER,
    "inicio" DATE NOT NULL,

    CONSTRAINT "PlanIngreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ajustes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT,
    "tema" "Tema" NOT NULL DEFAULT 'SISTEMA',
    "umbralHormigaCentavos" INTEGER NOT NULL DEFAULT 500,
    "mesesFondoObjetivo" INTEGER NOT NULL DEFAULT 6,
    "metaIngresoExtraCentavos" INTEGER,
    "plantillas" JSONB NOT NULL DEFAULT '[]',
    "plantillasMensaje" JSONB NOT NULL DEFAULT '{}',
    "cargasFamiliares" INTEGER NOT NULL DEFAULT 0,
    "metaPatrimonioCentavos" INTEGER,
    "fechaMetaPatrimonio" DATE,
    "multiplicadorIndependencia" INTEGER NOT NULL DEFAULT 25,
    "aporteIess" DECIMAL(5,2) NOT NULL DEFAULT 9.45,
    "diaRevision" INTEGER NOT NULL DEFAULT 1,
    "descartes" JSONB NOT NULL DEFAULT '[]',
    "distribucionObjetivo" JSONB NOT NULL DEFAULT '{}',
    "limiteCoberturaBancosCentavos" INTEGER NOT NULL DEFAULT 3200000,
    "fechaVerificacionCobertura" DATE,
    "porcentajeNoFacturable" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "colchonImprevistos" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "porcentajeImpuestosTarifa" DECIMAL(5,2),
    "ultimaCategoriaGastoId" TEXT,
    "ultimaCategoriaIngresoId" TEXT,
    "ultimaCuentaId" TEXT,

    CONSTRAINT "Ajustes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilProfesional" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "profesion" TEXT,
    "nivel" "NivelProfesional",
    "habilidades" TEXT[],
    "certificaciones" TEXT,
    "idiomas" TEXT,
    "horasSemana" INTEGER,
    "capital" "NivelCapital",
    "modalidad" "PreferenciaModalidad",
    "alcance" "Alcance",

    CONSTRAINT "PerfilProfesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oportunidad" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "planIngresoId" TEXT,
    "cliente" TEXT NOT NULL,
    "contacto" TEXT,
    "montoEstimadoCentavos" INTEGER,
    "etapa" "EtapaOportunidad" NOT NULL DEFAULT 'PROSPECTO',
    "proximoSeguimiento" DATE,
    "notas" TEXT,
    "motivoPerdida" "MotivoPerdida",

    CONSTRAINT "Oportunidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobro" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "oportunidadId" TEXT NOT NULL,
    "montoCentavos" INTEGER NOT NULL,
    "vencimiento" DATE NOT NULL,
    "estado" "EstadoCobro" NOT NULL DEFAULT 'PENDIENTE',
    "fechaCobro" DATE,
    "movimientoId" TEXT,

    CONSTRAINT "Cobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroHoras" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "planIngresoId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "horas" DECIMAL(5,2) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "RegistroHoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escenario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "parametros" JSONB NOT NULL,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Escenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuenta" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,
    "institucion" TEXT,
    "saldoInicialCentavos" INTEGER NOT NULL DEFAULT 0,
    "fechaSaldoInicial" DATE NOT NULL,
    "cupoCentavos" INTEGER,
    "diaCorte" INTEGER,
    "diaPago" INTEGER,
    "archivada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cuenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transferencia" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cuentaOrigenId" TEXT,
    "cuentaDestinoId" TEXT,
    "montoCentavos" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "nota" VARCHAR(140),
    "deudaId" TEXT,
    "prestamoId" TEXT,
    "inversionId" TEXT,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conciliacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "saldoRealCentavos" INTEGER NOT NULL,
    "diferenciaCentavos" INTEGER NOT NULL,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Conciliacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bien" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoBien" NOT NULL,
    "valorCompraCentavos" INTEGER NOT NULL,
    "fechaCompra" DATE NOT NULL,
    "valorActualCentavos" INTEGER NOT NULL,
    "depreciacionAnual" DECIMAL(5,2),

    CONSTRAINT "Bien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoPatrimonio" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "mes" CHAR(7) NOT NULL,
    "activosPorTipo" JSONB NOT NULL,
    "pasivosPorTipo" JSONB NOT NULL,
    "netoCentavos" INTEGER NOT NULL,
    "manual" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FotoPatrimonio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deuda" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "acreedor" TEXT,
    "tipo" "TipoDeuda" NOT NULL,
    "montoOriginalCentavos" INTEGER NOT NULL,
    "saldoCentavos" INTEGER NOT NULL,
    "tasaAnual" DECIMAL(7,4) NOT NULL,
    "cuotaCentavos" INTEGER NOT NULL,
    "diaPago" INTEGER NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "plazoMeses" INTEGER,

    CONSTRAINT "Deuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoDeuda" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "deudaId" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "interesCentavos" INTEGER NOT NULL,
    "capitalCentavos" INTEGER NOT NULL,
    "movimientoInteresId" TEXT,
    "transferenciaCapitalId" TEXT,

    CONSTRAINT "PagoDeuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postulacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "enlace" TEXT,
    "fuente" "FuentePostulacion",
    "fecha" DATE NOT NULL,
    "modalidad" "ModalidadTrabajo",
    "ciudad" TEXT,
    "salarioCentavos" INTEGER,
    "habilidades" TEXT[],
    "versionCvId" TEXT,
    "etapa" "EtapaPostulacion" NOT NULL DEFAULT 'GUARDADA',
    "proximoSeguimiento" DATE,
    "notas" TEXT,
    "motivoCierre" TEXT,

    CONSTRAINT "Postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfertaLaboral" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "postulacionId" TEXT NOT NULL,
    "brutoCentavos" INTEGER NOT NULL,
    "tipoContrato" "TipoContrato" NOT NULL,
    "aporteIess" DECIMAL(5,2) NOT NULL,
    "otrosDescuentosCentavos" INTEGER NOT NULL DEFAULT 0,
    "beneficiosMensualesCentavos" INTEGER NOT NULL DEFAULT 0,
    "trasladoCentavos" INTEGER NOT NULL DEFAULT 0,
    "horasSemana" DECIMAL(5,2) NOT NULL,
    "modalidad" "ModalidadTrabajo",
    "retencionEstimadaCentavos" INTEGER,
    "aceptada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OfertaLaboral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionCV" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "enlace" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "notas" TEXT,

    CONSTRAINT "VersionCV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionMensual" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "mes" CHAR(7) NOT NULL,
    "pasosHechos" INTEGER[],
    "nota" TEXT,
    "completadaEn" TIMESTAMPTZ(3),

    CONSTRAINT "RevisionMensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestamo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "persona" TEXT NOT NULL,
    "contacto" TEXT,
    "montoCentavos" INTEGER NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "fechaEsperada" DATE,
    "estado" "EstadoPrestamo" NOT NULL DEFAULT 'ACTIVO',
    "nota" TEXT,

    CONSTRAINT "Prestamo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbonoPrestamo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "prestamoId" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "montoCentavos" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "transferenciaId" TEXT,

    CONSTRAINT "AbonoPrestamo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParametrosSRI" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "canastaCentavos" INTEGER NOT NULL,
    "tablaCanastas" JSONB NOT NULL,
    "porcentajeRebaja" DECIMAL(5,2) NOT NULL,
    "baseExentaCentavos" INTEGER NOT NULL,
    "fuente" TEXT NOT NULL,
    "fechaVerificacion" DATE NOT NULL,

    CONSTRAINT "ParametrosSRI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aviso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "enlace" TEXT,
    "fecha" DATE NOT NULL,
    "leidoEn" TIMESTAMPTZ(3),
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Categoria_usuarioId_tipo_orden_idx" ON "Categoria"("usuarioId", "tipo", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_usuarioId_tipo_nombre_key" ON "Categoria"("usuarioId", "tipo", "nombre");

-- CreateIndex
CREATE INDEX "Movimiento_usuarioId_fecha_idx" ON "Movimiento"("usuarioId", "fecha");

-- CreateIndex
CREATE INDEX "Movimiento_usuarioId_categoriaId_fecha_idx" ON "Movimiento"("usuarioId", "categoriaId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Movimiento_recurrenteId_fecha_key" ON "Movimiento"("recurrenteId", "fecha");

-- CreateIndex
CREATE INDEX "Recurrente_usuarioId_activo_idx" ON "Recurrente"("usuarioId", "activo");

-- CreateIndex
CREATE INDEX "Presupuesto_usuarioId_idx" ON "Presupuesto"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Presupuesto_categoriaId_vigenteDesde_key" ON "Presupuesto"("categoriaId", "vigenteDesde");

-- CreateIndex
CREATE INDEX "Meta_usuarioId_estado_idx" ON "Meta"("usuarioId", "estado");

-- CreateIndex
CREATE INDEX "AporteMeta_usuarioId_fecha_idx" ON "AporteMeta"("usuarioId", "fecha");

-- CreateIndex
CREATE INDEX "AporteMeta_metaId_idx" ON "AporteMeta"("metaId");

-- CreateIndex
CREATE INDEX "Inversion_usuarioId_idx" ON "Inversion"("usuarioId");

-- CreateIndex
CREATE INDEX "PerfilRiesgo_usuarioId_fecha_idx" ON "PerfilRiesgo"("usuarioId", "fecha");

-- CreateIndex
CREATE INDEX "IdeaIngreso_usuarioId_area_idx" ON "IdeaIngreso"("usuarioId", "area");

-- CreateIndex
CREATE INDEX "PlanIngreso_usuarioId_estado_idx" ON "PlanIngreso"("usuarioId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Ajustes_usuarioId_key" ON "Ajustes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilProfesional_usuarioId_key" ON "PerfilProfesional"("usuarioId");

-- CreateIndex
CREATE INDEX "Oportunidad_usuarioId_etapa_idx" ON "Oportunidad"("usuarioId", "etapa");

-- CreateIndex
CREATE UNIQUE INDEX "Cobro_movimientoId_key" ON "Cobro"("movimientoId");

-- CreateIndex
CREATE INDEX "Cobro_usuarioId_estado_idx" ON "Cobro"("usuarioId", "estado");

-- CreateIndex
CREATE INDEX "RegistroHoras_usuarioId_fecha_idx" ON "RegistroHoras"("usuarioId", "fecha");

-- CreateIndex
CREATE INDEX "Escenario_usuarioId_idx" ON "Escenario"("usuarioId");

-- CreateIndex
CREATE INDEX "Cuenta_usuarioId_archivada_idx" ON "Cuenta"("usuarioId", "archivada");

-- CreateIndex
CREATE INDEX "Transferencia_usuarioId_fecha_idx" ON "Transferencia"("usuarioId", "fecha");

-- CreateIndex
CREATE INDEX "Transferencia_cuentaOrigenId_idx" ON "Transferencia"("cuentaOrigenId");

-- CreateIndex
CREATE INDEX "Transferencia_cuentaDestinoId_idx" ON "Transferencia"("cuentaDestinoId");

-- CreateIndex
CREATE INDEX "Conciliacion_usuarioId_resuelta_idx" ON "Conciliacion"("usuarioId", "resuelta");

-- CreateIndex
CREATE INDEX "Bien_usuarioId_idx" ON "Bien"("usuarioId");

-- CreateIndex
CREATE INDEX "FotoPatrimonio_usuarioId_fecha_idx" ON "FotoPatrimonio"("usuarioId", "fecha");

-- CreateIndex
CREATE INDEX "Deuda_usuarioId_idx" ON "Deuda"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PagoDeuda_movimientoInteresId_key" ON "PagoDeuda"("movimientoInteresId");

-- CreateIndex
CREATE UNIQUE INDEX "PagoDeuda_transferenciaCapitalId_key" ON "PagoDeuda"("transferenciaCapitalId");

-- CreateIndex
CREATE INDEX "PagoDeuda_usuarioId_fecha_idx" ON "PagoDeuda"("usuarioId", "fecha");

-- CreateIndex
CREATE INDEX "Postulacion_usuarioId_etapa_idx" ON "Postulacion"("usuarioId", "etapa");

-- CreateIndex
CREATE INDEX "Postulacion_usuarioId_fecha_idx" ON "Postulacion"("usuarioId", "fecha");

-- CreateIndex
CREATE INDEX "OfertaLaboral_usuarioId_idx" ON "OfertaLaboral"("usuarioId");

-- CreateIndex
CREATE INDEX "VersionCV_usuarioId_idx" ON "VersionCV"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionMensual_usuarioId_mes_key" ON "RevisionMensual"("usuarioId", "mes");

-- CreateIndex
CREATE INDEX "Prestamo_usuarioId_estado_idx" ON "Prestamo"("usuarioId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "AbonoPrestamo_transferenciaId_key" ON "AbonoPrestamo"("transferenciaId");

-- CreateIndex
CREATE INDEX "AbonoPrestamo_prestamoId_idx" ON "AbonoPrestamo"("prestamoId");

-- CreateIndex
CREATE UNIQUE INDEX "ParametrosSRI_anio_key" ON "ParametrosSRI"("anio");

-- CreateIndex
CREATE INDEX "Aviso_usuarioId_leidoEn_idx" ON "Aviso"("usuarioId", "leidoEn");

-- CreateIndex
CREATE UNIQUE INDEX "Aviso_usuarioId_clave_key" ON "Aviso"("usuarioId", "clave");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_recurrenteId_fkey" FOREIGN KEY ("recurrenteId") REFERENCES "Recurrente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_planIngresoId_fkey" FOREIGN KEY ("planIngresoId") REFERENCES "PlanIngreso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurrente" ADD CONSTRAINT "Recurrente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurrente" ADD CONSTRAINT "Recurrente_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurrente" ADD CONSTRAINT "Recurrente_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AporteMeta" ADD CONSTRAINT "AporteMeta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AporteMeta" ADD CONSTRAINT "AporteMeta_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "Meta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inversion" ADD CONSTRAINT "Inversion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inversion" ADD CONSTRAINT "Inversion_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilRiesgo" ADD CONSTRAINT "PerfilRiesgo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaIngreso" ADD CONSTRAINT "IdeaIngreso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanIngreso" ADD CONSTRAINT "PlanIngreso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanIngreso" ADD CONSTRAINT "PlanIngreso_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "IdeaIngreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ajustes" ADD CONSTRAINT "Ajustes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilProfesional" ADD CONSTRAINT "PerfilProfesional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidad" ADD CONSTRAINT "Oportunidad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidad" ADD CONSTRAINT "Oportunidad_planIngresoId_fkey" FOREIGN KEY ("planIngresoId") REFERENCES "PlanIngreso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_oportunidadId_fkey" FOREIGN KEY ("oportunidadId") REFERENCES "Oportunidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_movimientoId_fkey" FOREIGN KEY ("movimientoId") REFERENCES "Movimiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroHoras" ADD CONSTRAINT "RegistroHoras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroHoras" ADD CONSTRAINT "RegistroHoras_planIngresoId_fkey" FOREIGN KEY ("planIngresoId") REFERENCES "PlanIngreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escenario" ADD CONSTRAINT "Escenario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_cuentaOrigenId_fkey" FOREIGN KEY ("cuentaOrigenId") REFERENCES "Cuenta"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "Cuenta"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "Prestamo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_inversionId_fkey" FOREIGN KEY ("inversionId") REFERENCES "Inversion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conciliacion" ADD CONSTRAINT "Conciliacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conciliacion" ADD CONSTRAINT "Conciliacion_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bien" ADD CONSTRAINT "Bien_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoPatrimonio" ADD CONSTRAINT "FotoPatrimonio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_movimientoInteresId_fkey" FOREIGN KEY ("movimientoInteresId") REFERENCES "Movimiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_transferenciaCapitalId_fkey" FOREIGN KEY ("transferenciaCapitalId") REFERENCES "Transferencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_versionCvId_fkey" FOREIGN KEY ("versionCvId") REFERENCES "VersionCV"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfertaLaboral" ADD CONSTRAINT "OfertaLaboral_postulacionId_fkey" FOREIGN KEY ("postulacionId") REFERENCES "Postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionCV" ADD CONSTRAINT "VersionCV_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionMensual" ADD CONSTRAINT "RevisionMensual_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbonoPrestamo" ADD CONSTRAINT "AbonoPrestamo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbonoPrestamo" ADD CONSTRAINT "AbonoPrestamo_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "Prestamo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbonoPrestamo" ADD CONSTRAINT "AbonoPrestamo_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbonoPrestamo" ADD CONSTRAINT "AbonoPrestamo_transferenciaId_fkey" FOREIGN KEY ("transferenciaId") REFERENCES "Transferencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- Restricciones que Prisma no declara en el esquema (sección 5)
-- ─────────────────────────────────────────────────────────────

-- Montos estrictamente positivos
ALTER TABLE "Movimiento"    ADD CONSTRAINT "Movimiento_monto_positivo"    CHECK ("montoCentavos" > 0);
ALTER TABLE "Recurrente"    ADD CONSTRAINT "Recurrente_monto_positivo"    CHECK ("montoCentavos" > 0);
ALTER TABLE "Presupuesto"   ADD CONSTRAINT "Presupuesto_monto_positivo"   CHECK ("montoMensualCentavos" > 0);
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_monto_positivo" CHECK ("montoCentavos" > 0);
ALTER TABLE "Prestamo"      ADD CONSTRAINT "Prestamo_monto_positivo"      CHECK ("montoCentavos" > 0);
ALTER TABLE "AbonoPrestamo" ADD CONSTRAINT "AbonoPrestamo_monto_positivo" CHECK ("montoCentavos" > 0);
ALTER TABLE "Cobro"         ADD CONSTRAINT "Cobro_monto_positivo"         CHECK ("montoCentavos" > 0);
ALTER TABLE "RegistroHoras" ADD CONSTRAINT "RegistroHoras_horas_positivas" CHECK ("horas" > 0);

-- Movimiento: la nota admite hasta 140 caracteres y el monto hasta $1.000.000
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_monto_maximo" CHECK ("montoCentavos" <= 100000000);

-- Transferencia: dos cuentas distintas, o una sola cuenta con exactamente una contraparte
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_cuentas_validas" CHECK (
  ("cuentaOrigenId" IS NOT NULL AND "cuentaDestinoId" IS NOT NULL AND "cuentaOrigenId" <> "cuentaDestinoId")
  OR (
    ("cuentaOrigenId" IS NULL) <> ("cuentaDestinoId" IS NULL)
    AND num_nonnulls("deudaId", "prestamoId", "inversionId") = 1
  )
);

-- Rangos de días y meses
ALTER TABLE "Categoria"  ADD CONSTRAINT "Categoria_color_slot"   CHECK ("colorSlot" IS NULL OR "colorSlot" BETWEEN 1 AND 8);
ALTER TABLE "Recurrente" ADD CONSTRAINT "Recurrente_dia_semana"  CHECK ("diaSemana" IS NULL OR "diaSemana" BETWEEN 1 AND 7);
ALTER TABLE "Recurrente" ADD CONSTRAINT "Recurrente_dia_mes"     CHECK ("diaMes" IS NULL OR "diaMes" BETWEEN 1 AND 31);
ALTER TABLE "Recurrente" ADD CONSTRAINT "Recurrente_mes"         CHECK ("mes" IS NULL OR "mes" BETWEEN 1 AND 12);
ALTER TABLE "Cuenta"     ADD CONSTRAINT "Cuenta_dia_corte"       CHECK ("diaCorte" IS NULL OR "diaCorte" BETWEEN 1 AND 31);
ALTER TABLE "Cuenta"     ADD CONSTRAINT "Cuenta_dia_pago"        CHECK ("diaPago" IS NULL OR "diaPago" BETWEEN 1 AND 31);
ALTER TABLE "Deuda"      ADD CONSTRAINT "Deuda_dia_pago"         CHECK ("diaPago" BETWEEN 1 AND 31);
ALTER TABLE "Ajustes"    ADD CONSTRAINT "Ajustes_meses_fondo"    CHECK ("mesesFondoObjetivo" BETWEEN 3 AND 12);
ALTER TABLE "Ajustes"    ADD CONSTRAINT "Ajustes_dia_revision"   CHECK ("diaRevision" BETWEEN 1 AND 28);
ALTER TABLE "Ajustes"    ADD CONSTRAINT "Ajustes_cargas"         CHECK ("cargasFamiliares" >= 0);

-- Formato AAAA-MM
ALTER TABLE "Presupuesto"     ADD CONSTRAINT "Presupuesto_vigente_formato" CHECK ("vigenteDesde" ~ '^\d{4}-(0[1-9]|1[0-2])$');
ALTER TABLE "FotoPatrimonio"  ADD CONSTRAINT "FotoPatrimonio_mes_formato"  CHECK ("mes" ~ '^\d{4}-(0[1-9]|1[0-2])$');
ALTER TABLE "RevisionMensual" ADD CONSTRAINT "RevisionMensual_mes_formato" CHECK ("mes" ~ '^\d{4}-(0[1-9]|1[0-2])$');

-- Índices únicos parciales
CREATE UNIQUE INDEX "Meta_un_fondo_emergencia_por_usuario" ON "Meta" ("usuarioId") WHERE "esFondoEmergencia";
CREATE UNIQUE INDEX "FotoPatrimonio_una_automatica_por_mes" ON "FotoPatrimonio" ("usuarioId", "mes") WHERE NOT "manual";
