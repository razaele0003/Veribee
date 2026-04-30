import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import { useRiderStore } from '@/store/riderStore';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';
import { useState } from 'react';

export default function RiderOtpEntry() {
  const router = useRouter();
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const completeActiveDelivery = useRiderStore((s) => s.completeActiveDelivery);
  const [otp, setOtp] = useState('');

  if (!activeDelivery) {
    router.replace('/(rider)/job-feed');
    return null;
  }

  const onConfirm = () => {
    if (otp !== activeDelivery.otpCode) {
      Alert.alert('Invalid OTP', `For local testing, enter ${activeDelivery.otpCode}.`);
      return;
    }

    const completed = completeActiveDelivery();
    if (completed) {
      router.replace({
        pathname: '/(rider)/delivery-complete',
        params: { orderId: completed.orderId, fee: String(completed.jobFee) },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successBanner}>
          <MaterialIcons name="verified-user" size={28} color={Colors.onTertiary} />
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
          <OTPInput value={otp} onChange={setOtp} />
        </View>

        <View style={styles.localHint}>
          <Text style={styles.localHintLabel}>Local Test Code</Text>
          <Text style={styles.localHintCode}>{activeDelivery.otpCode}</Text>
        </View>

        <Button title="Confirm Delivery" onPress={onConfirm} disabled={otp.length < 6} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
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
    color: Colors.onTertiary,
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
});
