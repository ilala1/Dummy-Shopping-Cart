import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { api, BffApiError } from '../../api/bffClient';
import type { CartSnapshot, ProductListItem } from '../../api/types';
import { useShopSession } from '../../context/ShopSessionContext';
import { Screens, type RootStackParamList } from '../../navigation/types';

export type CartNavigation = NativeStackNavigationProp<
  RootStackParamList,
  typeof Screens.Cart
>;

export function useCartScreen(navigation: CartNavigation): {
  ready: boolean;
  banner: string | null;
  dismissBanner: () => void;
  cart: CartSnapshot | null;
  catalogue: ProductListItem[];
  busy: boolean;
  reloadCatalogue: () => Promise<void>;
  changeQty: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  goCheckout: () => void;
} {
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

  const dismissBanner = useCallback(() => {
    clearError();
    setCatError(null);
  }, [clearError]);

  const changeQty = useCallback(
    async (productId: string, qty: number) => {
      clearError();
      try {
        await addOrUpdateLine(productId, qty);
        await loadCatalogue();
      } catch {
        /* session surfaces error */
      }
    },
    [addOrUpdateLine, clearError, loadCatalogue],
  );

  const remove = useCallback(
    async (productId: string) => {
      clearError();
      try {
        await removeLine(productId);
        await loadCatalogue();
      } catch {
        /* handled */
      }
    },
    [clearError, removeLine, loadCatalogue],
  );

  const goCheckout = useCallback(() => {
    navigation.navigate(Screens.Checkout);
  }, [navigation]);

  const banner = lastError ?? catError;

  return {
    ready,
    banner,
    dismissBanner,
    cart,
    catalogue,
    busy,
    reloadCatalogue: loadCatalogue,
    changeQty,
    remove,
    goCheckout,
  };
}
