import React from 'react';
import type { TextProps } from 'react-native';
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
  return (
    <AppText variant={variant} {...(rest as TextProps)}>
      {formatCents(cents)}
    </AppText>
  );
}
