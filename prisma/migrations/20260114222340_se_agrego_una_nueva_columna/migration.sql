/*
  Warnings:

  - Added the required column `strTipoMovimiento` to the `tbMotivo_Movimientos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbMotivo_Movimientos" ADD COLUMN     "strTipoMovimiento" TEXT NOT NULL;
