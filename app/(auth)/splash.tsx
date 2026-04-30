import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Logo } from '@/components/ui/Logo';

export default function Splash() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    const t = setTimeout(() => router.replace('/(auth)/onboarding'), 2000);
    return () => clearTimeout(t);
  }, [fade, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fade }]}>
        <Logo size={120} />
        <Text style={styles.title}>Veribee Delivery</Text>
        <Text style={styles.tagline}>Buzzing with Trust</Text>
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
  inner: { alignItems: 'center', gap: Spacing.sm },
  title: {
    ...Type.h2,
    color: Colors.primary,
    marginTop: Spacing.md,
  },
  tagline: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
  },
});
