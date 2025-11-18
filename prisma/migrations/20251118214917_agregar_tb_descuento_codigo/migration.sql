-- CreateTable
CREATE TABLE "tbDescuentosCodigos" (
    "intDescuentoCodigo" SERIAL NOT NULL,
    "strCodigo" TEXT NOT NULL,
    "dblPorcentajeDescuento" TEXT NOT NULL,
    "datFechaInicio" TIMESTAMP(3) NOT NULL,
    "datFechaFin" TIMESTAMP(3) NOT NULL,
    "bolActivo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tbDescuentosCodigos_pkey" PRIMARY KEY ("intDescuentoCodigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbDescuentosCodigos_strCodigo_key" ON "tbDescuentosCodigos"("strCodigo");
