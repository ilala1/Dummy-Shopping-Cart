import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableStateCallbackType,
} from '../../lib/rn';
import type { CartLine } from '../../api/types';
import { colors, radius, space } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { MoneyText } from '../atoms/MoneyText';
import { QuantityStepper } from './QuantityStepper';

export function CartLineRow({
  line,
  maxQty,
  busy,
  onChangeQty,
  onRemove,
}: {
  line: CartLine;
  maxQty: number;
  busy?: boolean;
  onChangeQty: (qty: number) => void;
  onRemove: () => void;
}): React.ReactElement {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText variant="subtitle" numberOfLines={2} style={styles.name}>
          {line.name}
        </AppText>
        <MoneyText cents={line.lineTotalCents} variant="subtitle" />
      </View>
      <View style={styles.row}>
        <QuantityStepper
          value={line.quantity}
          min={1}
          max={maxQty}
          onChange={onChangeQty}
          disabled={busy}
          a11yItemName={line.name}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${line.name} from cart`}
          accessibilityHint="Removes this product line from your shopping cart."
          onPress={onRemove}
          disabled={busy}
          style={(s: PressableStateCallbackType) => [
            styles.removeBtn,
            s.pressed && !busy ? styles.removePressed : null,
            busy ? styles.removeDisabled : null,
          ]}
        >
          <AppText variant="caption" style={styles.removeLabel}>
            Remove
          </AppText>
        </Pressable>
      </View>
    </View>
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
    gap: space.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.md,
    alignItems: 'flex-start',
  },
  name: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    flexWrap: 'wrap',
  },
  removeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  removePressed: { opacity: 0.85 },
  removeDisabled: { opacity: 0.4 },
  removeLabel: { color: colors.danger, fontWeight: '700' },
});
