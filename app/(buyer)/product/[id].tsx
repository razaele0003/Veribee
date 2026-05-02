import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { Button } from '@/components/ui/Button';
import { findBuyerProduct, formatPHP } from '@/lib/buyerData';
import { sellerProductToBuyerProduct } from '@/lib/marketplaceProducts';
import { useCartStore } from '@/store/cartStore';
import { useBuyerPrefsStore } from '@/store/buyerPrefsStore';
import { useSellerStore } from '@/store/sellerStore';
import { resolveImageSource } from '@/constants/productImages';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';
import { useMemo, useState } from 'react';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const sellerProducts = useSellerStore((s) => s.products);
  const product = useMemo(() => {
    const productId = Array.isArray(id) ? id[0] : id;
    const localProduct = sellerProducts.find((item) => item.id === productId);
    return localProduct ? sellerProductToBuyerProduct(localProduct) : findBuyerProduct(id);
  }, [id, sellerProducts]);
  const addItem = useCartStore((s) => s.addItem);
  const isSaved = useBuyerPrefsStore((s) => s.savedProductIds.includes(product.id));
  const toggleSaved = useBuyerPrefsStore((s) => s.toggleSavedProduct);
  const [authReportOpen, setAuthReportOpen] = useState(false);

  const cartItem = () => ({
    productId: product.id,
    title: product.title,
    price: product.price,
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    imageUrl: product.imageUrl,
    quantity: 1,
    authStatus: product.authStatus,
  });

  const addToCart = () => {
    addItem(cartItem());
    router.push('/(buyer)/(tabs)/cart');
  };

  const buyNow = () => {
    addItem({
      ...cartItem(),
      quantity: 1,
    });
    router.push('/(buyer)/checkout');
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
          onPress={() => toggleSaved(product.id)}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove from saved' : 'Save product'}
          accessibilityState={{ selected: isSaved }}
        >
          <MaterialIcons
            name={isSaved ? 'favorite' : 'favorite-border'}
            size={24}
            color={isSaved ? Colors.primary : Colors.onSurface}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroImage}>
          {product.imageUrl ? (
            <Image
              source={resolveImageSource(product.imageUrl)}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <MaterialIcons name="inventory-2" size={72} color={Colors.primary} />
          )}
        </View>

        <View style={styles.titleBlock}>
          <View style={styles.productMetaRow}>
            <View style={styles.productMetaPill}>
              <MaterialIcons name="verified-user" size={14} color={Colors.primary} />
              <Text style={styles.productMetaText}>VSI {product.sellerVsi}</Text>
            </View>
            <View style={styles.productMetaPill}>
              <MaterialIcons name="local-shipping" size={14} color={Colors.deal} />
              <Text style={styles.productMetaText}>Metro Manila</Text>
            </View>
          </View>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{formatPHP(product.price)}</Text>
        </View>

        <Pressable
          onPress={() => setAuthReportOpen(true)}
          style={({ pressed }) => [styles.verifiedBanner, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open authentication report"
        >
          <MaterialIcons name="verified" size={22} color={Colors.onSecondaryContainer} />
          <Text style={styles.verifiedText}>
            Veribee Verified - Authenticated April 20, 2026
          </Text>
          <MaterialIcons name="info-outline" size={20} color={Colors.onSecondaryContainer} />
        </Pressable>

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
            onPress={() =>
              router.push({
                pathname: '/(buyer)/seller-profile/[id]',
                params: { id: product.sellerId },
              })
            }
            hitSlop={10}
          >
            <Text style={styles.viewProfile}>View Profile</Text>
          </Pressable>
        </View>

        <View style={styles.descriptionBlock}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.specGrid}>
            <Spec label="Brand" value={product.brand} />
            <Spec label="Model" value={product.model} />
            <Spec label="Condition" value={product.condition} />
            <Spec label="Serial" value={product.serialNumber} />
          </View>
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

      <Modal
        transparent
        animationType="fade"
        visible={authReportOpen}
        onRequestClose={() => setAuthReportOpen(false)}
      >
        <View style={styles.modalScrim}>
          <View style={styles.authModal}>
            <Pressable
              onPress={() => setAuthReportOpen(false)}
              hitSlop={12}
              style={styles.modalClose}
              accessibilityRole="button"
              accessibilityLabel="Close authentication report"
            >
              <MaterialIcons name="close" size={24} color={Colors.onSurfaceVariant} />
            </Pressable>
            <MaterialIcons name="verified" size={42} color={Colors.primary} />
            <Text style={styles.modalTitle}>Authentication Report</Text>
            <Text style={styles.modalBody}>
              {product.aiScannerResult}
            </Text>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Seller VSI</Text>
              <Text style={styles.reportValue}>{product.sellerVsi}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Auth score</Text>
              <Text style={styles.reportValue}>{product.authScore}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Handover</Text>
              <Text style={styles.reportValue}>{product.handoverMethod}</Text>
            </View>
            <View style={styles.reportRow}>
              <Text style={styles.reportLabel}>Result</Text>
              <Text style={styles.reportValue}>
                {product.authStatus === 'verified' ? 'Verified' : 'Pending'}
              </Text>
            </View>
            <View style={styles.evidenceList}>
              {product.evidence.map((item) => (
                <View key={item} style={styles.evidenceRow}>
                  <MaterialIcons name="fact-check" size={17} color={Colors.primary} />
                  <Text style={styles.evidenceText}>{item}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.warrantyText}>{product.warrantyNote}</Text>
            <Button title="Close Report" onPress={() => setAuthReportOpen(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specItem}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 58,
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
    aspectRatio: 1.35,
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
    gap: 7,
  },
  productMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  productMetaPill: {
    minHeight: 30,
    borderRadius: Radii.full,
    backgroundColor: Colors.dealContainer,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  productMetaText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onDealContainer,
  },
  title: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    lineHeight: 34,
    color: Colors.onSurface,
  },
  price: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 31,
    lineHeight: 36,
    color: Colors.primary,
  },
  verifiedBanner: {
    marginHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.md,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 1,
    borderColor: Colors.secondaryFixedDim,
    padding: Spacing.sm,
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
    marginBottom: Spacing.md,
    borderRadius: Radii.card,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  sellerAvatar: {
    width: 54,
    height: 54,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInitial: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
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
    fontSize: 16,
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
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  specItem: {
    width: '48%',
    minHeight: 70,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.sm,
    gap: 4,
  },
  specLabel: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  specValue: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurface,
  },
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
    padding: Spacing.sm,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  action: { flex: 1 },
  modalScrim: {
    flex: 1,
    backgroundColor: Colors.inverseSurface,
    justifyContent: 'center',
    padding: Spacing.containerMargin,
  },
  authModal: {
    borderRadius: Radii.xl,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  modalClose: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: { ...Type.h3, color: Colors.onSurface },
  modalBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  reportRow: {
    minHeight: 44,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  reportLabel: { ...Type.labelCaps, color: Colors.onSurfaceVariant },
  reportValue: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.primary,
  },
  evidenceList: {
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  evidenceText: {
    flex: 1,
    fontFamily: Fonts.manropeMedium,
    fontSize: 13,
    color: Colors.onSurface,
  },
  warrantyText: {
    ...Type.bodySm,
    color: Colors.onSurfaceVariant,
  },
});
