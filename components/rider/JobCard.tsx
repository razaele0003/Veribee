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
      <View style={styles.accent} />
      <View style={styles.cardHeader}>
        <View style={styles.categoryPill}>
          <MaterialIcons name="inventory-2" size={14} color={Colors.primary} />
          <Text style={styles.categoryText}>{job.category} Verified</Text>
        </View>
        <View style={styles.feeBlock}>
          <Text style={styles.fee}>{formatRiderMoney(job.jobFee)}</Text>
          <Text style={styles.distance}>{job.distanceKm.toFixed(1)} km</Text>
        </View>
      </View>

      <View style={styles.routeBlock}>
        <View style={styles.routeLine} />
        <AddressDot label="Pickup" value={job.pickupAddress} dot="secondary" />
        <AddressDot label="Deliver To" value={job.deliveryAddress} dot="primary" />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onAccept}
          style={({ pressed }) => [styles.acceptButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Accept ${job.orderId}`}
        >
          <Text style={styles.acceptText}>Accept Job</Text>
        </Pressable>
        <Pressable
          onPress={onDecline}
          style={({ pressed }) => [styles.declineButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Decline ${job.orderId}`}
        >
          <Text style={styles.declineText}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AddressDot({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot: 'primary' | 'secondary';
}) {
  return (
    <View style={styles.addressRow}>
      <View style={styles.dotOuter}>
        {dot === 'primary' ? (
          <MaterialIcons name="location-on" size={13} color={Colors.primary} />
        ) : (
          <View style={styles.dotInner} />
        )}
      </View>
      <View style={styles.addressCopy}>
        <Text style={styles.addressLabel}>{label}</Text>
        <Text style={styles.addressValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    overflow: 'hidden',
    ...Shadow.card,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  categoryPill: {
    maxWidth: '62%',
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryText: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.primary,
  },
  feeBlock: { alignItems: 'flex-end' },
  fee: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    color: Colors.onSurface,
  },
  distance: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  routeBlock: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  routeLine: {
    position: 'absolute',
    left: 9,
    top: 24,
    bottom: 24,
    width: 1,
    backgroundColor: Colors.outlineVariant,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  dotOuter: {
    width: 20,
    height: 20,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
  },
  addressCopy: { flex: 1 },
  addressLabel: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  addressValue: {
    ...Type.bodyLg,
    fontFamily: Fonts.manropeBold,
    color: Colors.onSurface,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  acceptButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onTertiary,
  },
  declineButton: {
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.error,
  },
  pressed: { opacity: 0.72 },
});
