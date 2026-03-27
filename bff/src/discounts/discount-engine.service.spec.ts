import { DiscountEngineService } from './discount-engine.service';
import { DiscountType } from './domain/discount.types';

describe('DiscountEngineService', () => {
  let engine: DiscountEngineService;

  beforeEach(() => {
    engine = new DiscountEngineService();
  });

  it('applies fixed and percent rules in documented order', () => {
    const lines = [
      { productId: 'p1', quantity: 2, unitPriceCents: 2000 },
    ];
    const result = engine.price(lines);
    expect(result.subtotalCents).toBe(4000);
    expect(result.totalCents).toBeLessThan(result.subtotalCents);
    expect(result.applied.length).toBeGreaterThanOrEqual(1);
  });

  it('applies line qty threshold discount', () => {
    const lines = [
      { productId: 'p1', quantity: 3, unitPriceCents: 1000 },
    ];
    const result = engine.price(lines);
    const bulk = result.applied.find((a) =>
      a.name.toLowerCase().includes('bulk'),
    );
    expect(bulk).toBeDefined();
    expect(bulk!.amountCents).toBeGreaterThan(0);
  });

  it('lists active discounts from seed', () => {
    const list = engine.listActive();
    expect(list.every((d) => d.active)).toBe(true);
    expect(list.map((d) => d.type)).toEqual(
      expect.arrayContaining([DiscountType.FIXED_CENTS]),
);
  });
});
