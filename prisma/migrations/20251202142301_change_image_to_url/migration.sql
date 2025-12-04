/*
  Warnings:

  - You are about to drop the column `imageSeed` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "imageSeed",
ADD COLUMN     "imageUrl" TEXT;
