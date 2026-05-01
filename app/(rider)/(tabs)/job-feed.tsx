import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { JobCard } from '@/components/rider/JobCard';
import { MapCard } from '@/components/rider/MapCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { DEMO_ROUTE } from '@/lib/demoProfiles';
import { estimateRouteSummary } from '@/lib/maps';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRiderStore } from '@/store/riderStore';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function RiderJobFeed() {
  const router = useRouter();
  const jobs = useRiderStore((s) => s.jobs);
  const userId = useAuthStore((s) => s.userId);
  const isOnline = useRiderStore((s) => s.isOnline);
  const setOnline = useRiderStore((s) => s.setOnline);
  const acceptJob = useRiderStore((s) => s.acceptJob);
  const declineJob = useRiderStore((s) => s.declineJob);
  const todayEarnings = useRiderStore((s) => s.todayEarnings);
  const [refreshTick, setRefreshTick] = useState(0);

  const onAccept = async (jobId: string) => {
    const delivery = acceptJob(jobId);
    if (!delivery) return;

    if (userId) {
      await supabase
        .from('orders')
        .update({ rider_id: userId, status: 'processing' })
        .eq('id', delivery.orderId);
      await supabase.from('deliveries').insert({
        id: delivery.deliveryId,
        order_id: delivery.orderId,
        rider_id: userId,
        status: 'heading_to_pickup',
      });
    }

    router.push('/(rider)/navigation-pickup');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primaryContainer, Colors.primary, '#d22517']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroTitleRow}>
            <View>
              <Text style={styles.heroKicker}>RIDER WORKSPACE</Text>
              <Text style={styles.heroTitle}>Available Jobs</Text>
            </View>
            <View style={[styles.onlineBadge, !isOnline && styles.offlineBadge]}>
              <View style={[styles.onlineDot, !isOnline && styles.offlineDot]} />
              <Text style={styles.onlineBadgeText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
          <Text style={styles.heroBody}>Verified pickups near Makati and BGC.</Text>
          
          <View style={styles.statusPill}>
            <Text style={styles.statusLabel}>STATUS</Text>
            <View style={styles.statusToggleContainer}>
              <Text style={styles.onlineText}>{isOnline ? 'Online' : 'Offline'}</Text>
              <Switch
                value={isOnline}
                onValueChange={setOnline}
                trackColor={{
                  true: Colors.primary,
                  false: Colors.surfaceContainerHighest,
                }}
                thumbColor={Colors.surfaceContainerLowest}
              />
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{jobs.length}</Text>
              <Text style={styles.heroStatLabel}>Open jobs</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>PHP {todayEarnings}</Text>
              <Text style={styles.heroStatLabel}>Today</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>4.9</Text>
              <Text style={styles.heroStatLabel}>Rating</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MapCard
          label="Live route zone"
          height={120}
          origin={DEMO_ROUTE.riderStart}
          destination={DEMO_ROUTE.pickup}
          routeSummary={estimateRouteSummary(DEMO_ROUTE.riderStart, DEMO_ROUTE.pickup)}
        />

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>QUEUE</Text>
            <Text style={styles.sectionTitle}>Nearby Requests</Text>
          </View>
          <View style={styles.sectionActions}>
            <View style={styles.countChip}>
              <Text style={styles.countChipText}>{jobs.length} jobs</Text>
            </View>
          <Pressable
            onPress={() => setRefreshTick((value) => value + 1)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Refresh rider jobs"
          >
            <MaterialIcons name="refresh" size={24} color={Colors.primary} />
          </Pressable>
          </View>
        </View>
        {refreshTick > 0 && (
          <Text style={styles.refreshNote}>Local jobs are up to date.</Text>
        )}

        {isOnline && jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onAccept={() => onAccept(job.id)}
              onDecline={() => declineJob(job.id)}
            />
          ))
        ) : (
          <EmptyState
            icon={isOnline ? 'task-alt' : 'power-settings-new'}
            title={isOnline ? 'No jobs waiting' : 'You are offline'}
            subtitle={
              isOnline
                ? 'New requests will appear here when riders are needed nearby.'
                : 'Switch online to receive nearby delivery requests.'
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: Radii.xl,
    borderBottomRightRadius: Radii.xl,
  },
  heroRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  heroKicker: {
    ...Type.labelCaps,
    color: Colors.onPrimaryContainer,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    lineHeight: 34,
    color: Colors.onPrimary,
  },
  heroBody: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onPrimaryContainer,
  },
  onlineBadge: {
    minHeight: 34,
    borderRadius: Radii.full,
    backgroundColor: Colors.successContainer,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  offlineBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.success,
  },
  offlineDot: {
    backgroundColor: Colors.outline,
  },
  onlineBadgeText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onSuccessContainer,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radii.DEFAULT,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    marginTop: Spacing.sm,
  },
  statusLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    color: Colors.onPrimaryContainer,
    letterSpacing: 0,
  },
  statusToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  onlineText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 14,
    color: Colors.onPrimary,
  },
  heroStats: {
    minHeight: 56,
    marginTop: Spacing.xs,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
    minHeight: 56,
    borderRadius: Radii.DEFAULT,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  heroStatValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    lineHeight: 22,
    color: Colors.onPrimary,
  },
  heroStatLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onPrimaryContainer,
  },
  heroStatDivider: {
    display: 'none',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 112,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  sectionEyebrow: {
    ...Type.labelCaps,
    color: Colors.primary,
    marginBottom: 3,
  },
  sectionTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
    color: Colors.onSurface,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countChip: {
    minHeight: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countChipText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onSecondaryContainer,
  },
  refreshNote: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.xs,
  },
});
