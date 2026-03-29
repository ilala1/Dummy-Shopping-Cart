import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { api, BffApiError } from '../api/bffClient';
import type { CartSnapshot, CheckoutSuccess } from '../api/types';

const STORAGE_KEY = 'shop_cart_id';
/** Align with bff/src/carts/cart-inactivity.service.ts sweep interval. */
const CART_PEEK_INTERVAL_MS = 10_000;

type ShopSessionContextValue = {
  cartId: string | null;
  cart: CartSnapshot | null;
  ready: boolean;
  busy: boolean;
  lastError: string | null;
  refreshCart: () => Promise<void>;
  /**
   * Creates a new server cart and clears any stale local id.
   */
  resetSession: () => Promise<void>;
  addOrUpdateLine: (productId: string, quantity: number) => Promise<void>;
  removeLine: (productId: string) => Promise<void>;
  checkout: () => Promise<CheckoutSuccess>;
  clearError: () => void;
};

const ShopSessionContext = createContext<ShopSessionContextValue | null>(null);

export function ShopSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const persistCartId = useCallback(async (id: string | null) => {
    if (id) {
      await AsyncStorage.setItem(STORAGE_KEY, id);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const recoverAfterServerExpiredCart = useCallback(async () => {
    await persistCartId(null);
    setCart(null);
    const created = await api.createCart();
    setCartId(created.id);
    await persistCartId(created.id);
    const snap = await api.getCart(created.id);
    setCart(snap);
    setLastError(
      'Your cart expired on the server after inactivity. Started a new cart.',
    );
  }, [persistCartId]);

  const refreshCart = useCallback(async () => {
    if (!cartId) {
      setCart(null);
      return;
    }
    try {
      const snap = await api.getCart(cartId);
      setCart(snap);
    } catch (e) {
      if (e instanceof BffApiError && e.status === 410) {
        await recoverAfterServerExpiredCart();
        return;
      }
      throw e;
    }
  }, [cartId, recoverAfterServerExpiredCart]);

  const peekCartFromServer = useCallback(async () => {
    if (!cartId) return;
    try {
      const snap = await api.peekCart(cartId);
      setCart(snap);
    } catch (e) {
      if (e instanceof BffApiError && e.status === 410) {
        await recoverAfterServerExpiredCart();
      }
    }
  }, [cartId, recoverAfterServerExpiredCart]);

  const resetSession = useCallback(async () => {
    setBusy(true);
    setLastError(null);
    try {
      await persistCartId(null);
      setCartId(null);
      setCart(null);
      const created = await api.createCart();
      setCartId(created.id);
      await persistCartId(created.id);
      const snap = await api.getCart(created.id);
      setCart(snap);
    } finally {
      setBusy(false);
    }
  }, [persistCartId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          if (!cancelled) {
            setCartId(stored);
          }
        } else {
          const created = await api.createCart();
          if (!cancelled) {
            setCartId(created.id);
            await persistCartId(created.id);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setLastError(
            e instanceof Error ? e.message : 'Could not start shopping session.',
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persistCartId]);

  useEffect(() => {
    if (!ready || !cartId) return;
    refreshCart().catch((e) => {
      setLastError(e instanceof Error ? e.message : 'Failed to load cart.');
    });
  }, [ready, cartId, refreshCart]);

  useEffect(() => {
    if (!ready || !cartId) return;
    const tick = () => {
      void peekCartFromServer();
    };
    const id = setInterval(tick, CART_PEEK_INTERVAL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [ready, cartId, peekCartFromServer]);

  const addOrUpdateLine = useCallback(
    async (productId: string, quantity: number) => {
      if (!cartId) return;
      setBusy(true);
      setLastError(null);
      try {
        const snap = await api.setLine(cartId, productId, quantity);
        setCart(snap);
      } catch (e) {
        const msg =
          e instanceof BffApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Could not update cart.';
        setLastError(msg);
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [cartId],
  );

  const removeLine = useCallback(
    async (productId: string) => {
      if (!cartId) return;
      setBusy(true);
      setLastError(null);
      try {
        const snap = await api.removeLine(cartId, productId);
        setCart(snap);
      } catch (e) {
        const msg =
          e instanceof BffApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Could not remove item.';
        setLastError(msg);
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [cartId],
  );

  const checkout = useCallback(async () => {
    if (!cartId) {
      throw new Error('No active cart.');
    }
    setBusy(true);
    setLastError(null);
    try {
      const order = await api.checkout(cartId);
      await persistCartId(null);
      setCartId(null);
      setCart(null);
      const created = await api.createCart();
      setCartId(created.id);
      await persistCartId(created.id);
      const snap = await api.getCart(created.id);
      setCart(snap);
      return order;
    } catch (e) {
      const msg =
        e instanceof BffApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Checkout failed.';
      setLastError(msg);
      // Failed checkout removes the cart on the server; start fresh locally.
      try {
        await persistCartId(null);
        setCartId(null);
        setCart(null);
        const created = await api.createCart();
        setCartId(created.id);
        await persistCartId(created.id);
        const snap = await api.getCart(created.id);
        setCart(snap);
      } catch {
        /* ignore secondary failures */
      }
      throw e;
    } finally {
      setBusy(false);
    }
  }, [cartId, persistCartId]);

  const clearError = useCallback(() => setLastError(null), []);

  const value = useMemo(
    () => ({
      cartId,
      cart,
      ready,
      busy,
      lastError,
      refreshCart,
      resetSession,
      addOrUpdateLine,
      removeLine,
      checkout,
      clearError,
    }),
    [
      cartId,
      cart,
      ready,
      busy,
      lastError,
      refreshCart,
      resetSession,
      addOrUpdateLine,
      removeLine,
      checkout,
      clearError,
    ],
  );

  return (
    <ShopSessionContext.Provider value={value}>
      {children}
    </ShopSessionContext.Provider>
  );
}

export function useShopSession(): ShopSessionContextValue {
  const ctx = useContext(ShopSessionContext);
  if (!ctx) {
    throw new Error('useShopSession must be used within ShopSessionProvider');
  }
  return ctx;
}
