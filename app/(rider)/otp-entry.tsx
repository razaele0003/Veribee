import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import { isLocalUserId } from '@/lib/localAuth';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRiderStore } from '@/store/riderStore';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function RiderOtpEntry() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const completeActiveDelivery = useRiderStore((s) => s.completeActiveDelivery);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  if (!activeDelivery) return <Redirect href="/(rider)/(tabs)/job-feed" />;

  const onConfirm = async () => {
    if (otp !== activeDelivery.otpCode) {
      setOtp('');
      setAttempts((current) => current + 1);
      setError('Incorrect code. Ask the buyer to read the OTP again.');
      return;
    }

    const completed = completeActiveDelivery();
    if (completed) {
      if (!isLocalUserId(userId)) {
        await supabase
          .from('deliveries')
          .update({
            status: 'delivered',
            otp_confirmed_at: new Date().toISOString(),
          })
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
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header with back button ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>OTP Verification</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successBanner}>
          <MaterialIcons name="verified-user" size={28} color={Colors.onTertiaryContainer} />
          <Text style={styles.successText}>You have arrived. Verify buyer handover.</Text>
        </View>

        <View style={styles.iconCircle}>
          <MaterialIcons name="pin" size={48} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Enter buyer OTP</Text>
        <Text style={styles.subtitle}>
          Ask {activeDelivery.buyerName} for the six-digit code shown in their Veribee app.
        </Text>

        <View style={styles.otpWrap}>
          <OTPInput
            value={otp}
            onChange={(next) => {
              setOtp(next);
              setError('');
            }}
          />
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {attempts >= 3 && (
          <Button
            title="Contact Support"
            variant="outlined"
            onPress={() => Linking.openURL('tel:0280008374')}
          />
        )}

        <View style={styles.localHint}>
          <Text style={styles.localHintLabel}>Local Test Code</Text>
          <Text style={styles.localHintCode}>{activeDelivery.otpCode}</Text>
        </View>

        <Button title="Confirm Delivery" onPress={onConfirm} disabled={otp.length < 6} />

        {/* Switch to biometrics */}
        <Pressable
          onPress={() => router.replace('/(rider)/biometric-confirm')}
          hitSlop={12}
          style={({ pressed }) => [styles.switchRow, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Switch to biometric verification"
        >
          <MaterialIcons name="fingerprint" size={20} color={Colors.secondary} />
          <Text style={styles.switchText}>Switch to Biometrics instead</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
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
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.containerMargin,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  successBanner: {
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    backgroundColor: Colors.tertiaryContainer,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  successText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onTertiaryContainer,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  title: { ...Type.h2, color: Colors.onSurface, textAlign: 'center' },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 320,
  },
  otpWrap: { alignSelf: 'stretch' },
  localHint: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    alignItems: 'center',
    minWidth: 180,
  },
  localHintLabel: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
  },
  localHintCode: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  errorText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  switchText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.secondary,
  },
});
