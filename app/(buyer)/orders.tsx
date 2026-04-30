import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { BUYER_ORDERS, BuyerOrder, formatPHP } from '@/lib/buyerData';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type OrderTab = 'active' | 'completed' | 'disputed';

const tabs: Array<{ key: OrderTab; label: string }> = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'disputed', label: 'Disputed' },
];

export default function BuyerOrders() {
  const [activeTab, setActiveTab] = useState<OrderTab>('active');
  const orders = useMemo(
    () =>
      BUYER_ORDERS.filter((order) => {
        if (activeTab === 'completed') return order.status === 'delivered';
        if (activeTab === 'disputed') return order.status === 'disputed';
        return order.status !== 'delivered' && order.status !== 'disputed';
      }),
    [activeTab],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <View style={styles.tabs}>
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
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
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

function OrderCard({ order }: { order: BuyerOrder }) {
  return (
    <View style={styles.orderCard}>
      <View style={styles.thumb}>
        <MaterialIcons name="inventory-2" size={28} color={Colors.primary} />
      </View>
      <View style={styles.orderCopy}>
        <Text style={styles.orderTitle} numberOfLines={1}>
          {order.productTitle}
        </Text>
        <Text style={styles.orderDate}>{order.orderedAt}</Text>
        <Text style={styles.orderPrice}>{formatPHP(order.price)}</Text>
      </View>
      <View style={styles.orderRight}>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{order.status.replace('_', ' ')}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  title: {
    ...Type.h2,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.lg,
  },
  tabs: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  tab: { flex: 1, alignItems: 'center' },
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
    backgroundColor: Colors.surface,
  },
  tabLineActive: { backgroundColor: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.md,
  },
  orderCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  thumb: {
    width: 62,
    height: 62,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCopy: { flex: 1, minWidth: 0 },
  orderTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  orderDate: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  orderPrice: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.primary,
    marginTop: 4,
  },
  orderRight: { alignItems: 'flex-end', gap: Spacing.sm },
  statusPill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.primary,
  },
  emptyState: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface },
  emptyBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
});
