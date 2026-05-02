import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { VSIGauge } from '@/components/ui/VSIGauge';
import { calculateSellerVsiFromProducts, getVsiBreakdown } from '@/lib/veribeeScoring';
import { useSellerStore } from '@/store/sellerStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type BreakdownItem = {
  label: string;
  weight: number;
  score: number;
};

const tips = [
  'Dispatch orders within 24 hours to reduce delivery delays.',
  'Upload complete label, serial, receipt, and full-product evidence.',
  'Keep disputes low by using OTP or biometric handover for high-value orders.',
];

export default function VSIScoreScreen() {
  const router = useRouter();
  const products = useSellerStore((s) => s.products);
  const score = calculateSellerVsiFromProducts(products);
  const breakdown: BreakdownItem[] = getVsiBreakdown({
    successfulDeliveries: 94,
    totalDeliveries: 99,
    verifiedProducts: products.filter((product) => product.authStatus === 'verified').length,
    totalProducts: products.length,
    satisfiedOrders: 91,
    reviewedOrders: 96,
    disputes: 2 + products.filter((product) => product.authStatus === 'failed').length,
    totalOrders: 112,
    accountAgeDays: 438,
    kycApproved: true,
  });

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
        <Text style={styles.headerTitle}>Seller Performance</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.title}>Your VSI Score</Text>
          <VSIGauge score={score} />
        </View>

        <View style={styles.breakdown}>
          {breakdown.map((item) => (
            <BreakdownCard key={item.label} item={item} />
          ))}
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIcon}>
              <MaterialIcons name="lightbulb" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.tipsTitle}>Tips to Improve Your Score</Text>
          </View>
          <View style={styles.tipsList}>
            {tips.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <MaterialIcons name="arrow-right" size={18} color={Colors.primary} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BreakdownCard({ item }: { item: BreakdownItem }) {
  const width = `${Math.min(Math.max(item.score, 0), 100)}%` as `${number}%`;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardCopy}>
          <Text style={styles.weight}>{item.weight}% Weight</Text>
          <Text style={styles.cardTitle}>{item.label}</Text>
        </View>
        <Text style={styles.cardScore}>{item.score}/100</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerLow },
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
    gap: Spacing.xl,
  },
  hero: { alignItems: 'center', gap: Spacing.lg },
  title: { ...Type.h2, color: Colors.onSurface, textAlign: 'center' },
  breakdown: { gap: Spacing.sm },
  card: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  cardCopy: { flex: 1, gap: Spacing.xs },
  weight: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
  },
  cardTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 18,
    lineHeight: 25,
    color: Colors.onSurface,
  },
  cardScore: {
    fontFamily: Fonts.manropeBold,
    fontSize: 18,
    color: Colors.primaryContainer,
  },
  track: {
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainer,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryContainer,
  },
  tipsCard: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 1,
    borderColor: Colors.secondaryFixedDim,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tipsIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitle: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 18,
    color: Colors.onSecondaryContainer,
  },
  tipsList: { gap: Spacing.sm },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  tipText: {
    flex: 1,
    ...Type.bodyMd,
    color: Colors.onSecondaryFixed,
  },
});
