import React from 'react';
import type { ProductDetail } from '../../api/types';
import { ScreenContainer } from '../../components/atoms/ScreenContainer';
import { ProductDetailPanel } from '../../components/organisms/ProductDetailPanel';

export function ProductDetailScreenView(props: {
  product: ProductDetail | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  onClearError: () => void;
  onAddToCart: (productId: string, quantity: number) => Promise<void>;
}): React.ReactElement {
  const { product, loading, busy, error, onClearError, onAddToCart } = props;

  return (
    <ScreenContainer scroll>
      <ProductDetailPanel
        product={product}
        loading={loading}
        busy={busy}
        error={error}
        onClearError={onClearError}
        onAddToCart={onAddToCart}
      />
    </ScreenContainer>
  );
}
