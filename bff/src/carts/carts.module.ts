import { Module } from '@nestjs/common';
import { DiscountsModule } from '../discounts/discounts.module';
import { CartInactivityService } from './cart-inactivity.service';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  imports: [DiscountsModule],
  controllers: [CartsController],
  providers: [CartsService, CartInactivityService],
})
export class CartsModule {}
