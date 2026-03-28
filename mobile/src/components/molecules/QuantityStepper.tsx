import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, space } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';

export function QuantityStepper({
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}): React.ReactElement {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        onPress={dec}
        disabled={disabled || value <= min}
        style={[
          styles.side,
          (disabled || value <= min) && styles.sideDisabled,
        ]}
      >
        <AppText variant="subtitle">−</AppText>
      </Pressable>
      <AppText variant="subtitle" style={styles.val}>
        {value}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={inc}
        disabled={disabled || value >= max}
        style={[
          styles.side,
          (disabled || value >= max) && styles.sideDisabled,
        ]}
      >
        <AppText variant="subtitle">+</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  side: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sideDisabled: { opacity: 0.4 },
  val: { minWidth: 28, textAlign: 'center' },
});
