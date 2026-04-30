import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Logo } from '@/components/ui/Logo';
import { ProductCard } from '@/components/buyer/ProductCard';
import { BUYER_PRODUCTS } from '@/lib/buyerData';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const categories = ['All', 'Electronics', 'Bags', 'Shoes', 'Jewelry'];

export default function BuyerHome() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const products = useMemo(
    () =>
      activeCategory === 'All'
        ? BUYER_PRODUCTS
        : BUYER_PRODUCTS.filter((product) => product.category === activeCategory),
    [activeCategory],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <View style={styles.brandRow}>
          <Logo size={32} />
          <Text style={styles.brand}>Veribee</Text>
        </View>
        <Pressable
          onPress={() => Alert.alert('Location', 'City picker comes next.')}
          style={({ pressed }) => [styles.locationPill, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Change location"
        >
          <MaterialIcons name="location-on" size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.locationText}>Metro Manila</Text>
          <MaterialIcons name="expand-more" size={16} color={Colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          onPress={() => Alert.alert('Notifications', 'Notifications come next.')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <MaterialIcons name="notifications-none" size={24} color={Colors.onSurface} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(product) => product.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Pressable
              onPress={() => router.push('/(buyer)/search')}
              style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Search verified products"
            >
              <MaterialIcons name="search" size={20} color={Colors.outline} />
              <Text style={styles.searchText}>Search verified products...</Text>
            </Pressable>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => setActiveCategory(category)}
                    style={[styles.chip, isActive && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
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
  appBar: {
    minHeight: 64,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brand: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
    color: Colors.primary,
  },
  locationPill: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  locationText: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurface,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
  pressed: { opacity: 0.72 },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.md,
  },
  searchBar: {
    minHeight: 48,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.outline,
  },
  chips: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  chip: {
    minHeight: 34,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Type.labelCaps,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: { color: Colors.onPrimary },
  productRow: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
});
