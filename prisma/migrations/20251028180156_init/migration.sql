-- CreateEnum
CREATE TYPE "RolEmpleado" AS ENUM ('SUPERADMIN', 'ADMIN', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'PAGADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "tbClientes" (
    "intCliente" SERIAL NOT NULL,
    "strNombre" TEXT NOT NULL,
    "strEmail" TEXT NOT NULL,
    "strPassword" TEXT NOT NULL,
    "strTelefono" TEXT,
    "bolActivo" BOOLEAN NOT NULL DEFAULT true,
    "datRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbClientes_pkey" PRIMARY KEY ("intCliente")
);

-- CreateTable
CREATE TABLE "tbEmpleados" (
    "intEmpleado" SERIAL NOT NULL,
    "strNombre" TEXT NOT NULL,
    "strEmail" TEXT NOT NULL,
    "strPassword" TEXT NOT NULL,
    "strRol" "RolEmpleado" NOT NULL,
    "bolActivo" BOOLEAN NOT NULL DEFAULT true,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbEmpleados_pkey" PRIMARY KEY ("intEmpleado")
);

-- CreateTable
CREATE TABLE "tbCategorias" (
    "intCategoria" SERIAL NOT NULL,
    "strNombre" TEXT NOT NULL,
    "strDescripcion" TEXT,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbCategorias_pkey" PRIMARY KEY ("intCategoria")
);

-- CreateTable
CREATE TABLE "tbProductos" (
    "intProducto" SERIAL NOT NULL,
    "strNombre" TEXT NOT NULL,
    "strDescripcion" TEXT,
    "dblPrecio" DOUBLE PRECISION NOT NULL,
    "intStock" INTEGER NOT NULL DEFAULT 0,
    "strImagen" TEXT,
    "bolActivo" BOOLEAN NOT NULL DEFAULT true,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datActualizacion" TIMESTAMP(3) NOT NULL,
    "intCategoria" INTEGER NOT NULL,
    "intCreadoPorId" INTEGER,

    CONSTRAINT "tbProductos_pkey" PRIMARY KEY ("intProducto")
);

-- CreateTable
CREATE TABLE "tbPedidos" (
    "intPedido" SERIAL NOT NULL,
    "intCliente" INTEGER NOT NULL,
    "dblTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "strEstado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "datPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbPedidos_pkey" PRIMARY KEY ("intPedido")
);

-- CreateTable
CREATE TABLE "tbPedidosItems" (
    "intPedidoItem" SERIAL NOT NULL,
    "intPedido" INTEGER NOT NULL,
    "intProducto" INTEGER NOT NULL,
    "intCantidad" INTEGER NOT NULL DEFAULT 1,
    "dblSubtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "tbPedidosItems_pkey" PRIMARY KEY ("intPedidoItem")
);

-- CreateTable
CREATE TABLE "tbDirecciones" (
    "intDireccion" SERIAL NOT NULL,
    "intCliente" INTEGER NOT NULL,
    "strCalle" TEXT NOT NULL,
    "strCiudad" TEXT NOT NULL,
    "strEstado" TEXT NOT NULL,
    "strCP" TEXT NOT NULL,
    "strPais" TEXT NOT NULL DEFAULT 'México',

    CONSTRAINT "tbDirecciones_pkey" PRIMARY KEY ("intDireccion")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbClientes_strEmail_key" ON "tbClientes"("strEmail");

-- CreateIndex
CREATE UNIQUE INDEX "tbEmpleados_strEmail_key" ON "tbEmpleados"("strEmail");

-- AddForeignKey
ALTER TABLE "tbProductos" ADD CONSTRAINT "tbProductos_intCategoria_fkey" FOREIGN KEY ("intCategoria") REFERENCES "tbCategorias"("intCategoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbProductos" ADD CONSTRAINT "tbProductos_intCreadoPorId_fkey" FOREIGN KEY ("intCreadoPorId") REFERENCES "tbEmpleados"("intEmpleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbPedidos" ADD CONSTRAINT "tbPedidos_intCliente_fkey" FOREIGN KEY ("intCliente") REFERENCES "tbClientes"("intCliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbPedidosItems" ADD CONSTRAINT "tbPedidosItems_intPedido_fkey" FOREIGN KEY ("intPedido") REFERENCES "tbPedidos"("intPedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbPedidosItems" ADD CONSTRAINT "tbPedidosItems_intProducto_fkey" FOREIGN KEY ("intProducto") REFERENCES "tbProductos"("intProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbDirecciones" ADD CONSTRAINT "tbDirecciones_intCliente_fkey" FOREIGN KEY ("intCliente") REFERENCES "tbClientes"("intCliente") ON DELETE RESTRICT ON UPDATE CASCADE;
