export enum DiscountType {
  /** Subtract fixed cents from subtotal when threshold met. */
  FIXED_CENTS = 'FIXED_CENTS',
  /** Apply percentage off subtotal when threshold met. */
  PERCENT_OFF = 'PERCENT_OFF',
  /** Percentage off a line when quantity for that SKU meets minimum. */
  LINE_QTY_PERCENT = 'LINE_QTY_PERCENT',
}

export interface DiscountRecord {
  id: string;
  name: string;
  description: string;
  type: DiscountType;
  /** For PERCENT_OFF / LINE_QTY_PERCENT: 10 means 10%. For FIXED_CENTS: unused. */
  valuePercent?: number;
  /** For FIXED_CENTS: amount to subtract. */
  valueCents?: number;
  /** Minimum cart subtotal in cents (pre-discount) for order-level rules. */
  minSubtotalCents?: number;
  /** For LINE_QTY_PERCENT: minimum units of any single SKU on the order. */
  minLineQuantity?: number;
  active: boolean;
}

export interface CartLinePricing {
  productId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface AppliedDiscount {
  discountId: string;
  name: string;
  amountCents: number;
}

export interface PricingResult {
  subtotalCents: number;
  applied: AppliedDiscount[];
  totalCents: number;
}
