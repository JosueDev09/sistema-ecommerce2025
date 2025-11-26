-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'REEMBOLSADO');

-- CreateTable
CREATE TABLE "tbPagos" (
    "intPago" SERIAL NOT NULL,
    "intPedido" INTEGER NOT NULL,
    "strMercadoPagoId" TEXT NOT NULL,
    "strMetodoPago" TEXT NOT NULL,
    "strEstado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "dblMonto" DOUBLE PRECISION NOT NULL,
    "intCuotas" INTEGER,
    "jsonDetallesPago" TEXT,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbPagos_pkey" PRIMARY KEY ("intPago")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbPagos_intPedido_key" ON "tbPagos"("intPedido");

-- CreateIndex
CREATE UNIQUE INDEX "tbPagos_strMercadoPagoId_key" ON "tbPagos"("strMercadoPagoId");

-- AddForeignKey
ALTER TABLE "tbPagos" ADD CONSTRAINT "tbPagos_intPedido_fkey" FOREIGN KEY ("intPedido") REFERENCES "tbPedidos"("intPedido") ON DELETE RESTRICT ON UPDATE CASCADE;
