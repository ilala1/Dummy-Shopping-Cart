import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Screens, type RootStackParamList } from '../../navigation/types';
import { CartScreenView } from './CartScreenView';
import { useCartScreen } from './useCartScreen';

type Props = NativeStackScreenProps<RootStackParamList, typeof Screens.Cart>;

export function CartScreen({ navigation }: Props): React.ReactElement {
  const model = useCartScreen(navigation);
  return (
    <CartScreenView
      ready={model.ready}
      banner={model.banner}
      onDismissBanner={model.dismissBanner}
      cart={model.cart}
      catalogue={model.catalogue}
      busy={model.busy}
      onChangeQty={model.changeQty}
      onRemove={model.remove}
      onCheckout={model.goCheckout}
    />
  );
}
