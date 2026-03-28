import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ShopSessionProvider } from './src/context/ShopSessionContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App(): React.ReactElement {
  return (
    <ShopSessionProvider>
      <AppNavigator />
      <StatusBar style="dark" />
    </ShopSessionProvider>
  );
}
