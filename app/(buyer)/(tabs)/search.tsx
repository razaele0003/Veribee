import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
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
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={22} color={Colors.outline} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search verified products..."
          placeholderTextColor={Colors.outline}
          style={styles.input}
          autoFocus
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(product) => product.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
  searchBar: {
    minHeight: 52,
    margin: Spacing.containerMargin,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
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
  content: {
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.md,
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
});
