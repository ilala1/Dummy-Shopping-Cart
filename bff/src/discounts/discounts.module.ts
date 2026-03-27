import { Module } from '@nestjs/common';
import { DiscountEngineService } from './discount-engine.service';
import { DiscountsController } from './discounts.controller';

@Module({
  controllers: [DiscountsController],
  providers: [DiscountEngineService],
  exports: [DiscountEngineService],
})
export class DiscountsModule {}
