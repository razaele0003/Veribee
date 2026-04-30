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
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { useAuthStore, Role } from '@/store/authStore';
import { Colors } from '@/constants/colors';
import { Type, Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Logo } from '@/components/ui/Logo';

export default function Login() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Missing info', 'Enter your phone and password.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: `+63${phone}`,
      password,
    });
    setLoading(false);
    if (error || !data.user) {
      Alert.alert('Login failed', error?.message ?? 'Try again.');
      return;
    }
    setUser(data.user.id);
    const { data: profile } = await supabase
      .from('users')
      .select('active_role')
      .eq('id', data.user.id)
      .maybeSingle();
    const role = profile?.active_role as Role | null;
    if (role === 'seller') {
      setActiveRole(role);
      router.replace('/(seller)/dashboard');
    } else {
      router.replace('/(auth)/role-select');
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
              onChangeText={setPhone}
              placeholder="9171234567"
            />
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
            />
            <Pressable style={styles.forgot} hitSlop={8}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <Button title="Login" onPress={onLogin} loading={loading} />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>or</Text>
              <View style={styles.line} />
            </View>

            <Button
              title="Continue with Google"
              variant="outlined"
              onPress={() => Alert.alert('Coming soon', 'Google sign-in is not wired up yet.')}
            />
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.outlineVariant },
  or: { fontFamily: Fonts.manropeRegular, color: Colors.onSurfaceVariant, fontSize: 12 },
  footer: { marginTop: Spacing.lg, alignItems: 'center' },
  footerText: { fontFamily: Fonts.manropeRegular, fontSize: 14, color: Colors.onSurfaceVariant },
  footerLink: { fontFamily: Fonts.manropeBold, color: Colors.primary },
});

