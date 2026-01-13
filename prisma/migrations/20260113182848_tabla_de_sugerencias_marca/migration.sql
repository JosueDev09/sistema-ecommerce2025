-- CreateTable
CREATE TABLE "tbSugerencias_Marcas" (
    "intSugerenciaMarca" SERIAL NOT NULL,
    "strMarca" TEXT NOT NULL,
    "intVotos" INTEGER NOT NULL DEFAULT 0,
    "datCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbSugerencias_Marcas_pkey" PRIMARY KEY ("intSugerenciaMarca")
);
