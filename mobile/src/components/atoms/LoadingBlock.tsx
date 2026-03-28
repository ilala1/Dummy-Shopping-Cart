import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { AppText } from './AppText';

export function LoadingBlock({
  message = 'Loading…',
}: {
  message?: string;
}): React.ReactElement {
  return (
    <View style={styles.wrap} accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="caption" style={styles.msg}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  msg: {
    textAlign: 'center',
  },
});
