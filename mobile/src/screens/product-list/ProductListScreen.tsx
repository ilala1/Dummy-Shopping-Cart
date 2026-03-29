import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Screens, type RootStackParamList } from '../../navigation/types';
import { ProductListScreenView } from './ProductListScreenView';
import { useProductListScreen } from './useProductListScreen';

type Props = NativeStackScreenProps<RootStackParamList, typeof Screens.Products>;

export function ProductListScreen({ navigation }: Props): React.ReactElement {
  const model = useProductListScreen(navigation);
  return (
    <ProductListScreenView
      products={model.products}
      loading={model.loading}
      error={model.error}
      onDismissError={model.dismissError}
      onRefresh={model.load}
      onSelectProduct={model.openProduct}
    />
  );
}
