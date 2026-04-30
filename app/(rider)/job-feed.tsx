import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { JobCard } from '@/components/rider/JobCard';
import { MapCard } from '@/components/rider/MapCard';
import { useRiderStore } from '@/store/riderStore';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function RiderJobFeed() {
  const router = useRouter();
  const jobs = useRiderStore((s) => s.jobs);
  const isOnline = useRiderStore((s) => s.isOnline);
  const setOnline = useRiderStore((s) => s.setOnline);
  const acceptJob = useRiderStore((s) => s.acceptJob);

  const onAccept = (jobId: string) => {
    const delivery = acceptJob(jobId);
    if (delivery) router.push('/(rider)/navigation-pickup');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroTitle}>Available Jobs</Text>
            <Text style={styles.heroBody}>Looking for new requests nearby.</Text>
          </View>
          <View style={styles.onlinePill}>
            <View style={[styles.onlineDot, !isOnline && styles.onlineDotOff]} />
            <Text style={styles.onlineText}>{isOnline ? 'Online' : 'Offline'}</Text>
            <Switch
              value={isOnline}
              onValueChange={setOnline}
              trackColor={{
                true: Colors.tertiaryFixedDim,
                false: Colors.surfaceContainerHighest,
              }}
              thumbColor={isOnline ? Colors.tertiaryContainer : Colors.outline}
            />
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
            onPress={() => Alert.alert('Refresh', 'Local jobs are already up to date.')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Refresh rider jobs"
          >
            <MaterialIcons name="refresh" size={24} color={Colors.primary} />
          </Pressable>
        </View>

        {isOnline && jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onAccept={() => onAccept(job.id)}
              onDecline={() => Alert.alert('Declined', `${job.orderId} hidden for this session.`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons
              name={isOnline ? 'task-alt' : 'power-settings-new'}
              size={36}
              color={Colors.primary}
            />
            <Text style={styles.emptyTitle}>
              {isOnline ? 'No jobs waiting' : 'You are offline'}
            </Text>
            <Text style={styles.emptyBody}>
              {isOnline
                ? 'New local demo requests will appear here after the active flow resets.'
                : 'Switch online to receive nearby delivery requests.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    backgroundColor: Colors.inverseSurface,
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  heroTitle: { ...Type.h2, color: Colors.surfaceContainerLowest },
  heroBody: {
    ...Type.bodyMd,
    color: Colors.inverseOnSurface,
    marginTop: Spacing.xs,
  },
  onlinePill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.inverseOnSurface,
    paddingLeft: Spacing.sm,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryFixedDim,
  },
  onlineDotOff: { backgroundColor: Colors.outline },
  onlineText: {
    ...Type.labelCaps,
    color: Colors.inverseSurface,
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
  emptyState: {
    minHeight: 240,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  emptyBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
