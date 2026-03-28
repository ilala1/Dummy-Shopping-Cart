import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { CartSnapshot, ProductListItem } from '../../api/types';
import { formatCents } from '../../lib/money';
import { colors, space } from '../../theme/tokens';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { AppText } from '../atoms/AppText';
import { MoneyText } from '../atoms/MoneyText';
import { CartLineRow } from '../molecules/CartLineRow';
import { SectionHeader } from '../molecules/SectionHeader';

function maxQtyForLine(
  lineQty: number,
  productId: string,
  catalogue: Map<string, ProductListItem>,
): number {
  const p = catalogue.get(productId);
  if (!p) return Math.max(1, lineQty);
  return Math.max(1, p.availableStock + lineQty);
}

export function CartPanel({
  cart,
  catalogue,
  busy,
  onChangeQty,
  onRemove,
  onCheckout,
}: {
  cart: CartSnapshot | null;
  catalogue: ProductListItem[];
  busy: boolean;
  onChangeQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}): React.ReactElement {
  const map = React.useMemo(() => {
    const m = new Map<string, ProductListItem>();
    for (const p of catalogue) m.set(p.id, p);
    return m;
  }, [catalogue]);

  if (!cart || cart.lines.length === 0) {
    return (
      <View style={styles.empty}>
        <AppText variant="body">Your cart is empty.</AppText>
        <AppText variant="caption">Add products from the catalogue.</AppText>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Cart" />
      {cart.lines.map((line) => (
        <CartLineRow
          key={line.productId}
          line={line}
          maxQty={maxQtyForLine(line.quantity, line.productId, map)}
          busy={busy}
          onChangeQty={(q) => onChangeQty(line.productId, q)}
          onRemove={() => onRemove(line.productId)}
        />
      ))}
      <View style={styles.totals}>
        <View style={styles.row}>
          <AppText variant="body">Subtotal</AppText>
          <MoneyText cents={cart.subtotalCents} />
        </View>
        {cart.appliedDiscounts.map((d) => (
          <View style={styles.row} key={d.discountId}>
            <AppText variant="caption" style={styles.discountLabel}>
              {d.name}
            </AppText>
            <AppText variant="caption" style={styles.discountValue}>
              −{formatCents(d.amountCents)}
            </AppText>
          </View>
        ))}
        <View style={[styles.row, styles.boldRow]}>
          <AppText variant="subtitle">Total</AppText>
          <MoneyText cents={cart.totalCents} variant="subtitle" />
        </View>
      </View>
      <PrimaryButton
        title="Checkout"
        onPress={onCheckout}
        disabled={busy}
        loading={busy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  empty: { gap: space.sm, paddingVertical: space.xl },
  totals: {
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: space.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.md,
  },
  boldRow: { marginTop: space.xs },
  discountLabel: { flex: 1, color: colors.muted },
  discountValue: { color: colors.success, fontWeight: '600' },
});
