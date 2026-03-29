import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from '../lib/rn';
import { useShopSession } from '../context/ShopSessionContext';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProductListScreen } from '../screens/ProductListScreen';
import { colors } from '../theme/tokens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function CartBadgeTitle({ title }: { title: string }) {
  const { cart } = useShopSession();
  const n = cart?.lines.reduce((s, l) => s + l.quantity, 0) ?? 0;
  const suffix = n > 0 ? ` (${n})` : '';
  const a11yLabel =
    n > 0 ? `${title}, ${n} ${n === 1 ? 'item' : 'items'}` : title;
  return (
    <Text
      accessibilityRole="header"
      accessibilityLabel={a11yLabel}
      style={{ fontSize: 17, fontWeight: '700', color: colors.text }}
    >
      {title}
      {suffix}
    </Text>
  );
}

export function AppNavigator(): React.ReactElement {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Products"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen
          name="Products"
          component={ProductListScreen}
          options={{ title: 'Products' }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: 'Details' }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{
            title: 'Cart',
            headerTitle: () => <CartBadgeTitle title="Cart" />,
          }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: 'Checkout' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
