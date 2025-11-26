/*
  Warnings:

  - A unique constraint covering the columns `[intCliente]` on the table `tbDirecciones` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `strColonia` to the `tbDirecciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strNumeroExterior` to the `tbDirecciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strNumeroInterior` to the `tbDirecciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbDirecciones" ADD COLUMN     "strColonia" TEXT NOT NULL,
ADD COLUMN     "strNumeroExterior" TEXT NOT NULL,
ADD COLUMN     "strNumeroInterior" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tbDirecciones_intCliente_key" ON "tbDirecciones"("intCliente");
