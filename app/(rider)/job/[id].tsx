import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { formatRiderMoney, useRiderStore } from '@/store/riderStore';
import { resolveImageSource } from '@/constants/productImages';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { jobs, completedJobs } = useRiderStore();

  const job = completedJobs.find((j) => j.id === id) || jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={26} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Job Not Found</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Could not load job details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = 'status' in job && job.status === 'delivered';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>
        <Text style={styles.headerTitle}>Job Details</Text>
        <Pressable hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="more-vert" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Earnings */}
        <View style={styles.heroSection}>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, !isCompleted && { backgroundColor: Colors.tertiaryContainer }]} />
            <Text style={styles.statusText}>{isCompleted ? 'COMPLETED' : 'PENDING'}</Text>
          </View>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsValue}>{formatRiderMoney(job.jobFee)}</Text>
          <Text style={styles.dateText}>Today, 2:45 PM</Text>
        </View>

        {/* Route Details */}
        <View style={styles.bentoCard}>
          <Text style={styles.cardTitle}>Route Details</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routeTimeline}>
              <View style={styles.routeLine} />
              
              <View style={styles.routeStep}>
                <View style={styles.pickupDotOuter} />
                <Text style={styles.stepLabel}>PICKUP</Text>
                <Text style={styles.stepValue}>{job.pickupAddress}</Text>
                <Text style={styles.stepMeta}>Picked up at 2:15 PM</Text>
              </View>
              
              <View style={[styles.routeStep, { marginTop: Spacing.xl }]}>
                <View style={styles.deliveryDotOuter} />
                <Text style={styles.stepLabelDropoff}>DROPOFF</Text>
                <Text style={styles.stepValue}>{job.deliveryAddress}</Text>
                <Text style={styles.stepMeta}>Delivered at 2:45 PM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.bentoCard}>
          <View style={styles.cardHeaderWithBorder}>
            <Text style={styles.cardTitle}>Order Details</Text>
          </View>
          <View style={styles.orderRow}>
            <View style={styles.orderImageContainer}>
              <Image source={resolveImageSource(job.productImage)} style={styles.orderImage} />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle} numberOfLines={1}>{job.productName}</Text>
              <Text style={styles.orderMeta}>Qty: 1 • Small Box</Text>
            </View>
            <View style={styles.orderIdPill}>
              <Text style={styles.orderIdText}>ID: #{job.id.substring(0, 5).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={[styles.bentoCard, styles.customerCard]}>
          <View style={styles.customerLeft}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerInitials}>MV</Text>
            </View>
            <View>
              <Text style={styles.customerName}>Mariana V.</Text>
              <Text style={styles.customerRole}>Customer</Text>
            </View>
          </View>
          <Pressable style={styles.callButton}>
            <MaterialIcons name="call" size={20} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.bentoCard}>
          <View style={styles.cardHeaderWithBorder}>
            <Text style={styles.cardTitle}>Earnings Breakdown</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Base Fare</Text>
            <Text style={styles.breakdownValue}>{formatRiderMoney(job.jobFee * 0.6)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Distance Bonus</Text>
            <Text style={styles.breakdownValue}>{formatRiderMoney(job.jobFee * 0.2)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Customer Tip</Text>
            <Text style={styles.breakdownValue}>{formatRiderMoney(job.jobFee * 0.2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatRiderMoney(job.jobFee)}</Text>
          </View>
        </View>

        {/* Footer Actions */}
        <Pressable style={styles.helpButton}>
          <MaterialIcons name="help-outline" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.helpText}>HELP WITH THIS JOB</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: Fonts.manropeMedium,
    color: Colors.onSurfaceVariant,
  },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.containerMargin,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  statusText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  earningsLabel: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  earningsValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 40,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  dateText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  bentoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.card,
    padding: Spacing.containerMargin,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  cardHeaderWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  routeContainer: {
    paddingLeft: Spacing.lg,
  },
  routeTimeline: {
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: Colors.outlineVariant,
    paddingLeft: Spacing.sm,
  },
  routeLine: {
    display: 'none',
  },
  routeStep: {
    position: 'relative',
  },
  pickupDotOuter: {
    position: 'absolute',
    left: -21,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.outline,
    borderWidth: 4,
    borderColor: Colors.surfaceContainerLowest,
  },
  deliveryDotOuter: {
    position: 'absolute',
    left: -23,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.surfaceContainerLowest,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  stepLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepLabelDropoff: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepValue: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 16,
    color: Colors.onSurface,
  },
  stepMeta: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  orderImageContainer: {
    width: 64,
    height: 64,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  orderImage: {
    width: '100%',
    height: '100%',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 16,
    color: Colors.onSurface,
  },
  orderMeta: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  orderIdPill: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.DEFAULT,
  },
  orderIdText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInitials: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.primary,
  },
  customerName: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 16,
    color: Colors.onSurface,
  },
  customerRole: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  breakdownValue: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 14,
    color: Colors.onSurface,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  totalLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  totalValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.primary,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.containerMargin,
  },
  helpText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
});
