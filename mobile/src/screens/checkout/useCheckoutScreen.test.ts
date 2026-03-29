import { act, renderHook, waitFor } from '@testing-library/react-native';
import { BffApiError } from '../../api/bffClient';
import type { CheckoutSuccess } from '../../api/types';
import { useCheckoutScreen } from './useCheckoutScreen';

const mockUseShopSession = jest.fn();

jest.mock('../../context/ShopSessionContext', () => ({
  useShopSession: () => mockUseShopSession(),
}));

function nav() {
  return { navigate: jest.fn() } as unknown as Parameters<
    typeof useCheckoutScreen
  >[0];
}

const successOrder: CheckoutSuccess = {
  ok: true,
  orderId: 'ord-1',
  cartId: 'cart-1',
  lines: [],
  subtotalCents: 100,
  appliedDiscounts: [],
  totalPaidCents: 100,
};

describe('useCheckoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseShopSession.mockReturnValue({
      cart: { lines: [{ productId: 'p1', quantity: 1 }], totalCents: 100 },
      checkout: jest.fn().mockResolvedValue(successOrder),
      busy: false,
    });
  });

  it('canSubmit is false when cart has no lines', () => {
    mockUseShopSession.mockReturnValue({
      cart: { lines: [], totalCents: 0 },
      checkout: jest.fn(),
      busy: false,
    });
    const { result } = renderHook(() => useCheckoutScreen(nav()));
    expect(result.current.canSubmit).toBe(false);
  });

  it('canSubmit follows cart lines', () => {
    const { result } = renderHook(() => useCheckoutScreen(nav()));
    expect(result.current.canSubmit).toBe(true);
  });

  it('placeOrder sets done on success', async () => {
    const { result } = renderHook(() => useCheckoutScreen(nav()));
    await act(async () => {
      await result.current.placeOrder();
    });
    await waitFor(() => {
      expect(result.current.done).toEqual(successOrder);
    });
    expect(result.current.error).toBeNull();
  });

  it('placeOrder sets error message from BffApiError', async () => {
    mockUseShopSession.mockReturnValue({
      cart: { lines: [{ productId: 'p1', quantity: 1 }], totalCents: 100 },
      checkout: jest
        .fn()
        .mockRejectedValue(new BffApiError('nope', 400, null)),
      busy: false,
    });
    const { result } = renderHook(() => useCheckoutScreen(nav()));
    await act(async () => {
      await result.current.placeOrder();
    });
    await waitFor(() => {
      expect(result.current.error).toBe('nope');
    });
    expect(result.current.done).toBeNull();
  });
});
