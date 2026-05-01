import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { isLocalUserId } from '@/lib/localAuth';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRiderStore } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

function usePulse() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.18, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 800, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return anim;
}

export default function BiometricConfirm() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const completeActiveDelivery = useRiderStore((s) => s.completeActiveDelivery);
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'failed'>('waiting');
  const pulseAnim = usePulse();
  const isLocalDemo = isLocalUserId(userId);

  // Poll Supabase for biometric_confirmed flag
  useEffect(() => {
    if (!activeDelivery || isLocalDemo || status !== 'waiting') return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('deliveries')
        .select('biometric_confirmed')
        .eq('id', activeDelivery.deliveryId)
        .single();
      if (data?.biometric_confirmed) {
        clearInterval(interval);
        setStatus('confirmed');
        setTimeout(async () => {
          const completed = completeActiveDelivery();
          if (completed) {
            if (!isLocalDemo) {
              await supabase
                .from('deliveries')
                .update({ status: 'delivered', otp_confirmed_at: new Date().toISOString() })
                .eq('id', completed.deliveryId);
              await supabase
                .from('orders')
                .update({ status: 'delivered' })
                .eq('id', completed.orderId);
            }
            router.replace({
              pathname: '/(rider)/delivery-complete',
              params: { orderId: completed.orderId, fee: String(completed.jobFee) },
            });
          }
        }, 1500);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeDelivery, completeActiveDelivery, isLocalDemo, router, status]);

  if (!activeDelivery) return <Redirect href="/(rider)/(tabs)/job-feed" />;

  // For demo/local: manually simulate confirmation
  const simulateConfirmed = () => {
    setStatus('confirmed');
    setTimeout(async () => {
      const completed = completeActiveDelivery();
      if (completed) {
        router.replace({
          pathname: '/(rider)/delivery-complete',
          params: { orderId: completed.orderId, fee: String(completed.jobFee) },
        });
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Biometric Confirmation</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.content}>
        {/* Animated biometric ring */}
        <View style={styles.biometricOuter}>
          <Animated.View
            style={[
              styles.biometricPulse,
              {
                transform: [{ scale: pulseAnim }],
                opacity: status === 'confirmed' ? 0 : 0.25,
              },
            ]}
          />
          <View
            style={[
              styles.biometricCircle,
              status === 'confirmed' && styles.biometricCircleConfirmed,
            ]}
          >
            <MaterialIcons
              name={status === 'confirmed' ? 'check-circle' : 'fingerprint'}
              size={64}
              color={status === 'confirmed' ? Colors.onPrimary : Colors.primary}
            />
          </View>
        </View>

        <Text style={styles.title}>
          {status === 'confirmed' ? 'Confirmed!' : 'Waiting for Customer'}
        </Text>
        <Text style={styles.subtitle}>
          {status === 'confirmed'
            ? 'Biometric verified. Completing delivery…'
            : `${activeDelivery.buyerName} is being prompted to verify via Face ID or Fingerprint.`}
        </Text>

        {status === 'waiting' && (
          <>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Awaiting biometric verification…</Text>
            </View>

            {/* Dev only — simulate the customer confirming */}
            <Pressable
              style={({ pressed }) => [styles.simulateButton, pressed && { opacity: 0.7 }]}
              onPress={simulateConfirmed}
            >
              <Text style={styles.simulateText}>Mark Customer Verified</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  iconButton: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.containerMargin,
    gap: Spacing.lg,
  },

  // Biometric animation
  biometricOuter: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  biometricPulse: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primary,
  },
  biometricCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
    ...Shadow.card,
  },
  biometricCircleConfirmed: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
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
    maxWidth: 280,
    lineHeight: 22,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
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

  simulateButton: {
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  simulateText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  switchLink: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.primary,
  },
});
