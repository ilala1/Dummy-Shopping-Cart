import { InventoryStore } from './inventory.store';

describe('InventoryStore', () => {
  let store: InventoryStore;

  beforeEach(() => {
    store = new InventoryStore();
    store.initializeProducts([
      {
        id: 'a',
        name: 'A',
        description: '',
        priceCents: 100,
        stock: 10,
      },
    ]);
  });

  it('tracks reservations per cart and enforces stock', () => {
    expect(store.availableToReserve('a')).toBe(10);
    store.setLineQty('c1', 'a', 4);
    expect(store.availableToReserve('a')).toBe(6);
    store.setLineQty('c2', 'a', 5);
    expect(store.reservedForProduct('a')).toBe(9);
    expect(store.maxQtyForCart('a', 'c1')).toBe(5);
  });

  it('fulfillCart decrements stock and clears reservations', () => {
    store.setLineQty('c1', 'a', 3);
    store.fulfillCart('c1');
    expect(store.getProduct('a')!.stock).toBe(7);
    expect(store.reservedForProduct('a')).toBe(0);
    expect(store.getCartLines('c1').size).toBe(0);
  });

  it('releaseCart clears reservations only', () => {
    store.setLineQty('c1', 'a', 2);
    store.releaseCart('c1');
    expect(store.getProduct('a')!.stock).toBe(10);
    expect(store.reservedForProduct('a')).toBe(0);
  });
});
