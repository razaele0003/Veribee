import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
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
      setError('No local test account uses this phone');
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
    Alert.alert('Password reset', 'Local password reset flow completed.', [
      { text: 'Log In', onPress: () => router.replace('/(auth)/login') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
          </Pressable>

          <View style={styles.iconCircle}>
            <MaterialIcons name="lock-reset" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Verify your local test phone, then choose a new password.
          </Text>

          {step === 'phone' && (
            <>
              <Input
                label="Phone Number"
                prefix="+63"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(value) => {
                  setPhone(toLocalPhoneDigits(value));
                  setError('');
                }}
                placeholder="9171234501"
                maxLength={10}
                error={error}
              />
              <Button title="Send OTP" onPress={onSendCode} />
            </>
          )}

          {step === 'otp' && (
            <>
              <Text style={styles.helper}>
                Enter the local reset code sent to +63{phone}.
              </Text>
              <OTPInput value={code} onChange={setCode} />
              {!!error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.testCode}>
                <Text style={styles.testCodeLabel}>Local Code</Text>
                <Text style={styles.testCodeValue}>{LOCAL_OTP_CODE}</Text>
              </View>
              <Button title="Verify OTP" onPress={onVerify} disabled={code.length !== 6} />
            </>
          )}

          {step === 'password' && (
            <>
              <PasswordInput
                label="New Password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setError('');
                }}
                placeholder="At least 8 characters"
              />
              <PasswordInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setError('');
                }}
                placeholder="Re-enter password"
                error={error}
              />
              <Button title="Save Password" onPress={onSave} />
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  title: { ...Type.h2, color: Colors.onSurface, textAlign: 'center' },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  helper: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  error: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
  },
  testCode: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    alignItems: 'center',
  },
  testCodeLabel: { ...Type.labelCaps, color: Colors.onSurfaceVariant },
  testCodeValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
});
