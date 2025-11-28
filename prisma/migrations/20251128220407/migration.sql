/*
  Warnings:

  - The values [PAGADO,EN_PROCESO] on the enum `EstadoPedido` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "EstadoPagoEnum" AS ENUM ('PENDIENTE', 'PAGADO', 'RECHAZADO', 'CANCELADO', 'REEMBOLSADO');

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoPedido_new" AS ENUM ('PENDIENTE', 'PROCESANDO', 'EMPAQUETANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO');
ALTER TABLE "public"."tbPedidos" ALTER COLUMN "strEstado" DROP DEFAULT;
ALTER TABLE "tbPedidos" ALTER COLUMN "strEstado" TYPE "EstadoPedido_new" USING ("strEstado"::text::"EstadoPedido_new");
ALTER TYPE "EstadoPedido" RENAME TO "EstadoPedido_old";
ALTER TYPE "EstadoPedido_new" RENAME TO "EstadoPedido";
DROP TYPE "public"."EstadoPedido_old";
ALTER TABLE "tbPedidos" ALTER COLUMN "strEstado" SET DEFAULT 'PENDIENTE';
COMMIT;

-- AlterTable
ALTER TABLE "tbPedidos" ADD COLUMN     "strEstadoPago" "EstadoPagoEnum" NOT NULL DEFAULT 'PENDIENTE';
