-- CreateTable
CREATE TABLE "tbProducto_Reviews" (
    "intReview" SERIAL NOT NULL,
    "intProducto" INTEGER NOT NULL,
    "intCliente" INTEGER NOT NULL,
    "intCalificacion" INTEGER NOT NULL,
    "strComentario" TEXT,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbProducto_Reviews_pkey" PRIMARY KEY ("intReview")
);

-- CreateIndex
CREATE INDEX "tbProducto_Reviews_intProducto_idx" ON "tbProducto_Reviews"("intProducto");

-- CreateIndex
CREATE INDEX "tbProducto_Reviews_intCliente_idx" ON "tbProducto_Reviews"("intCliente");

-- AddForeignKey
ALTER TABLE "tbProducto_Reviews" ADD CONSTRAINT "tbProducto_Reviews_intProducto_fkey" FOREIGN KEY ("intProducto") REFERENCES "tbProductos"("intProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbProducto_Reviews" ADD CONSTRAINT "tbProducto_Reviews_intCliente_fkey" FOREIGN KEY ("intCliente") REFERENCES "tbClientes"("intCliente") ON DELETE RESTRICT ON UPDATE CASCADE;
