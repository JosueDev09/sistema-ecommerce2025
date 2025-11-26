-- DropIndex
DROP INDEX "public"."tbDirecciones_intCliente_key";

-- AlterTable
ALTER TABLE "tbDirecciones" ALTER COLUMN "strNumeroInterior" DROP NOT NULL;
