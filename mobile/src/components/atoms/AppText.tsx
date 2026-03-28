import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors } from '../../theme/tokens';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'error';

export type AppTextProps = TextProps & {
  variant?: Variant;
};

export function AppText({
  variant = 'body',
  style,
  ...rest
}: AppTextProps): React.ReactElement {
  return <Text {...rest} style={[styles.base, styles[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  error: {
    fontSize: 14,
    color: colors.danger,
    lineHeight: 20,
  },
});
