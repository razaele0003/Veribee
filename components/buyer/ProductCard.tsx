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
  const discount = product.price >= 15000 ? 12 : product.price >= 9000 ? 8 : 5;
  const soldCount = Math.max(18, Math.round(product.sellerVsi * 1.7));

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
        <View style={styles.imageShade} />
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
        <View style={styles.discountFlag}>
          <Text style={styles.discountValue}>{discount}%</Text>
          <Text style={styles.discountLabel}>OFF</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
          <View style={styles.authPill}>
            <MaterialIcons name="shield" size={11} color={Colors.tertiary} />
            <Text style={styles.authText}>{product.authScore}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPHP(product.price)}</Text>
          <Text style={styles.sold}>{soldCount} sold</Text>
        </View>
        <View style={styles.deliveryRow}>
          <MaterialIcons name="local-shipping" size={13} color={Colors.deal} />
          <Text style={styles.deliveryText}>Metro Manila verified route</Text>
        </View>
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
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Shadow.card,
  },
  pressed: { opacity: 0.72 },
  imageBlock: {
    aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  imageShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 58,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    borderRadius: Radii.full,
    paddingHorizontal: 7,
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
  discountFlag: {
    position: 'absolute',
    top: 0,
    right: Spacing.sm,
    width: 42,
    minHeight: 48,
    borderBottomLeftRadius: Radii.DEFAULT,
    borderBottomRightRadius: Radii.DEFAULT,
    backgroundColor: Colors.warningContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  discountValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 13,
    color: Colors.warning,
  },
  discountLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 8,
    color: Colors.onWarningContainer,
  },
  content: {
    padding: Spacing.sm,
    gap: 7,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryPill: {
    minHeight: 24,
    borderRadius: Radii.full,
    backgroundColor: Colors.dealContainer,
    paddingHorizontal: 8,
    justifyContent: 'center',
    flexShrink: 1,
  },
  categoryText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onDealContainer,
  },
  authPill: {
    minHeight: 24,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  authText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onTertiaryContainer,
  },
  title: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.onSurface,
  },
  price: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 17,
    color: Colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  sold: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  deliveryRow: {
    minHeight: 24,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
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
