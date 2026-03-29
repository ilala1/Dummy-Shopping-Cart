import { act, renderHook, waitFor } from '@testing-library/react-native';
import { api } from '../../api/bffClient';
import { Screens } from '../../navigation/types';
import { useCartScreen } from './useCartScreen';

const mockUseShopSession = jest.fn();

jest.mock('../../context/ShopSessionContext', () => ({
  useShopSession: () => mockUseShopSession(),
}));

jest.mock('../../api/bffClient', () => {
  const actual = jest.requireActual('../../api/bffClient');
  return {
    ...actual,
    api: { listProducts: jest.fn() },
  };
});

const listProducts = api.listProducts as jest.MockedFunction<
  typeof api.listProducts
>;

const navigation = {
  navigate: jest.fn(),
} as unknown as Parameters<typeof useCartScreen>[0];

describe('useCartScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listProducts.mockResolvedValue([]);
    mockUseShopSession.mockReturnValue({
      cart: null,
      ready: true,
      busy: false,
      refreshCart: jest.fn().mockResolvedValue(undefined),
      addOrUpdateLine: jest.fn().mockResolvedValue(undefined),
      removeLine: jest.fn().mockResolvedValue(undefined),
      lastError: null,
      clearError: jest.fn(),
    });
  });

  it('goCheckout navigates', async () => {
    const { result } = renderHook(() => useCartScreen(navigation));
    await waitFor(() => {
      expect(listProducts).toHaveBeenCalled();
    });
    act(() => {
      result.current.goCheckout();
    });
    expect(navigation.navigate).toHaveBeenCalledWith(Screens.Checkout);
  });

  it('surfaces catalogue load errors as banner', async () => {
    listProducts.mockRejectedValue(new Error('catalogue down'));
    const { result } = renderHook(() => useCartScreen(navigation));
    await waitFor(() => {
      expect(result.current.banner).toBe('Could not refresh stock info.');
    });
  });
});
