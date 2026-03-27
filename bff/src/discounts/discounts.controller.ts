import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { DiscountEngineService } from './discount-engine.service';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly engine: DiscountEngineService) {}

  @Get()
  list() {
    return this.engine.listActive();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    const d = this.engine.getById(id);
    if (!d || !d.active) {
      throw new NotFoundException({
        code: 'DISCOUNT_NOT_FOUND',
        message: 'Discount not found.',
      });
    }
    return d;
  }
}
