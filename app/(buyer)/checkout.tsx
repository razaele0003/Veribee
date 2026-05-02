import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { DEMO_ACCOUNTS, DEMO_ROUTE } from '@/lib/demoProfiles';
import { formatPHP } from '@/lib/buyerData';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useBuyerOrderStore } from '@/store/buyerOrderStore';
import { CartItem, useCartStore } from '@/store/cartStore';
import { useRiderStore } from '@/store/riderStore';
import { resolveImageSource } from '@/constants/productImages';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function Checkout() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const grandTotal = useCartStore((s) => s.grandTotal());
  const deliveryFee = useCartStore((s) => s.deliveryFee());
  const authFee = useCartStore((s) => s.authFee());
  const userId = useAuthStore((s) => s.userId);
  const placeLocalOrder = useBuyerOrderStore((s) => s.placeLocalOrder);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.sellerName]) {
      acc[item.sellerName] = [];
    }
    acc[item.sellerName].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Secure Checkout</Text>
            <View style={styles.iconButton} />
          </View>
        </View>
        <View style={styles.emptyCheckout}>
          <View style={styles.emptyCheckoutIcon}>
            <MaterialIcons name="shopping-cart" size={34} color={Colors.primary} />
          </View>
          <Text style={styles.emptyCheckoutTitle}>No items ready for checkout</Text>
          <Text style={styles.emptyCheckoutBody}>
            Add a verified product first so Veribee can prepare authentication, delivery, and handover.
          </Text>
          <Button title="Browse Verified Products" onPress={() => router.replace('/(buyer)/(tabs)/home')} />
        </View>
      </SafeAreaView>
    );
  }

  const placeOrder = async () => {
    if (items.length === 0) {
      router.replace('/(buyer)/(tabs)/home');
      return;
    }
    const orderItems = [...items];
    const total = grandTotal;
    const first = orderItems[0];
    const localOrder = placeLocalOrder(orderItems, total);

    if (localOrder && first) {
      useRiderStore.getState().addJob({
        id: `job-${localOrder.id.toLowerCase()}`,
        orderId: localOrder.id,
        productName: localOrder.productTitle,
        productImage: first.imageUrl ?? '',
        category: 'Verified order',
        pickupAddress: DEMO_ROUTE.pickup.address,
        deliveryAddress: DEMO_ROUTE.dropoff.address,
        pickupLatitude: DEMO_ROUTE.pickup.latitude,
        pickupLongitude: DEMO_ROUTE.pickup.longitude,
        deliveryLatitude: DEMO_ROUTE.dropoff.latitude,
        deliveryLongitude: DEMO_ROUTE.dropoff.longitude,
        riderStartLatitude: DEMO_ROUTE.riderStart.latitude,
        riderStartLongitude: DEMO_ROUTE.riderStart.longitude,
        buyerName: DEMO_ACCOUNTS.buyer.fullName,
        buyerPhone: DEMO_ACCOUNTS.buyer.phone,
        sellerName: first.sellerName,
        sellerPhone: DEMO_ACCOUNTS.seller.phone,
        distanceKm: DEMO_ROUTE.distanceKm,
        etaMinutes: DEMO_ROUTE.etaMinutes,
        jobFee: DEMO_ROUTE.jobFee,
        otpCode: DEMO_ROUTE.otpCode,
      });
    }

    if (userId && first) {
      const { data } = await supabase
        .from('orders')
        .insert({
          buyer_id: userId,
          seller_id: first.sellerId,
          product_id: first.productId,
          total_price: total,
          status: 'processing',
        })
        .select('id')
        .maybeSingle();

      if (data?.id) {
        await supabase.from('deliveries').insert({
          order_id: data.id,
          status: 'pending',
          rider_id: null,
        });
      }
    }

    clearCart();
    router.replace('/(buyer)/(tabs)/orders');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerKicker}>VERIBEE PROTECTED</Text>
            <Text style={styles.headerTitle}>Secure Checkout</Text>
          </View>
          <View style={styles.iconButton}>
            <MaterialIcons name="help-outline" size={24} color={Colors.secondary} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section>
          <Pressable 
            style={({ pressed }) => [styles.addressRow, pressed && { opacity: 0.7 }]}
            onPress={() => {}}
          >
            <MaterialIcons name="location-on" size={24} color={Colors.primary} />
            <View style={styles.addressCopy}>
              <View style={styles.addressTitleRow}>
                <Text style={styles.addressTitle}>Delivery Address</Text>
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                </View>
              </View>
              <Text style={styles.addressName}>
                {DEMO_ACCOUNTS.buyer.fullName} | {DEMO_ACCOUNTS.buyer.phone}
              </Text>
              <Text style={styles.addressDetail}>
                {DEMO_ROUTE.dropoff.address}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.secondary} />
          </Pressable>
        </Section>

        {Object.entries(groupedItems).map(([sellerName, sellerItems]) => (
          <Section key={sellerName}>
            <View style={styles.storeHeader}>
              <MaterialIcons name="store" size={20} color={Colors.onSurface} />
              <Text style={styles.storeName}>{sellerName}</Text>
            </View>
            
            {sellerItems.map((item) => (
              <View key={item.productId} style={styles.orderItemRow}>
                <View style={styles.itemThumb}>
                  {item.imageUrl ? (
                    <Image source={resolveImageSource(item.imageUrl)} style={styles.thumbImage} resizeMode="cover" />
                  ) : (
                    <MaterialIcons name="inventory-2" size={24} color={Colors.secondary} />
                  )}
                </View>
                <View style={styles.itemCopy}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.itemPriceRow}>
                    <Text style={styles.itemPrice}>{formatPHP(item.price)}</Text>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.storeSubtotal}>
              <Text style={styles.subtotalLabel}>Subtotal ({sellerItems.length} item{sellerItems.length > 1 ? 's' : ''})</Text>
              <Text style={styles.subtotalValue}>
                {formatPHP(sellerItems.reduce((acc, it) => acc + it.price * it.quantity, 0))}
              </Text>
            </View>
          </Section>
        ))}

        <Section>
          <View style={styles.addressRow}>
            <MaterialIcons name="local-shipping" size={24} color={Colors.primary} />
            <View style={styles.addressCopy}>
              <Text style={styles.addressTitle}>Shipping Option</Text>
              <Text style={styles.addressName}>Standard Logistics</Text>
              <Text style={styles.shippingEta}>Metro Manila route - live rider tracking after pickup</Text>
            </View>
            <View style={styles.shippingRight}>
              <Text style={styles.shippingFee}>{formatPHP(deliveryFee)}</Text>
              <MaterialIcons name="chevron-right" size={24} color={Colors.secondary} />
            </View>
          </View>
        </Section>

        {authFee > 0 && (
          <Section>
            <View style={styles.addressRow}>
              <MaterialIcons name="verified-user" size={24} color={Colors.primary} />
              <View style={styles.addressCopy}>
                <Text style={styles.addressTitle}>Platform Services</Text>
                <Text style={styles.addressName}>Authentication Fee</Text>
                <Text style={styles.shippingEta}>Guarantees item legitimacy and quality</Text>
              </View>
              <View style={styles.shippingRight}>
                <Text style={styles.shippingFee}>{formatPHP(authFee)}</Text>
              </View>
            </View>
          </Section>
        )}

        <Section>
          <Pressable 
            style={({ pressed }) => [styles.addressRow, pressed && { opacity: 0.7 }]}
            onPress={() => {}}
          >
            <MaterialIcons name="credit-card" size={24} color={Colors.primary} />
            <View style={styles.addressCopy}>
              <Text style={styles.addressTitle}>Payment Method</Text>
              <View style={styles.paymentMethodRow}>
                <View style={styles.paymentIcon} />
                <Text style={styles.addressName}>Cash on Delivery</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.secondary} />
          </Pressable>
        </Section>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomContent}>
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Total Payment</Text>
            <Text style={styles.totalValue}>{formatPHP(grandTotal)}</Text>
          </View>
          <Pressable
            style={styles.checkoutButton}
            onPress={placeOrder}
          >
            <Text style={styles.checkoutButtonText}>Place Order</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceDim,
  },
  headerTop: {
    minHeight: 62,
    paddingHorizontal: Spacing.containerMargin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerKicker: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  headerTitle: { 
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 19,
    color: Colors.onSurface 
  },
  headerTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceDim,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  tabItemActive: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabTextInactive: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.05 * 12,
    color: Colors.secondary,
  },
  tabTextActive: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.05 * 12,
    color: Colors.primary,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 120,
    gap: Spacing.sm,
  },
  sectionCard: {
    borderRadius: Radii.card,
    backgroundColor: Colors.surfaceContainerLowest,
    ...Shadow.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  addressCopy: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  addressTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  defaultBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  defaultBadgeText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    letterSpacing: 0.05 * 10,
    color: Colors.primary,
  },
  addressName: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 14,
    color: Colors.onSurface,
  },
  addressDetail: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.secondary,
    marginTop: Spacing.base,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceDim,
  },
  storeName: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.05 * 12,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  orderItemRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  itemThumb: {
    width: 76,
    height: 76,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  itemCopy: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
  itemPrice: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 15,
    letterSpacing: 0,
    color: Colors.primary,
  },
  itemQty: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.secondary,
  },
  storeSubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceDim,
  },
  subtotalLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.secondary,
  },
  subtotalValue: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  shippingEta: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.secondary,
    marginTop: Spacing.base,
  },
  shippingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  shippingFee: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.05 * 12,
    color: Colors.onSurface,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  paymentIcon: {
    width: 32,
    height: 20,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.surfaceDim,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceDim,
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
    flexDirection: 'column',
  },
  totalLabel: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    letterSpacing: 0.05 * 12,
    textTransform: 'uppercase',
    color: Colors.secondary,
    marginBottom: Spacing.base,
  },
  totalValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  emptyCheckout: {
    flex: 1,
    paddingHorizontal: Spacing.containerMargin,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyCheckoutIcon: {
    width: 74,
    height: 74,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCheckoutTitle: {
    ...Type.h3,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptyCheckoutBody: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  checkoutButtonText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.05 * 12,
    color: Colors.onPrimary,
    textTransform: 'uppercase',
  },
});
