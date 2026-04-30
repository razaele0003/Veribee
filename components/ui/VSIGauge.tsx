import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

type Props = {
  score: number;
};

export function VSIGauge({ score }: Props) {
  const width = 240;
  const height = 146;
  const centerX = 120;
  const centerY = 118;
  const radius = 96;
  const arcLength = Math.PI * radius;
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const rotation = normalizedScore * 1.8 - 90;
  const arc = `M ${centerX - radius},${centerY} A ${radius},${radius} 0 0,1 ${centerX + radius},${centerY}`;

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={arc}
          fill="none"
          stroke={Colors.surfaceContainerHigh}
          strokeWidth={12}
          strokeLinecap="round"
        />
        <Path
          d={arc}
          fill="none"
          stroke={Colors.error}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${arcLength * 0.6} ${arcLength}`}
        />
        <Path
          d={arc}
          fill="none"
          stroke={Colors.secondaryContainer}
          strokeWidth={12}
          strokeDasharray={`${arcLength * 0.15} ${arcLength}`}
          strokeDashoffset={-arcLength * 0.6}
        />
        <Path
          d={arc}
          fill="none"
          stroke={Colors.primary}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${arcLength * 0.25} ${arcLength}`}
          strokeDashoffset={-arcLength * 0.75}
        />
        <G rotation={rotation} origin={`${centerX}, ${centerY}`}>
          <Path
            d={`M ${centerX - 5},${centerY} L ${centerX + 5},${centerY} L ${centerX},${centerY - 82} Z`}
            fill={Colors.surfaceTint}
          />
          <Circle cx={centerX} cy={centerY} r={8} fill={Colors.surfaceTint} />
        </G>
      </Svg>
      <View style={styles.scoreBlock}>
        <Text style={styles.score}>{normalizedScore}</Text>
        <Text style={styles.label}>Excellent</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  scoreBlock: {
    alignItems: 'center',
    marginTop: -Spacing.xl,
  },
  score: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 56,
    lineHeight: 60,
    color: Colors.onSurface,
  },
  label: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
  },
});
