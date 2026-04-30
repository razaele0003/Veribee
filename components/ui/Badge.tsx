import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Type } from '@/constants/typography';
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Type.labelCaps,
  },
});
