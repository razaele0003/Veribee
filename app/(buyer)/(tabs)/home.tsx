import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { BUYER_PRODUCTS, BuyerProduct } from '@/lib/buyerData';
import { BUYER_LOCATIONS, BuyerLocation, useBuyerPrefsStore } from '@/store/buyerPrefsStore';
import { useCartStore } from '@/store/cartStore';
import { useBuyerPrefsStore as useSavedStore } from '@/store/buyerPrefsStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';
import { CategoryImages, ProductImages, ProductImageSource, resolveImageSource } from '@/constants/productImages';

type CategoryTile = {
  label: string;
  category: string;
  imageUrl: ProductImageSource;
};

type StitchProduct = {
  product: BuyerProduct;
  title: string;
  seller: string;
  price: string;
  msrp?: string;
  discount?: string;
  imageUrl: ProductImageSource;
};

const categories: CategoryTile[] = [
  {
    label: 'Electronics',
    category: 'Electronics',
    imageUrl: CategoryImages.electronics,
  },
  {
    label: 'Bags',
    category: 'Bags',
    imageUrl: CategoryImages.bags,
  },
  {
    label: 'Shoes',
    category: 'Shoes',
    imageUrl: CategoryImages.shoes,
  },
  {
    label: 'Jewelry',
    category: 'Jewelry',
    imageUrl: CategoryImages.jewelry,
  },
];

const stitchProducts: StitchProduct[] = [
  {
    product: BUYER_PRODUCTS[0],
    title: 'Minimalist Smartwatch',
    seller: 'TechBrand Inc.',
    price: '$249.00',
    msrp: '$295.00',
    discount: '15% OFF',
    imageUrl: ProductImages.marketWatch,
  },
  {
    product: BUYER_PRODUCTS[0],
    title: 'Studio Pro Headphones',
    seller: 'AudioPhile',
    price: '$349.00',
    imageUrl: ProductImages.headphones,
  },
  {
    product: BUYER_PRODUCTS[3],
    title: 'Heritage Chronograph',
    seller: 'TimePiece Co.',
    price: '$590.00',
    discount: 'NEW',
    imageUrl: ProductImages.chronograph,
  },
];

