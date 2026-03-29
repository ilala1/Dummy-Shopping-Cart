import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CartsService } from './carts.service';
import { SetLineDto } from './dto/set-line.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly carts: CartsService) {}

  @Post()
  create() {
    return this.carts.createCart();
  }

  /** Poll without extending the inactivity deadline (see CartsService.peekSnapshot). */
  @Get(':cartId/status')
  getStatus(@Param('cartId') cartId: string) {
    return this.carts.peekSnapshot(cartId);
  }

  @Get(':cartId')
  getOne(@Param('cartId') cartId: string) {
    return this.carts.snapshot(cartId);
  }

  @Post(':cartId/items')
  addOrUpdate(@Param('cartId') cartId: string, @Body() body: SetLineDto) {
    return this.carts.setLine(cartId, body.productId, body.quantity);
  }

  @Delete(':cartId/items/:productId')
  remove(
    @Param('cartId') cartId: string,
    @Param('productId') productId: string,
  ) {
    return this.carts.removeLine(cartId, productId);
  }

  @Post(':cartId/checkout')
  checkout(@Param('cartId') cartId: string) {
    return this.carts.checkout(cartId);
  }
}
