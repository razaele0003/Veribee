import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import { LOCAL_OTP_CODE } from '@/lib/localAuth';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

function maskPhone(p?: string) {
  if (!p) return '';
  return p.replace(
    /(\+\d{2})(\d+)(\d{2})/,
    (_m, a, mid, c) => `${a} ${'*'.repeat(mid.length)}${c}`,
  );
}

export default function OtpVerify() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [code, setCode] = useState('');
  const [secs, setSecs] = useState(45);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secs]);

  const verify = async () => {
    if (code.length !== 6 || !phone) return;
    setLoading(true);
    setLoading(false);
    if (code !== LOCAL_OTP_CODE) {
      // inline error instead of Alert
      setCode('');
      return;
    }
    router.replace('/(auth)/role-select');
  };

  const resend = async () => {
    if (secs > 0 || !phone) return;
    setSecs(45);
  };

  const mins = Math.floor(secs / 60);
  const rem = (secs % 60).toString().padStart(2, '0');

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
      </Pressable>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.icon}>
          <MaterialIcons name="lock" size={32} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code we sent to{'\n'}
          <Text style={styles.phone}>{maskPhone(phone)}</Text>
        </Text>

        <View style={styles.otpWrap}>
          <OTPInput value={code} onChange={setCode} />
        </View>

        {/* Resend */}
        <Pressable onPress={resend} disabled={secs > 0}>
          <Text style={[styles.resend, secs <= 0 && styles.resendActive]}>
            {secs > 0 ? `Resend code in ${mins}:${rem}` : 'Resend code'}
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <Button
            title="Verify"
            onPress={verify}
            disabled={code.length !== 6}
            loading={loading}
          />
        </View>

        {/* Back to login */}
        <Pressable style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.loginLinkText}>Back to login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.containerMargin,
    marginTop: Spacing.md,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.section,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: Radii.card,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Type.h3,
    color: Colors.onSurface,
    marginBottom: Spacing.base,
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  phone: { color: Colors.onSurface, fontFamily: Fonts.manropeBold },
  otpWrap: { marginBottom: Spacing.lg },
  resend: {
    fontFamily: Fonts.manropeMedium,
    color: Colors.onSurfaceVariant,
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  resendActive: {
    color: Colors.primary,
    fontFamily: Fonts.manropeBold,
  },
  actions: { alignSelf: 'stretch' },
  loginLink: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  loginLinkText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
});
