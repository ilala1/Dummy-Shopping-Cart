import { act, renderHook, waitFor } from '@testing-library/react-native';
import { api, BffApiError } from '../../api/bffClient';
import type { ProductDetail } from '../../api/types';
import { Screens } from '../../navigation/types';
import { useProductDetailScreen } from './useProductDetailScreen';

const mockUseShopSession = jest.fn();

jest.mock('../../context/ShopSessionContext', () => ({
  useShopSession: () => mockUseShopSession(),
}));

jest.mock('../../api/bffClient', () => {
  const actual = jest.requireActual('../../api/bffClient');
  return {
    ...actual,
    api: {
      getProduct: jest.fn(),
    },
  };
});

const getProduct = api.getProduct as jest.MockedFunction<typeof api.getProduct>;

const navigation = {
  navigate: jest.fn(),
} as unknown as Parameters<typeof useProductDetailScreen>[1];

const product: ProductDetail = {
  id: 'p1',
  name: 'A',
  priceCents: 100,
  availableStock: 3,
  description: 'x',
};

describe('useProductDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getProduct.mockResolvedValue(product);
    mockUseShopSession.mockReturnValue({
      addOrUpdateLine: jest.fn().mockResolvedValue(undefined),
      busy: false,
      lastError: null,
      clearError: jest.fn(),
    });
  });

  it('loads product', async () => {
    const { result } = renderHook(() =>
      useProductDetailScreen('p1', navigation),
    );
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.product).toEqual(product);
  });

  it('addToCart navigates to Cart on success', async () => {
    const { result } = renderHook(() =>
      useProductDetailScreen('p1', navigation),
    );
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    await act(async () => {
      await result.current.addToCart('p1', 2);
    });
    expect(navigation.navigate).toHaveBeenCalledWith(Screens.Cart);
  });

  it('surfaces addToCart BffApiError', async () => {
    mockUseShopSession.mockReturnValue({
      addOrUpdateLine: jest
        .fn()
        .mockRejectedValue(new BffApiError('bad', 400, null)),
      busy: false,
      lastError: null,
      clearError: jest.fn(),
    });
    const { result } = renderHook(() =>
      useProductDetailScreen('p1', navigation),
    );
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    await act(async () => {
      await result.current.addToCart('p1', 1);
    });
    expect(result.current.error).toBe('bad');
  });
});
