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
        <View>
          <Text style={styles.headerKicker}>SECURE BUYER CART</Text>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountValue}>{items.length}</Text>
          <Text style={styles.headerCountLabel}>items</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.checkoutButtonText}>Checkout ({selectedItems.length})</Text>
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
              <MaterialIcons name="remove" size={17} color={Colors.onSurfaceVariant} />
            </Pressable>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <Pressable 
              style={[styles.qtyBtn, styles.qtyBtnRight]}
              onPress={() => updateQuantity(item.productId, item.quantity + 1)}
            >
              <MaterialIcons name="add" size={17} color={Colors.onSurfaceVariant} />
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
    minHeight: 72,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerKicker: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.secondaryContainer,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  headerTitle: { 
    fontFamily: Fonts.epilogueBold,
    fontSize: 25,
    color: Colors.onPrimary 
  },
  headerCount: {
    minWidth: 64,
    minHeight: 44,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerCountValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onSecondaryContainer,
  },
  headerCountLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onSecondaryContainer,
  },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 120,
    gap: Spacing.sm,
  },
  storeGroup: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.card,
    overflow: 'hidden',
    ...Shadow.card,
    marginBottom: Spacing.sm,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
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
    width: 82,
    height: 82,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  cartCopy: { flex: 1, minHeight: 82, justifyContent: 'space-between' },
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
    fontSize: 18,
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
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  totalBlock: {
    flex: 1,
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
    fontSize: 18,
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
    width: 132,
    paddingHorizontal: 0,
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
