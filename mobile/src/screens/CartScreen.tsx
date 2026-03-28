import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { api, BffApiError } from '../api/bffClient';
import type { ProductListItem } from '../api/types';
import { ScreenContainer } from '../components/atoms/ScreenContainer';
import { LoadingBlock } from '../components/atoms/LoadingBlock';
import { CartPanel } from '../components/organisms/CartPanel';
import { ErrorCallout } from '../components/molecules/ErrorCallout';
import { useShopSession } from '../context/ShopSessionContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props): React.ReactElement {
  const {
    cart,
    ready,
    busy,
    refreshCart,
    addOrUpdateLine,
    removeLine,
    lastError,
    clearError,
  } = useShopSession();
  const [catalogue, setCatalogue] = useState<ProductListItem[]>([]);
  const [catError, setCatError] = useState<string | null>(null);

  const loadCatalogue = useCallback(async () => {
    try {
      setCatError(null);
      const list = await api.listProducts();
      setCatalogue(list);
    } catch (e) {
      setCatError(
        e instanceof BffApiError
          ? e.message
          : 'Could not refresh stock info.',
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshCart();
      void loadCatalogue();
    }, [refreshCart, loadCatalogue]),
  );

  if (!ready) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingBlock message="Starting session…" />
      </ScreenContainer>
    );
  }

  const banner = lastError ?? catError;

  return (
    <ScreenContainer scroll>
      {banner ? (
        <ErrorCallout
          message={banner}
          onDismiss={() => {
            clearError();
            setCatError(null);
          }}
        />
      ) : null}
      <View style={{ flex: 1 }}>
        <CartPanel
          cart={cart}
          catalogue={catalogue}
          busy={busy}
          onChangeQty={async (productId, qty) => {
            clearError();
            try {
              await addOrUpdateLine(productId, qty);
              await loadCatalogue();
            } catch {
              /* session surfaces error */
            }
          }}
          onRemove={async (productId) => {
            clearError();
            try {
              await removeLine(productId);
              await loadCatalogue();
            } catch {
              /* handled */
            }
          }}
          onCheckout={() => navigation.navigate('Checkout')}
        />
      </View>
    </ScreenContainer>
  );
}
