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
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <MaterialIcons name="inventory-2" size={40} color={Colors.primary} />
        )}
        <View style={styles.imageShade} />
        <View style={[styles.statusBadge, isVerified ? styles.verifiedBadge : styles.pendingBadge]}>
          <MaterialIcons
            name={isVerified ? 'verified' : 'schedule'}
            size={13}
            color={isVerified ? Colors.onSecondaryContainer : Colors.onWarningContainer}
          />
          <Text style={[styles.statusText, isVerified ? styles.verifiedText : styles.pendingText]}>
            {isVerified ? 'Verified' : 'Reviewing'}
          </Text>
        </View>
        <View style={styles.discountFlag}>
          <Text style={styles.discountValue}>{discount}%</Text>
          <Text style={styles.discountLabel}>OFF</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {product.category}
            </Text>
          </View>
          <View style={styles.scorePill}>
            <MaterialIcons name="shield" size={12} color={Colors.tertiary} />
            <Text style={styles.scoreText}>{product.authScore}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPHP(product.price)}</Text>
          <Text style={styles.sold}>{soldCount} sold</Text>
        </View>

        <View style={styles.routePill}>
          <MaterialIcons name="local-shipping" size={13} color={Colors.deal} />
          <Text style={styles.routeText} numberOfLines={1}>
            Metro Manila verified
          </Text>
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
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Shadow.card,
  },
  pressed: { opacity: 0.76 },
  imageBlock: {
    aspectRatio: 1.04,
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
    height: 48,
    backgroundColor: 'rgba(33,27,24,0.2)',
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    minHeight: 28,
    maxWidth: '72%',
    borderRadius: Radii.full,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verifiedBadge: { backgroundColor: Colors.secondaryContainer },
  pendingBadge: { backgroundColor: Colors.warningContainer },
  statusText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  verifiedText: { color: Colors.onSecondaryContainer },
  pendingText: { color: Colors.onWarningContainer },
  discountFlag: {
    position: 'absolute',
    top: 0,
    right: Spacing.sm,
    width: 42,
    minHeight: 52,
    borderBottomLeftRadius: Radii.DEFAULT,
    borderBottomRightRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  discountValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 15,
    lineHeight: 18,
    color: Colors.warning,
  },
  discountLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 9,
    color: Colors.onWarningContainer,
  },
  content: {
    padding: Spacing.sm,
    gap: 7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryPill: {
    minHeight: 26,
    maxWidth: '64%',
    borderRadius: Radii.full,
    backgroundColor: Colors.dealContainer,
    paddingHorizontal: 9,
    justifyContent: 'center',
  },
  categoryText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onDealContainer,
  },
  scorePill: {
    minHeight: 26,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  scoreText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onTertiaryContainer,
  },
  title: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.onSurface,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  price: {
    flex: 1,
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    lineHeight: 22,
    color: Colors.primary,
  },
  sold: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  routePill: {
    minHeight: 28,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.warningContainer,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  routeText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onWarningContainer,
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
    backgroundColor: Colors.dealContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  vsiText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onDealContainer,
  },
});
