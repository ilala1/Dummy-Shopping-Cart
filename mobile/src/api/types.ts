export interface ProductListItem {
  id: string;
  name: string;
  priceCents: number;
  availableStock: number;
}

export interface ProductDetail extends ProductListItem {
  description: string;
}

export interface AppliedDiscount {
  discountId: string;
  name: string;
  amountCents: number;
}

export interface CartLine {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface CartSnapshot {
  id: string;
  lines: CartLine[];
  subtotalCents: number;
  totalCents: number;
  appliedDiscounts: AppliedDiscount[];
}

export interface CreateCartResponse {
  id: string;
}

export interface CheckoutSuccess {
  ok: true;
  orderId: string;
  cartId: string;
  lines: CartLine[];
  subtotalCents: number;
  appliedDiscounts: AppliedDiscount[];
  totalPaidCents: number;
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  code?: string;
  details?: {
    productId?: string;
    requested?: number;
    available?: number;
  }[];
}
