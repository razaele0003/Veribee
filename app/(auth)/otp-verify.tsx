import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    (_m, a, mid, c) => `${a} ${'•'.repeat(mid.length)}${c}`,
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
      Alert.alert('Verification failed', `Use ${LOCAL_OTP_CODE} for local testing.`);
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
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={{ fontSize: 32 }}>🔒</Text>
        </View>
        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code we sent to{'\n'}
          <Text style={styles.phone}>{maskPhone(phone)}</Text>
        </Text>

        <View style={styles.otpWrap}>
          <OTPInput value={code} onChange={setCode} />
        </View>

        <Pressable onPress={resend} disabled={secs > 0}>
          <Text style={styles.resend}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLow,
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
    fontSize: 13,
    marginTop: Spacing.base,
    marginBottom: Spacing.lg + 4,
  },
  actions: { alignSelf: 'stretch' },
});
