import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { api, BffApiError } from '../../api/bffClient';
import type { ProductDetail } from '../../api/types';
import { useShopSession } from '../../context/ShopSessionContext';
import { Screens, type RootStackParamList } from '../../navigation/types';

export type ProductDetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  typeof Screens.ProductDetail
>;

export function useProductDetailScreen(
  productId: string,
  navigation: ProductDetailNavigation,
): {
  product: ProductDetail | null;
  loading: boolean;
  error: string | null;
  busy: boolean;
  clearErrors: () => void;
  addToCart: (pid: string, quantity: number) => Promise<void>;
} {
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

  useEffect(() => {
    void load();
  }, [load]);

  const error = localError ?? lastError;

  const clearErrors = useCallback(() => {
    setLocalError(null);
    clearError();
  }, [clearError]);

  const addToCart = useCallback(
    async (pid: string, quantity: number) => {
      setLocalError(null);
      clearError();
      try {
        await addOrUpdateLine(pid, quantity);
        navigation.navigate(Screens.Cart);
      } catch (e) {
        setLocalError(
          e instanceof BffApiError
            ? e.message
            : 'Could not add to cart.',
        );
      }
    },
    [addOrUpdateLine, clearError, navigation],
  );

  return {
    product,
    loading,
    error,
    busy,
    clearErrors,
    addToCart,
  };
}
