/*
  Warnings:

  - You are about to drop the column `strDestacado` on the `tbCategorias` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tbCategorias" DROP COLUMN "strDestacado",
ADD COLUMN     "boolDestacado" BOOLEAN;
