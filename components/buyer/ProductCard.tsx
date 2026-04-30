import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BuyerProduct, formatPHP } from '@/lib/buyerData';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type Props = {
  product: BuyerProduct;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const isVerified = product.authStatus === 'verified';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatPHP(product.price)}`}
    >
      <View style={styles.imageBlock}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <MaterialIcons name="inventory-2" size={42} color={Colors.primary} />
        )}
        <View
          style={[
            styles.badge,
            isVerified ? styles.badgeVerified : styles.badgePending,
          ]}
        >
          <MaterialIcons
            name={isVerified ? 'verified' : 'schedule'}
            size={12}
            color={isVerified ? Colors.onSecondaryContainer : Colors.onTertiaryContainer}
          />
          <Text
            style={[
              styles.badgeText,
              isVerified ? styles.badgeTextVerified : styles.badgeTextPending,
            ]}
          >
            {isVerified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>{formatPHP(product.price)}</Text>
        <View style={styles.sellerRow}>
          <Text style={styles.seller} numberOfLines={1}>
            {product.sellerName}
          </Text>
          <View style={styles.vsiPill}>
            <Text style={styles.vsiText}>VSI {product.sellerVsi}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Shadow.card,
  },
  pressed: { opacity: 0.72 },
  imageBlock: {
    aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeVerified: { backgroundColor: Colors.secondaryContainer },
  badgePending: { backgroundColor: Colors.tertiaryContainer },
  badgeText: {
    ...Type.labelCaps,
    fontSize: 10,
    lineHeight: 12,
  },
  badgeTextVerified: { color: Colors.onSecondaryContainer },
  badgeTextPending: { color: Colors.onTertiaryContainer },
  content: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.onSurface,
  },
  price: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.primary,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  seller: {
    flex: 1,
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  vsiPill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  vsiText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
  },
});
