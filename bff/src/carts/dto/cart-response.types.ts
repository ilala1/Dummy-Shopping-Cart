import { AppliedDiscount } from '../../discounts/domain/discount.types';

export interface CartLineResponse {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface CartSnapshotResponse {
  id: string;
  lines: CartLineResponse[];
  subtotalCents: number;
  /** Pricing preview; same engine as checkout. */
  totalCents: number;
  appliedDiscounts: AppliedDiscount[];
}

export interface CheckoutSuccessResponse {
  ok: true;
  orderId: string;
  cartId: string;
  lines: CartLineResponse[];
  subtotalCents: number;
  appliedDiscounts: AppliedDiscount[];
  totalPaidCents: number;
}

export interface CheckoutFailureResponse {
  ok: false;
  code: string;
  message: string;
  details?: { productId?: string; requested?: number; available?: number }[];
}
