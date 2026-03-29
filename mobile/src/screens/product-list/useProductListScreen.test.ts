import { act, renderHook, waitFor } from '@testing-library/react-native';
import { api, BffApiError } from '../../api/bffClient';
import type { ProductListItem } from '../../api/types';
import { Screens } from '../../navigation/types';
import { useProductListScreen } from './useProductListScreen';

const mockSetOptions = jest.fn();

const navigation = {
  setOptions: mockSetOptions,
  navigate: jest.fn(),
} as unknown as Parameters<typeof useProductListScreen>[0];

const item: ProductListItem = {
  id: 'p1',
  name: 'A',
  priceCents: 100,
  availableStock: 5,
};

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

describe('useProductListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listProducts.mockResolvedValue([item]);
  });

  it('loads products on mount', async () => {
    const { result } = renderHook(() => useProductListScreen(navigation));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.products).toEqual([item]);
    expect(result.current.error).toBeNull();
  });

  it('surfaces BffApiError message', async () => {
    listProducts.mockRejectedValue(new BffApiError('boom', 500, null));
    const { result } = renderHook(() => useProductListScreen(navigation));
    await waitFor(() => {
      expect(result.current.error).toBe('boom');
    });
  });

  it('openProduct navigates to detail', async () => {
    const { result } = renderHook(() => useProductListScreen(navigation));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    act(() => {
      result.current.openProduct(item);
    });
    expect(navigation.navigate).toHaveBeenCalledWith(Screens.ProductDetail, {
      productId: 'p1',
    });
  });
});
