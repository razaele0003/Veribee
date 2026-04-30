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
    <View style={[styles.card, { padding }, elevated && Shadow.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
});
