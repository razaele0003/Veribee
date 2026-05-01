import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ProductListItem } from '@/components/seller/ProductListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { LocalProduct, useSellerStore } from '@/store/sellerStore';
import { ProductImages } from '@/constants/productImages';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type ProductTab = 'verified' | 'pending' | 'failed';

const previewProducts: LocalProduct[] = [
  {
    id: 'preview-watch',
    photos: [ProductImages.watch],
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
    photos: [ProductImages.tote],
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
    photos: [ProductImages.sneakers],
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
    photos: [ProductImages.pendant],
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

type SortMode = 'recent' | 'price-high' | 'price-low' | 'title';

export default function Products() {
  const router = useRouter();
  const storeProducts = useSellerStore((s) => s.products);
  const removeProduct = useSellerStore((s) => s.removeProduct);
  const [activeTab, setActiveTab] = useState<ProductTab | 'all'>('all');
  const [menuProduct, setMenuProduct] = useState<LocalProduct | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const products = useMemo(
    () => (storeProducts.length > 0 ? storeProducts : previewProducts),
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

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    const base = activeTab === 'all' ? products : products.filter((product) => product.authStatus === activeTab);
    const matched = term
      ? base.filter(
          (product) =>
            product.title.toLowerCase().includes(term) ||
            product.brand.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term),
        )
      : base;

    const sorted = [...matched];
    if (sortMode === 'price-high') {
      sorted.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortMode === 'price-low') {
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortMode === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      );
    }
    return sorted;
  }, [products, activeTab, searchQuery, sortMode]);

  const sortOptions: Array<{ key: SortMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
    { key: 'recent', label: 'Most recent', icon: 'schedule' },
    { key: 'price-high', label: 'Price: high to low', icon: 'arrow-downward' },
    { key: 'price-low', label: 'Price: low to high', icon: 'arrow-upward' },
    { key: 'title', label: 'Title (A→Z)', icon: 'sort-by-alpha' },
  ];

  const openMenu = (product: LocalProduct) => {
    setMenuProduct(product);
  };

  const deleteMenuProduct = () => {
    if (!menuProduct) return;
    removeProduct(menuProduct.id);
    setMenuProduct(null);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarPlaceholder} />
          <Text style={styles.headerTitle}>Seller Hub</Text>
        </View>
        <Pressable
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <MaterialIcons name="notifications" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Inventory</Text>
          <Text style={styles.pageSubtitle}>Manage and track your products.</Text>
        </View>

        <View style={styles.controlsArea}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, SKU, or tag..."
              placeholderTextColor={Colors.onSurfaceVariant}
              style={styles.searchInput}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <Pressable style={styles.filterPill} onPress={() => setSortSheetOpen(true)}>
              <MaterialIcons name="sort" size={18} color={Colors.onSurface} />
              <Text style={styles.filterText}>Sort: Highest Sales</Text>
            </Pressable>
            <Pressable style={styles.filterPill}>
              <MaterialIcons name="filter-list" size={18} color={Colors.onSurface} />
              <Text style={styles.filterText}>Status: All</Text>
            </Pressable>
            <Pressable style={styles.filterPill}>
              <MaterialIcons name="category" size={18} color={Colors.onSurface} />
              <Text style={styles.filterText}>Category</Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={styles.listContainer}>
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
          <EmptyState
            icon="inventory-2"
            title="No products here yet"
            subtitle="New listings will appear here after you submit them for verification."
            actionLabel="Add product"
            onAction={() => router.push('/(seller)/add-product/step1-basic')}
          />
        )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push('/(seller)/add-product/step1-basic')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        accessibilityRole="button"
        accessibilityLabel="Add product"
      >
        <MaterialIcons name="add" size={24} color={Colors.onPrimary} style={styles.fabIcon} />
        <Text style={styles.fabText}>Add Product</Text>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={!!menuProduct}
        onRequestClose={() => setMenuProduct(null)}
      >
        <Pressable style={styles.menuScrimCenter} onPress={() => setMenuProduct(null)}>
          <Pressable style={[styles.menuCard, { width: 240 }]}>
            <Text style={styles.menuTitle}>{menuProduct?.title || 'Product actions'}</Text>
            <Pressable
              onPress={() => {
                const target = menuProduct;
                setMenuProduct(null);
                if (target) {
                  router.push({
                    pathname: '/(seller)/edit-product/[id]',
                    params: { id: target.id },
                  });
                }
              }}
              style={styles.menuRow}
            >
              <MaterialIcons name="edit" size={21} color={Colors.onSurfaceVariant} />
              <Text style={styles.menuText}>Edit</Text>
            </Pressable>
            <Pressable onPress={deleteMenuProduct} style={styles.menuRow}>
              <MaterialIcons name="delete-outline" size={21} color={Colors.error} />
              <Text style={[styles.menuText, styles.menuTextDanger]}>Delete</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={sortSheetOpen}
        onRequestClose={() => setSortSheetOpen(false)}
      >
        <Pressable style={styles.menuScrimTopLeft} onPress={() => setSortSheetOpen(false)}>
          <Pressable style={[styles.menuCard, { width: 220 }]}>
            <Text style={styles.menuTitle}>Sort inventory</Text>
            {sortOptions.map((option) => {
              const active = option.key === sortMode;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    setSortMode(option.key);
                    setSortSheetOpen(false);
                  }}
                  style={styles.menuRow}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <MaterialIcons
                    name={option.icon}
                    size={20}
                    color={active ? Colors.primary : Colors.onSurfaceVariant}
                  />
                  <Text style={[styles.menuText, active && styles.menuTextActive]}>
                    {option.label}
                  </Text>
                  {active && (
                    <MaterialIcons name="check" size={20} color={Colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.sheet,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    ...Shadow.input,
  },
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.full,
    backgroundColor: 'transparent',
  },
  pressed: { opacity: 0.72 },
  content: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.xl,
  },
  titleSection: {
    gap: Spacing.base,
  },
  pageTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.8,
    color: Colors.onBackground,
  },
  pageSubtitle: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  controlsArea: {
    gap: Spacing.sm,
  },
  searchBar: {
    height: 48,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  filterScroll: {
    gap: Spacing.sm,
    paddingBottom: 8,
  },
  filterPill: {
    height: 48,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 12,
    color: Colors.onSurface,
  },
  listContainer: {
    gap: Spacing.md,
  },
  fab: {
    position: 'absolute',
    right: Spacing.containerMargin,
    bottom: 88,
    height: 48,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.fab,
  },
  fabIcon: {
    fontWeight: '600',
  },
  fabText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    color: Colors.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fabPressed: { opacity: 0.78, transform: [{ scale: 0.95 }] },
  menuScrimCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.containerMargin,
  },
  menuScrimTopLeft: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 64,
    paddingLeft: Spacing.containerMargin,
  },
  menuCard: {
    borderRadius: Radii.card,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.sheet,
  },
  menuTitle: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  menuRow: {
    minHeight: 52,
    borderRadius: Radii.DEFAULT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  menuText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  menuTextDanger: { color: Colors.error },
  menuTextActive: { color: Colors.primary },
});
