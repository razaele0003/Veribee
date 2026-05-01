import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

/**
 * BiometricHandover — shown on the Customer's phone when they choose
 * "Use Biometrics" on the handover-select screen.
 *
 * Always renders the biometric UI. When no hardware is available
 * (web / simulator) a "Simulate" dev button is shown instead.
 */

function usePulse(active: boolean) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) {
      anim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.2, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, anim]);
  return anim;
}

type State = 'idle' | 'scanning' | 'success' | 'failed';

export default function BiometricHandover() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const [state, setState] = useState<State>('idle');
  const [hasHardware, setHasHardware] = useState<boolean | null>(null); // null = not checked yet
  const pulseAnim = usePulse(state === 'scanning');

  // Check hardware once on mount — but never redirect away
  useEffect(() => {
    (async () => {
      const hw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasHardware(hw && enrolled);
    })();
  }, []);

  const triggerBiometric = async () => {
    if (!hasHardware) {
      // Simulate for dev/web — write confirmed flag directly
      simulateSuccess();
      return;
    }

    setState('scanning');
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm your delivery handover',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await markConfirmed();
      } else {
        setState('failed');
        setTimeout(() => setState('idle'), 2000);
      }
    } catch {
      setState('failed');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const markConfirmed = async () => {
    setState('success');
    if (userId) {
      await supabase
        .from('deliveries')
        .update({ biometric_confirmed: true })
        .eq('buyer_id', userId)
        .eq('status', 'arrived_buyer');
    }
    setTimeout(() => {
      router.replace('/(buyer)/delivery-confirmed');
    }, 1400);
  };

  const simulateSuccess = () => {
    setState('scanning');
    setTimeout(() => markConfirmed(), 1200);
  };

  // ── Derived display values ──────────────────────────────────────────────────

  const isSuccess = state === 'success';
  const isFailed  = state === 'failed';
  const isScanning = state === 'scanning';

  const circleStyle = [
    styles.biometricCircle,
    isSuccess && styles.circleSuccess,
    isFailed  && styles.circleFailed,
  ];

  const statusLabel =
    isScanning ? 'Scanning biometrics…' :
    isSuccess  ? 'Identity Verified!' :
    isFailed   ? 'Scan failed — try again' :
    hasHardware === false ? 'No biometric hardware detected' :
    'Tap the button below to scan';

  const scanButtonLabel =
    hasHardware === false ? '▶  Simulate (Dev)' :
    isFailed ? 'Try Again' :
    'Scan Now';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Dimmed backdrop */}
      <View style={styles.backdrop} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* ── Biometric animation ─────────────────────────────────────────── */}
        <View style={styles.biometricOuter}>
          {/* Pulse ring */}
          {isScanning && (
            <Animated.View
              style={[
                styles.biometricPulse,
                { transform: [{ scale: pulseAnim }], opacity: 0.2 },
              ]}
            />
          )}

          <View style={circleStyle}>
            {isSuccess ? (
              <MaterialIcons name="check-circle" size={80} color={Colors.onPrimary} />
            ) : isFailed ? (
              <MaterialIcons name="cancel" size={80} color={Colors.error} />
            ) : (
              /* Face + Fingerprint icons side-by-side */
              <View style={styles.iconPair}>
                <View style={styles.iconHalf}>
                  <MaterialIcons
                    name="face"
                    size={46}
                    color={isScanning ? Colors.secondary : Colors.primary}
                  />
                  <Text style={[styles.iconLabel, isScanning && styles.iconLabelActive]}>
                    Face ID
                  </Text>
                </View>
                <View style={styles.iconDivider} />
                <View style={styles.iconHalf}>
                  <MaterialIcons
                    name="fingerprint"
                    size={46}
                    color={isScanning ? Colors.secondary : Colors.primary}
                  />
                  <Text style={[styles.iconLabel, isScanning && styles.iconLabelActive]}>
                    Touch ID
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isSuccess ? 'Delivery Confirmed!' : 'Biometric Verification'}
        </Text>
        <Text style={styles.subtitle}>
          {isSuccess
            ? 'Your identity has been verified. Completing handover…'
            : 'Use Face ID or Fingerprint to confirm receipt of your delivery.'}
        </Text>

        {/* Status chip */}
        <View style={[
          styles.statusChip,
          isFailed  && styles.statusChipError,
          isScanning && styles.statusChipScanning,
          isSuccess  && styles.statusChipSuccess,
        ]}>
          {isScanning ? (
            <MaterialIcons name="radio-button-checked" size={14} color={Colors.secondary} />
          ) : isSuccess ? (
            <MaterialIcons name="check-circle" size={14} color={Colors.primary} />
          ) : isFailed ? (
            <MaterialIcons name="cancel" size={14} color={Colors.error} />
          ) : (
            <View style={styles.statusDot} />
          )}
          <Text style={[
            styles.statusText,
            isFailed && styles.statusTextError,
            isScanning && styles.statusTextScanning,
          ]}>
            {statusLabel}
          </Text>
        </View>

        {/* Scan / Try Again / Simulate button */}
        {!isSuccess && !isScanning && (
          <Pressable
            style={({ pressed }) => [styles.scanButton, pressed && { opacity: 0.85 }]}
            onPress={triggerBiometric}
            accessibilityRole="button"
          >
            <MaterialIcons
              name={hasHardware === false ? 'bug-report' : 'fingerprint'}
              size={22}
              color={Colors.onPrimary}
            />
            <Text style={styles.scanButtonText}>{scanButtonLabel}</Text>
          </Pressable>
        )}

        {/* Use OTP instead link */}
        {!isSuccess && (
          <Pressable
            onPress={() => router.replace('/(buyer)/otp-handover')}
            hitSlop={12}
            style={styles.switchRow}
            accessibilityRole="button"
          >
            <MaterialIcons name="pin" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.switchText}>Use OTP code instead</Text>
          </Pressable>
        )}
      </View>
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
    backgroundColor: 'rgba(28,27,27,0.6)',
  },

  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    alignItems: 'center',
    gap: Spacing.lg,
    ...Shadow.card,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.outlineVariant,
    marginBottom: Spacing.xs,
  },

  // Biometric ring
  biometricOuter: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  biometricPulse: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary,
  },
  biometricCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
    ...Shadow.card,
  },
  circleSuccess: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  circleFailed: {
    backgroundColor: Colors.errorContainer,
    borderColor: Colors.error,
  },

  // Face + Touch icons inside the circle
  iconPair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  iconHalf: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
  },
  iconLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  iconLabelActive: {
    color: Colors.secondary,
  },
  iconDivider: {
    width: 1,
    height: 44,
    backgroundColor: Colors.outlineVariant,
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
    maxWidth: 300,
    lineHeight: 22,
  },

  // Status chip
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusChipError:    { backgroundColor: Colors.errorContainer },
  statusChipScanning: { backgroundColor: Colors.secondaryContainer },
  statusChipSuccess:  { backgroundColor: Colors.primaryFixed },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.tertiary,
  },
  statusText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  statusTextError:    { color: Colors.error },
  statusTextScanning: { color: Colors.secondary },

  // Scan button
  scanButton: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    paddingVertical: 14,
  },
  scanButtonText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onPrimary,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  switchText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
});
