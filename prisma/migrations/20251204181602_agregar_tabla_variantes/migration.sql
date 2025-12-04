-- AlterTable
ALTER TABLE "tbPedidosItems" ADD COLUMN     "intVariante" INTEGER;

-- CreateTable
CREATE TABLE "tbProductoVariantes" (
    "intVariante" SERIAL NOT NULL,
    "intProducto" INTEGER NOT NULL,
    "strTalla" TEXT NOT NULL,
    "strColor" TEXT NOT NULL,
    "intStock" INTEGER NOT NULL DEFAULT 0,
    "strSKU" TEXT,
    "dblPrecioAdicional" DOUBLE PRECISION DEFAULT 0,
    "strImagen" TEXT,
    "bolActivo" BOOLEAN NOT NULL DEFAULT true,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbProductoVariantes_pkey" PRIMARY KEY ("intVariante")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbProductoVariantes_strSKU_key" ON "tbProductoVariantes"("strSKU");

-- CreateIndex
CREATE INDEX "tbProductoVariantes_intProducto_idx" ON "tbProductoVariantes"("intProducto");

-- CreateIndex
CREATE INDEX "tbProductoVariantes_strTalla_idx" ON "tbProductoVariantes"("strTalla");

-- CreateIndex
CREATE INDEX "tbProductoVariantes_strColor_idx" ON "tbProductoVariantes"("strColor");

-- CreateIndex
CREATE UNIQUE INDEX "tbProductoVariantes_intProducto_strTalla_strColor_key" ON "tbProductoVariantes"("intProducto", "strTalla", "strColor");

-- CreateIndex
CREATE INDEX "tbPedidosItems_intPedido_idx" ON "tbPedidosItems"("intPedido");

-- CreateIndex
CREATE INDEX "tbPedidosItems_intProducto_idx" ON "tbPedidosItems"("intProducto");

-- CreateIndex
CREATE INDEX "tbPedidosItems_intVariante_idx" ON "tbPedidosItems"("intVariante");

-- AddForeignKey
ALTER TABLE "tbProductoVariantes" ADD CONSTRAINT "tbProductoVariantes_intProducto_fkey" FOREIGN KEY ("intProducto") REFERENCES "tbProductos"("intProducto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbPedidosItems" ADD CONSTRAINT "tbPedidosItems_intVariante_fkey" FOREIGN KEY ("intVariante") REFERENCES "tbProductoVariantes"("intVariante") ON DELETE SET NULL ON UPDATE CASCADE;
