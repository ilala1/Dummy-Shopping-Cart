import React from 'react';
import { View } from '../../lib/rn';
import type { CartSnapshot, ProductListItem } from '../../api/types';
import { LoadingBlock } from '../../components/atoms/LoadingBlock';
import { ScreenContainer } from '../../components/atoms/ScreenContainer';
import { CartPanel } from '../../components/organisms/CartPanel';
import { ErrorCallout } from '../../components/molecules/ErrorCallout';

export function CartScreenView(props: {
  ready: boolean;
  banner: string | null;
  onDismissBanner: () => void;
  cart: CartSnapshot | null;
  catalogue: ProductListItem[];
  busy: boolean;
  onChangeQty: (productId: string, qty: number) => Promise<void>;
  onRemove: (productId: string) => Promise<void>;
  onCheckout: () => void;
}): React.ReactElement {
  const {
    ready,
    banner,
    onDismissBanner,
    cart,
    catalogue,
    busy,
    onChangeQty,
    onRemove,
    onCheckout,
  } = props;

  if (!ready) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingBlock message="Starting session…" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      {banner ? (
        <ErrorCallout message={banner} onDismiss={onDismissBanner} />
      ) : null}
      <View style={{ flex: 1 }}>
        <CartPanel
          cart={cart}
          catalogue={catalogue}
          busy={busy}
          onChangeQty={onChangeQty}
          onRemove={onRemove}
          onCheckout={onCheckout}
        />
      </View>
    </ScreenContainer>
  );
}
