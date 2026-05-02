import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { ProductImageSource, resolveImageSource } from '@/constants/productImages';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export type OrderItemData = {
  id: string;
  buyerName: string;
  productTitle: string;
  price: number;
  status: string;
  thumbnailUrl?: ProductImageSource;
};

type Props = {
  order: OrderItemData;
};

function formatPrice(value: number) {
  return `PHP ${Math.round(value).toLocaleString('en-PH')}`;
}

function statusTone(status: string) {
  const value = status.toLowerCase();
  if (value.includes('pending')) {
    return {
      bg: Colors.primaryContainer,
      fg: Colors.onPrimary,
    };
  }
  return {
    bg: Colors.surfaceContainerHigh,
    fg: Colors.onSurfaceVariant,
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function OrderItem({ order }: Props) {
  const tone = statusTone(order.status);

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(order.buyerName)}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.product} numberOfLines={1}>
            {order.productTitle}
          </Text>
          <Text style={styles.buyer} numberOfLines={1}>
            {order.buyerName}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.thumb}>
          {order.thumbnailUrl ? (
            <Image source={resolveImageSource(order.thumbnailUrl)} style={styles.image} />
          ) : (
            <MaterialIcons
              name="inventory-2"
              size={24}
              color={Colors.primary}
            />
          )}
        </View>
        <Text style={styles.price}>{formatPrice(order.price)}</Text>
        <View style={[styles.status, { backgroundColor: tone.bg }]}>
          <Text style={[styles.statusText, { color: tone.fg }]}>
            {order.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 94,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.card,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    ...Shadow.card,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.primary,
  },
  copy: { flex: 1, minWidth: 0 },
  product: {
    fontFamily: Fonts.manropeBold,
    fontSize: 17,
    lineHeight: 23,
    color: Colors.onSurface,
  },
  buyer: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  price: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    lineHeight: 21,
    color: Colors.primary,
  },
  status: {
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    lineHeight: 15,
  },
});
