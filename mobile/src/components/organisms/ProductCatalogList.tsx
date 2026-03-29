import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from '../../lib/rn';
import type { ProductListItem } from '../../api/types';
import { space } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';
import { LoadingBlock } from '../atoms/LoadingBlock';
import { ProductListRow } from '../molecules/ProductListRow';
import { SectionHeader } from '../molecules/SectionHeader';

export function ProductCatalogList({
  products,
  loading,
  onRefresh,
  onSelect,
}: {
  products: ProductListItem[];
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  onSelect: (p: ProductListItem) => void;
}): React.ReactElement {
  const [refreshing, setRefreshing] = React.useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && products.length === 0) {
    return <LoadingBlock message="Loading products…" />;
  }

  return (
    <View style={styles.fill}>
      <SectionHeader
        title="Shop"
        accessibilityHint="Browse products to add to your cart."
      />
      <FlatList
        accessibilityLabel="Product list"
        accessibilityHint="Pull down to refresh availability and prices."
        data={products}
        keyExtractor={(item: ProductListItem) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <AppText
            variant="caption"
            accessibilityRole="text"
            accessibilityLabel="No products available."
          >
            No products available.
          </AppText>
        }
        renderItem={({ item }: ListRenderItemInfo<ProductListItem>) => (
          <ProductListRow product={item} onPress={() => onSelect(item)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  list: { paddingBottom: space.xl },
});
