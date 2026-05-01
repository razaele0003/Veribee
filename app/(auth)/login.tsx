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
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import {
  findLocalAccount,
  findLocalAccountByPhone,
  toLocalPhoneDigits,
} from '@/lib/localAuth';
import { useAuthStore } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Type, Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';
import { Logo } from '@/components/ui/Logo';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/authOAuth';
import type { Role } from '@/store/authStore';

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
    router.replace('/(seller)/(tabs)/dashboard');
  };

  const onDevBuyerLogin = () => {
    setUser('local-buyer');
    setActiveRole('buyer');
    setRoles(['buyer']);
    router.replace('/(buyer)/(tabs)/home');
  };

  const onDevRiderLogin = () => {
    setUser('local-rider');
    setActiveRole('rider');
    setRoles(['rider']);
    router.replace('/(rider)/(tabs)/job-feed');
  };

  const handleLogin = async () => {
    let valid = true;
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    }
    if (!valid) return;

    setLoading(true);

    // Try local accounts first
    const localByPhone = findLocalAccountByPhone(phone);
    if (localByPhone) {
      const localById = findLocalAccount(phone, password);
      if (localById) {
        setUser(localById.id);
        setActiveRole(localById.role);
        setRoles([localById.role]);
        router.replace(
          localById.role === 'seller'
            ? '/(seller)/(tabs)/dashboard'
            : localById.role === 'rider'
              ? '/(rider)/(tabs)/job-feed'
              : '/(buyer)/(tabs)/home',
        );
        setLoading(false);
        return;
      }
      setPhoneError('Incorrect password');
      setLoading(false);
      return;
    }

    const email = `${phone}@veribee.ph`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setPhoneError(error?.message ?? 'Login failed');
      setLoading(false);
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id);

    const roles = (roleData ?? []).map((r: { role: string }) => r.role as Role);
    const primary = roles[0] ?? 'buyer';

    setUser(data.user.id);
    setRoles(roles);
    setActiveRole(primary);

    if (primary === 'seller') router.replace('/(seller)/(tabs)/dashboard');
    else if (primary === 'rider') router.replace('/(rider)/(tabs)/job-feed');
    else router.replace('/(buyer)/(tabs)/home');

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setPhoneError('');
    setPasswordError('');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setPhoneError(error?.message ?? 'Google sign in is not configured yet.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero banner ── */}
          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={styles.logoBadge}>
              <Logo size={58} />
            </View>
            <Text style={styles.heroTitle}>Welcome back</Text>
            <Text style={styles.heroSub}>Sign in to your Veribee account</Text>
          </View>

          {/* ── Form card ── */}
          <View style={styles.card}>
            {/* Inline error banner */}
            {(!!phoneError || !!passwordError) && (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={18} color={Colors.error} />
                <Text style={styles.errorText}>{phoneError || passwordError}</Text>
              </View>
            )}

            <Input
              label="Phone number"
              value={phone}
              onChangeText={setPhoneDigits}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="09XX XXX XXXX"
              error={phoneError}
            />

            <PasswordInput
              label="Password"
              value={password}
              onChangeText={(v) => { setPassword(v); setPasswordError(''); }}
              error={passwordError}
            />

            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              hitSlop={10}
              style={styles.forgotWrap}
            >
              <Text style={styles.forgot}>Forgot password?</Text>
            </Pressable>

            <Button
              title="Sign in"
              onPress={handleLogin}
              loading={loading}
              style={styles.signInBtn}
            />

            <Pressable
              onPress={handleGoogleLogin}
              style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <MaterialIcons name="account-circle" size={20} color={Colors.primary} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            {/* Dev shortcuts */}
            <View style={styles.devDivider}>
              <View style={styles.devLine} />
              <Text style={styles.devLabel}>DEV SHORTCUTS</Text>
              <View style={styles.devLine} />
            </View>

            <View style={styles.devRow}>
              <Pressable onPress={onDevBuyerLogin} style={styles.devChip}>
                <MaterialIcons name="shopping-bag" size={14} color={Colors.primary} />
                <Text style={styles.devChipText}>Buyer</Text>
              </Pressable>
              <Pressable onPress={onDevSellerLogin} style={styles.devChip}>
                <MaterialIcons name="storefront" size={14} color={Colors.primary} />
                <Text style={styles.devChipText}>Seller</Text>
              </Pressable>
              <Pressable onPress={onDevRiderLogin} style={styles.devChip}>
                <MaterialIcons name="two-wheeler" size={14} color={Colors.primary} />
                <Text style={styles.devChipText}>Rider</Text>
              </Pressable>
            </View>
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={10}>
              <Text style={styles.registerLink}> Sign up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1 },

  /* Hero */
  hero: {
    minHeight: 260,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.lg,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.primary,
    opacity: 0.15,
    top: -60,
    right: -60,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.42)',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 30,
    lineHeight: 36,
    color: Colors.onPrimary,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 15,
    color: Colors.onPrimaryContainer,
    opacity: 0.85,
  },

  /* Card */
  card: {
    marginHorizontal: Spacing.containerMargin,
    marginTop: -Radii.xl,
    borderRadius: Radii.card,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sheet,
  },

  /* Inline error banner */
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
    fontFamily: Fonts.manropeMedium,
    fontSize: 13,
    color: Colors.onErrorContainer,
    flex: 1,
  },

  forgotWrap: { alignSelf: 'flex-end' },
  forgot: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.primary,
  },

  signInBtn: { marginTop: Spacing.xs },
  googleButton: {
    minHeight: 48,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  googleButtonText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  pressed: { opacity: 0.72 },

  /* Dev shortcuts */
  devDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  devLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.outlineVariant },
  devLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.onSurfaceVariant,
  },
  devRow: { flexDirection: 'row', gap: Spacing.sm },
  devChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  devChipText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.primary,
  },

  /* Register link */
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  registerText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  registerLink: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.primary,
  },
});
