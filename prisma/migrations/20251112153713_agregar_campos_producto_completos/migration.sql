/*
  Warnings:

  - A unique constraint covering the columns `[strSKU]` on the table `tbProductos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tbProductos" ADD COLUMN     "bolDestacado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bolTieneDescuento" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "datFinDescuento" TIMESTAMP(3),
ADD COLUMN     "datInicioDescuento" TIMESTAMP(3),
ADD COLUMN     "dblPrecioDescuento" DOUBLE PRECISION,
ADD COLUMN     "intPorcentajeDescuento" INTEGER,
ADD COLUMN     "intStockMinimo" INTEGER,
ADD COLUMN     "jsonImagenes" TEXT,
ADD COLUMN     "jsonVariantes" TEXT,
ADD COLUMN     "strDescripcionLarga" TEXT,
ADD COLUMN     "strDimensiones" TEXT,
ADD COLUMN     "strEstado" TEXT NOT NULL DEFAULT 'activo',
ADD COLUMN     "strEtiquetas" TEXT,
ADD COLUMN     "strMarca" TEXT,
ADD COLUMN     "strPeso" TEXT,
ADD COLUMN     "strSKU" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tbProductos_strSKU_key" ON "tbProductos"("strSKU");
