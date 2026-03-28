import { formatCents } from './money';

describe('formatCents', () => {
  it('formats whole dollars', () => {
    const s = formatCents(499, 'USD');
    expect(s).toMatch(/4\.99/);
  });
});
