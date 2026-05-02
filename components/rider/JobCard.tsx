import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RiderJob, formatRiderMoney } from '@/store/riderStore';
import { resolveImageSource } from '@/constants/productImages';
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
            <Image source={resolveImageSource(job.productImage)} style={styles.productImage} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.categoryText} numberOfLines={1}>{job.category} Verified</Text>
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
        <View style={styles.routeConnector} />
        <View style={styles.routeRow}>
          <View style={styles.markerColumn}>
            <View style={styles.pickupDotOuter} />
          </View>
          <View style={styles.routeCopy}>
            <Text style={styles.stepLabel}>PICKUP</Text>
            <Text style={styles.stepValue}>{job.pickupAddress}</Text>
          </View>
        </View>
        <View style={styles.routeRow}>
          <View style={styles.markerColumn}>
            <View style={styles.deliveryDotOuter}>
              <MaterialIcons name="location-on" size={12} color={Colors.onPrimary} />
            </View>
          </View>
          <View style={styles.routeCopy}>
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
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 14,
    overflow: 'hidden',
    ...Shadow.card,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
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
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
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
    minWidth: 92,
    alignItems: 'flex-end',
  },
  feeText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.primary,
  },
  highPriorityPill: {
    backgroundColor: Colors.successContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
    marginTop: 4,
  },
  highPriorityText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    color: Colors.onSuccessContainer,
    letterSpacing: 0,
  },
  routeContainer: {
    position: 'relative',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  routeConnector: {
    position: 'absolute',
    left: Spacing.md + 13,
    top: 32,
    bottom: 32,
    width: 2,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  markerColumn: {
    width: 28,
    alignItems: 'center',
    paddingTop: 2,
  },
  routeCopy: {
    flex: 1,
    minWidth: 0,
  },
  pickupDotOuter: {
    width: 16,
    height: 16,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  deliveryDotOuter: {
    width: 18,
    height: 18,
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
    fontSize: 15,
    color: Colors.onSurface,
    lineHeight: 21,
  },
  actionsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  declineButton: {
    flex: 1,
    height: 44,
    borderRadius: Radii.DEFAULT,
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
    height: 44,
    borderRadius: Radii.DEFAULT,
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
