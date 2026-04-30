import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Badge, BadgeType } from '@/components/ui/Badge';
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

function badgeFor(status: LocalProduct['authStatus']): {
  type: BadgeType;
  label: string;
} {
  if (status === 'pending') return { type: 'pending', label: 'Pending Auth' };
  if (status === 'failed') return { type: 'rejected', label: 'Rejected' };
  return { type: 'verified', label: 'Live' };
}

function vsiDelta(status: LocalProduct['authStatus']) {
  if (status === 'verified') return '+2';
  if (status === 'pending') return '+0';
  return '+0';
}

export function ProductListItem({ product, onMenu, onPress }: Props) {
  const badge = badgeFor(product.authStatus);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onMenu}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${badge.label}`}
    >
      <View style={styles.thumb}>
        {product.photos[0] ? (
          <Image source={{ uri: product.photos[0] }} style={styles.image} />
        ) : (
          <MaterialIcons name="inventory-2" size={30} color={Colors.primary} />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.category}>{product.category || 'Uncategorized'}</Text>
          <Pressable
            onPress={onMenu}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Open actions for ${product.title}`}
          >
            <MaterialIcons name="more-vert" size={22} color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {product.title || 'Untitled product'}
        </Text>

        <View style={styles.metaRow}>
          <Badge type={badge.type} label={badge.label} />
          <View style={styles.vsiPill}>
            <Text style={styles.vsiText}>VSI {vsiDelta(product.authStatus)}</Text>
          </View>
        </View>

        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.md,
    ...Shadow.card,
  },
  pressed: { opacity: 0.72 },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  body: { flex: 1, gap: Spacing.xs },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  category: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  title: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 16,
    lineHeight: 21,
    color: Colors.onSurface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  vsiPill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.base,
    paddingVertical: 4,
  },
  vsiText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  price: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
});
