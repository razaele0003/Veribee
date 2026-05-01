import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useSellerStore } from '@/store/sellerStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const CATEGORIES = ['Electronics', 'Bags', 'Shoes', 'Jewelry', 'Other'];

function asString(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? '';
}

export default function EditProduct() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = asString(params.id);

  const products = useSellerStore((s) => s.products);
  const updateProduct = useSellerStore((s) => s.updateProduct);
  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);

  const [title, setTitle] = useState(product?.title ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [error, setError] = useState('');

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Product</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.empty}>
          <MaterialIcons name="info-outline" size={36} color={Colors.primary} />
          <Text style={styles.emptyTitle}>Product not editable</Text>
          <Text style={styles.emptyBody}>
            This is one of the demo products. Add a new product first to edit your own listings.
          </Text>
          <Button title="Back to Products" variant="outlined" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const save = async () => {
    if (!title.trim() || !category || !price.trim()) {
      setError('Title, category, and price are required.');
      return;
    }
    setError('');
    updateProduct(product.id, {
      title: title.trim(),
      category,
      price: price.trim(),
      description: description.trim(),
    });
    await supabase
      .from('products')
      .update({
        title: title.trim(),
        category,
        price: Number(price.trim()),
        description: description.trim(),
      })
      .eq('id', product.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Product Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="e.g. Series 9 Chronograph"
          placeholderTextColor={Colors.outline}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((option) => {
            const active = option === category;
            return (
              <Pressable
                key={option}
                onPress={() => setCategory(option)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Price (PHP)</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          style={styles.input}
          placeholder="0"
          keyboardType="numeric"
          placeholderTextColor={Colors.outline}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multiline]}
          placeholder="What makes this listing authentic?"
          placeholderTextColor={Colors.outline}
          multiline
          numberOfLines={4}
        />

        <Button title="Save Changes" onPress={save} />
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72 },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurface,
    marginTop: Spacing.sm,
  },
  input: {
    minHeight: 48,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    fontFamily: Fonts.manropeRegular,
    fontSize: 15,
    color: Colors.onSurface,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top', paddingTop: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    minHeight: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Type.labelCaps, color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },
  empty: {
    flex: 1,
    margin: Spacing.containerMargin,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
    ...Shadow.card,
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  emptyBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  errorText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
  },
});
