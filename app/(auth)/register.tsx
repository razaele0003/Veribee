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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { makeLocalUserId, toLocalPhone } from '@/lib/localAuth';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const schema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const setRoles = useAuthStore((s) => s.setRoles);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false as unknown as true,
    },
  });

  const terms = watch('terms');

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const fullPhone = toLocalPhone(values.phone);
    setUser(makeLocalUserId(fullPhone));
    setActiveRole(null);
    setRoles([]);
    setLoading(false);
    router.push({ pathname: '/(auth)/otp-verify', params: { phone: fullPhone } });
  };

  const onlyPhoneDigits = (value: string) =>
    value.replace(/\D/g, '').slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Veribee for a boutique delivery experience.</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Juan dela Cruz"
                  error={errors.fullName?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Phone Number"
                  prefix="+63"
                  value={value}
                  onChangeText={(text) => onChange(onlyPhoneDigits(text))}
                  placeholder="9171234567"
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={errors.phone?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange } }) => (
                <PasswordInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="At least 8 characters"
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { value, onChange } }) => (
                <PasswordInput
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Pressable
              style={styles.termsRow}
              onPress={() => setValue('terms', (!terms) as unknown as true, { shouldValidate: true })}
            >
              <View style={[styles.checkbox, terms && styles.checkboxChecked]}>
                {terms && <MaterialIcons name="check" size={14} color={Colors.onPrimary} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.link}>Terms</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </Pressable>
            {errors.terms?.message && (
              <Text style={styles.error}>{errors.terms.message}</Text>
            )}

            <Button title="CREATE ACCOUNT" onPress={handleSubmit(onSubmit)} loading={loading} />
          </View>

          <Pressable style={styles.footer} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.link}>Log In</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  back: { paddingVertical: Spacing.base, marginBottom: 4 },
  title: {
    ...Type.h3,
    color: Colors.primary,
    marginTop: Spacing.base,
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  form: { gap: Spacing.sm + 2 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Radii.sm,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurface,
    flex: 1,
  },
  link: { color: Colors.primary, fontFamily: Fonts.manropeBold },
  error: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: Fonts.manropeMedium,
  },
  footer: { marginTop: Spacing.lg, alignItems: 'center' },
  footerText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
});
