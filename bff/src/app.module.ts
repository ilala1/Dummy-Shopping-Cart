import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { DiscountsModule } from './discounts/discounts.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [InventoryModule, ProductsModule, DiscountsModule],
})
export class AppModule {}
