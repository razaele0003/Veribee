import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Radii } from '@/constants/radii';

type Variant = 'primary' | 'outlined' | 'ghost';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth = true,
  style,
  icon,
}: Props) {
  const isPrimary = variant === 'primary';
  const isOutlined = variant === 'outlined';
  const isDisabled = disabled || loading;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .enabled(!isDisabled)
    .onBegin(() => {
      scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 18, stiffness: 300 });
      if (onPress) runOnJS(onPress)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 18, stiffness: 300 });
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.base,
          fullWidth && styles.fullWidth,
          isPrimary && styles.primary,
          isOutlined && styles.outlined,
          variant === 'ghost' && styles.ghost,
          isDisabled && styles.disabled,
          isPrimary && !isDisabled && Shadow.fab,
          animatedStyle,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isPrimary ? Colors.onPrimary : Colors.primary} />
        ) : (
          <View style={styles.contentRow}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.text,
                isPrimary && { color: Colors.onPrimary },
                (isOutlined || variant === 'ghost') && { color: Colors.primary },
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  fullWidth: { alignSelf: 'stretch' },
  primary: { backgroundColor: Colors.primary },
  outlined: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.45 },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});
