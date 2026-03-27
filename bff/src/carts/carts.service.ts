import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DiscountEngineService } from '../discounts/discount-engine.service';
import { InventoryStore } from '../inventory/inventory.store';
import { CartSnapshotResponse, CheckoutSuccessResponse } from './dto/cart-response.types';

const INACTIVITY_MS = 2 * 60 * 1000;

interface CartMeta {
  lastActivityAt: number;
}

@Injectable()
export class CartsService {
  private readonly carts = new Map<string, CartMeta>();

  constructor(
    private readonly inventory: InventoryStore,
    private readonly discounts: DiscountEngineService,
  ) {}

  createCart(): { id: string } {
    const id = randomUUID();
    this.carts.set(id, { lastActivityAt: Date.now() });
    return { id };
  }

  snapshot(cartId: string): CartSnapshotResponse {
    this.assertActiveCart(cartId);
    this.touch(cartId);
    const linesMap = this.inventory.getCartLines(cartId);
    const lines: CartSnapshotResponse['lines'] = [];
    for (const [productId, quantity] of linesMap) {
      const p = this.inventory.getProduct(productId);
      if (!p) continue;
      lines.push({
        productId,
        name: p.name,
        quantity,
        unitPriceCents: p.priceCents,
        lineTotalCents: p.priceCents * quantity,
      });
    }
    lines.sort((a, b) => a.name.localeCompare(b.name));
    const pricingLines = lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
    }));
    const priced = this.discounts.price(pricingLines);
    return {
      id: cartId,
      lines,
      subtotalCents: priced.subtotalCents,
      totalCents: priced.totalCents,
      appliedDiscounts: priced.applied,
    };
  }

  setLine(cartId: string, productId: string, quantity: number): CartSnapshotResponse {
    this.assertActiveCart(cartId);
    const p = this.inventory.getProduct(productId);
    if (!p) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' });
    }
    const max = this.inventory.maxQtyForCart(productId, cartId);
    if (quantity > max) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_STOCK',
        message: 'Not enough stock to reserve that quantity.',
        details: [{ productId, requested: quantity, available: max }],
      });
    }
    this.inventory.setLineQty(cartId, productId, quantity);
    this.touch(cartId);
    return this.snapshot(cartId);
  }

  removeLine(cartId: string, productId: string): CartSnapshotResponse {
    this.assertActiveCart(cartId);
    if (!this.inventory.getProduct(productId)) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' });
    }
    this.inventory.setLineQty(cartId, productId, 0);
    this.touch(cartId);
    return this.snapshot(cartId);
  }

  /**
   * Validates current reservations against physical stock (other carts may have raced),
   * then fulfills or aborts and releases reservations for this cart.
   */
  checkout(cartId: string): CheckoutSuccessResponse {
    this.assertActiveCart(cartId);
    this.touch(cartId);
    const linesMap = this.inventory.getCartLines(cartId);
    if (linesMap.size === 0) {
      throw new BadRequestException({
        code: 'EMPTY_CART',
        message: 'Add items before checking out.',
      });
    }

    const failures: { productId: string; requested: number; available: number }[] = [];
    for (const [productId, qty] of linesMap) {
      const max = this.inventory.maxQtyForCart(productId, cartId);
      if (qty > max) {
        failures.push({ productId, requested: qty, available: max });
      }
    }
    if (failures.length) {
      this.inventory.releaseCart(cartId);
      this.carts.delete(cartId);
      throw new BadRequestException({
        code: 'INSUFFICIENT_STOCK_AT_CHECKOUT',
        message: 'Inventory changed while you were shopping. Your reservation was released.',
        details: failures,
      });
    }

    const lines: CheckoutSuccessResponse['lines'] = [];
    for (const [productId, quantity] of linesMap) {
      const p = this.inventory.getProduct(productId)!;
      lines.push({
        productId,
        name: p.name,
        quantity,
        unitPriceCents: p.priceCents,
        lineTotalCents: p.priceCents * quantity,
      });
    }
    lines.sort((a, b) => a.name.localeCompare(b.name));
    const pricingLines = lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
    }));
    const priced = this.discounts.price(pricingLines);
    const orderId = randomUUID();
    this.inventory.fulfillCart(cartId);
    this.carts.delete(cartId);

    return {
      ok: true,
      orderId,
      cartId,
      lines,
      subtotalCents: priced.subtotalCents,
      appliedDiscounts: priced.applied,
      totalPaidCents: priced.totalCents,
    };
  }

  purgeStale(now = Date.now()): string[] {
    const removed: string[] = [];
    for (const [cartId, meta] of this.carts) {
      if (now - meta.lastActivityAt >= INACTIVITY_MS) {
        this.inventory.releaseCart(cartId);
        this.carts.delete(cartId);
        removed.push(cartId);
      }
    }
    return removed;
  }

  private touch(cartId: string): void {
    const meta = this.carts.get(cartId);
    if (meta) {
      meta.lastActivityAt = Date.now();
    }
  }

  private assertActiveCart(cartId: string): void {
    if (!this.carts.has(cartId)) {
      throw new GoneException({
        code: 'CART_EXPIRED',
        message: 'This cart expired after inactivity; start a new cart.',
      });
    }
  }
}
