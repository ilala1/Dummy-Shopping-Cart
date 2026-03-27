export function formatCents(cents: number, currency = 'USD'): string {
  if (!Number.isFinite(cents)) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
