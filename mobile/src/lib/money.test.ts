import { formatCents } from './money';

describe('formatCents', () => {
  it('formats pence as GBP', () => {
    const s = formatCents(499);
    expect(s).toMatch(/4\.99/);
    expect(s.toLowerCase()).toMatch(/£|gbp/);
  });
});
