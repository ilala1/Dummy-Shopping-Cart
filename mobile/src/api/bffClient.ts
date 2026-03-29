import { getBffBaseUrl } from '../config/env';
import type {
  ApiErrorBody,
  CartSnapshot,
  CheckoutSuccess,
  CreateCartResponse,
  ProductDetail,
  ProductListItem,
} from './types';

export class BffApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    super(message);
    this.name = 'BffApiError';
  }
}

function joinUrl(path: string): string {
  const base = getBffBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function parseJsonOrNull(res: Response): Promise<unknown | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function messageFromBody(body: ApiErrorBody | null, fallback: string): string {
  if (!body?.message) return fallback;
  if (Array.isArray(body.message)) {
    return body.message.join(' ');
  }
  return body.message;
}

export async function bffFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(joinUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const raw = (await parseJsonOrNull(res)) as ApiErrorBody | T | null;
  if (!res.ok) {
    const body = raw as ApiErrorBody | null;
    const msg = messageFromBody(body, `Request failed (${res.status})`);
    throw new BffApiError(msg, res.status, body);
  }
  return raw as T;
}

export const api = {
  listProducts: () => bffFetch<ProductListItem[]>('/products'),

  getProduct: (id: string) => bffFetch<ProductDetail>(`/products/${encodeURIComponent(id)}`),

  createCart: () =>
    bffFetch<CreateCartResponse>('/carts', { method: 'POST', body: '{}' }),

  getCart: (cartId: string) =>
    bffFetch<CartSnapshot>(`/carts/${encodeURIComponent(cartId)}`),

  /** Does not refresh the cart idle timer on the server; use for expiry polling. */
  peekCart: (cartId: string) =>
    bffFetch<CartSnapshot>(
      `/carts/${encodeURIComponent(cartId)}/status`,
    ),

  setLine: (cartId: string, productId: string, quantity: number) =>
    bffFetch<CartSnapshot>(
      `/carts/${encodeURIComponent(cartId)}/items`,
      {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      },
    ),

  removeLine: (cartId: string, productId: string) =>
    bffFetch<CartSnapshot>(
      `/carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(productId)}`,
      { method: 'DELETE' },
    ),

  checkout: (cartId: string) =>
    bffFetch<CheckoutSuccess>(
      `/carts/${encodeURIComponent(cartId)}/checkout`,
      { method: 'POST', body: '{}' },
    ),
};
