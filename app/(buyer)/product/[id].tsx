import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { findBuyerProduct, formatPHP } from '@/lib/buyerData';
import { useCartStore } from '@/store/cartStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const product = findBuyerProduct(id);
  const addItem = useCartStore((s) => s.addItem);

  const addToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      imageUrl: product.imageUrl,
      quantity: 1,
      authStatus: product.authStatus,
    });
    Alert.alert('Added to cart', `${product.title} is now in your cart.`, [
      { text: 'Keep Browsing' },
      { text: 'View Cart', onPress: () => router.push('/(buyer)/cart') },
    ]);
  };

  const buyNow = () => {
    addToCart();
    router.push('/(buyer)/cart');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={26} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Veribee</Text>
        <Pressable
          onPress={() => Alert.alert('Saved', 'Saved products come next.')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Save product"
        >
          <MaterialIcons name="favorite-border" size={24} color={Colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroImage}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <MaterialIcons name="inventory-2" size={72} color={Colors.primary} />
          )}
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{formatPHP(product.price)}</Text>
        </View>

        <View style={styles.verifiedBanner}>
          <MaterialIcons name="verified" size={22} color={Colors.onSecondaryContainer} />
          <Text style={styles.verifiedText}>
            Veribee Verified - Authenticated April 20, 2026
          </Text>
        </View>

        <View style={styles.sellerCard}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerInitial}>{product.sellerName[0]}</Text>
            <View style={styles.vsiBadge}>
              <Text style={styles.vsiBadgeText}>{product.sellerVsi}</Text>
            </View>
          </View>
          <View style={styles.sellerCopy}>
            <Text style={styles.sellerName}>{product.sellerName}</Text>
            <Text style={styles.sellerMeta}>Elite Verified Seller</Text>
          </View>
          <Pressable
            onPress={() => Alert.alert('Seller profile', 'Seller profile comes next.')}
            hitSlop={10}
          >
            <Text style={styles.viewProfile}>View Profile</Text>
          </Pressable>
        </View>

        <View style={styles.descriptionBlock}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.bulletRow}>
            <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
            <Text style={styles.bulletText}>Serial and photo evidence reviewed</Text>
          </View>
          <View style={styles.bulletRow}>
            <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
            <Text style={styles.bulletText}>Seller transaction history included in VSI</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button title="Add to Cart" variant="outlined" onPress={addToCart} style={styles.action} />
        <Button title="Buy Now" onPress={buyNow} style={styles.action} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72 },
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.primary,
  },
  content: { paddingBottom: 112 },
  heroImage: {
    aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  titleBlock: {
    padding: Spacing.containerMargin,
    gap: Spacing.sm,
  },
  title: { ...Type.h2, color: Colors.onSurface },
  price: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 36,
    lineHeight: 40,
    color: Colors.primary,
  },
  verifiedBanner: {
    marginHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.lg,
    borderRadius: Radii.lg,
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 1,
    borderColor: Colors.secondaryFixedDim,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  verifiedText: {
    flex: 1,
    ...Type.labelCaps,
    color: Colors.onSecondaryContainer,
  },
  sellerCard: {
    marginHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.xl,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  sellerAvatar: {
    width: 64,
    height: 64,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInitial: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    color: Colors.primary,
  },
  vsiBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsiBadgeText: {
    ...Type.labelCaps,
    fontSize: 9,
    color: Colors.onPrimary,
  },
  sellerCopy: { flex: 1 },
  sellerName: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  sellerMeta: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.secondary,
    marginTop: Spacing.xs,
  },
  viewProfile: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.primary,
  },
  descriptionBlock: {
    paddingHorizontal: Spacing.containerMargin,
    gap: Spacing.sm,
  },
  sectionTitle: { ...Type.h3, color: Colors.onSurface },
  description: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bulletText: {
    flex: 1,
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  action: { flex: 1 },
});
