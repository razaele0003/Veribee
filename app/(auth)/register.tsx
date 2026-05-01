import { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { OTPInput } from '@/components/ui/OTPInput';
import { makeLocalUserId, toLocalPhone, toLocalPhoneDigits, LOCAL_OTP_CODE } from '@/lib/localAuth';
import {
  captureIdImage,
  evaluateIdImages,
  type CapturedIdImage,
} from '@/lib/idVerification';
import { useAuthStore, Role } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
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
type Step = 1 | 2 | 3 | 4;

const ROLES: Array<{ id: Role; label: string; icon: keyof typeof MaterialIcons.glyphMap; desc: string }> = [
  { id: 'buyer', label: 'Customer', icon: 'shopping-bag', desc: 'Purchase premium artisan goods.' },
  { id: 'seller', label: 'Seller', icon: 'storefront', desc: 'Manage your inventory and shop.' },
  { id: 'rider', label: 'Rider', icon: 'delivery-dining', desc: 'Deliver products to customers.' },
];

const ID_TYPES = ['National ID', "Driver's License", 'Passport', 'Postal ID'];

export default function Register() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const setRoles = useAuthStore((s) => s.setRoles);
  
  const [step, setStep] = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Verification states
  const [otpCode, setOtpCode] = useState('');
  
  // ID Upload states
  const [selectedIdType, setSelectedIdType] = useState<string>(ID_TYPES[0]);
  const [frontImage, setFrontImage] = useState<CapturedIdImage | null>(null);
  const [backImage, setBackImage] = useState<CapturedIdImage | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [secs, setSecs] = useState(45);
  
  const [showWelcome, setShowWelcome] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
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

  useEffect(() => {
    if (step === 3 && secs > 0) {
      const t = setInterval(() => setSecs((s) => s - 1), 1000);
      return () => clearInterval(t);
    }
  }, [step, secs]);

  const onNextStep1 = async (values: FormValues) => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 500));
    setLoading(false);
    setStep(2);
  };

  const onNextStep2 = () => {
    if (selectedRole) setStep(3);
  };

  const onNextStep3 = async () => {
    if (otpCode !== LOCAL_OTP_CODE) {
      setOtpCode('');
      return;
    }
    
    if (selectedRole === 'seller' || selectedRole === 'rider') {
      setStep(4);
    } else {
      await finalizeRegistration();
    }
  };

  const finalizeRegistration = async () => {
    setLoading(true);
    const fullPhone = toLocalPhone(getValues('phone'));
    setUser(makeLocalUserId(fullPhone));
    setActiveRole(selectedRole);
    setRoles(selectedRole ? [selectedRole] : []);
    setLoading(false);
    setShowWelcome(true);
  };

  const finishWelcome = () => {
    setShowWelcome(false);
    if (selectedRole === 'buyer') router.replace('/(buyer)/(tabs)/home');
    else if (selectedRole === 'seller') router.replace('/(seller)/(tabs)/dashboard');
    else if (selectedRole === 'rider') router.replace('/(rider)/(tabs)/job-feed');
  };

  const onlyPhoneDigits = (value: string) => toLocalPhoneDigits(value);
  const isSellerOrRider = selectedRole === 'seller' || selectedRole === 'rider';
  
  // Total steps logic: 
  // If role isn't selected yet, we can't be sure, default to 3 or 4. 
  // Let's just use 4 if seller/rider, otherwise 3.
  const totalSteps = isSellerOrRider ? 4 : 3;
  const idCheck = evaluateIdImages(selectedIdType, frontImage, backImage);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Back */}
      <View style={styles.header}>
        <Pressable
          onPress={() => (step > 1 ? setStep((s) => (s - 1) as Step) : router.back())}
          hitSlop={12}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.stepIndicator}>Step {step} of {totalSteps}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Join Veribee for a trusted marketplace experience.</Text>
              
              <View style={styles.form}>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Full name"
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
                      label="Phone number"
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
                      label="Confirm password"
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
                    I agree to the <Text style={styles.link}>Terms</Text> and <Text style={styles.link}>Privacy Policy</Text>
                  </Text>
                </Pressable>
                {errors.terms?.message && <Text style={styles.error}>{errors.terms.message}</Text>}

                <Button title="Continue" onPress={handleSubmit(onNextStep1)} loading={loading} />
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Account Type</Text>
              <Text style={styles.subtitle}>Choose how you want to use Veribee.</Text>
              <View style={styles.rolesGrid}>
                {ROLES.map((r) => {
                  const isActive = selectedRole === r.id;
                  return (
                    <Pressable
                      key={r.id}
                      onPress={() => setSelectedRole(r.id)}
                      style={[styles.roleCard, isActive && styles.roleCardActive]}
                    >
                      <View style={[styles.roleIcon, isActive && styles.roleIconActive]}>
                        <MaterialIcons name={r.icon} size={28} color={isActive ? Colors.primary : Colors.onSurfaceVariant} />
                      </View>
                      <Text style={[styles.roleLabel, isActive && styles.roleLabelActive]}>{r.label}</Text>
                      <Text style={styles.roleDesc}>{r.desc}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Button title="Continue" onPress={onNextStep2} disabled={!selectedRole} />
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Verify Phone</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to +63 {getValues('phone')}.
              </Text>

              <View style={styles.otpWrap}>
                <OTPInput value={otpCode} onChange={setOtpCode} />
              </View>
              <Pressable onPress={() => setSecs(45)} disabled={secs > 0}>
                <Text style={[styles.resend, secs <= 0 && styles.resendActive]}>
                  {secs > 0 ? `Resend code in 00:${secs.toString().padStart(2, '0')}` : 'Resend code'}
                </Text>
              </Pressable>

              <Button
                title={isSellerOrRider ? "Continue" : "Complete Registration"}
                onPress={onNextStep3}
                disabled={otpCode.length !== 6}
                loading={loading}
              />
            </View>
          )}

          {step === 4 && isSellerOrRider && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Verify Identity</Text>
              <Text style={styles.subtitle}>
                As a {selectedRole}, you must provide a valid government ID to activate your account.
              </Text>

              <View style={styles.form}>
                <Text style={styles.idTypeLabel}>Choose ID Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.idTypeScroll}>
                  {ID_TYPES.map((type) => (
                    <Pressable 
                      key={type} 
                      style={[styles.idTypePill, selectedIdType === type && styles.idTypePillActive]}
                      onPress={() => setSelectedIdType(type)}
                    >
                      <Text style={[styles.idTypePillText, selectedIdType === type && styles.idTypePillTextActive]}>{type}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={styles.uploadRow}>
                  <Pressable 
                    style={[styles.uploadBoxHalf, frontImage && styles.uploadBoxSuccess]} 
                    onPress={async () => setFrontImage(await captureIdImage())}
                  >
                    <MaterialIcons 
                      name={frontImage ? "check-circle" : "add-photo-alternate"} 
                      size={28} 
                      color={frontImage ? Colors.primary : Colors.onSurfaceVariant} 
                    />
                    <Text style={[styles.uploadBoxText, frontImage && styles.uploadBoxTextSuccess]}>
                      {frontImage ? "Front Captured" : "Upload Front"}
                    </Text>
                  </Pressable>

                  <Pressable 
                    style={[styles.uploadBoxHalf, backImage && styles.uploadBoxSuccess]} 
                    onPress={async () => setBackImage(await captureIdImage())}
                  >
                    <MaterialIcons 
                      name={backImage ? "check-circle" : "add-photo-alternate"} 
                      size={28} 
                      color={backImage ? Colors.primary : Colors.onSurfaceVariant} 
                    />
                    <Text style={[styles.uploadBoxText, backImage && styles.uploadBoxTextSuccess]}>
                      {backImage ? "Back Captured" : "Upload Back"}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.localCheckCard}>
                  <MaterialIcons name="manage-search" size={18} color={Colors.primary} />
                  <View style={styles.localCheckCopy}>
                    <Text style={styles.localCheckTitle}>Free local ID pre-check: {idCheck.score}/100</Text>
                    <Text style={styles.localCheckBody}>
                      {idCheck.status === 'ready_for_review'
                        ? 'Images are ready for manual KYC review.'
                        : 'Capture both ID sides before review.'}
                    </Text>
                  </View>
                </View>

                <Button
                  title="Complete Registration"
                  onPress={finalizeRegistration}
                  disabled={idCheck.status !== 'ready_for_review'}
                  loading={loading}
                  style={{marginTop: Spacing.md}}
                />
              </View>
            </View>
          )}

          {step === 1 && (
            <Pressable style={styles.footer} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.link}>Log in</Text>
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showWelcome} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="verified" size={72} color={Colors.primary} style={{ marginBottom: Spacing.md }} />
            <Text style={styles.modalTitle}>Welcome to Veribee!</Text>
            <Text style={styles.modalBody}>
              Your {selectedRole} account has been successfully created. We're excited to have you on board!
            </Text>
            <Button title="Get Started" onPress={finishWelcome} style={{ width: '100%', marginTop: Spacing.lg }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  stepContainer: {
    gap: Spacing.base,
    flex: 1,
  },
  title: {
    ...Type.h2,
    color: Colors.primary,
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  rolesGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  roleCard: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.card,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFixed,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  roleIconActive: {
    backgroundColor: Colors.surfaceContainerLowest,
  },
  roleLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  roleLabelActive: {
    color: Colors.primary,
  },
  roleDesc: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  form: { gap: Spacing.md + 2 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
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
    ...Type.bodySm,
    color: Colors.onSurface,
    flex: 1,
  },
  link: { color: Colors.primary, fontFamily: Fonts.manropeBold },
  error: {
    ...Type.bodySm,
    color: Colors.error,
  },
  footer: { marginTop: Spacing.lg, alignItems: 'center' },
  footerText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  otpWrap: { marginBottom: Spacing.md, alignItems: 'center' },
  resend: {
    fontFamily: Fonts.manropeMedium,
    color: Colors.onSurfaceVariant,
    fontSize: 14,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  resendActive: {
    color: Colors.primary,
    fontFamily: Fonts.manropeBold,
  },
  idTypeLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  idTypeScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  idTypePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  idTypePillActive: {
    backgroundColor: Colors.primaryFixed,
    borderColor: Colors.primary,
  },
  idTypePillText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  idTypePillTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.manropeBold,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  uploadBoxHalf: {
    flex: 1,
    height: 120,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  uploadBoxSuccess: {
    backgroundColor: Colors.primaryFixed,
    borderColor: Colors.primary,
    borderStyle: 'solid',
  },
  uploadBoxText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  uploadBoxTextSuccess: {
    color: Colors.primary,
  },
  localCheckCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  localCheckCopy: { flex: 1 },
  localCheckTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  localCheckBody: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    ...Shadow.card,
  },
  modalTitle: {
    ...Type.h3,
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalBody: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
