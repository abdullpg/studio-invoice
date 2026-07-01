-- AlterTable
ALTER TABLE "StudioProfile" ADD COLUMN "invoicePrefix" TEXT DEFAULT 'INV';
ALTER TABLE "StudioProfile" ADD COLUMN "language" TEXT DEFAULT 'id';
ALTER TABLE "StudioProfile" ADD COLUMN "watermarkText" TEXT;
