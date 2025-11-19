/*
  Warnings:

  - You are about to drop the column `dblPorcentajeDescuento` on the `tbDescuentosCodigos` table. All the data in the column will be lost.
  - Added the required column `intPorcentajeDescuento` to the `tbDescuentosCodigos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbDescuentosCodigos" DROP COLUMN "dblPorcentajeDescuento",
ADD COLUMN     "intPorcentajeDescuento" INTEGER NOT NULL;
