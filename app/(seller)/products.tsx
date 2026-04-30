import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ProductListItem } from '@/components/seller/ProductListItem';
import { LocalProduct, useSellerStore } from '@/store/sellerStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type ProductTab = 'verified' | 'pending' | 'failed';

const previewProducts: LocalProduct[] = [
  {
    id: 'preview-watch',
    photos: [],
    title: 'Series 9 Chronograph',
    category: 'Electronics',
    price: '18500',
    description: 'Luxury chronograph watch.',
    serialNumber: 'VB-WATCH-001',
    brand: 'Other',
    model: 'Series 9',
    evidencePhotos: [],
    submittedAt: new Date().toISOString(),
    authStatus: 'verified',
    authScore: 96,
  },
  {
    id: 'preview-tote',
    photos: [],
    title: 'Classic Artisan Tote',
    category: 'Bags',
    price: '12990',
    description: 'Artisan leather tote.',
    serialNumber: 'VB-BAG-002',
    brand: 'Other',
    model: 'Classic Tote',
    evidencePhotos: [],
    submittedAt: new Date().toISOString(),
    authStatus: 'verified',
    authScore: 94,
  },
  {
    id: 'preview-sneakers',
    photos: [],
    title: 'Urban Kicks',
    category: 'Shoes',
    price: '8450',
    description: 'Modern urban sneakers.',
    serialNumber: 'VB-SHOE-003',
    brand: 'Nike',
    model: 'Urban Kicks',
    evidencePhotos: [],
    submittedAt: new Date().toISOString(),
    authStatus: 'pending',
    authScore: 0,
  },
  {
    id: 'preview-rejected',
    photos: [],
    title: 'Logo Label Wallet',
    category: 'Bags',
    price: '3900',
    description: 'Wallet pending resubmission.',
    serialNumber: 'VB-WALLET-004',
    brand: 'Other',
    model: 'Logo Wallet',
    evidencePhotos: [],
    submittedAt: new Date().toISOString(),
    authStatus: 'failed',
    authScore: 42,
    reviewerNotes: 'Brand label photo is unclear. Upload a sharper image.',
  },
];

const tabs: Array<{ key: ProductTab; label: string }> = [
  { key: 'verified', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Rejected' },
];

export default function Products() {
  const router = useRouter();
  const storeProducts = useSellerStore((s) => s.products);
  const removeProduct = useSellerStore((s) => s.removeProduct);
  const [activeTab, setActiveTab] = useState<ProductTab>('verified');
  const products = useMemo(
    () => [...storeProducts, ...previewProducts],
    [storeProducts],
  );
  const counts = useMemo(
    () => ({
      verified: products.filter((product) => product.authStatus === 'verified').length,
      pending: products.filter((product) => product.authStatus === 'pending').length,
      failed: products.filter((product) => product.authStatus === 'failed').length,
    }),
    [products],
  );
  const filteredProducts = products.filter(
    (product) => product.authStatus === activeTab,
  );

  const openMenu = (product: LocalProduct) => {
    Alert.alert(product.title || 'Product actions', 'Choose an action.', [
      {
        text: 'Edit',
        onPress: () => Alert.alert('Edit product', 'Edit flow comes next.'),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeProduct(product.id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openProduct = (product: LocalProduct) => {
    if (product.authStatus === 'pending') {
      Alert.alert('Verification pending', 'This listing is still being reviewed.');
      return;
    }

    const result = product.authStatus === 'failed' ? 'failed' : 'verified';
    router.push({
      pathname: '/(seller)/auth-status/[id]',
      params: { id: product.id, result },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => Alert.alert('Menu', 'Inventory filters come next.')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open inventory menu"
        >
          <MaterialIcons name="menu" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.title}>My Products</Text>
        <Pressable
          onPress={() => Alert.alert('Search', 'Product search comes next.')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Search products"
        >
          <MaterialIcons name="search" size={26} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label} ({counts[tab.key]})
              </Text>
              <View style={[styles.tabLine, isActive && styles.tabLineActive]} />
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onMenu={() => openMenu(product)}
              onPress={() => openProduct(product)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="inventory-2" size={36} color={Colors.primary} />
            <Text style={styles.emptyTitle}>No products here yet</Text>
            <Text style={styles.emptyBody}>
              New listings will appear here after you submit them for verification.
            </Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/(seller)/add-product/step1-basic')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        accessibilityRole="button"
        accessibilityLabel="Add product"
      >
        <MaterialIcons name="add" size={30} color={Colors.onPrimary} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
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
  title: {
    ...Type.h3,
    fontFamily: Fonts.epilogueBold,
    color: Colors.primary,
  },
  tabs: {
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  tabText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  tabTextActive: { color: Colors.primary },
  tabLine: {
    height: 2,
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    marginTop: Spacing.md,
  },
  tabLineActive: { backgroundColor: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.md,
  },
  emptyState: {
    minHeight: 240,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  emptyBody: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.fab,
  },
  fabPressed: { opacity: 0.78 },
});
