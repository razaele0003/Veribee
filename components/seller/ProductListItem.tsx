import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LocalProduct } from '@/store/sellerStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type Props = {
  product: LocalProduct;
  onMenu: () => void;
  onPress: () => void;
};

function formatPrice(price: string) {
  const value = Number(price || 0);
  return `PHP ${Math.round(value).toLocaleString('en-PH')}`;
}

function getStatusColor(status: LocalProduct['authStatus']) {
  if (status === 'verified') return Colors.success;
  if (status === 'pending') return Colors.warning;
  return Colors.onSurfaceVariant;
}

function getStatusLabel(status: LocalProduct['authStatus']) {
  if (status === 'verified') return 'Verified';
  if (status === 'pending') return 'Pending review';
  return 'Needs update';
}

export function ProductListItem({ product, onMenu, onPress }: Props) {
  const statusColor = getStatusColor(product.authStatus);

  // Derive some dummy stats for visual fidelity with the design
  const weeklySales = product.authStatus === 'failed' ? 0 : Math.floor(product.authScore / 2);
  const inventory = product.authStatus === 'failed' ? 0 : product.authScore;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onMenu}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}`}
    >
      <View style={styles.topRow}>
        <View style={styles.thumb}>
          {product.photos[0] ? (
            <Image source={{ uri: product.photos[0] }} style={[styles.image, product.authStatus === 'failed' && styles.imageDisabled]} />
          ) : (
            <MaterialIcons name="inventory-2" size={30} color={Colors.primary} />
          )}
        </View>

        <View style={styles.infoCol}>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.title, product.authStatus === 'failed' && styles.titleDisabled]} numberOfLines={2}>
                {product.title || 'Untitled product'}
              </Text>
              <View style={[styles.statusPill, { borderColor: statusColor }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusLabel(product.authStatus)}
                </Text>
              </View>
            </View>
            <Text style={styles.sku}>SKU: {product.serialNumber || 'N/A'}</Text>
          </View>
          <Text style={[styles.price, product.authStatus === 'failed' && styles.priceDisabled]}>{formatPrice(product.price)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.statsGroup}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Weekly Sales</Text>
            <Text style={[styles.statValue, product.authStatus === 'failed' && styles.statValueDisabled]}>{weeklySales} units</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, product.authStatus === 'pending' && styles.statLabelWarning]}>Inventory</Text>
            <Text style={[styles.statValue, product.authStatus === 'failed' && styles.statValueDisabled]}>{inventory}</Text>
          </View>
        </View>
        <Pressable
          onPress={onMenu}
          hitSlop={10}
          style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
          accessibilityRole="button"
        >
          <MaterialIcons name="more-vert" size={20} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: Spacing.sm,
    flexDirection: 'column',
    gap: Spacing.sm,
    ...Shadow.card,
  },
  pressed: { opacity: 0.72 },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imageDisabled: { opacity: 0.7 },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  titleRow: {
    gap: Spacing.xs,
  },
  statusPill: {
    alignSelf: 'flex-start',
    minHeight: 26,
    borderRadius: Radii.full,
    borderWidth: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.onSurface,
  },
  titleDisabled: { color: Colors.onSurfaceVariant },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: Radii.full,
  },
  statusText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
  },
  sku: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  price: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    color: Colors.onBackground,
    marginTop: Spacing.xs,
  },
  priceDisabled: { color: Colors.onSurfaceVariant },
  divider: {
    height: 1,
    backgroundColor: Colors.secondaryContainer,
    opacity: 0.5,
    marginVertical: Spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCol: {
    flexDirection: 'column',
  },
  statLabel: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabelWarning: { color: Colors.warning },
  statValue: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  statValueDisabled: { color: Colors.onSurfaceVariant },
  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnPressed: { backgroundColor: Colors.surfaceContainer },
});
