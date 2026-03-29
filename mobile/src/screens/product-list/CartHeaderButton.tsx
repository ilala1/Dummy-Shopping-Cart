import React from 'react';
import { Pressable } from '../../lib/rn';
import { AppText } from '../../components/atoms/AppText';
import { colors } from '../../theme/tokens';

export function CartHeaderButton({
  onPress,
}: {
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open cart"
      accessibilityHint="Shows items in your shopping cart."
      onPress={onPress}
      style={{ paddingHorizontal: 12, paddingVertical: 8 }}
    >
      <AppText variant="subtitle" style={{ color: colors.primary }}>
        Cart
      </AppText>
    </Pressable>
  );
}
