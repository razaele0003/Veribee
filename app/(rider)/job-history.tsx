import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { formatRiderMoney, useRiderStore } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function RiderJobHistory() {
  const router = useRouter();
  const completedJobs = useRiderStore((s) => s.completedJobs);
  const sampleJobs = useRiderStore((s) => s.jobs);
  const rows = completedJobs.length > 0 ? completedJobs : sampleJobs;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Job History</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {rows.map((job) => (
          <Pressable 
            key={job.id} 
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => router.push(`/(rider)/job/${job.id}`)}
          >
            <Image source={{ uri: job.productImage }} style={styles.image} />
            <View style={styles.copy}>
              <Text style={styles.title} numberOfLines={1}>
                {job.productName}
              </Text>
              <Text style={styles.meta}>{job.pickupAddress} to {job.deliveryAddress}</Text>
              <Text style={styles.status}>
                {'status' in job && job.status === 'delivered' ? 'Delivered' : 'Sample route'}
              </Text>
            </View>
            <Text style={styles.fee}>{formatRiderMoney(job.jobFee)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  row: {
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
  rowPressed: {
    opacity: 0.72,
    backgroundColor: Colors.surface,
  },
  image: {
    width: 62,
    height: 62,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainer,
  },
  copy: { flex: 1, gap: 2 },
  title: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  meta: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  status: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.tertiaryContainer,
    marginTop: Spacing.xs,
  },
  fee: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.primary,
  },
});
