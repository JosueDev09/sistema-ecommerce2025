-- CreateTable
CREATE TABLE "tbTarjetas" (
    "intTarjeta" SERIAL NOT NULL,
    "intCliente" INTEGER NOT NULL,
    "strNumeroTarjeta" TEXT NOT NULL,
    "strNombreTarjeta" TEXT NOT NULL,
    "strTipoTarjeta" TEXT NOT NULL,
    "strFechaExpiracion" TEXT NOT NULL,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbTarjetas_pkey" PRIMARY KEY ("intTarjeta")
);

-- CreateIndex
CREATE INDEX "tbTarjetas_intCliente_idx" ON "tbTarjetas"("intCliente");

-- AddForeignKey
ALTER TABLE "tbTarjetas" ADD CONSTRAINT "tbTarjetas_intCliente_fkey" FOREIGN KEY ("intCliente") REFERENCES "tbClientes"("intCliente") ON DELETE RESTRICT ON UPDATE CASCADE;
