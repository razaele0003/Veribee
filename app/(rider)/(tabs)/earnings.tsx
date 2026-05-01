import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { formatRiderMoney, useRiderStore } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type Period = 'today' | 'week' | 'month';

const PERIOD_TABS: Array<{ key: Period; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const WEEK_TOTAL = 1240;
const MONTH_TOTAL = 4800;

export default function RiderEarnings() {
  const router = useRouter();
  const todayEarnings = useRiderStore((s) => s.todayEarnings);
  const completedJobs = useRiderStore((s) => s.completedJobs);
  const jobs = useRiderStore((s) => s.jobs);
  const fallbackJobs = jobs.slice(0, 2);
  const [period, setPeriod] = useState<Period>('today');

  const periodTotal = useMemo(() => {
    if (period === 'today') return todayEarnings;
    if (period === 'week') return Math.max(WEEK_TOTAL, todayEarnings);
    return Math.max(MONTH_TOTAL, todayEarnings);
  }, [period, todayEarnings]);

  const periodLabel = useMemo(() => {
    if (period === 'today') return 'Total Earned Today';
    if (period === 'week') return 'Total Earned This Week';
    return 'Total Earned This Month';
  }, [period]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconButton} />
        <Text style={styles.headerTitle}>My Earnings</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {PERIOD_TABS.map((tab) => {
              const active = tab.key === period;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setPeriod(tab.key)}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.primaryCard}>
          {/* Faux blur using large soft shadow/background */}
          <View style={styles.blurEffect} pointerEvents="none" />
          <Text style={styles.primaryLabel}>{periodLabel}</Text>
          <View style={styles.primaryValueRow}>
            <Text style={styles.currencyLabel}>PHP</Text>
            <Text style={styles.primaryValue}>{periodTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.secondaryGrid}>
          <View style={styles.secondaryCard}>
            <Text style={styles.secondaryLabel}>This Week</Text>
            <Text style={styles.secondaryValue}>PHP {WEEK_TOTAL.toFixed(2)}</Text>
          </View>
          <View style={styles.secondaryCard}>
            <Text style={styles.secondaryLabel}>This Month</Text>
            <Text style={styles.secondaryValue}>PHP {MONTH_TOTAL.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          <Pressable onPress={() => router.push('/(rider)/job-history')} hitSlop={12}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        <View style={styles.jobsContainer}>
          {completedJobs.length > 0 ? (
            completedJobs.map((job, index) => (
              <EarningRow
                key={job.deliveryId || job.id}
                job={job}
                isLast={index === completedJobs.length - 1}
                onPress={() => router.push(`/(rider)/job/${job.id}`)}
              />
            ))
          ) : (
            fallbackJobs.map((job, index) => (
              <EarningRow
                key={job.id}
                job={job}
                muted
                isLast={index === fallbackJobs.length - 1}
                onPress={() => router.push(`/(rider)/job/${job.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EarningRow({
  job,
  muted,
  isLast,
  onPress,
}: {
  job: { id?: string; productImage: string; productName: string; orderId: string; jobFee: number };
  muted?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.jobRow,
        !isLast && styles.jobRowBorder,
        muted && styles.jobRowMuted,
        pressed && styles.jobRowPressed,
      ]}
    >
      <Image source={{ uri: job.productImage }} style={styles.jobImage} />
      <View style={styles.jobCopy}>
        <Text style={styles.jobName} numberOfLines={1}>
          {job.productName}
        </Text>
        <Text style={styles.jobMeta}>
          {muted ? `Order #${job.orderId.slice(0, 6).toUpperCase()} • 2:30 PM` : `Order #${job.orderId.slice(0, 6).toUpperCase()} • 2:30 PM`}
        </Text>
      </View>
      <View style={styles.jobRight}>
        <Text style={styles.jobFee}>+ PHP {job.jobFee.toFixed(0)}</Text>
        <View style={styles.completedPill}>
          <Text style={styles.completedPillText}>COMPLETED</Text>
        </View>
      </View>
    </Pressable>
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
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    color: Colors.onSurface,
  },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.lg,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.5)',
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  tabLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: Colors.onSurfaceVariant,
  },
  tabLabelActive: {
    color: Colors.onPrimary,
  },
  primaryCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: Spacing.xl,
    paddingVertical: 32,
    gap: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.3)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  blurEffect: {
    position: 'absolute',
    top: -96,
    right: -96,
    width: 256,
    height: 256,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixedDim,
    opacity: 0.2,
    // Note: CSS blur is hard to replicate exactly in RN without expo-blur, but a soft circle achieves the look.
  },
  primaryLabel: {
    ...Type.bodyLg,
    color: Colors.onSurfaceVariant,
  },
  primaryValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  currencyLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.primary,
  },
  primaryValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 56,
    letterSpacing: -1,
    lineHeight: 56,
    color: Colors.onSurface,
  },
  trendBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.5)',
    marginTop: Spacing.xs,
  },
  trendText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    color: Colors.onSurface,
  },
  secondaryGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 248, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  secondaryLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.onSurfaceVariant,
  },
  secondaryValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
    paddingBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
  },
  viewAllText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    color: Colors.primary,
  },
  jobsContainer: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 248, 0.5)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  jobRow: {
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  jobRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  jobRowMuted: { opacity: 0.82 },
  jobRowPressed: { opacity: 0.72 },
  jobImage: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceVariant,
  },
  jobCopy: { flex: 1 },
  jobName: {
    ...Type.bodyLg,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  jobMeta: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  jobRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  jobFee: {
    ...Type.bodyLg,
    fontFamily: Fonts.epilogueBold,
    color: Colors.onSurface,
  },
  completedPill: {
    backgroundColor: 'rgba(255, 180, 168, 0.3)', // primary-fixed-dim/30
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  completedPillText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: Colors.surfaceTint,
  },
});
