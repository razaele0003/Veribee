import { Alert, Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { AuthScoreCircle } from '@/components/ui/AuthScoreCircle';
import { LocalProduct, useSellerStore } from '@/store/sellerStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type CheckRow = {
  label: string;
  passed: boolean;
};

const fallbackProduct: LocalProduct = {
  id: 'local-product',
  photos: [],
  title: 'Vintage Leather Satchel',
  category: 'Bags',
  price: '4200',
  description: '',
  serialNumber: 'VB-AUTH-2026-001',
  brand: 'Other',
  model: 'Classic Satchel',
  evidencePhotos: [],
  submittedAt: new Date().toISOString(),
  authStatus: 'verified',
  authScore: 96,
};

function asString(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function checklistFor(status: LocalProduct['authStatus']): CheckRow[] {
  if (status === 'failed') {
    return [
      { label: 'Serial Number Verified', passed: false },
      { label: 'Brand Database Match', passed: false },
      { label: 'Photo Analysis Passed', passed: true },
      { label: 'KYC Check Completed', passed: true },
    ];
  }

  return [
    { label: 'Serial Number Verified', passed: true },
    { label: 'Brand Database Match', passed: true },
    { label: 'Photo Analysis Passed', passed: true },
    { label: 'KYC Check Completed', passed: true },
  ];
}

export default function AuthStatus() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; result?: string }>();
  const id = asString(params.id);
  const result = asString(params.result);
  const products = useSellerStore((s) => s.products);
  const removeProduct = useSellerStore((s) => s.removeProduct);
  const storedProduct = products.find((product) => product.id === id);
  const inferredStatus =
    result === 'failed' || id?.includes('failed') ? 'failed' : 'verified';
  const product: LocalProduct = storedProduct ?? {
    ...fallbackProduct,
    id: id ?? fallbackProduct.id,
    authStatus: inferredStatus,
    authScore: inferredStatus === 'verified' ? 96 : 42,
    reviewerNotes:
      inferredStatus === 'failed'
        ? 'The serial number provided does not match the submitted brand. Please verify and resubmit.'
        : undefined,
  };
  const isPassed = product.authStatus === 'verified';
  const checks = checklistFor(product.authStatus);
  const heroIcon = isPassed ? 'check-circle' : 'cancel';
  const heroTitle = isPassed ? 'Authentication Passed' : 'Authentication Failed';
  const heroBody = isPassed
    ? 'Your product is now ready for buyers on Veribee.'
    : 'Your product did not pass verification.';

  const removeListing = () => {
    removeProduct(product.id);
    router.replace('/(seller)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace('/(seller)/dashboard')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
        >
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Verification Status</Text>
        <Pressable
          onPress={() => Alert.alert('Options', 'More listing actions come next.')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <MaterialIcons name="more-vert" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.thumbnail}>
            {product.photos[0] ? (
              <Image source={{ uri: product.photos[0] }} style={styles.image} />
            ) : (
              <MaterialIcons name="inventory-2" size={28} color={Colors.primary} />
            )}
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.productTitle}>{product.title || 'Untitled product'}</Text>
            <Text style={styles.submitted}>Submitted {formatDate(product.submittedAt)}</Text>
          </View>
        </View>

        <View style={[styles.hero, isPassed ? styles.heroPass : styles.heroFail]}>
          <View style={styles.heroIcon}>
            <MaterialIcons
              name={heroIcon}
              size={42}
              color={isPassed ? Colors.onSecondaryContainer : Colors.onErrorContainer}
            />
          </View>
          <Text style={[styles.heroTitle, isPassed ? styles.passText : styles.failText]}>
            {heroTitle}
          </Text>
          <Text style={[styles.heroBody, isPassed ? styles.passText : styles.failText]}>
            {heroBody}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.scoreWrap}>
            <AuthScoreCircle score={product.authScore} tone={isPassed ? 'pass' : 'fail'} />
          </View>
          <View style={styles.checks}>
            {checks.map((check, index) => (
              <View key={check.label}>
                <View style={styles.checkRow}>
                  <MaterialIcons
                    name={check.passed ? 'check-circle' : 'cancel'}
                    size={22}
                    color={check.passed ? Colors.primary : Colors.error}
                  />
                  <Text
                    style={[
                      styles.checkText,
                      !check.passed && styles.failedCheckText,
                    ]}
                  >
                    {check.label}
                  </Text>
                </View>
                {index < checks.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {!isPassed && (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <MaterialIcons name="edit-note" size={22} color={Colors.onSurfaceVariant} />
              <Text style={styles.notesTitle}>Reviewer Notes</Text>
            </View>
            <Text style={styles.notesText}>
              {product.reviewerNotes ??
                'Please update the submitted evidence and resubmit for review.'}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {isPassed ? (
            <>
              <Button
                title="View Live Listing"
                variant="outlined"
                onPress={() => router.replace('/(seller)/products')}
              />
              <Button
                title="Share Listing"
                onPress={() =>
                  Share.share({
                    title: product.title || 'Veribee listing',
                    message: `${product.title || 'This listing'} is Veribee verified with auth score ${product.authScore}.`,
                  })
                }
              />
            </>
          ) : (
            <>
              <Button title="Remove Listing" variant="outlined" onPress={removeListing} />
              <Button
                title="Resubmit"
                onPress={() => router.replace('/(seller)/add-product/step1-basic')}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
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
  summaryCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  summaryText: { flex: 1, gap: Spacing.xs },
  productTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  submitted: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  hero: {
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroPass: { backgroundColor: Colors.secondaryContainer },
  heroFail: { backgroundColor: Colors.errorContainer },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...Type.h3,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  heroBody: {
    ...Type.bodyMd,
    textAlign: 'center',
  },
  passText: { color: Colors.onSecondaryContainer },
  failText: { color: Colors.onErrorContainer },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.lg,
    gap: Spacing.xl,
    ...Shadow.card,
  },
  scoreWrap: { alignItems: 'center' },
  checks: { gap: Spacing.sm },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  checkText: {
    flex: 1,
    ...Type.bodyMd,
    fontFamily: Fonts.manropeMedium,
    color: Colors.onSurface,
  },
  failedCheckText: { color: Colors.error },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.surfaceVariant,
    marginLeft: 38,
  },
  notesCard: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  notesTitle: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
  },
  notesText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  actions: { gap: Spacing.sm, paddingTop: Spacing.md },
});
