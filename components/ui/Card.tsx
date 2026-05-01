import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Shadow } from '@/constants/colors';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

type Props = PropsWithChildren<{
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
}>;

export function Card({ children, style, padding = Spacing.md, elevated = false }: Props) {
  return (
    <View
      style={[
        styles.card,
        elevated ? styles.elevated : styles.flat,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.card,
  },
  // Elevated cards: shadow only, no border
  elevated: {
    ...Shadow.card,
  },
  // Flat cards: subtle border, no shadow
  flat: {
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
});
