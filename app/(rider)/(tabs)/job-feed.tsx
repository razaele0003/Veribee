import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { JobCard } from '@/components/rider/JobCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { isLocalUserId } from '@/lib/localAuth';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { RiderJob, formatRiderMoney, useRiderStore } from '@/store/riderStore';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type PendingAction = 'accept' | 'decline';

export default function RiderJobFeed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const jobs = useRiderStore((s) => s.jobs);
  const userId = useAuthStore((s) => s.userId);
  const isOnline = useRiderStore((s) => s.isOnline);
  const setOnline = useRiderStore((s) => s.setOnline);
  const acceptJob = useRiderStore((s) => s.acceptJob);
  const declineJob = useRiderStore((s) => s.declineJob);
  const todayEarnings = useRiderStore((s) => s.todayEarnings);
  const [refreshTick, setRefreshTick] = useState(0);
  const [pendingJob, setPendingJob] = useState<RiderJob | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const openJobDialog = (job: RiderJob, action: PendingAction) => {
    setPendingJob(job);
    setPendingAction(action);
  };

  const closeJobDialog = () => {
    setPendingJob(null);
    setPendingAction(null);
  };

  const onAccept = async (jobId: string) => {
    const delivery = acceptJob(jobId);
    if (!delivery) return;

    if (userId && !isLocalUserId(userId)) {
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

  const confirmJobAction = async () => {
    if (!pendingJob || !pendingAction) return;
    const jobId = pendingJob.id;
    closeJobDialog();

    if (pendingAction === 'accept') {
      await onAccept(jobId);
      return;
    }

    declineJob(jobId);
  };

  const isAcceptDialog = pendingAction === 'accept';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryContainer, Colors.primary, '#d22517']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + Spacing.md }]}
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
              onAccept={() => openJobDialog(job, 'accept')}
              onDecline={() => openJobDialog(job, 'decline')}
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

      {!!pendingJob && (
        <View style={styles.dialogScrim}>
          <View style={styles.dialog}>
            <View style={[styles.dialogIcon, !isAcceptDialog && styles.dialogIconMuted]}>
              <MaterialIcons
                name={isAcceptDialog ? 'check-circle' : 'close'}
                size={28}
                color={isAcceptDialog ? Colors.primary : Colors.onSurfaceVariant}
              />
            </View>
            <Text style={styles.dialogTitle}>
              {isAcceptDialog ? 'Accept this verified job?' : 'Decline this request?'}
            </Text>
            {!!pendingJob && (
              <Text style={styles.dialogBody}>
                {pendingJob.productName} from {pendingJob.pickupAddress} to{' '}
                {pendingJob.deliveryAddress}. Fee {formatRiderMoney(pendingJob.jobFee)}.
              </Text>
            )}

            <View style={styles.dialogMetaGrid}>
              <View style={styles.dialogMeta}>
                <Text style={styles.dialogMetaLabel}>ETA</Text>
                <Text style={styles.dialogMetaValue}>{pendingJob?.etaMinutes ?? 0} min</Text>
              </View>
              <View style={styles.dialogMeta}>
                <Text style={styles.dialogMetaLabel}>Distance</Text>
                <Text style={styles.dialogMetaValue}>{pendingJob?.distanceKm.toFixed(1) ?? '0.0'} km</Text>
              </View>
            </View>

            <View style={styles.dialogActions}>
              <Pressable
                onPress={closeJobDialog}
                style={({ pressed }) => [styles.dialogCancel, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Cancel job action"
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmJobAction}
                style={({ pressed }) => [
                  styles.dialogConfirm,
                  !isAcceptDialog && styles.dialogDeclineConfirm,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={isAcceptDialog ? 'Confirm accept job' : 'Confirm decline job'}
              >
                <MaterialIcons
                  name={isAcceptDialog ? 'check' : 'close'}
                  size={18}
                  color={Colors.onPrimary}
                />
                <Text style={styles.dialogConfirmText}>
                  {isAcceptDialog ? 'Accept Job' : 'Decline'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    paddingHorizontal: Spacing.containerMargin,
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
    paddingTop: Spacing.lg,
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
  dialogScrim: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
    backgroundColor: 'rgba(34,16,10,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.containerMargin,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radii.xl,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 26,
    elevation: 10,
  },
  dialogIcon: {
    width: 52,
    height: 52,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogIconMuted: {
    backgroundColor: Colors.surfaceContainer,
  },
  dialogTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.onSurface,
  },
  dialogBody: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
  },
  dialogMetaGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dialogMeta: {
    flex: 1,
    borderRadius: Radii.lg,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: Spacing.sm,
    gap: 2,
  },
  dialogMetaLabel: {
    ...Type.labelCaps,
    color: Colors.primary,
  },
  dialogMetaValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  dialogCancel: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancelText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  dialogConfirm: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  dialogDeclineConfirm: {
    backgroundColor: Colors.error,
  },
  dialogConfirmText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 14,
    color: Colors.onPrimary,
  },
  pressed: { opacity: 0.72 },
});
