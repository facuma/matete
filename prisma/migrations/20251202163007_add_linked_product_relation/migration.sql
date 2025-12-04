-- AddForeignKey
ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_linkedProductId_fkey" FOREIGN KEY ("linkedProductId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
