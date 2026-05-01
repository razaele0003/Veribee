import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Radii } from '@/constants/radii';

export type BadgeType = 'verified' | 'pending' | 'rejected' | 'elite';

type Props = {
  type: BadgeType;
  label?: string;
  style?: ViewStyle;
};

const PALETTE: Record<BadgeType, { bg: string; fg: string; defaultLabel: string }> = {
  verified: {
    bg: Colors.secondaryContainer,
    fg: Colors.onSecondaryContainer,
    defaultLabel: 'Verified',
  },
  pending: {
    bg: Colors.tertiaryContainer,
    fg: Colors.onTertiaryContainer,
    defaultLabel: 'Pending',
  },
  rejected: {
    bg: Colors.errorContainer,
    fg: Colors.onErrorContainer,
    defaultLabel: 'Rejected',
  },
  elite: {
    bg: Colors.secondaryFixed,
    fg: Colors.onSecondaryFixed,
    defaultLabel: 'Elite',
  },
};

export function Badge({ type, label, style }: Props) {
  const p = PALETTE[type];
  return (
    <View style={[styles.badge, { backgroundColor: p.bg }, style]}>
      <Text style={[styles.text, { color: p.fg }]}>{label ?? p.defaultLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
