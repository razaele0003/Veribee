import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { EvidenceUploader } from '@/components/seller/EvidenceUploader';
import { useSellerStore } from '@/store/sellerStore';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const categories = ['Electronics', 'Bags', 'Shoes', 'Clothes', 'Jewelry', 'Other'];

const schema = z.object({
  title: z.string().min(2, 'Enter the product name'),
  category: z.string().min(1, 'Select a category'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price'),
  description: z.string().min(10, 'Add a short description'),
});

type FormValues = z.infer<typeof schema>;

export default function AddProductStep1() {
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
      title: draft.title,
      category: draft.category,
      price: draft.price,
      description: draft.description,
    },
  });

  const selectedCategory = watch('category');

  const addPhoto = async () => {
    if (draft.photos.length >= 8) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to add product images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 8 - draft.photos.length,
    });

    if (result.canceled) return;
    const selected = result.assets.map((asset) => asset.uri);
    updateDraft({ photos: [...draft.photos, ...selected].slice(0, 8) });
  };

  const submit = (values: FormValues) => {
    updateDraft(values);
    router.push('/(seller)/add-product/step2-auth');
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
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={styles.backButton} />
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
          <StepIndicator current={1} total={3} label="Basic Info" />

          <EvidenceUploader photos={draft.photos} onAdd={addPhoto} />

          <View style={styles.form}>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Product Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Vintage Leather Satchel"
                  error={errors.title?.message}
                />
              )}
            />

            <View>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <Pressable
                      key={category}
                      onPress={() =>
                        setValue('category', category, { shouldValidate: true })
                      }
                      style={[
                        styles.categoryChip,
                        isActive && styles.categoryChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isActive && styles.categoryTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {!!errors.category?.message && (
                <Text style={styles.error}>{errors.category.message}</Text>
              )}
            </View>

            <Controller
              control={control}
              name="price"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Price"
                  prefix="PHP"
                  value={value}
                  onChangeText={(text) =>
                    onChange(text.replace(/[^\d.]/g, ''))
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  error={errors.price?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Description"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Describe condition, features, and brand"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  error={errors.description?.message}
                  style={styles.textarea}
                />
              )}
            />
          </View>

          <Button
            title="NEXT: AUTHENTICATION INFO"
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
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72 },
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.primary,
  },
  keyboard: { flex: 1 },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  form: { gap: Spacing.lg },
  fieldLabel: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  categoryChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFixed,
  },
  categoryText: {
    fontFamily: Fonts.manropeBold,
    color: Colors.onSurfaceVariant,
  },
  categoryTextActive: { color: Colors.primary },
  error: {
    color: Colors.error,
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  textarea: {
    minHeight: 112,
  },
});
