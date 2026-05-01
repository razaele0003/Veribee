import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Type, Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Logo } from '@/components/ui/Logo';

export default function Splash() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(() => router.replace('/(auth)/onboarding'), 2400);
    return () => clearTimeout(t);
  }, [fade, scale, router]);

  return (
    <View style={styles.container}>
      {/* Ambient glow behind logo */}
      <View style={styles.glow} />
      <Animated.View style={[styles.inner, { opacity: fade, transform: [{ scale }] }]}>
        <Logo size={96} />
        <Text style={styles.title}>Veribee</Text>
        <Text style={styles.tagline}>Buzzing with trust</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.primaryFixed,
    opacity: 0.35,
  },
  inner: { alignItems: 'center', gap: Spacing.sm },
  title: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: Colors.primary,
    marginTop: Spacing.md,
  },
  tagline: {
    ...Type.bodySm,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.2,
  },
});
