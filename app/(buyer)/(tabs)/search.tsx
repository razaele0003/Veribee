import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { BUYER_PRODUCTS, BuyerProduct, formatPHP } from '@/lib/buyerData';
import { sellerProductToBuyerProduct, supabaseProductToBuyerProduct } from '@/lib/marketplaceProducts';
import { supabase } from '@/lib/supabase';
import { useBuyerPrefsStore } from '@/store/buyerPrefsStore';
import { useCartStore } from '@/store/cartStore';
import { useSellerStore } from '@/store/sellerStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const quickFilters = ['Bags', 'Shoes', 'Electronics', 'Jewelry'];

export default function BuyerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [liveProducts, setLiveProducts] = useState<BuyerProduct[]>([]);
  const sellerProducts = useSellerStore((s) => s.products);

  useEffect(() => {
    let cancelled = false;
    async function searchProducts() {
      const term = query.trim();
      let request = supabase
        .from('products')
        .select('id, title, category, price, description, seller_id, images, seller:seller_profiles(store_name, vsi_score)')
        .eq('auth_status', 'verified')
        .limit(20);

      if (term) {
        request = request.ilike('title', `%${term}%`);
      }

      const { data, error } = await request;
      if (cancelled) return;
      setLiveProducts(error || !data ? [] : data.map(supabaseProductToBuyerProduct));
    }

    searchProducts();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const marketplaceProducts = useMemo(
    () => [
      ...sellerProducts
        .filter((product) => product.authStatus === 'verified')
        .map(sellerProductToBuyerProduct),
      ...(liveProducts.length > 0 ? liveProducts : BUYER_PRODUCTS),
    ],
    [liveProducts, sellerProducts],
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return marketplaceProducts;
    return marketplaceProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.sellerName.toLowerCase().includes(term),
    );
  }, [marketplaceProducts, query]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={23} color={Colors.onSurfaceVariant} />
        </Pressable>
        <View style={styles.searchInput}>
          <MaterialIcons name="search" size={15} color={Colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search verified items..."
            placeholderTextColor={Colors.onSurfaceVariant}
            style={styles.input}
            autoFocus
          />
          {!!query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
              <MaterialIcons name="cancel" size={17} color={Colors.onSurfaceVariant} />
            </Pressable>
          ) : (
            <MaterialIcons name="photo-camera" size={16} color={Colors.onSurfaceVariant} />
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilters}>
          {quickFilters.map((filter) => {
            const active = query.toLowerCase() === filter.toLowerCase();
            return (
              <Pressable
                key={filter}
                onPress={() => setQuery(active ? '' : filter)}
                style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.resultTitle}>{results.length} verified finds</Text>
            <Text style={styles.resultSubtitle}>Authentic items ready for Veribee delivery.</Text>
          </View>
          <View style={styles.vsiBadge}>
            <MaterialIcons name="verified" size={14} color={Colors.onSecondaryContainer} />
            <Text style={styles.vsiText}>VSI</Text>
          </View>
        </View>

        {results.map((product) => (
          <SearchResultCard key={product.id} product={product} />
        ))}

        {results.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={34} color={Colors.primary} />
            <Text style={styles.emptyTitle}>No verified finds</Text>
            <Text style={styles.emptyBody}>Try a category like Bags, Shoes, Electronics, or Jewelry.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SearchResultCard({ product }: { product: BuyerProduct }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const savedProductIds = useBuyerPrefsStore((s) => s.savedProductIds);
  const toggleSavedProduct = useBuyerPrefsStore((s) => s.toggleSavedProduct);
  const saved = savedProductIds.includes(product.id);
  const msrp = Math.round(product.price * 1.35);

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
  };

  return (
    <Pressable
      onPress={() => router.push(`/(buyer)/product/${product.id}`)}
      style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${product.title}`}
    >
      <View style={styles.productImageWrap}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <MaterialIcons name="inventory-2" size={42} color={Colors.primary} />
        )}
        <View style={styles.verifiedBadge}>
          <MaterialIcons name="verified" size={12} color={Colors.onSecondaryContainer} />
          <Text style={styles.verifiedText}>VERIFIED</Text>
        </View>
        <Pressable
          onPress={() => toggleSavedProduct(product.id)}
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
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.productSeller}>{product.sellerName}</Text>
        <View style={styles.productFooter}>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{formatPHP(product.price)}</Text>
            <Text style={styles.productMsrp}>{formatPHP(msrp)}</Text>
          </View>
          <Pressable
            onPress={addToCart}
            hitSlop={10}
            style={styles.addButton}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.title} to cart`}
          >
            <MaterialIcons name="add-shopping-cart" size={20} color={Colors.onPrimary} />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eae7e7',
    backgroundColor: '#fcf9f8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backButton: {
    width: 34,
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
  input: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurface,
    outlineStyle: 'none',
  } as any,
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 116,
    gap: Spacing.md,
  },
  quickFilters: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterChip: {
    minHeight: 34,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: '#e5e2e1',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primaryFixed,
    borderColor: Colors.primaryFixedDim,
  },
  filterText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  filterTextActive: { color: Colors.primary },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  resultTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 25,
    lineHeight: 31,
    color: Colors.onSurface,
  },
  resultSubtitle: {
    marginTop: 5,
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  vsiBadge: {
    minHeight: 32,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vsiText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.onSecondaryContainer,
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
    alignItems: 'center',
    justifyContent: 'center',
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
    color: Colors.onSurface,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  productPrice: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    lineHeight: 25,
    color: Colors.onSurface,
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
  emptyState: {
    minHeight: 240,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#e5e2e1',
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  emptyTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
  },
  emptyBody: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  pressed: { opacity: 0.72 },
});
