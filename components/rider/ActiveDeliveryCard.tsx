import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ActiveDelivery, formatRiderMoney } from '@/store/riderStore';
import { resolveImageSource } from '@/constants/productImages';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

type Props = {
  delivery: ActiveDelivery;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ActiveDeliveryCard({
  delivery,
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  const contactPhone =
    delivery.status === 'heading_to_pickup' || delivery.status === 'arrived_pickup'
      ? delivery.sellerPhone
      : delivery.buyerPhone;

  return (
    <View style={styles.sheet}>
      <View style={styles.topRow}>
        <View style={styles.statusCopy}>
          <Text style={styles.label}>{subtitle}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.etaPill}>
          <MaterialIcons name="schedule" size={15} color={Colors.primary} />
          <Text style={styles.etaText}>{delivery.etaMinutes} mins</Text>
          <Text style={styles.etaMeta}>{delivery.distanceKm.toFixed(1)} km</Text>
        </View>
      </View>

      <View style={styles.packageCard}>
        <Image source={resolveImageSource(delivery.productImage)} style={styles.productImage} />
        <View style={styles.packageCopy}>
          <Text style={styles.productName} numberOfLines={2}>
            {delivery.productName}
          </Text>
          <Text style={styles.orderId}>Order {delivery.orderId}</Text>
          <View style={styles.verifiedRow}>
            <MaterialIcons name="verified" size={14} color={Colors.secondary} />
            <Text style={styles.verifiedText}>Veribee Verified</Text>
          </View>
        </View>
        <Pressable
          onPress={() => Linking.openURL(`tel:${contactPhone}`)}
          style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Call contact"
          hitSlop={8}
        >
          <MaterialIcons name="call" size={20} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoIcon}>
          <MaterialIcons name="payments" size={20} color={Colors.primary} />
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>Job fee</Text>
          <Text style={styles.infoBody}>{formatRiderMoney(delivery.jobFee)}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.outline} />
      </View>

      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <MaterialIcons name="check-circle" size={18} color={Colors.onPrimary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: Spacing.containerMargin,
    gap: Spacing.md,
    ...Shadow.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  statusCopy: { flex: 1 },
  label: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
  },
  title: {
    ...Type.h3,
    color: Colors.onSurface,
    marginTop: Spacing.xs,
  },
  etaPill: {
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.dealContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.base,
    alignItems: 'flex-end',
    gap: 2,
  },
  etaText: {
    ...Type.labelCaps,
    color: Colors.primary,
  },
  etaMeta: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  packageCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainer,
  },
  packageCopy: { flex: 1 },
  productName: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.onSurface,
  },
  orderId: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  verifiedText: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.secondary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    minHeight: 64,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceVariant,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: { flex: 1 },
  infoTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  infoBody: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  action: {
    minHeight: 48,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  actionText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onPrimary,
  },
  pressed: { opacity: 0.74 },
});
