import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Screens, type RootStackParamList } from '../../navigation/types';
import { CheckoutScreenView } from './CheckoutScreenView';
import { useCheckoutScreen } from './useCheckoutScreen';

type Props = NativeStackScreenProps<RootStackParamList, typeof Screens.Checkout>;

export function CheckoutScreen({ navigation }: Props): React.ReactElement {
  const model = useCheckoutScreen(navigation);
  return (
    <CheckoutScreenView
      done={model.done}
      error={model.error}
      onDismissError={model.dismissError}
      canSubmit={model.canSubmit}
      cartTotalCents={model.cartTotalCents}
      busy={model.busy}
      onPlaceOrder={model.placeOrder}
      onBackToShop={model.backToShop}
    />
  );
}
