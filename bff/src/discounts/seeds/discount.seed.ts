import { DiscountRecord, DiscountType } from '../domain/discount.types';

export const DISCOUNT_SEED: DiscountRecord[] = [
  {
    id: 'disc-15pct-40plus',
    name: '15% off £40+',
    description: 'Fifteen percent off when your cart subtotal reaches £40 or more.',
    type: DiscountType.PERCENT_OFF,
    valuePercent: 15,
    minSubtotalCents: 4000,
    active: true,
  },
  {
    id: 'disc-10pct-30plus',
    name: '10% off £30+',
    description: 'Ten percent off the entire order subtotal of £30 or more.',
    type: DiscountType.PERCENT_OFF,
    valuePercent: 10,
    minSubtotalCents: 3000,
    active: true,
  },
  {
    id: 'disc-bulk-snack',
    name: 'Bulk snack deal',
    description: '15% off any line where you buy 3 or more of the same product.',
    type: DiscountType.LINE_QTY_PERCENT,
    valuePercent: 15,
    minLineQuantity: 3,
    active: true,
  },
];
