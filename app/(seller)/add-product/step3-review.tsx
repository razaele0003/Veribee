import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useSellerStore } from '@/store/sellerStore';
import { resolveImageSource } from '@/constants/productImages';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const evidenceLabels = ['Box', 'Serial', 'Labels', 'Full'];

function formatPrice(price: string) {
  const value = Number(price || 0);
  return `PHP ${Math.round(value).toLocaleString('en-PH')}`;
}

function maskSerial(value: string) {
  if (value.length <= 4) return value || 'Not provided';
  return `${value.slice(0, 2)}-${'X'.repeat(Math.max(value.length - 6, 4))}-${value.slice(-4)}`;
}

export default function AddProductStep3() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const draft = useSellerStore((s) => s.productDraft);
  const addProductFromDraft = useSellerStore((s) => s.addProductFromDraft);

  const submit = async () => {
    const product = addProductFromDraft();
    if (userId) {
      await supabase.from('products').insert({
        id: product.id,
        seller_id: userId,
        title: product.title,
        category: product.category,
        price: Number(product.price || 0),
        description: product.description,
        serial_number: product.serialNumber,
        brand: product.brand,
        model: product.model,
        images: product.photos,
        auth_status: product.authStatus,
        auth_score: product.authScore,
      });
    }
    router.replace(`/(seller)/auth-status/${product.id}`);
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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator current={3} total={3} label="Review & Publish" />

        <ReviewCard
          title="Product Info"
          onEdit={() => router.push('/(seller)/add-product/step1-basic')}
        >
          <View style={styles.photoRow}>
            {draft.photos.slice(0, 3).map((photo) => (
              <Image key={String(photo)} source={resolveImageSource(photo)} style={styles.photoThumb} />
            ))}
            {draft.photos.length === 0 && <EmptyThumb label="Photo" />}
          </View>
          <Text style={styles.primaryText}>{draft.title || 'Untitled product'}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.mutedText}>{draft.category || 'No category'}</Text>
            <Text style={styles.priceText}>{formatPrice(draft.price)}</Text>
          </View>
        </ReviewCard>

        <ReviewCard
          title="Authentication Info"
          onEdit={() => router.push('/(seller)/add-product/step2-auth')}
        >
          <View style={styles.authGrid}>
            <InfoCell label="Brand" value={draft.brand || 'Not selected'} />
            <InfoCell label="Serial Number" value={maskSerial(draft.serialNumber)} />
            <InfoCell label="Model" value={draft.model || 'Not provided'} wide />
          </View>
        </ReviewCard>

        <ReviewCard
          title="Evidence Photos"
          onEdit={() => router.push('/(seller)/add-product/step2-auth')}
        >
          <View style={styles.evidenceRow}>
            {evidenceLabels.map((label, index) => {
              const uri = draft.evidencePhotos[index];
              return (
                <View key={label} style={styles.evidenceThumb}>
                  {uri ? (
                    <Image source={resolveImageSource(uri)} style={styles.evidenceImage} />
                  ) : (
                    <MaterialIcons
                      name="image"
                      size={22}
                      color={Colors.onSurfaceVariant}
                    />
                  )}
                  <View style={styles.evidenceLabel}>
                    <Text style={styles.evidenceLabelText}>{label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ReviewCard>

        <View style={styles.infoBanner}>
          <MaterialIcons name="info" size={22} color={Colors.tertiary} />
          <Text style={styles.infoText}>
            Your product will go live after Veribee verifies your submission within 24 hours.
          </Text>
        </View>

        <Button title="SUBMIT & PUBLISH LISTING" onPress={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Pressable onPress={onEdit} hitSlop={10}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function InfoCell({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.infoCell, wide && styles.infoCellWide]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function EmptyThumb({ label }: { label: string }) {
  return (
    <View style={styles.emptyThumb}>
      <MaterialIcons name="image" size={22} color={Colors.onSurfaceVariant} />
      <Text style={styles.emptyThumbText}>{label}</Text>
    </View>
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
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  editText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.primary,
  },
  photoRow: { flexDirection: 'row', gap: Spacing.sm },
  photoThumb: {
    width: 78,
    height: 78,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
  },
  emptyThumb: {
    width: 78,
    height: 78,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  emptyThumbText: {
    ...Type.labelCaps,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
  },
  primaryText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  mutedText: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  priceText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.primary,
  },
  authGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  infoCell: { width: '47%', gap: Spacing.xs },
  infoCellWide: { width: '100%' },
  infoLabel: { ...Type.labelCaps, color: Colors.onSurfaceVariant, fontSize: 10 },
  infoValue: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 14,
    color: Colors.onSurface,
  },
  evidenceRow: { flexDirection: 'row', gap: Spacing.sm },
  evidenceThumb: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  evidenceImage: { width: '100%', height: '100%' },
  evidenceLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.inverseSurface,
    paddingVertical: 2,
  },
  evidenceLabelText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 8,
    color: Colors.inverseOnSurface,
    textAlign: 'center',
  },
  infoBanner: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.tertiaryFixed,
    borderWidth: 1,
    borderColor: Colors.tertiaryFixedDim,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onTertiaryFixedVariant,
  },
});
