import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Screens, type RootStackParamList } from '../../navigation/types';
import { ProductDetailScreenView } from './ProductDetailScreenView';
import { useProductDetailScreen } from './useProductDetailScreen';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof Screens.ProductDetail
>;

export function ProductDetailScreen({
  route,
  navigation,
}: Props): React.ReactElement {
  const { productId } = route.params;
  const model = useProductDetailScreen(productId, navigation);
  return (
    <ProductDetailScreenView
      product={model.product}
      loading={model.loading}
      busy={model.busy}
      error={model.error}
      onClearError={model.clearErrors}
      onAddToCart={model.addToCart}
    />
  );
}
