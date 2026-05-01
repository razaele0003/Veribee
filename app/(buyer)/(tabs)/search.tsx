import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ProductCard } from '@/components/buyer/ProductCard';
import { BUYER_PRODUCTS, BuyerProduct } from '@/lib/buyerData';
import { sellerProductToBuyerProduct, supabaseProductToBuyerProduct } from '@/lib/marketplaceProducts';
import { supabase } from '@/lib/supabase';
import { useSellerStore } from '@/store/sellerStore';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

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
      <View style={styles.header}>
        <Text style={styles.headerKicker}>VERIFIED MARKET SEARCH</Text>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color={Colors.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search verified products..."
            placeholderTextColor={Colors.outline}
            style={styles.input}
            autoFocus
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <MaterialIcons name="cancel" size={18} color={Colors.outline} />
            </Pressable>
          )}
        </View>
        <View style={styles.quickFilters}>
          {['Luxury bags', 'Sneakers', 'Watches'].map((filter) => (
            <Pressable key={filter} onPress={() => setQuery(filter)} style={styles.filterChip}>
              <Text style={styles.filterText}>{filter}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <FlatList
        data={results}
        keyExtractor={(product) => product.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.resultTitle}>{results.length} verified finds</Text>
              <Text style={styles.resultSubtitle}>Sorted by trusted local marketplace signals</Text>
            </View>
            <View style={styles.resultBadge}>
              <MaterialIcons name="shield" size={15} color={Colors.onSecondaryContainer} />
              <Text style={styles.resultBadgeText}>VSI</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/(buyer)/product/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  headerKicker: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.secondaryContainer,
    textTransform: 'uppercase',
  },
  searchBar: {
    minHeight: 52,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 16,
    color: Colors.onSurface,
    outlineStyle: 'none',
  } as any,
  quickFilters: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    minHeight: 34,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onPrimary,
  },
  content: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.md,
    paddingBottom: 112,
    gap: Spacing.md,
  },
  resultHeader: {
    width: '100%',
    marginBottom: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  resultTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  resultSubtitle: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 3,
  },
  resultBadge: {
    minHeight: 34,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
  },
  resultBadgeText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onSecondaryContainer,
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
});
