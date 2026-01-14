-- CreateTable
CREATE TABLE "tbMovimientosInventarios" (
    "intMovimiento" SERIAL NOT NULL,
    "intProducto" INTEGER NOT NULL,
    "strTipoMovimiento" TEXT NOT NULL,
    "intCantidad" INTEGER NOT NULL,
    "dblCostoUnitario" DOUBLE PRECISION NOT NULL,
    "dblCostoTotal" DOUBLE PRECISION NOT NULL,
    "intMotivoMovimiento" INTEGER,
    "strReferencia" TEXT,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intEmpleado" INTEGER,

    CONSTRAINT "tbMovimientosInventarios_pkey" PRIMARY KEY ("intMovimiento")
);

-- CreateTable
CREATE TABLE "tbMotivo_Movimientos" (
    "intMotivoMovimiento" SERIAL NOT NULL,
    "strDescripcion" TEXT NOT NULL,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbMotivo_Movimientos_pkey" PRIMARY KEY ("intMotivoMovimiento")
);

-- CreateIndex
CREATE INDEX "tbMovimientosInventarios_intProducto_idx" ON "tbMovimientosInventarios"("intProducto");

-- CreateIndex
CREATE INDEX "tbMovimientosInventarios_intMotivoMovimiento_idx" ON "tbMovimientosInventarios"("intMotivoMovimiento");

-- AddForeignKey
ALTER TABLE "tbMovimientosInventarios" ADD CONSTRAINT "tbMovimientosInventarios_intProducto_fkey" FOREIGN KEY ("intProducto") REFERENCES "tbProductos"("intProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbMovimientosInventarios" ADD CONSTRAINT "tbMovimientosInventarios_intMotivoMovimiento_fkey" FOREIGN KEY ("intMotivoMovimiento") REFERENCES "tbMotivo_Movimientos"("intMotivoMovimiento") ON DELETE SET NULL ON UPDATE CASCADE;
