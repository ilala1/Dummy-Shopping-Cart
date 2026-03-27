import { ProductRecord } from '../domain/product.types';

export const PRODUCT_SEED: ProductRecord[] = [
  {
    id: 'prod-oat-milk-1l',
    name: 'Organic Oat Milk 1L',
    description: 'Barista blend; shelf-stable carton.',
    priceCents: 399,
    stock: 48,
  },
  {
    id: 'prod-sourdough',
    name: 'Country Sourdough Loaf',
    description: 'Naturally leavened; baked daily.',
    priceCents: 650,
    stock: 20,
  },
  {
    id: 'prod-blueberries',
    name: 'Fresh Blueberries 125g',
    description: 'Chilled; best within 3 days.',
    priceCents: 449,
    stock: 35,
  },
  {
    id: 'prod-dark-choc',
    name: 'Dark Chocolate 70% 100g',
    description: 'Single-origin; vegan.',
    priceCents: 525,
    stock: 60,
  },
  {
    id: 'prod-cleaner',
    name: 'All-Purpose Surface Cleaner 500ml',
    description: 'Plant-based; unscented.',
    priceCents: 799,
    stock: 15,
  },
  {
    id: 'prod-reusable-bag',
    name: 'Reusable Tote Bag',
    description: 'Heavy cotton; holds ~15kg.',
    priceCents: 1200,
    stock: 8,
  },
];
