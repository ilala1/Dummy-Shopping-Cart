import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, View } from '../lib/rn';
import type { CheckoutSuccess } from '../api/types';
import { BffApiError } from '../api/bffClient';
import { ScreenContainer } from '../components/atoms/ScreenContainer';
import { AppText } from '../components/atoms/AppText';
import { MoneyText } from '../components/atoms/MoneyText';
import { PrimaryButton } from '../components/atoms/PrimaryButton';
import { ErrorCallout } from '../components/molecules/ErrorCallout';
import { SectionHeader } from '../components/molecules/SectionHeader';
import { useShopSession } from '../context/ShopSessionContext';
import { formatCents } from '../lib/money';
import { colors, space } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props): React.ReactElement {
  const { cart, checkout, busy } = useShopSession();
  const [done, setDone] = useState<CheckoutSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <ScreenContainer scroll>
        <SectionHeader
          title="Order placed"
          accessibilityHint="Confirmation of your completed order."
        />
        <AppText variant="caption" style={styles.orderMeta}>
          Order ID: {done.orderId}
        </AppText>
        <View style={styles.block}>
          <AppText variant="subtitle">Items</AppText>
          {done.lines.map((l) => (
            <View key={l.productId} style={styles.line}>
              <AppText variant="body" style={{ flex: 1 }}>
                {l.name} × {l.quantity}
              </AppText>
              <MoneyText cents={l.lineTotalCents} />
            </View>
          ))}
        </View>
        <View style={styles.block}>
          <View style={styles.line}>
            <AppText variant="body">Subtotal</AppText>
            <MoneyText cents={done.subtotalCents} />
          </View>
          {done.appliedDiscounts.map((d) => (
            <View style={styles.line} key={d.discountId}>
              <AppText variant="caption" style={{ flex: 1 }}>
                {d.name}
              </AppText>
              <AppText variant="caption" style={{ color: colors.success }}>
                −{formatCents(d.amountCents)}
              </AppText>
            </View>
          ))}
          <View style={styles.line}>
            <AppText variant="subtitle">Paid</AppText>
            <MoneyText cents={done.totalPaidCents} variant="subtitle" />
          </View>
        </View>
        <PrimaryButton
          title="Back to shop"
          onPress={() => {
            setDone(null);
            navigation.navigate('Products');
          }}
        />
      </ScreenContainer>
    );
  }

  const canSubmit = (cart?.lines.length ?? 0) > 0;

  return (
    <ScreenContainer scroll>
      <SectionHeader
        title="Checkout"
        accessibilityHint="Review total and place your simulated order."
      />
      {error ? (
        <ErrorCallout message={error} onDismiss={() => setError(null)} />
      ) : null}
      <AppText variant="body" style={{ marginBottom: space.md }}>
        Payment is simulated. We will place the order against the BFF using your
        current cart reservations.
      </AppText>
      {!canSubmit ? (
        <AppText variant="caption">
          Your cart is empty. Add items before checking out.
        </AppText>
      ) : (
        <View style={styles.block}>
          <View style={styles.line}>
            <AppText variant="body">Total due</AppText>
            <MoneyText cents={cart?.totalCents ?? 0} variant="subtitle" />
          </View>
        </View>
      )}
      <PrimaryButton
        title="Place order"
        accessibilityHint="Submits the order using your current cart."
        loading={busy}
        disabled={!canSubmit || busy}
        onPress={async () => {
          setError(null);
          try {
            const order = await checkout();
            setDone(order);
          } catch (e) {
            setError(
              e instanceof BffApiError
                ? e.message
                : e instanceof Error
                  ? e.message
                  : 'Checkout failed.',
            );
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  block: { gap: space.sm, marginVertical: space.md },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.md,
  },
  orderMeta: { marginBottom: space.md },
});
