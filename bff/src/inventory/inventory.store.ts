import { Injectable } from '@nestjs/common';
import { ProductRecord } from '../products/domain/product.types';

/** Per-cart line quantities used to compute reservations. */
export type CartLines = Map<string, number>;

@Injectable()
export class InventoryStore {
  private products = new Map<string, ProductRecord>();
  /** cartId -> productId -> qty reserved */
  private reservations = new Map<string, CartLines>();

  initializeProducts(seed: ProductRecord[]): void {
    this.products.clear();
    for (const p of seed) {
      this.products.set(p.id, { ...p });
    }
  }

  listProducts(): ProductRecord[] {
    return [...this.products.values()];
  }

  getProduct(id: string): ProductRecord | undefined {
    const p = this.products.get(id);
    return p ? { ...p } : undefined;
  }

  /** Total reserved units for a product across all carts. */
  reservedForProduct(productId: string): number {
    let sum = 0;
    for (const lines of this.reservations.values()) {
      sum += lines.get(productId) ?? 0;
    }
    return sum;
  }

  /** Units shoppers can still add to carts (stock minus all reservations). */
  availableToReserve(productId: string): number {
    const p = this.products.get(productId);
    if (!p) return 0;
    return Math.max(0, p.stock - this.reservedForProduct(productId));
  }

  /**
   * Maximum qty this cart may hold for product (including existing line),
   * given other carts' reservations.
   */
  maxQtyForCart(productId: string, cartId: string): number {
    const p = this.products.get(productId);
    if (!p) return 0;
    const current = this.getLineQty(cartId, productId);
    const others = this.reservedForProduct(productId) - current;
    return Math.max(0, p.stock - others);
  }

  getLineQty(cartId: string, productId: string): number {
    return this.reservations.get(cartId)?.get(productId) ?? 0;
  }

  setLineQty(cartId: string, productId: string, qty: number): void {
    if (qty < 0) throw new Error('Invalid quantity');
    if (!this.products.has(productId)) {
      throw new Error('Unknown product');
    }
    let lines = this.reservations.get(cartId);
    if (!lines) {
      lines = new Map();
      this.reservations.set(cartId, lines);
    }
    if (qty === 0) {
      lines.delete(productId);
      if (lines.size === 0) {
        this.reservations.delete(cartId);
      }
      return;
    }
    lines.set(productId, qty);
  }

  releaseCart(cartId: string): void {
    this.reservations.delete(cartId);
  }

  /** Decrement physical stock by fulfilled quantities; clears reservations for cart. */
  fulfillCart(cartId: string): void {
    const lines = this.reservations.get(cartId);
    if (!lines) return;
    for (const [productId, qty] of lines) {
      const p = this.products.get(productId);
      if (!p) continue;
      p.stock -= qty;
    }
    this.reservations.delete(cartId);
  }

  /** Snapshot of lines for a cart (defensive copy). */
  getCartLines(cartId: string): Map<string, number> {
    const lines = this.reservations.get(cartId);
    if (!lines) return new Map();
    return new Map(lines);
  }

  hasCartReservations(cartId: string): boolean {
    const lines = this.reservations.get(cartId);
    return !!lines && lines.size > 0;
  }
}
