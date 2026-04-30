import { useState } from 'react';
import {
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
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import {
  findLocalAccount,
  findLocalAccountByPhone,
  toLocalPhoneDigits,
} from '@/lib/localAuth';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/colors';
import { Type, Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Logo } from '@/components/ui/Logo';

export default function Login() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const setRoles = useAuthStore((s) => s.setRoles);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const setPhoneDigits = (value: string) => {
    setPhone(toLocalPhoneDigits(value));
    setPhoneError('');
  };

  const onDevSellerLogin = () => {
    setUser('local-seller');
    setActiveRole('seller');
    setRoles(['seller']);
    router.replace('/(seller)/dashboard');
  };

  const onDevBuyerLogin = () => {
    setUser('local-buyer');
    setActiveRole('buyer');
    setRoles(['buyer']);
    router.replace('/(buyer)/home');
  };

  const onDevRiderLogin = () => {
    setUser('local-rider');
    setActiveRole('rider');
    setRoles(['rider']);
    router.replace('/(rider)/job-feed');
  };

  const onLogin = async () => {
    setPhoneError('');
    setPasswordError('');

    if (!phone) {
      setPhoneError('Phone number is required');
    } else if (phone.length !== 10) {
      setPhoneError('Phone must be 10 digits');
    }

    if (!password) {
      setPasswordError('Password is required');
    }

    if (!phone || phone.length !== 10 || !password) {
      return;
    }

    const knownAccount = findLocalAccountByPhone(phone);
    const account = findLocalAccount(phone, password);
    if (!knownAccount || !account) {
      setPasswordError('Invalid credentials');
      return;
    }

    setLoading(true);
    setUser(account.id);
    setRoles([account.role]);
    setActiveRole(account.role);
    setLoading(false);

    if (account.role === 'seller') {
      router.replace('/(seller)/dashboard');
    } else if (account.role === 'buyer') {
      router.replace('/(buyer)/home');
    } else if (account.role === 'rider') {
      router.replace('/(rider)/job-feed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoWrap}>
            <Logo size={64} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to keep buzzing with trust.</Text>

          <View style={styles.form}>
            <Input
              label="Phone Number"
              prefix="+63"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhoneDigits}
              placeholder="9171234567"
              maxLength={10}
              error={phoneError}
            />
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setPasswordError('');
              }}
              placeholder="********"
              error={passwordError}
            />
            <Pressable
              style={styles.forgot}
              hitSlop={8}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <Button title="Login" onPress={onLogin} loading={loading} />
            {__DEV__ && (
              <>
                <Button
                  title="Use Test Buyer"
                  variant="outlined"
                  onPress={onDevBuyerLogin}
                />
                <Button
                  title="Use Test Seller"
                  variant="outlined"
                  onPress={onDevSellerLogin}
                />
                <Button
                  title="Use Test Rider"
                  variant="outlined"
                  onPress={onDevRiderLogin}
                />
              </>
            )}
          </View>

          <Pressable
            style={styles.footer}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.footerLink}>Sign Up</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.containerMargin, paddingTop: 40, gap: 8 },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.md },
  title: {
    ...Type.h2,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  form: { gap: Spacing.md },
  forgot: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.primary,
  },
  footer: { marginTop: Spacing.lg, alignItems: 'center' },
  footerText: { fontFamily: Fonts.manropeRegular, fontSize: 14, color: Colors.onSurfaceVariant },
  footerLink: { fontFamily: Fonts.manropeBold, color: Colors.primary },
});
