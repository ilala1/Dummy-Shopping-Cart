/** All amounts are minor units (pence for GBP). */
export function formatCents(
  cents: number,
  currency: string = 'GBP',
  locale: string = 'en-GB',
): string {
  if (!Number.isFinite(cents)) return '—';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(cents / 100);
  } catch {
    return `£${(cents / 100).toFixed(2)}`;
  }
}
