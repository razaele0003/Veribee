import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Radii } from '@/constants/radii';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 20, borderRadius = Radii.md, style }: Props) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        animStyle,
        style,
      ]}
    />
  );
}

/** Pre-built skeleton for a product card (image + two text lines) */
export function ProductCardSkeleton() {
  return (
    <View style={styles.cardSkel}>
      <Skeleton height={140} borderRadius={Radii.lg} style={styles.imgSkel} />
      <View style={styles.textSkel}>
        <Skeleton height={14} width="80%" />
        <Skeleton height={12} width="50%" style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  cardSkel: {
    flex: 1,
  },
  imgSkel: {
    marginBottom: 10,
  },
  textSkel: {
    gap: 4,
  },
});
