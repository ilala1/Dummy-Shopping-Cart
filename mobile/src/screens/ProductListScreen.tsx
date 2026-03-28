import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { api, BffApiError } from '../api/bffClient';
import type { ProductListItem } from '../api/types';
import { ProductCatalogList } from '../components/organisms/ProductCatalogList';
import { ScreenContainer } from '../components/atoms/ScreenContainer';
import { AppText } from '../components/atoms/AppText';
import { ErrorCallout } from '../components/molecules/ErrorCallout';
import { colors } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export function ProductListScreen({ navigation }: Props): React.ReactElement {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open cart"
          onPress={() => navigation.navigate('Cart')}
          style={{ paddingHorizontal: 12, paddingVertical: 8 }}
        >
          <AppText variant="subtitle" style={{ color: colors.primary }}>
            Cart
          </AppText>
        </Pressable>
      ),
    });
  }, [navigation]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <ScreenContainer scroll={false}>
      {error ? (
        <ErrorCallout message={error} onDismiss={() => setError(null)} />
      ) : null}
      <ProductCatalogList
        products={products}
        loading={loading}
        onRefresh={load}
        onSelect={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
      />
    </ScreenContainer>
  );
}
