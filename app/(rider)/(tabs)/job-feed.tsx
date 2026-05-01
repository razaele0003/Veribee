import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { JobCard } from '@/components/rider/JobCard';
import { MapCard } from '@/components/rider/MapCard';
import { EmptyState } from '@/components/ui/EmptyState';
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
      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <Text style={styles.heroTitle}>Available Jobs</Text>
          <Text style={styles.heroBody}>Looking for requests...</Text>
          
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
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MapCard />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Requests</Text>
          <Pressable
            onPress={() => setRefreshTick((value) => value + 1)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Refresh rider jobs"
          >
            <MaterialIcons name="refresh" size={24} color={Colors.primary} />
          </Pressable>
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
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.lg,
  },
  heroRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  heroTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    color: Colors.onSurface,
  },
  heroBody: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    marginTop: Spacing.sm,
  },
  statusLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  statusToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  onlineText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 14,
    color: Colors.primary,
  },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    color: Colors.onSurface,
  },
  refreshNote: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.xs,
  },
});

