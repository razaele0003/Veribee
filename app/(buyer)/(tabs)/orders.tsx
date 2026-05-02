import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { BUYER_ORDERS, BuyerOrder, formatPHP } from '@/lib/buyerData';
import { isLocalUserId } from '@/lib/localAuth';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useBuyerOrderStore } from '@/store/buyerOrderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type OrderTab = 'all' | 'processing' | 'in_transit' | 'delivered' | 'disputed';

const tabs: Array<{ key: OrderTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'processing', label: 'To Ship' },
  { key: 'in_transit', label: 'Shipping' },
  { key: 'delivered', label: 'Completed' },
  { key: 'disputed', label: 'Disputed' },
];

export default function BuyerOrders() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const localOrders = useBuyerOrderStore((s) => s.orders);
  const [liveOrders, setLiveOrders] = useState<BuyerOrder[]>([]);
  const [activeTab, setActiveTab] = useState<OrderTab>('all');

  useEffect(() => {
    let cancelled = false;
    async function loadOrders() {
      if (!userId || isLocalUserId(userId)) {
        setLiveOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('id, product_id, total_price, status, created_at')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (cancelled) return;
      if (error || !data) {
        setLiveOrders([]);
        return;
      }

      setLiveOrders(
        data.map((row: any) => ({
          id: String(row.id),
          productId: String(row.product_id ?? row.id),
          productTitle: `Order ${row.id}`,
          sellerName: 'Veribee Seller',
          orderedAt: row.created_at
            ? new Date(row.created_at).toLocaleDateString('en-PH', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Today',
          price: Number(row.total_price ?? 0),
          status: String(row.status ?? 'processing') as BuyerOrder['status'],
        })),
      );
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const allOrders = useMemo(
    () => [...localOrders, ...(liveOrders.length > 0 ? liveOrders : BUYER_ORDERS)],
    [liveOrders, localOrders],
  );

  const orders = useMemo(
    () =>
      allOrders.filter((order) => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
      }),
    [activeTab, allOrders],
  );

  const orderCounts = useMemo(
    () => ({
      all: allOrders.length,
      shipping: allOrders.filter((order) => order.status === 'in_transit').length,
      secured: allOrders.filter((order) => order.status === 'delivered').length,
    }),
    [allOrders],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>ORDER CONTROL CENTER</Text>
        <Text style={styles.title}>Verified Orders</Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{orderCounts.all}</Text>
            <Text style={styles.heroStatLabel}>Orders</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{orderCounts.shipping}</Text>
            <Text style={styles.heroStatLabel}>Shipping</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{orderCounts.secured}</Text>
            <Text style={styles.heroStatLabel}>Secured</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={styles.tab}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabLine, isActive && styles.tabLineActive]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() =>
              router.push({
                pathname: '/(buyer)/order-tracking/[id]',
                params: { id: order.id },
              })
            }
          />
        ))}
        {orders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No orders</Text>
            <Text style={styles.emptyBody}>Matching buyer orders will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderCard({ order, onPress }: { order: BuyerOrder; onPress: () => void }) {
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'processing': return 'To Ship';
      case 'in_transit': return 'Shipping';
      case 'delivered': return 'Completed';
      case 'disputed': return 'Disputed';
      default: return status;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.orderCard, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open order ${order.id}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sellerInfo}>
          <MaterialIcons name="storefront" size={16} color={Colors.primary} />
          <Text style={styles.sellerName}>{order.sellerName}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusLabel}>{getStatusLabel(order.status)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.thumb}>
          <MaterialIcons name="inventory-2" size={32} color={Colors.primary} />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.orderTitle} numberOfLines={2}>
            {order.productTitle}
          </Text>
          <Text style={styles.orderDate}>{order.orderedAt}</Text>
          <View style={styles.qtyPriceRow}>
            <Text style={styles.itemQty}>x 1</Text>
            <Text style={styles.orderPrice}>{formatPHP(order.price)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <Text style={styles.itemCount}>1 item</Text>
        <View style={styles.totalPaymentRow}>
          <MaterialIcons name="security" size={14} color={Colors.primary} />
          <Text style={styles.totalLabel}>Total Payment: </Text>
          <Text style={styles.totalPriceValue}>{formatPHP(order.price)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionRow}>
        <View style={styles.orderTrustRow}>
          <MaterialIcons name="verified-user" size={15} color={Colors.tertiary} />
          <Text style={styles.orderIdText}>Order ID {order.id}</Text>
        </View>
        <Pressable style={styles.actionButton} onPress={onPress}>
          <Text style={styles.actionButtonText}>View Details</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  heroKicker: {
    ...Type.labelCaps,
    color: Colors.secondaryContainer,
  },
  title: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 26,
    lineHeight: 31,
    color: Colors.onPrimary,
  },
  heroStats: {
    minHeight: 52,
    borderRadius: Radii.DEFAULT,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onPrimary,
  },
  heroStatLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onPrimaryContainer,
  },
  heroDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  tabsWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  tabs: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
  },
  tab: { paddingHorizontal: Spacing.md, alignItems: 'center' },
  tabText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  tabTextActive: { color: Colors.primary },
  tabLine: {
    marginTop: Spacing.sm,
    height: 2,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  tabLineActive: { backgroundColor: Colors.primary },
  content: {
    padding: Spacing.md,
    paddingBottom: 112,
    gap: Spacing.sm,
    backgroundColor: Colors.background,
  },
  orderCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radii.card,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.card,
  },
  pressed: { opacity: 0.8 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerName: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  statusPill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.dealContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  statusLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceVariant,
    marginHorizontal: -Spacing.sm,
  },
  cardBody: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.outlineVariant,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  orderDate: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  qtyPriceRow: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  orderPrice: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  itemCount: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  totalPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurface,
  },
  totalPriceValue: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  orderTrustRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  orderIdText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: Radii.sm,
  },
  actionButtonText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.surfaceContainerLowest,
  },
  emptyState: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.xl,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface },
  emptyBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
});
