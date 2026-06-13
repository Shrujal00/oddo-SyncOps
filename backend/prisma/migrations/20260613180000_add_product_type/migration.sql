-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('RAW_MATERIAL', 'FINISHED_PRODUCT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "productType" "ProductType" NOT NULL DEFAULT 'FINISHED_PRODUCT';

-- CreateIndex
CREATE INDEX "Product_productType_idx" ON "Product"("productType");
