import React from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '../../theme/tokens';
import { AppText } from '../atoms/AppText';

export function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}): React.ReactElement {
  return (
    <View style={styles.row}>
      <AppText variant="subtitle" accessibilityRole="header">
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
