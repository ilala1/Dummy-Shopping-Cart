import React from 'react';
import { Pressable, StyleSheet, View } from '../../lib/rn';
import { colors, radius, space } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';

export function QuantityStepper({
  value,
  min,
  max,
  onChange,
  disabled,
  a11yItemName,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  /** Product or line name for clearer VoiceOver labels. */
  a11yItemName?: string;
}): React.ReactElement {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const focusName = a11yItemName ?? 'this item';
  return (
    <View style={styles.row} accessibilityRole="none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease quantity for ${focusName}. Current quantity ${value}.`}
        accessibilityHint="Subtracts one from the number of items."
        accessibilityState={{ disabled: !!(disabled || value <= min) }}
        onPress={dec}
        disabled={disabled || value <= min}
        style={[
          styles.side,
          (disabled || value <= min) && styles.sideDisabled,
        ]}
      >
        <AppText variant="subtitle">−</AppText>
      </Pressable>
      <AppText
        variant="subtitle"
        style={styles.val}
        accessibilityRole="text"
        accessibilityLabel={`Quantity ${value}`}
      >
        {value}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase quantity for ${focusName}. Current quantity ${value}.`}
        accessibilityHint="Adds one more item, up to the maximum you can order."
        accessibilityState={{ disabled: !!(disabled || value >= max) }}
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
