import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

// Static demo code — in production, fetched from the active delivery record
const DEMO_CODE = ['8', '2', '1', '9', '4', '6'];

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { label: `${mm}:${ss}`, expired: remaining <= 0 };
}

function usePulse() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.12, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return anim;
}

export default function OtpHandover() {
  const router = useRouter();
  const { label: timerLabel, expired } = useCountdown(9 * 60 + 45);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarLabel}>veribee</Text>
      </View>

      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustration}>
          <View style={styles.illustrationDoor}>
            <MaterialIcons name="door-front" size={72} color={Colors.primary} />
          </View>
          <View style={styles.illustrationRider}>
            <MaterialIcons name="delivery-dining" size={48} color={Colors.onPrimary} />
          </View>
        </View>

        <Text style={styles.title}>Your Rider Has Arrived</Text>
        <Text style={styles.subtitle}>Show this code to confirm your delivery.</Text>

        {/* OTP Digits */}
        <View style={styles.otpBox}>
          {DEMO_CODE.map((digit, i) => (
            <View key={i} style={styles.digitWrap}>
              <Text style={styles.digit}>{digit}</Text>
            </View>
          ))}
        </View>

        {/* Countdown */}
        <View style={[styles.countdown, expired && styles.countdownExpired]}>
          <Text style={[styles.countdownTime, expired && styles.countdownTimeExpired]}>
            {expired ? '0:00' : timerLabel}
          </Text>
        </View>
        <Text style={styles.expires}>CODE EXPIRES AUTOMATICALLY</Text>

        {/* Back link */}
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backLink}>Back to tracking</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  topBar: {
    height: 56,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
    color: Colors.onPrimary,
    letterSpacing: 1,
  },

  content: {
    flex: 1,
    padding: Spacing.containerMargin,
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.xl,
  },

  // Illustration
  illustration: {
    width: '100%',
    maxWidth: 300,
    height: 180,
    borderRadius: Radii.xl,
    backgroundColor: Colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  illustrationDoor: {
    width: 96,
    height: 96,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationRider: {
    width: 78,
    height: 78,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 26,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // OTP Box
  otpBox: {
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.xs,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  digitWrap: {
    width: 38,
    alignItems: 'center',
  },
  digit: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 36,
    color: Colors.onSurface,
  },

  // Countdown
  countdown: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownExpired: { borderColor: Colors.error },
  countdownTime: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.primary,
  },
  countdownTimeExpired: { color: Colors.error },
  expires: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.onSurfaceVariant,
  },

  // Biometric button
  biometricButton: {
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  biometricButtonSuccess: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFixed,
  },
  biometricButtonFailed: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorContainer,
  },
  biometricButtonScanning: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryContainer,
  },
  biometricIconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButtonText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.primary,
  },

  backLink: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.primary,
  },
});
