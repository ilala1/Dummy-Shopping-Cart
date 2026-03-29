import { BadRequestException, GoneException } from '@nestjs/common';
import { DiscountEngineService } from '../discounts/discount-engine.service';
import { InventoryStore } from '../inventory/inventory.store';
import { CartsService } from './carts.service';

describe('CartsService', () => {
  let inventory: InventoryStore;
  let carts: CartsService;

  beforeEach(() => {
    inventory = new InventoryStore();
    inventory.initializeProducts([
      {
        id: 'p1',
        name: 'One',
        description: 'x',
        priceCents: 1000,
        stock: 5,
      },
    ]);
    const discounts = new DiscountEngineService();
    carts = new CartsService(inventory, discounts);
  });

  it('reserves stock when lines are set', () => {
    const { id } = carts.createCart();
    carts.setLine(id, 'p1', 2);
    expect(inventory.availableToReserve('p1')).toBe(3);
  });

  it('blocks over-allocation', () => {
    const c1 = carts.createCart();
    const c2 = carts.createCart();
    carts.setLine(c1.id, 'p1', 4);
    expect(() => carts.setLine(c2.id, 'p1', 2)).toThrow(BadRequestException);
  });

  it('checkout reduces stock and removes cart', () => {
    const { id } = carts.createCart();
    carts.setLine(id, 'p1', 2);
    const order = carts.checkout(id);
    expect(order.ok).toBe(true);
    expect(inventory.getProduct('p1')!.stock).toBe(3);
    expect(() => carts.snapshot(id)).toThrow(GoneException);
  });

  it('checkout fails when physical stock no longer covers reservations', () => {
    const { id } = carts.createCart();
    carts.setLine(id, 'p1', 2);
    const inv = inventory as unknown as { products: Map<string, { stock: number }> };
    inv.products.get('p1')!.stock = 1;
    expect(() => carts.checkout(id)).toThrow(BadRequestException);
    expect(inventory.reservedForProduct('p1')).toBe(0);
  });

  it('purgeStale releases reservations for inactive carts', () => {
    jest.useFakeTimers();
    const { id } = carts.createCart();
    carts.setLine(id, 'p1', 2);
    const v = carts as unknown as { carts: Map<string, { lastActivityAt: number }> };
    const meta = v.carts.get(id);
    expect(meta).toBeDefined();
    meta!.lastActivityAt = Date.now() - 3 * 60 * 1000;
    carts.purgeStale();
    expect(inventory.reservedForProduct('p1')).toBe(0);
    jest.useRealTimers();
  });

  it('peekSnapshot does not extend last activity', () => {
    const { id } = carts.createCart();
    carts.setLine(id, 'p1', 2);
    const v = carts as unknown as { carts: Map<string, { lastActivityAt: number }> };
    const t0 = v.carts.get(id)!.lastActivityAt;
    carts.peekSnapshot(id);
    expect(v.carts.get(id)!.lastActivityAt).toBe(t0);
  });

  it('peekSnapshot releases and throws when cart is past inactivity window', () => {
    const { id } = carts.createCart();
    carts.setLine(id, 'p1', 2);
    const v = carts as unknown as { carts: Map<string, { lastActivityAt: number }> };
    v.carts.get(id)!.lastActivityAt = Date.now() - 3 * 60 * 1000;
    expect(() => carts.peekSnapshot(id)).toThrow(GoneException);
    expect(inventory.reservedForProduct('p1')).toBe(0);
  });
});
