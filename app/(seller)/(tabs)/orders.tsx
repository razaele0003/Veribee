import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
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
  image?: any;
};

const tabs: Array<{ key: OrderStatus; label: string }> = [
  { key: 'new', label: 'New' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed', label: 'Completed' },
];

const fallbackOrders: SellerOrder[] = [
  {
    id: 'VB-9982',
    buyerName: 'Nico V.',
    productTitle: 'Artisan Honey',
    price: 1200,
    status: 'new',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    image: null,
  },
  {
    id: 'VB-9983',
    buyerName: 'Sarah L.',
    productTitle: 'Beeswax Candles',
    price: 850,
    status: 'new',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    image: null,
  },
  {
    id: 'VB-9984',
    buyerName: 'Michael R.',
    productTitle: 'Organic Propolis',
    price: 2500,
    status: 'new',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    image: null,
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
    image: product?.images?.[0],
  };
}

export default function SellerOrders() {
  const router = useRouter();
  const storeUserId = useAuthStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<SellerOrder[]>(fallbackOrders);
  const [refreshing, setRefreshing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const visibleOrders = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (activeTab !== 'all' && !order.status.toLowerCase().includes(activeTab)) return false;
      if (!term) return true;
      return (
        order.id.toLowerCase().includes(term) ||
        order.buyerName.toLowerCase().includes(term) ||
        order.productTitle.toLowerCase().includes(term)
      );
    });
  }, [activeTab, orders, searchQuery]);

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerKicker}>SELLER ORDER DESK</Text>
            <Text style={styles.title}>Recent Orders</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setSearchOpen((open) => !open)}
              hitSlop={12}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="search" size={24} color={Colors.onPrimary} />
            </Pressable>
            <Pressable
              hitSlop={12}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="filter-list" size={24} color={Colors.onPrimary} />
            </Pressable>
          </View>
        </View>

        {searchOpen && (
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.onSurfaceVariant} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search orders..."
              placeholderTextColor={Colors.onSurfaceVariant}
              style={styles.searchInput}
              autoFocus
            />
            {!!searchQuery && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <MaterialIcons name="cancel" size={18} color={Colors.onSurfaceVariant} />
              </Pressable>
            )}
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabs}>
          <Pressable
            onPress={() => setActiveTab('all')}
            style={[styles.statusTab, activeTab === 'all' && styles.statusTabActive]}
          >
            <Text style={[styles.statusTabValue, activeTab === 'all' && styles.statusTabValueActive]}>
              {orders.length}
            </Text>
            <Text style={[styles.statusTabLabel, activeTab === 'all' && styles.statusTabLabelActive]}>All</Text>
          </Pressable>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.statusTab, active && styles.statusTabActive]}
              >
                <Text style={[styles.statusTabValue, active && styles.statusTabValueActive]}>
                  {counts[tab.key]}
                </Text>
                <Text style={[styles.statusTabLabel, active && styles.statusTabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
              onViewDetails={() =>
                router.push({
                  pathname: '/(seller)/order/[id]',
                  params: {
                    id: order.id,
                    buyer: order.buyerName,
                    product: order.productTitle,
                    price: String(order.price),
                    status: order.status,
                    placedAt: order.createdAt ?? new Date().toISOString(),
                  },
                })
              }
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
  onViewDetails,
}: {
  order: SellerOrder;
  onAccept: () => void;
  onViewDetails: () => void;
}) {
  const isNew = order.status.toLowerCase().includes('new');

  const getStatusColor = () => {
    switch (order.status) {
      case 'new': return Colors.primary;
      case 'processing': return Colors.tertiaryFixed;
      case 'completed': return Colors.secondaryContainer;
      default: return Colors.surfaceVariant;
    }
  };

  const getStatusTextColor = () => {
    switch (order.status) {
      case 'new': return Colors.onPrimary;
      case 'processing': return Colors.onTertiaryFixed;
      case 'completed': return Colors.onSecondaryContainer;
      default: return Colors.onSurfaceVariant;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.orderCard, pressed && styles.orderCardPressed]}
      onPress={onViewDetails}
    >
      <View style={styles.cardImageContainer}>
        <View style={[styles.cardImagePlaceholder, order.image && { backgroundColor: 'transparent' }]}>
          {order.image ? (
            <MaterialIcons name="image" size={32} color={Colors.onSurfaceVariant} />
          ) : (
            <MaterialIcons name="inventory-2" size={32} color={Colors.onSurfaceVariant} />
          )}
        </View>
        <View style={[styles.badgeContainer, { backgroundColor: getStatusColor() }]}>
          <Text style={[styles.badgeText, { color: getStatusTextColor() }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderArea}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.productTitle} numberOfLines={1}>{order.productTitle}</Text>
          </View>
          <Text style={styles.price}>{formatPeso(order.price)}</Text>
        </View>
        <View style={styles.cardFooter}>
          <MaterialIcons name="schedule" size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.timeText}>{relativeTime(order.createdAt)}</Text>
        </View>
        {isNew && (
          <Button
            title="Accept Order"
            onPress={onAccept}
            style={styles.acceptButton}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.primaryContainer,
    gap: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    color: Colors.onPrimary,
  },
  headerKicker: {
    ...Type.labelCaps,
    color: Colors.secondaryContainer,
    marginBottom: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    opacity: 0.8,
  },
  pressed: { opacity: 0.6 },
  searchBar: {
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    opacity: 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurface,
  },
  statusTabs: {
    gap: Spacing.sm,
    paddingRight: Spacing.containerMargin,
  },
  statusTab: {
    minWidth: 92,
    minHeight: 58,
    borderRadius: Radii.DEFAULT,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  statusTabActive: {
    backgroundColor: Colors.secondaryContainer,
    borderColor: Colors.secondaryContainer,
  },
  statusTabValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onPrimary,
  },
  statusTabValueActive: { color: Colors.onSecondaryContainer },
  statusTabLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onPrimaryContainer,
  },
  statusTabLabelActive: { color: Colors.onSecondaryContainer },
  content: {
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.lg,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  orderCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  cardImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.surfaceVariant,
    position: 'relative',
  },
  cardImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: Colors.onPrimary,
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardHeaderArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  orderId: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  productTitle: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 18,
    color: Colors.onSurface,
    marginTop: 2,
  },
  price: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outlineVariant,
  },
  timeText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  acceptButton: {
    marginTop: Spacing.md,
  },
  empty: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
  },
  emptyBody: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
