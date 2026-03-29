import React from 'react';
import { ProductCatalogList } from '../../components/organisms/ProductCatalogList';
import { ScreenContainer } from '../../components/atoms/ScreenContainer';
import { ErrorCallout } from '../../components/molecules/ErrorCallout';
import type { ProductListItem } from '../../api/types';

export function ProductListScreenView(props: {
  products: ProductListItem[];
  loading: boolean;
  error: string | null;
  onDismissError: () => void;
  onRefresh: () => Promise<void>;
  onSelectProduct: (product: ProductListItem) => void;
}): React.ReactElement {
  const {
    products,
    loading,
    error,
    onDismissError,
    onRefresh,
    onSelectProduct,
  } = props;

  return (
    <ScreenContainer scroll={false}>
      {error ? (
        <ErrorCallout message={error} onDismiss={onDismissError} />
      ) : null}
      <ProductCatalogList
        products={products}
        loading={loading}
        onRefresh={onRefresh}
        onSelect={onSelectProduct}
      />
    </ScreenContainer>
  );
}
