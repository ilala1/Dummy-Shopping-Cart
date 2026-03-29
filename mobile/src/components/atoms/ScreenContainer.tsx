import React from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from '../../lib/rn';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, space } from '../../theme/tokens';

export function ScreenContainer({
  children,
  scroll = false,
  ...rest
}: ViewProps & { scroll?: boolean }): React.ReactElement {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          {...(rest as object)}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.fill} {...rest}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  fill: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  scrollContent: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
    flexGrow: 1,
  },
});
