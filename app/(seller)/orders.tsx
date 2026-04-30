import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { isLocalUserId } from '@/lib/localAuth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type OrderStatus = 'new' | 'processing' | 'completed';

type SellerOrder = {
  id: string;
  buyerName: string;
  productTitle: string;
  price: number;
  status: string;
  createdAt?: string;
};

const tabs: Array<{ key: OrderStatus; label: string }> = [
  { key: 'new', label: 'New' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed', label: 'Completed' },
];

const fallbackOrders: SellerOrder[] = [
  {
    id: 'VB-9982',
    buyerName: 'David K.',
    productTitle: 'Artisan Honey',
    price: 1200,
    status: 'new',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'VB-9983',
    buyerName: 'Sarah L.',
    productTitle: 'Beeswax Candles',
    price: 850,
    status: 'new',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'VB-9984',
    buyerName: 'Michael R.',
    productTitle: 'Organic Propolis',
    price: 2500,
    status: 'new',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

function formatPeso(value: number) {
  return `PHP ${Math.round(value).toLocaleString('en-PH')}`;
}

function relativeTime(value?: string) {
  if (!value) return 'Just now';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr${hours === 1 ? '' : 's'} ago`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function normalizeOrder(row: Record<string, any>): SellerOrder {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;

  return {
    id: String(row.id),
    buyerName: buyer?.full_name ?? 'Buyer',
    productTitle: product?.title ?? 'Order item',
    price: Number(row.total_price ?? 0),
    status: String(row.status ?? 'new').toLowerCase(),
    createdAt: row.created_at,
  };
}

export default function SellerOrders() {
  const storeUserId = useAuthStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState<OrderStatus>('new');
  const [orders, setOrders] = useState<SellerOrder[]>(fallbackOrders);
  const [refreshing, setRefreshing] = useState(false);

  const counts = useMemo(
    () =>
      tabs.reduce<Record<OrderStatus, number>>(
        (acc, tab) => {
          acc[tab.key] = orders.filter((order) =>
            order.status.toLowerCase().includes(tab.key),
          ).length;
          return acc;
        },
        { new: 0, processing: 0, completed: 0 },
      ),
    [orders],
  );

  const visibleOrders = useMemo(
    () =>
      orders.filter((order) =>
        order.status.toLowerCase().includes(activeTab),
      ),
    [activeTab, orders],
  );

  const loadOrders = useCallback(async () => {
    setRefreshing(true);
    let userId = storeUserId;

    if (isLocalUserId(userId)) {
      setOrders(fallbackOrders);
      setRefreshing(false);
      return;
    }

    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }

    if (!userId) {
      setOrders(fallbackOrders);
      setRefreshing(false);
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, total_price, status, created_at, products(title, images), buyer:users!orders_buyer_id_fkey(full_name)',
      )
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      Alert.alert('Could not load orders', error.message);
      setRefreshing(false);
      return;
    }

    const nextOrders = Array.isArray(data) ? data.map(normalizeOrder) : [];
    setOrders(nextOrders.length > 0 ? nextOrders : fallbackOrders);
    setRefreshing(false);
  }, [storeUserId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const acceptOrder = async (order: SellerOrder) => {
    if (order.id.startsWith('VB-')) {
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status: 'processing' } : item,
        ),
      );
      setActiveTab('processing');
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', order.id);

    if (error) {
      Alert.alert('Could not accept order', error.message);
      return;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id ? { ...item, status: 'processing' } : item,
      ),
    );
    setActiveTab('processing');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="menu" size={28} color={Colors.primary} />
          <Text style={styles.title}>Orders</Text>
        </View>
        <Pressable
          onPress={() => Alert.alert('Search', 'Order search comes next.')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="search" size={28} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {tab.key === 'new' && counts.new > 0 && (
                <View style={styles.countPill}>
                  <Text style={styles.countText}>{counts.new}</Text>
                </View>
              )}
              {isActive && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadOrders}
            tintColor={Colors.primary}
          />
        }
      >
        {visibleOrders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No {activeTab} orders</Text>
            <Text style={styles.emptyBody}>
              Pull to refresh or switch tabs to review other orders.
            </Text>
          </View>
        ) : (
          visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={() => acceptOrder(order)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderCard({
  order,
  onAccept,
}: {
  order: SellerOrder;
  onAccept: () => void;
}) {
  const isNew = order.status.toLowerCase().includes('new');

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.buyerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(order.buyerName)}</Text>
          </View>
          <Text style={styles.buyerName}>{order.buyerName}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.productBox}>
        <View style={styles.productThumb}>
          <MaterialIcons name="inventory-2" size={28} color={Colors.primary} />
        </View>
        <View style={styles.productCopy}>
          <Text style={styles.productTitle}>{order.productTitle}</Text>
          <Text style={styles.meta}>
            #{order.id}  |  {relativeTime(order.createdAt)}
          </Text>
        </View>
        <Text style={styles.price}>{formatPeso(order.price)}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Accept"
          onPress={onAccept}
          disabled={!isNew}
          style={styles.cardButton}
        />
        <Button
          title="View Details"
          variant="outlined"
          onPress={() => Alert.alert('Order details', 'Detail screen comes next.')}
          style={styles.cardButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: { ...Type.h3, color: Colors.primary },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72 },
  tabBar: {
    minHeight: 56,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.surfaceBright,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  tab: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    position: 'relative',
  },
  tabText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
  countPill: {
    minWidth: 22,
    height: 22,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  countText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onPrimary,
  },
  content: {
    padding: Spacing.containerMargin,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  orderCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.card,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  buyerRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  avatarText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSecondaryContainer,
  },
  buyerName: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  statusPill: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    ...Type.labelCaps,
    fontSize: 10,
    lineHeight: 12,
    color: Colors.onSecondaryContainer,
  },
  productBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.lg,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  productThumb: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCopy: {
    flex: 1,
    minWidth: 0,
  },
  productTitle: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.onSurface,
  },
  meta: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  price: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 17,
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cardButton: { flex: 1 },
  empty: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface },
  emptyBody: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
