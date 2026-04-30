import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useSellerStore } from '@/store/sellerStore';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const brands = ['Chanel', 'Rolex', 'Hermes', 'Apple', 'Nike', 'Other'];
const evidenceLabels = [
  'Box/Packaging',
  'Serial Number Closeup',
  'Brand Labels',
  'Full Product View',
];

const schema = z.object({
  serialNumber: z.string().min(3, 'Enter the serial number'),
  brand: z.string().min(1, 'Select a brand'),
  model: z.string().min(2, 'Enter the model'),
});

type FormValues = z.infer<typeof schema>;

export default function AddProductStep2() {
  const router = useRouter();
  const draft = useSellerStore((s) => s.productDraft);
  const updateDraft = useSellerStore((s) => s.updateProductDraft);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serialNumber: draft.serialNumber,
      brand: draft.brand,
      model: draft.model,
    },
  });

  const selectedBrand = watch('brand');

  const pickEvidence = async (index: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to add evidence images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: false,
    });

    if (result.canceled) return;
    const next = [...draft.evidencePhotos];
    next[index] = result.assets[0].uri;
    updateDraft({ evidencePhotos: next });
  };

  const scanSerial = () => {
    Alert.alert('Barcode scanner', 'Scanner modal comes next; entering a sample serial.');
    setValue('serialNumber', 'VB-AUTH-2026-001', { shouldValidate: true });
  };

  const submit = (values: FormValues) => {
    updateDraft(values);
    router.push('/(seller)/add-product/step3-review');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Product Authentication</Text>
        <Text style={styles.headerStep}>2 of 3</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepIndicator current={2} total={3} label="Authentication" />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authentication Details</Text>
            <Controller
              control={control}
              name="serialNumber"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Serial Number"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter or scan"
                  error={errors.serialNumber?.message}
                  rightAccessory={
                    <Pressable onPress={scanSerial} hitSlop={10}>
                      <MaterialIcons
                        name="qr-code-scanner"
                        size={24}
                        color={Colors.primary}
                      />
                    </Pressable>
                  }
                />
              )}
            />

            <View>
              <Text style={styles.fieldLabel}>Brand</Text>
              <View style={styles.chips}>
                {brands.map((brand) => {
                  const isActive = selectedBrand === brand;
                  return (
                    <Pressable
                      key={brand}
                      onPress={() => setValue('brand', brand, { shouldValidate: true })}
                      style={[styles.chip, isActive && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {brand}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {!!errors.brand?.message && (
                <Text style={styles.error}>{errors.brand.message}</Text>
              )}
            </View>

            <Controller
              control={control}
              name="model"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Model"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter model number"
                  error={errors.model?.message}
                />
              )}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authentication Evidence</Text>
            <View style={styles.evidenceGrid}>
              {evidenceLabels.map((label, index) => (
                <Pressable
                  key={label}
                  onPress={() => pickEvidence(index)}
                  style={styles.evidenceSlot}
                >
                  {draft.evidencePhotos[index] ? (
                    <Image
                      source={{ uri: draft.evidencePhotos[index] }}
                      style={styles.evidenceImage}
                    />
                  ) : (
                    <>
                      <View style={styles.addCircle}>
                        <MaterialIcons name="add" size={22} color={Colors.primary} />
                      </View>
                      <Text style={styles.evidenceLabel}>{label}</Text>
                    </>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.infoBanner}>
            <MaterialIcons name="info" size={22} color={Colors.onTertiary} />
            <Text style={styles.infoText}>
              Your product will be reviewed within 24 hours.
            </Text>
          </View>

          <Button
            title="SUBMIT FOR VERIFICATION"
            onPress={handleSubmit(submit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72 },
  headerTitle: {
    flex: 1,
    fontFamily: Fonts.epilogueBold,
    fontSize: 17,
    color: Colors.primary,
    textAlign: 'center',
  },
  headerStep: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.primary,
  },
  keyboard: { flex: 1 },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  section: { gap: Spacing.md },
  sectionTitle: { ...Type.h3, color: Colors.onSurface },
  fieldLabel: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFixed,
  },
  chipText: {
    fontFamily: Fonts.manropeBold,
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: { color: Colors.primary },
  error: {
    color: Colors.error,
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  evidenceSlot: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    overflow: 'hidden',
  },
  evidenceImage: { width: '100%', height: '100%' },
  addCircle: {
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  evidenceLabel: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  infoBanner: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.tertiaryContainer,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    ...Type.bodyMd,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onTertiary,
  },
});
