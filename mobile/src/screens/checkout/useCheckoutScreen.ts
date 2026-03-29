import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { BffApiError } from '../../api/bffClient';
import type { CheckoutSuccess } from '../../api/types';
import { useShopSession } from '../../context/ShopSessionContext';
import { Screens, type RootStackParamList } from '../../navigation/types';

export type CheckoutNavigation = NativeStackNavigationProp<
  RootStackParamList,
  typeof Screens.Checkout
>;

export function useCheckoutScreen(navigation: CheckoutNavigation): {
  done: CheckoutSuccess | null;
  error: string | null;
  dismissError: () => void;
  canSubmit: boolean;
  cartTotalCents: number;
  busy: boolean;
  placeOrder: () => Promise<void>;
  backToShop: () => void;
} {
  const { cart, checkout, busy } = useShopSession();
  const [done, setDone] = useState<CheckoutSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = (cart?.lines.length ?? 0) > 0;

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const backToShop = useCallback(() => {
    setDone(null);
    navigation.navigate(Screens.Products);
  }, [navigation]);

  const placeOrder = useCallback(async () => {
    setError(null);
    try {
      const order = await checkout();
      setDone(order);
    } catch (e) {
      setError(
        e instanceof BffApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Checkout failed.',
      );
    }
  }, [checkout]);

  return {
    done,
    error,
    dismissError,
    canSubmit,
    cartTotalCents: cart?.totalCents ?? 0,
    busy,
    placeOrder,
    backToShop,
  };
}
