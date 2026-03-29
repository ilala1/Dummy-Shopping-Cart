import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import { api, BffApiError } from '../../api/bffClient';
import type { ProductListItem } from '../../api/types';
import { Screens, type RootStackParamList } from '../../navigation/types';
import { CartHeaderButton } from './CartHeaderButton';

export type ProductListNavigation = NativeStackNavigationProp<
  RootStackParamList,
  typeof Screens.Products
>;

export function useProductListScreen(navigation: ProductListNavigation): {
  products: ProductListItem[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  dismissError: () => void;
  openProduct: (product: ProductListItem) => void;
} {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openCart = useCallback(() => {
    navigation.navigate(Screens.Cart);
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <CartHeaderButton onPress={openCart} />,
    });
  }, [navigation, openCart]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.listProducts();
      setProducts(data);
    } catch (e) {
      setError(
        e instanceof BffApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Could not load products. Is the BFF running?',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openProduct = useCallback(
    (product: ProductListItem) => {
      navigation.navigate(Screens.ProductDetail, { productId: product.id });
    },
    [navigation],
  );

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return {
    products,
    loading,
    error,
    load,
    dismissError,
    openProduct,
  };
}
