import React from 'react';
import { StyleSheet, View } from '../../lib/rn';
import { colors, radius, space } from '../../theme/tokens';
import { AppText } from './AppText';

export function StockBadge({
  available,
}: {
  available: number;
}): React.ReactElement {
  const ok = available > 5;
  const low = available > 0 && available <= 5;
  const label =
    available <= 0
      ? 'Out of stock'
      : low
        ? `${available} left`
        : 'In stock';
  const hint =
    available <= 0
      ? 'This item cannot be added to your cart until stock is available.'
      : low
        ? 'Low stock. Order soon if you need this item.'
        : 'Enough units available to add to your cart.';
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: available <= 0 ? colors.border : colors.surface },
        low && available > 0 ? styles.low : null,
      ]}
      accessibilityLabel={`Stock: ${label}`}
      accessibilityHint={hint}
    >
      <AppText
        variant="caption"
        style={{
          color:
            available <= 0 ? colors.danger : ok ? colors.success : colors.text,
          fontWeight: '600',
        }}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  low: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
});
