import { DiscountEngineService } from './discount-engine.service';
import { DiscountType } from './domain/discount.types';

describe('DiscountEngineService', () => {
  let engine: DiscountEngineService;

  beforeEach(() => {
    engine = new DiscountEngineService();
  });

  it('applies only the £40-tier order promo when subtotal clears £40 (not 10% £30+)', () => {
    const lines = [
      { productId: 'p1', quantity: 2, unitPriceCents: 2000 },
    ];
    const result = engine.price(lines);
    expect(result.subtotalCents).toBe(4000);
    expect(result.totalCents).toBe(3400);
    const orderLevel = result.applied.filter(
      (a) => !a.name.toLowerCase().includes('bulk'),
    );
    expect(orderLevel).toHaveLength(1);
    expect(orderLevel[0].name).toContain('15%');
    expect(orderLevel[0].amountCents).toBe(600);
    expect(result.applied.some((a) => a.name.includes('10%'))).toBe(false);
  });

  it('after bulk line deal, subtotal only clears £30 → 10% tier only (15% £40 not eligible)', () => {
    const lines = [
      { productId: 'prod-cleaner', quantity: 5, unitPriceCents: 799 },
    ];
    const result = engine.price(lines);
    expect(result.subtotalCents).toBe(3995);
    const orderLevel = result.applied.filter(
      (a) => !a.name.toLowerCase().includes('bulk'),
    );
    expect(orderLevel).toHaveLength(1);
    expect(orderLevel[0].name).toContain('10%');
    expect(orderLevel[0].name).not.toContain('15%');
    expect(orderLevel[0].amountCents).toBe(340);
  });

  it('bulk + 15 cleaners: only one order-level row (15% £40), never 10%', () => {
    const lines = [
      { productId: 'prod-cleaner', quantity: 15, unitPriceCents: 799 },
    ];
    const result = engine.price(lines);
    expect(result.subtotalCents).toBe(15 * 799);
    expect(result.applied.filter((a) => a.name.includes('10%'))).toHaveLength(
      0,
    );
    const orderLevel = result.applied.filter(
      (a) => !a.name.toLowerCase().includes('bulk'),
    );
    expect(orderLevel).toHaveLength(1);
    expect(orderLevel[0].name).toContain('15%');
    expect(orderLevel[0].amountCents).toBe(1528);
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
      expect.arrayContaining([
        DiscountType.PERCENT_OFF,
        DiscountType.LINE_QTY_PERCENT,
      ]),
    );
  });
});
