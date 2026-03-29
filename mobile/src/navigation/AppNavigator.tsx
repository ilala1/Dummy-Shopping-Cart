import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from '../lib/rn';
import { useShopSession } from '../context/ShopSessionContext';
import { CartScreen } from '../screens/cart/CartScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { ProductDetailScreen } from '../screens/product-detail/ProductDetailScreen';
import { ProductListScreen } from '../screens/product-list/ProductListScreen';
import { colors } from '../theme/tokens';
import { Screens, ScreenTitles, type RootStackParamList } from './types';

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
        initialRouteName={Screens.Products}
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen
          name={Screens.Products}
          component={ProductListScreen}
          options={{ title: ScreenTitles.Products }}
        />
        <Stack.Screen
          name={Screens.ProductDetail}
          component={ProductDetailScreen}
          options={{ title: ScreenTitles.ProductDetail }}
        />
        <Stack.Screen
          name={Screens.Cart}
          component={CartScreen}
          options={{
            title: ScreenTitles.Cart,
            headerTitle: () => (
              <CartBadgeTitle title={ScreenTitles.Cart} />
            ),
          }}
        />
        <Stack.Screen
          name={Screens.Checkout}
          component={CheckoutScreen}
          options={{ title: ScreenTitles.Checkout }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
