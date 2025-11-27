/*
  Warnings:

  - The `strEstado` column on the `tbPagos` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."tbPagos_strMercadoPagoId_key";

-- AlterTable
ALTER TABLE "tbPagos" ADD COLUMN     "jsonRespuestaMercadoPago" TEXT,
ADD COLUMN     "strPreferenciaId" TEXT,
ALTER COLUMN "strMercadoPagoId" DROP NOT NULL,
DROP COLUMN "strEstado",
ADD COLUMN     "strEstado" TEXT NOT NULL DEFAULT 'PENDIENTE';

-- CreateIndex
CREATE INDEX "tbPagos_intPedido_idx" ON "tbPagos"("intPedido");

-- CreateIndex
CREATE INDEX "tbPagos_strMercadoPagoId_idx" ON "tbPagos"("strMercadoPagoId");

-- CreateIndex
CREATE INDEX "tbPagos_strPreferenciaId_idx" ON "tbPagos"("strPreferenciaId");

-- CreateIndex
CREATE INDEX "tbPedidos_intCliente_idx" ON "tbPedidos"("intCliente");

-- CreateIndex
CREATE INDEX "tbPedidos_strEstado_idx" ON "tbPedidos"("strEstado");
