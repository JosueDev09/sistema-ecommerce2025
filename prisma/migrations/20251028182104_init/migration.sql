/*
  Warnings:

  - You are about to drop the column `strPassword` on the `tbClientes` table. All the data in the column will be lost.
  - You are about to drop the column `strPassword` on the `tbEmpleados` table. All the data in the column will be lost.
  - Added the required column `strContra` to the `tbClientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strUsuario` to the `tbClientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strContra` to the `tbEmpleados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strUsuario` to the `tbEmpleados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbClientes" DROP COLUMN "strPassword",
ADD COLUMN     "strContra" TEXT NOT NULL,
ADD COLUMN     "strUsuario" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tbEmpleados" DROP COLUMN "strPassword",
ADD COLUMN     "strContra" TEXT NOT NULL,
ADD COLUMN     "strUsuario" TEXT NOT NULL;
