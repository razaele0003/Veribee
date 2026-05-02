import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

/**
 * HandoverSelect — shown on the Customer's phone when the rider arrives.
 *
 * In production this screen would be pushed automatically via a Supabase
 * Realtime event when the rider presses "I've Arrived" on their device.
 * For now the Dev FAB on the tracking screen navigates here directly.
 *
 * The customer does NOT switch methods here — they pick ONE and proceed.
 * The rider's screen (otp-entry / biometric-confirm) mirrors the choice.
 */
export default function HandoverSelect() {
  const router = useRouter();

  // Gentle entrance animation for the card
  const slideAnim = new Animated.Value(60);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Dimmed background */}
      <View style={styles.backdrop} />

      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Arrival illustration */}
        <View style={styles.illustration}>
          <View style={styles.doorWrap}>
            <MaterialIcons name="door-front" size={64} color={Colors.primary} />
          </View>
          <View style={styles.riderBadge}>
            <MaterialIcons name="delivery-dining" size={40} color={Colors.onPrimary} />
          </View>
        </View>

        <Text style={styles.title}>Your Rider Has Arrived!</Text>
        <Text style={styles.subtitle}>
          Choose how you'd like to confirm your delivery.
        </Text>

        {/* OTP Option */}
        <Pressable
          style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
          onPress={() => router.replace('/(buyer)/otp-handover')}
          accessibilityRole="button"
          accessibilityLabel="Use OTP code"
        >
          <View style={[styles.optionIcon, { backgroundColor: Colors.primaryFixed }]}>
            <MaterialIcons name="pin" size={32} color={Colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Show OTP Code</Text>
            <Text style={styles.optionDesc}>
              Show a one-time 6-digit code to your rider
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
        </Pressable>

        {/* Biometric Option */}
        <Pressable
          style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
          onPress={() => router.replace('/(buyer)/biometric-handover')}
          accessibilityRole="button"
          accessibilityLabel="Use biometric verification"
        >
          <View style={[styles.optionIcon, { backgroundColor: Colors.tertiaryFixed }]}>
            <MaterialIcons name="fingerprint" size={32} color={Colors.tertiary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Use Biometrics</Text>
            <Text style={styles.optionDesc}>
              Verify with Face ID or Fingerprint on your phone
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
        </Pressable>

        {/* Back link */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backRow}
          accessibilityRole="button"
        >
          <MaterialIcons name="arrow-back" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.backLink}>Back to tracking</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,27,27,0.55)',
  },

  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.outlineVariant,
    marginBottom: Spacing.sm,
  },

  // Illustration
  illustration: {
    width: '100%',
    maxWidth: 280,
    height: 160,
    borderRadius: Radii.xl,
    backgroundColor: Colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  doorWrap: {
    width: 90,
    height: 90,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderBadge: {
    width: 72,
    height: 72,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Option cards
  optionCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radii.xl,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    ...Shadow.card,
  },
  optionCardPressed: {
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.primary,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  optionDesc: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  backLink: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
});
