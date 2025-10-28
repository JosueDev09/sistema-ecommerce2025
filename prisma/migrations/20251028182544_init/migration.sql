/*
  Warnings:

  - A unique constraint covering the columns `[strUsuario]` on the table `tbClientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[strUsuario]` on the table `tbEmpleados` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tbClientes_strUsuario_key" ON "tbClientes"("strUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "tbEmpleados_strUsuario_key" ON "tbEmpleados"("strUsuario");
