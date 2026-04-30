import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

type Props = {
  current: number;
  total: number;
  label: string;
};

export function StepIndicator({ current, total, label }: Props) {
  const progress = `${Math.min(Math.max(current / total, 0), 1) * 100}%` as `${number}%`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        Step {current} of {total} - {label}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: progress }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  label: { ...Type.labelCaps, color: Colors.onSurfaceVariant },
  track: {
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
});
