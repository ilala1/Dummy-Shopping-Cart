import React from 'react';
import { StyleSheet, View } from '../../lib/rn';
import { space } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';

export function SectionHeader({
  title,
  right,
  accessibilityHint: headerHint,
}: {
  title: string;
  right?: React.ReactNode;
  /** Describes the section for assistive tech (optional). */
  accessibilityHint?: string;
}): React.ReactElement {
  return (
    <View style={styles.row}>
      <AppText
        variant="subtitle"
        accessibilityRole="header"
        accessibilityLabel={title}
        accessibilityHint={headerHint}
      >
        {title}
      </AppText>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
    marginTop: space.sm,
  },
});
