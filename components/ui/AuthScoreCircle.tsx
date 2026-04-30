import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';

type Props = {
  score: number;
  tone: 'pass' | 'fail';
};

export function AuthScoreCircle({ score, tone }: Props) {
  const size = 132;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const offset = circumference * (1 - normalizedScore / 100);
  const activeColor = tone === 'pass' ? Colors.primary : Colors.error;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceContainerHighest}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.score}>{normalizedScore}%</Text>
      <Text style={styles.label}>
        {tone === 'pass' ? 'Authentic' : 'Needs Review'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 32,
    lineHeight: 36,
    color: Colors.onSurface,
  },
  label: {
    ...Type.labelCaps,
    fontSize: 10,
    lineHeight: 12,
    color: Colors.onSurfaceVariant,
  },
});
