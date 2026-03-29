import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableStateCallbackType,
} from '../../lib/rn';
import type { ProductListItem } from '../../api/types';
import { formatCents } from '../../lib/money';
import { colors, radius, space } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { MoneyText } from '../atoms/MoneyText';
import { StockBadge } from '../atoms/StockBadge';

export function ProductListRow({
  product,
  onPress,
}: {
  product: ProductListItem;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      style={(s: PressableStateCallbackType) => [
        styles.card,
        s.pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatCents(product.priceCents)}`}
      accessibilityHint="Opens full product details and add to cart."
    >
      <View style={styles.top}>
        <AppText variant="subtitle" numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>
        <MoneyText variant="subtitle" cents={product.priceCents} />
      </View>
      <StockBadge available={product.availableStock} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: space.sm,
  },
  pressed: { opacity: 0.92 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.md,
    alignItems: 'flex-start',
  },
  name: { flex: 1 },
});