export default function BuyerHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [locationOpen, setLocationOpen] = useState(false);
  const location = useBuyerPrefsStore((s) => s.location);
  const setLocation = useBuyerPrefsStore((s) => s.setLocation);
  const categoryTileWidth = Math.floor(
    (width - Spacing.md * 2 - Spacing.md) / 2,
  );

  const chooseLocation = (next: BuyerLocation) => {
    setLocation(next);
    setLocationOpen(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => router.push('/(buyer)/(tabs)/search')}
          style={({ pressed }) => [styles.searchInput, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Search verified items"
        >
          <MaterialIcons name="search" size={15} color={Colors.onSurfaceVariant} />
          <Text style={styles.searchText} numberOfLines={1}>Search verified items...</Text>
          <MaterialIcons name="photo-camera" size={16} color={Colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/(buyer)/(tabs)/orders')}
          hitSlop={10}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Messages"
        >
          <MaterialIcons name="chat-bubble-outline" size={22} color={Colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/(buyer)/(tabs)/cart')}
          hitSlop={10}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Cart"
        >
          <MaterialIcons name="shopping-bag" size={22} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <Pressable
              key={category.label}
              onPress={() => router.push('/(buyer)/(tabs)/search')}
              style={({ pressed }) => [
                styles.categoryCard,
                { width: categoryTileWidth },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Browse ${category.label}`}
            >
              <Image source={resolveImageSource(category.imageUrl)} style={styles.categoryImage} resizeMode="cover" />
              <View style={styles.categoryOverlay} />
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Curated for you</Text>
            <Text style={styles.sectionSubtitle}>Authentic, verified items ready for delivery.</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(buyer)/(tabs)/search')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="View all products"
          >
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </Pressable>
        </View>

        {stitchProducts.map((item) => (
          <StitchProductCard key={item.title} item={item} />
        ))}

        <Pressable
          onPress={() => setLocationOpen(true)}
          style={({ pressed }) => [styles.locationCard, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Change location, currently ${location}`}
        >
          <MaterialIcons name="location-on" size={18} color={Colors.primary} />
          <Text style={styles.locationText}>{location}</Text>
          <MaterialIcons name="expand-more" size={18} color={Colors.primary} />
        </Pressable>
      </ScrollView>

      <Modal
        transparent
        animationType="slide"
        visible={locationOpen}
        onRequestClose={() => setLocationOpen(false)}
      >
        <Pressable style={styles.sheetScrim} onPress={() => setLocationOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choose your city</Text>
            <Text style={styles.sheetBody}>We'll show verified sellers and riders available in your area.</Text>
            <View style={styles.sheetList}>
              {BUYER_LOCATIONS.map((option) => {
                const selected = option === location;
                return (
                  <Pressable
                    key={option}
                    onPress={() => chooseLocation(option)}
                    style={({ pressed }) => [styles.sheetRow, pressed && styles.sheetRowPressed]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color={selected ? Colors.primary : Colors.onSurfaceVariant}
                    />
                    <Text style={[styles.sheetRowLabel, selected && styles.sheetRowLabelActive]}>{option}</Text>
                    {selected && <MaterialIcons name="check" size={20} color={Colors.primary} />}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function StitchProductCard({ item }: { item: StitchProduct }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const savedProductIds = useSavedStore((s) => s.savedProductIds);
  const toggleSavedProduct = useSavedStore((s) => s.toggleSavedProduct);
  const saved = savedProductIds.includes(item.product.id);

  const addToCart = () => {
    addItem({
      productId: item.product.id,
      title: item.title,
      price: item.product.price,
      sellerId: item.product.sellerId,
      sellerName: item.seller,
      imageUrl: item.imageUrl,
      quantity: 1,
      authStatus: item.product.authStatus,
    });
  };

  return (
    <Pressable
      onPress={() => router.push(`/(buyer)/product/${item.product.id}`)}
      style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
    >
      <View style={styles.productImageWrap}>
        <Image source={resolveImageSource(item.imageUrl)} style={styles.productImage} resizeMode="cover" />
        <View style={styles.verifiedBadge}>
          <MaterialIcons name="verified" size={12} color={Colors.onSecondaryContainer} />
          <Text style={styles.verifiedText}>VERIFIED</Text>
        </View>
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}
        <Pressable
          onPress={() => toggleSavedProduct(item.product.id)}
          hitSlop={12}
          style={styles.favoriteButton}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved' : 'Save product'}
          accessibilityState={{ selected: saved }}
        >
          <MaterialIcons name={saved ? 'favorite' : 'favorite-border'} size={21} color={Colors.onSurface} />
        </Pressable>
      </View>
      <View style={styles.productCopy}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productSeller}>{item.seller}</Text>
        <View style={styles.productFooter}>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{item.price}</Text>
            {item.msrp && <Text style={styles.productMsrp}>{item.msrp}</Text>}
          </View>
          <Pressable
            onPress={addToCart}
            hitSlop={10}
            style={[styles.addButton, !item.discount && styles.addButtonSecondary]}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.title} to cart`}
          >
            <MaterialIcons
              name="add-shopping-cart"
              size={20}
              color={item.discount ? Colors.onPrimary : Colors.onSurface}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcf9f8' },
  appBar: {
    minHeight: 64,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eae7e7',
    backgroundColor: '#fcf9f8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 32,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    minHeight: 38,
    borderRadius: Radii.full,
    backgroundColor: '#f6f3f2',
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  searchText: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: 116,
    gap: Spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    aspectRatio: 4 / 3,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    backgroundColor: '#e5e2e1',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  categoryLabel: {
    position: 'absolute',
    left: Spacing.md,
    bottom: Spacing.md,
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 18,
    color: Colors.onPrimary,
  },
  sectionHeader: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  sectionCopy: { flex: 1 },
  sectionTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 25,
    lineHeight: 31,
    color: '#1c1b1b',
  },
  sectionSubtitle: {
    marginTop: 6,
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  viewAll: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: Colors.primary,
  },
  productCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#e5e2e1',
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Shadow.card,
  },
  productImageWrap: {
    aspectRatio: 1.12,
    backgroundColor: '#f6f3f2',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    minHeight: 24,
    borderRadius: Radii.sm,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.onSecondaryContainer,
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    minHeight: 30,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onPrimary,
  },
  favoriteButton: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  productCopy: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  productTitle: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 18,
    lineHeight: 23,
    color: '#1c1b1b',
  },
  productSeller: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  productFooter: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  productPrice: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    lineHeight: 25,
    color: '#1c1b1b',
  },
  productMsrp: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonSecondary: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  locationCard: {
    minHeight: 44,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  locationText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.primary,
  },
  pressed: { opacity: 0.72 },
  sheetScrim: {
    flex: 1,
    backgroundColor: Colors.inverseSurface,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    ...Shadow.sheet,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.outlineVariant,
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    lineHeight: 31,
    color: Colors.onSurface,
  },
  sheetBody: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
  },
  sheetList: {
    marginTop: Spacing.sm,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  sheetRow: {
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceVariant,
  },
  sheetRowPressed: { backgroundColor: Colors.surfaceContainerLow },
  sheetRowLabel: {
    flex: 1,
    fontFamily: Fonts.manropeMedium,
    fontSize: 15,
    color: Colors.onSurface,
  },
  sheetRowLabelActive: {
    fontFamily: Fonts.manropeBold,
    color: Colors.primary,
  },
});
