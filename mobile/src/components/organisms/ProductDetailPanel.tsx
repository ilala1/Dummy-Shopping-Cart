import React, { useState } from 'react';
import { StyleSheet, View } from '../../lib/rn';
import type { ProductDetail } from '../../api/types';
import { space } from '../../theme/tokens';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { AppText } from '../atoms/AppText';
import { LoadingBlock } from '../atoms/LoadingBlock';
import { StockBadge } from '../atoms/StockBadge';
import { ErrorCallout } from '../molecules/ErrorCallout';
import { QuantityStepper } from '../molecules/QuantityStepper';
import { SectionHeader } from '../molecules/SectionHeader';
import { MoneyText } from '../atoms/MoneyText';

export function ProductDetailPanel({
  product,
  loading,
  busy,
  error,
  onClearError,
  onAddToCart,
}: {
  product: ProductDetail | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  onClearError: () => void;
  onAddToCart: (
    productId: string,
    quantity: number,
  ) => Promise<void> | void;
}): React.ReactElement {
  const [qty, setQty] = useState(1);

  if (loading || !product) {
    return <LoadingBlock message="Loading product…" />;
  }

  const max = Math.max(0, product.availableStock);
  const effectiveQty = Math.min(qty, Math.max(1, max || 1));

  return (
    <View style={styles.wrap}>
      {error ? (
        <ErrorCallout message={error} onDismiss={onClearError} />
      ) : null}
      <SectionHeader
        title={product.name}
        accessibilityHint="Name of the product you are viewing."
      />
      <MoneyText cents={product.priceCents} variant="title" />
      <SectionHeader
        title="Stock"
        right={
          <StockBadge
            available={product.availableStock}
            showExactCount
          />
        }
        accessibilityHint="How many units are available to purchase."
      />
      <AppText variant="body" style={styles.desc}>
        {product.description}
      </AppText>
      {max <= 0 ? (
        <AppText
          variant="caption"
          accessibilityRole="text"
          accessibilityLabel="This item cannot be added right now."
        >
          This item cannot be added right now.
        </AppText>
      ) : (
        <>
          <SectionHeader
            title="Quantity"
            accessibilityHint="Adjust how many units to add using the minus and plus buttons."
          />
          <QuantityStepper
            value={effectiveQty}
            min={1}
            max={max}
            onChange={(n) => setQty(n)}
            disabled={busy}
            a11yItemName={product.name}
          />
          <PrimaryButton
            title="Add to cart"
            accessibilityHint="Adds the selected quantity of this product to your shopping cart."
            loading={busy}
            disabled={busy || max <= 0}
            onPress={async () => {
              await onAddToCart(product.id, effectiveQty);
            }}
            style={styles.btn}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  desc: { marginTop: space.sm },
  btn: { marginTop: space.lg },
});
