/*
  Warnings:

  - Added the required column `datActualizacion` to the `tbDirecciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbDirecciones" ADD COLUMN     "datActualizacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tbPedidos" ADD COLUMN     "dblCostoEnvio" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dblSubtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "intDireccion" INTEGER,
ADD COLUMN     "strMetodoEnvio" TEXT,
ADD COLUMN     "strNotasEnvio" TEXT;

-- AddForeignKey
ALTER TABLE "tbPedidos" ADD CONSTRAINT "tbPedidos_intDireccion_fkey" FOREIGN KEY ("intDireccion") REFERENCES "tbDirecciones"("intDireccion") ON DELETE SET NULL ON UPDATE CASCADE;
