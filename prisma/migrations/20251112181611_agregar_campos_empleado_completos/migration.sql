/*
  Warnings:

  - Added the required column `datFechaIngreso` to the `tbEmpleados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dblSalario` to the `tbEmpleados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strDepartamento` to the `tbEmpleados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strHorario` to the `tbEmpleados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strPuesto` to the `tbEmpleados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strTipoContrato` to the `tbEmpleados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbEmpleados" 
ADD COLUMN     "datFechaNacimiento" TIMESTAMP(3),
ADD COLUMN     "strTelefono" TEXT,
ADD COLUMN     "strDireccion" TEXT,
ADD COLUMN     "strCiudad" TEXT,
ADD COLUMN     "strEstado" TEXT,
ADD COLUMN     "intCP" INTEGER,
ADD COLUMN     "strPuesto" TEXT NOT NULL DEFAULT 'Sin asignar',
ADD COLUMN     "strDepartamento" TEXT NOT NULL DEFAULT 'Sin asignar',
ADD COLUMN     "dblSalario" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "datFechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "strTipoContrato" TEXT NOT NULL DEFAULT 'Sin especificar',
ADD COLUMN     "strHorario" TEXT NOT NULL DEFAULT 'Sin especificar';

-- Remove defaults after adding columns (for future inserts to be required)
ALTER TABLE "tbEmpleados" 
ALTER COLUMN "strPuesto" DROP DEFAULT,
ALTER COLUMN "strDepartamento" DROP DEFAULT,
ALTER COLUMN "dblSalario" DROP DEFAULT,
ALTER COLUMN "datFechaIngreso" DROP DEFAULT,
ALTER COLUMN "strTipoContrato" DROP DEFAULT,
ALTER COLUMN "strHorario" DROP DEFAULT;
