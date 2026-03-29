import React from 'react';
import type { TextProps } from '../../lib/rn';
import { formatCents } from '../../lib/money';
import { AppText, type AppTextProps } from './AppText';

export type MoneyTextProps = Omit<AppTextProps, 'children'> & {
  cents: number;
};

export function MoneyText({
  cents,
  variant = 'body',
  ...rest
}: MoneyTextProps): React.ReactElement {
  const formatted = formatCents(cents);
  return (
    <AppText
      variant={variant}
      accessibilityRole="text"
      accessibilityLabel={formatted}
      {...(rest as TextProps)}
    >
      {formatted}
    </AppText>
  );
}
