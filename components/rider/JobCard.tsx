import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RiderJob, formatRiderMoney } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type Props = {
  job: RiderJob;
  onAccept: () => void;
  onDecline?: () => void;
};

export function JobCard({ job, onAccept, onDecline }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <MaterialIcons name="inventory-2" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.categoryText}>{job.category} Verified</Text>
            <View style={styles.distanceRow}>
              <MaterialIcons name="directions-walk" size={14} color={Colors.onSurfaceVariant} />
              <Text style={styles.distanceText}>{job.distanceKm.toFixed(1)} km away</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.feeText}>{formatRiderMoney(job.jobFee)}</Text>
          {job.jobFee > 70 && (
            <View style={styles.highPriorityPill}>
              <Text style={styles.highPriorityText}>HIGH PRIORITY</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeTimeline}>
          <View style={styles.routeLine} />
          <View style={styles.routeStep}>
            <View style={styles.pickupDotOuter}>
              <View style={styles.pickupDotInner} />
            </View>
            <Text style={styles.stepLabel}>PICKUP</Text>
            <Text style={styles.stepValue}>{job.pickupAddress}</Text>
          </View>
          
          <View style={[styles.routeStep, { marginTop: Spacing.md }]}>
            <View style={styles.deliveryDotOuter}>
              <MaterialIcons name="location-on" size={12} color={Colors.onPrimary} />
            </View>
            <Text style={styles.stepLabel}>DELIVERY</Text>
            <Text style={styles.stepValue}>{job.deliveryAddress}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsGrid}>
        <Pressable
          onPress={onDecline}
          style={({ pressed }) => [styles.declineButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Decline ${job.orderId}`}
        >
          <MaterialIcons name="close" size={16} color={Colors.onSurface} />
          <Text style={styles.declineText}>Decline</Text>
        </Pressable>
        <Pressable
          onPress={onAccept}
          style={({ pressed }) => [styles.acceptButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Accept ${job.orderId}`}
        >
          <MaterialIcons name="check" size={16} color={Colors.onPrimary} />
          <Text style={styles.acceptText}>Accept Job</Text>
        </Pressable>
      </View>
    </View>
  );
}

// AddressDot component removed because it's merged inline

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.4)',
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.lg,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  distanceText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  feeText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.primary,
  },
  highPriorityPill: {
    backgroundColor: '#effded',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
    marginTop: 4,
  },
  highPriorityText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    color: '#15803d',
    letterSpacing: 0.5,
  },
  routeContainer: {
    paddingLeft: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  routeTimeline: {
    position: 'relative',
    borderLeftWidth: 2,
    borderLeftColor: Colors.surfaceContainerHighest,
    paddingLeft: Spacing.lg,
  },
  routeLine: {
    display: 'none',
  },
  routeStep: {
    position: 'relative',
  },
  pickupDotOuter: {
    position: 'absolute',
    left: -43,
    top: 4,
    width: 14,
    height: 14,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  pickupDotInner: {
    display: 'none',
  },
  deliveryDotOuter: {
    position: 'absolute',
    left: -43,
    top: 4,
    width: 14,
    height: 14,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepValue: {
    ...Type.bodyMd,
    fontFamily: Fonts.manropeMedium,
    color: Colors.onSurface,
  },
  actionsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  declineButton: {
    flex: 1,
    height: 48,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  declineText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  acceptButton: {
    flex: 1,
    height: 48,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 14,
    color: Colors.onPrimary,
  },
  pressed: { opacity: 0.72 },
});
