import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { formatPHP } from '@/lib/buyerData';
import { CartItem, useCartStore } from '@/store/cartStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function BuyerCart() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const selectedItems = items.filter((i) => i.selected !== false);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const authFee = useCartStore((s) => s.authFee());
  const deliveryFee = useCartStore((s) => s.deliveryFee());
  const grandTotal = useCartStore((s) => s.grandTotal());

  // Group items by seller
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.sellerName]) {
      acc[item.sellerName] = [];
    }
    acc[item.sellerName].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconButton} />
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cartHero}>
          <View>
            <Text style={styles.heroKicker}>VERIFIED CHECKOUT</Text>
            <Text style={styles.heroTitle}>Cart ready for Veribee checks</Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{selectedItems.length}</Text>
              <Text style={styles.heroStatLabel}>Selected</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{formatPHP(authFee)}</Text>
              <Text style={styles.heroStatLabel}>Auth fee</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{formatPHP(deliveryFee)}</Text>
              <Text style={styles.heroStatLabel}>Delivery</Text>
            </View>
          </View>
          <View style={styles.voucherStrip}>
            <MaterialIcons name="local-offer" size={18} color={Colors.onSecondaryContainer} />
            <Text style={styles.voucherText}>Free demo voucher applied to verified Metro Manila routes</Text>
          </View>
        </View>

        {items.length > 0 ? (
          Object.entries(groupedItems).map(([sellerName, sellerItems]) => (
            <View key={sellerName} style={styles.storeGroup}>
              <View style={styles.storeHeader}>
                <MaterialIcons name="storefront" size={20} color={Colors.secondary} />
                <Text style={styles.storeName}>{sellerName}</Text>
                <MaterialIcons name="chevron-right" size={20} color={Colors.secondary} style={{ marginLeft: 'auto' }} />
              </View>
              {sellerItems.map((item, index) => (
                <View key={item.productId}>
                  <CartRow item={item} />
                  {index < sellerItems.length - 1 && <View style={styles.itemDivider} />}
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="shopping-cart" size={38} color={Colors.primary} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyBody}>Add verified products from the home feed.</Text>
            <Button title="Browse Products" onPress={() => router.push('/(buyer)/(tabs)/home')} />
          </View>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomContent}>
            <View style={styles.totalBlock}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPHP(grandTotal)}</Text>
              <Text style={styles.totalSub}>{formatPHP(totalPrice)} items</Text>
            </View>
            <Pressable
              style={[
                styles.checkoutButton,
                selectedItems.length === 0 && { opacity: 0.5 }
              ]}
              disabled={selectedItems.length === 0}
              onPress={() => router.push('/(buyer)/checkout')}
            >
              <Text style={styles.checkoutButtonText}>Check Out ({selectedItems.length})</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleSelection = useCartStore((s) => s.toggleSelection);

  return (
    <View style={styles.cartRow}>
      <Pressable onPress={() => toggleSelection(item.productId)} style={styles.checkboxArea}>
        <MaterialIcons 
          name={item.selected !== false ? 'check-box' : 'check-box-outline-blank'} 
          size={24} 
          color={item.selected !== false ? Colors.primary : Colors.outlineVariant} 
        />
      </Pressable>
      <View style={styles.thumb}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <MaterialIcons name="inventory-2" size={30} color={Colors.primary} />
        )}
      </View>
      <View style={styles.cartCopy}>
        <View style={styles.titleRow}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Pressable onPress={() => removeItem(item.productId)} hitSlop={10}>
            <MaterialIcons name="delete-outline" size={20} color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>{formatPHP(item.price)}</Text>
          <View style={styles.quantityControl}>
            <Pressable 
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.productId, item.quantity - 1)}
            >
              <Text style={styles.qtyText}>−</Text>
            </Pressable>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <Pressable 
              style={[styles.qtyBtn, styles.qtyBtnRight]}
              onPress={() => updateQuantity(item.productId, item.quantity + 1)}
            >
              <Text style={styles.qtyText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { 
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onPrimary 
  },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 120,
    gap: Spacing.sm,
  },
  cartHero: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radii.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.fab,
  },
  heroKicker: {
    ...Type.labelCaps,
    color: Colors.secondaryContainer,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.onPrimary,
  },
  heroStats: {
    minHeight: 66,
    borderRadius: Radii.DEFAULT,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  heroStatValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onPrimary,
  },
  heroStatLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onPrimaryContainer,
  },
  heroDivider: {
    width: StyleSheet.hairlineWidth,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  voucherStrip: {
    minHeight: 44,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  voucherText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onSecondaryContainer,
  },
  storeGroup: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadow.card,
    marginBottom: Spacing.sm,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
    gap: Spacing.sm,
    backgroundColor: Colors.dealContainer,
  },
  storeName: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.05 * 12,
    color: Colors.onSurface,
  },
  cartRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  checkboxArea: {
    padding: Spacing.xs,
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginLeft: 16,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  cartCopy: { flex: 1, minHeight: 96, justifyContent: 'space-between' },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  itemTitle: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.onSurface,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
  },
  itemPrice: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 20,
    color: Colors.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radii.DEFAULT,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 18,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  qtyBtnRight: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.outlineVariant,
  },
  quantityText: {
    width: 32,
    textAlign: 'center',
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
    ...Shadow.card,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  totalBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  totalLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  totalValue: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 20,
    color: Colors.primary,
  },
  totalSub: {
    width: '100%',
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    minHeight: 48,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  checkoutButtonText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.05 * 12,
    color: Colors.onPrimary,
  },
  emptyState: {
    minHeight: 320,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  emptyBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
