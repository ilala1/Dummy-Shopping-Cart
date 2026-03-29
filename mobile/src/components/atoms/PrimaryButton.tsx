import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type PressableStateCallbackType,
} from '../../lib/rn';
import { colors, radius } from '../../theme/tokens';
import { AppText } from './AppText';

export type PrimaryButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'danger';
};

export function PrimaryButton({
  title,
  loading,
  disabled,
  variant = 'primary',
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState: a11yState,
  ...rest
}: PrimaryButtonProps): React.ReactElement {
  const isDisabled = disabled || loading;
  const bg =
    variant === 'danger'
      ? isDisabled
        ? '#fca5a5'
        : colors.danger
      : isDisabled
        ? '#93c5fd'
        : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: !!loading,
        ...a11yState,
      }}
      disabled={isDisabled}
      style={(s: PressableStateCallbackType) => [
        styles.btn,
        {
          backgroundColor: bg,
          opacity: s.pressed && !isDisabled ? 0.9 : 1,
        },
        style as object,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={colors.primaryText}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ) : (
        <AppText style={styles.label}>{title}</AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  label: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
});
