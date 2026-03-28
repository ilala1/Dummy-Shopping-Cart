import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { api, BffApiError } from '../api/bffClient';
import type { ProductDetail } from '../api/types';
import { ScreenContainer } from '../components/atoms/ScreenContainer';
import { ProductDetailPanel } from '../components/organisms/ProductDetailPanel';
import type { RootStackParamList } from '../navigation/types';
import { useShopSession } from '../context/ShopSessionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({
  route,
  navigation,
}: Props): React.ReactElement {
  const { productId } = route.params;
  const { addOrUpdateLine, busy, lastError, clearError } = useShopSession();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLocalError(null);
    try {
      const p = await api.getProduct(productId);
      setProduct(p);
    } catch (e) {
      setLocalError(
        e instanceof BffApiError
          ? e.message
          : 'Could not load this product.',
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const err = localError ?? lastError;

  return (
    <ScreenContainer scroll>
      <ProductDetailPanel
        product={product}
        loading={loading}
        busy={busy}
        error={err}
        onClearError={() => {
          setLocalError(null);
          clearError();
        }}
        onAddToCart={async (pid, quantity) => {
          setLocalError(null);
          clearError();
          try {
            await addOrUpdateLine(pid, quantity);
            navigation.navigate('Cart');
          } catch (e) {
            setLocalError(
              e instanceof BffApiError
                ? e.message
                : 'Could not add to cart.',
            );
          }
        }}
      />
    </ScreenContainer>
  );
}
