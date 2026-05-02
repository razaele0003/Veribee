import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { OTPInput } from '@/components/ui/OTPInput';
import {
  LOCAL_OTP_CODE,
  findLocalAccountByPhone,
  toLocalPhoneDigits,
} from '@/lib/localAuth';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const onSendCode = () => {
    const normalized = toLocalPhoneDigits(phone);
    setPhone(normalized);
    if (normalized.length !== 10) {
      setError('Phone must be 10 digits');
      return;
    }
    if (!findLocalAccountByPhone(normalized)) {
      setError('No account found with this phone number');
      return;
    }
    setError('');
    setStep('otp');
  };

  const onVerify = () => {
    if (code !== LOCAL_OTP_CODE) {
      setCode('');
      setError(`Use ${LOCAL_OTP_CODE} for local testing`);
      return;
    }
    setError('');
    setStep('password');
  };

  const onSave = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    Alert.alert('Password reset', 'Your password has been updated.', [
      { text: 'Log in', onPress: () => router.replace('/(auth)/login') },
    ]);
  };

  const stepTitles: Record<typeof step, { title: string; subtitle: string }> = {
    phone: {
      title: 'Reset password',
      subtitle: 'Enter your phone number and we\'ll send a verification code.',
    },
    otp: {
      title: 'Enter the code',
      subtitle: `Enter the 6-digit code sent to +63${phone}.`,
    },
    password: {
      title: 'New password',
      subtitle: 'Choose a strong password for your account.',
    },
  };

  const { title, subtitle } = stepTitles[step];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </Pressable>

          {/* Icon */}
          <View style={styles.iconCircle}>
            <MaterialIcons name="lock-reset" size={40} color={Colors.primary} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {!!error && (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 'phone' && (
            <>
              <Input
                label="Phone number"
                prefix="+63"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(value) => {
                  setPhone(toLocalPhoneDigits(value));
                  setError('');
                }}
                placeholder="9171234501"
                maxLength={10}
              />
              <Button title="Send code" onPress={onSendCode} />
            </>
          )}

          {step === 'otp' && (
            <>
              <OTPInput value={code} onChange={setCode} />
              <View style={styles.testCode}>
                <Text style={styles.testCodeLabel}>Local test code</Text>
                <Text style={styles.testCodeValue}>{LOCAL_OTP_CODE}</Text>
              </View>
              <Button title="Verify code" onPress={onVerify} disabled={code.length !== 6} />
            </>
          )}

          {step === 'password' && (
            <>
              <PasswordInput
                label="New password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setError('');
                }}
                placeholder="At least 8 characters"
              />
              <PasswordInput
                label="Confirm password"
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setError('');
                }}
                placeholder="Re-enter password"
              />
              <Button title="Save password" onPress={onSave} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: {
    flexGrow: 1,
    padding: Spacing.containerMargin,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: Radii.card,
    backgroundColor: Colors.primaryFixed,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Type.h2,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.errorContainer,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    ...Type.bodySm,
    color: Colors.onErrorContainer,
    flex: 1,
  },
  testCode: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    alignItems: 'center',
  },
  testCodeLabel: {
    ...Type.labelMd,
    color: Colors.onSurfaceVariant,
  },
  testCodeValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
});
