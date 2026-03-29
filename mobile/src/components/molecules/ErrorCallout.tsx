import React from 'react';
import { StyleSheet, View } from '../../lib/rn';
import { colors, radius, space } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';

export function ErrorCallout({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}): React.ReactElement {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
    >
      <AppText variant="error" style={styles.text}>
        {message}
      </AppText>
      {onDismiss ? (
        <AppText
          accessibilityRole="button"
          accessibilityLabel="Dismiss error"
          accessibilityHint="Hides this alert message."
          onPress={onDismiss}
          variant="caption"
          style={styles.dismiss}
        >
          Dismiss
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.dangerSurface,
    borderColor: '#fecaca',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
    gap: space.sm,
  },
  text: { flex: 1 },
  dismiss: {
    fontWeight: '600',
    color: colors.primary,
  },
});
