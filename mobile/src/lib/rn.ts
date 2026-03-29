/**
 * React 19's JSX types expect class constructors to extend React.Component.
 * React Native core components use valid host constructor types that tsc
 * still rejects. Re-export with ComponentType casts; runtime is unchanged.
 */
import type { ComponentProps, ComponentType } from 'react';
import {
  ActivityIndicator as RNActivityIndicator,
  FlatList as RNFlatList,
  Pressable as RNPressable,
  RefreshControl as RNRefreshControl,
  ScrollView as RNScrollView,
  StyleSheet,
  Text as RNText,
  View as RNView,
  type ActivityIndicatorProps,
  type PressableProps,
  type ScrollViewProps,
  type TextProps,
  type ViewProps,
} from 'react-native';

export { StyleSheet };
export type {
  ActivityIndicatorProps,
  ListRenderItemInfo,
  PressableProps,
  PressableStateCallbackType,
  TextProps,
  ViewProps,
} from 'react-native';

function asComponent<P>(C: unknown): ComponentType<P> {
  return C as ComponentType<P>;
}

export const View = asComponent<ViewProps>(RNView);
export const Text = asComponent<TextProps>(RNText);
export const ScrollView = asComponent<ScrollViewProps>(RNScrollView);
export const Pressable = asComponent<PressableProps>(RNPressable);
export const ActivityIndicator =
  asComponent<ActivityIndicatorProps>(RNActivityIndicator);
export const RefreshControl = asComponent<
  ComponentProps<typeof RNRefreshControl>
>(RNRefreshControl);

/** FlatList stays generic at runtime; the cast is only for the type checker. */
export const FlatList = RNFlatList as typeof RNFlatList;
