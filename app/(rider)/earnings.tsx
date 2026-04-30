import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { formatRiderMoney, useRiderStore } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function RiderEarnings() {
  const router = useRouter();
  const todayEarnings = useRiderStore((s) => s.todayEarnings);
  const completedJobs = useRiderStore((s) => s.completedJobs);
  const fallbackJobs = useRiderStore((s) => s.jobs.slice(0, 2));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/(rider)/job-history')}
          hitSlop={12}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Open job history"
        >
          <MaterialIcons name="history" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Earnings</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.featuredCard}>
          <Text style={styles.featuredLabel}>Total Earned Today</Text>
          <View style={styles.featuredValueRow}>
            <View style={styles.beeCircle}>
              <MaterialIcons name="hive" size={22} color={Colors.onSecondaryContainer} />
            </View>
            <Text style={styles.featuredValue}>{formatRiderMoney(todayEarnings)}</Text>
          </View>
          <View style={styles.statsRow}>
            <MiniStat label="This Week" value="PHP 1,240" />
            <MiniStat label="This Month" value="PHP 4,800" />
          </View>
        </View>

        <View style={styles.tabs}>
          <Text style={styles.tabActive}>Today</Text>
          <Text style={styles.tab}>This Week</Text>
          <Text style={styles.tab}>This Month</Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        {completedJobs.length > 0 ? (
          completedJobs.map((job) => <EarningRow key={job.deliveryId} job={job} />)
        ) : (
          fallbackJobs.map((job) => <EarningRow key={job.id} job={job} muted />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

function EarningRow({
  job,
  muted,
}: {
  job: { productImage: string; productName: string; orderId: string; jobFee: number };
  muted?: boolean;
}) {
  return (
    <View style={[styles.jobRow, muted && styles.jobRowMuted]}>
      <Image source={{ uri: job.productImage }} style={styles.jobImage} />
      <View style={styles.jobCopy}>
        <Text style={styles.jobName} numberOfLines={1}>
          {job.productName}
        </Text>
        <Text style={styles.jobMeta}>{muted ? 'Sample earning' : `Completed ${job.orderId}`}</Text>
      </View>
      <Text style={styles.jobFee}>{formatRiderMoney(job.jobFee)}</Text>
    </View>
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
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.lg,
  },
  featuredCard: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.primaryContainer,
    padding: Spacing.lg,
    gap: Spacing.md,
    overflow: 'hidden',
    ...Shadow.card,
  },
  featuredLabel: { ...Type.labelCaps, color: Colors.onPrimary },
  featuredValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  beeCircle: {
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredValue: {
    flex: 1,
    fontFamily: Fonts.epilogueBold,
    fontSize: 36,
    color: Colors.onPrimary,
  },
  statsRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.primaryFixedDim,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  miniLabel: { ...Type.labelCaps, fontSize: 10, color: Colors.onPrimary },
  miniValue: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onPrimary,
    marginTop: 2,
  },
  tabs: { flexDirection: 'row', gap: Spacing.sm },
  tabActive: {
    ...Type.labelCaps,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.primary,
    color: Colors.onPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    overflow: 'hidden',
  },
  tab: {
    ...Type.labelCaps,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    color: Colors.onSurfaceVariant,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    overflow: 'hidden',
  },
  sectionTitle: { ...Type.h3, color: Colors.onSurface },
  jobRow: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  jobRowMuted: { opacity: 0.82 },
  jobImage: {
    width: 56,
    height: 56,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainer,
  },
  jobCopy: { flex: 1 },
  jobName: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  jobMeta: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  jobFee: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.primary,
  },
});
