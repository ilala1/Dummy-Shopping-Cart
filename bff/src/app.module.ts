import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { DiscountsModule } from './discounts/discounts.module';
import { CartsModule } from './carts/carts.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [InventoryModule, ProductsModule, DiscountsModule, CartsModule],
})
export class AppModule {}
