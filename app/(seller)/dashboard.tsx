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
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { OrderItem, OrderItemData } from '@/components/seller/OrderItem';
import { supabase } from '@/lib/supabase';
import { isLocalUserId } from '@/lib/localAuth';
import { useAuthStore } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type DashboardState = {
  displayName: string;
  vsiScore: number;
  ordersToday: number;
  pendingAuth: number;
  totalSales: number;
  recentOrders: OrderItemData[];
};

const fallbackOrders: OrderItemData[] = [
  {
    id: 'preview-1',
    buyerName: 'David K.',
    productTitle: 'Artisan Honey x2',
    price: 1200,
    status: 'processing',
  },
  {
    id: 'preview-2',
    buyerName: 'Sarah L.',
    productTitle: 'Beeswax Candles',
    price: 850,
    status: 'pending auth',
  },
];

const fallbackDashboard: DashboardState = {
  displayName: 'Maria',
  vsiScore: 87,
  ordersToday: 3,
  pendingAuth: 2,
  totalSales: 45000,
  recentOrders: fallbackOrders,
};

function formatPeso(value: number) {
  if (value >= 1000) {
    const rounded = Math.round(value / 1000);
    return `PHP ${rounded}k`;
  }
  return `PHP ${Math.round(value).toLocaleString('en-PH')}`;
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || value;
}

function normalizeOrder(row: Record<string, any>): OrderItemData {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;

  return {
    id: String(row.id),
    buyerName: buyer?.full_name ?? buyer?.email ?? 'Buyer',
    productTitle: product?.title ?? 'Order item',
    price: Number(row.total_price ?? 0),
    status: String(row.status ?? 'processing'),
    thumbnailUrl: Array.isArray(product?.images) ? product.images[0] : undefined,
  };
}

export default function SellerDashboard() {
  const router = useRouter();
  const storeUserId = useAuthStore((s) => s.userId);
  const [data, setData] = useState<DashboardState>(fallbackDashboard);
  const [refreshing, setRefreshing] = useState(false);

  const progressWidth = useMemo(
    () => `${Math.min(Math.max(data.vsiScore, 0), 100)}%` as `${number}%`,
    [data.vsiScore],
  );

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    let userId = storeUserId;

    if (isLocalUserId(userId)) {
      setData(fallbackDashboard);
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
      setData(fallbackDashboard);
      setRefreshing(false);
      return;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      userResult,
      profileResult,
      ordersTodayResult,
      pendingAuthResult,
      recentOrdersResult,
    ] = await Promise.all([
      supabase.from('users').select('full_name').eq('id', userId).maybeSingle(),
      supabase
        .from('seller_profiles')
        .select('store_name, vsi_score, total_sales')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .gte('created_at', startOfToday.toISOString()),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('auth_status', 'pending'),
      supabase
        .from('orders')
        .select(
          'id, total_price, status, created_at, products(title, images), buyer:users!orders_buyer_id_fkey(full_name, email)',
        )
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    const profile = profileResult.data as
      | { store_name?: string; vsi_score?: number; total_sales?: number }
      | null;
    const userRow = userResult.data as { full_name?: string } | null;
    const recentRows = Array.isArray(recentOrdersResult.data)
      ? recentOrdersResult.data.map(normalizeOrder)
      : fallbackOrders;

    setData({
      displayName: firstName(userRow?.full_name ?? profile?.store_name ?? 'Maria'),
      vsiScore: Number(profile?.vsi_score ?? fallbackDashboard.vsiScore),
      ordersToday: ordersTodayResult.count ?? fallbackDashboard.ordersToday,
      pendingAuth: pendingAuthResult.count ?? fallbackDashboard.pendingAuth,
      totalSales: Number(profile?.total_sales ?? fallbackDashboard.totalSales),
      recentOrders: recentRows.length > 0 ? recentRows : fallbackOrders,
    });
    setRefreshing(false);
  }, [storeUserId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const goToOrders = () => router.push('/(seller)/orders');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <View style={styles.brandRow}>
          <Logo size={36} />
          <Text style={styles.brand}>Veribee</Text>
        </View>
        <Pressable
          onPress={() => Alert.alert('Notifications', 'Notifications come next.')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <MaterialIcons
            name="notifications-none"
            size={28}
            color={Colors.onSurfaceVariant}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadDashboard}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Good morning, {data.displayName}</Text>
          <Text style={styles.subtitle}>
            Here's your store overview for today.
          </Text>
        </View>

        <View style={styles.vsiCard}>
          <View style={styles.vsiHeader}>
            <View>
              <Text style={styles.vsiLabel}>VSI Score</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.score}>{data.vsiScore}</Text>
                <View style={styles.monthPill}>
                  <MaterialIcons
                    name="arrow-upward"
                    size={14}
                    color={Colors.onPrimary}
                  />
                  <Text style={styles.monthText}>3 this month</Text>
                </View>
              </View>
            </View>
            <View style={styles.trustedPill}>
              <MaterialIcons
                name="verified"
                size={18}
                color={Colors.onSecondaryContainer}
              />
              <Text style={styles.trustedText}>Trusted Seller</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={String(data.ordersToday)} label="Orders Today" />
          <StatCard value={String(data.pendingAuth)} label="Pending Auth" />
          <StatCard value={formatPeso(data.totalSales)} label="Sales" compact />
        </View>

        <View style={styles.actions}>
          <Button
            title="+ Add Product"
            onPress={() =>
              Alert.alert('Add Product', 'The add product wizard is next.')
            }
            style={styles.actionButton}
          />
          <Button
            title="View Orders"
            variant="outlined"
            onPress={goToOrders}
            style={styles.actionButton}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Pressable onPress={goToOrders} hitSlop={10}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        <View style={styles.orders}>
          {data.recentOrders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  value,
  label,
  compact,
}: {
  value: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, compact && styles.statValueCompact]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  appBar: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brand: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 26,
    lineHeight: 32,
    color: Colors.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72 },
  content: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  greetingBlock: { gap: Spacing.base },
  greeting: { ...Type.h1, color: Colors.onSurface },
  subtitle: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  vsiCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.xl,
    ...Shadow.card,
  },
  vsiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  vsiLabel: { ...Type.labelCaps, color: Colors.onPrimaryContainer },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.base,
  },
  score: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 72,
    lineHeight: 76,
    color: Colors.onPrimary,
  },
  monthPill: {
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceTint,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  monthText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onPrimary,
  },
  trustedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  trustedText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSecondaryContainer,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minHeight: 106,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    ...Shadow.card,
  },
  statValue: {
    ...Type.h3,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  statValueCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  statLabel: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.base,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionTitle: { ...Type.h2, color: Colors.onSurface },
  seeAll: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.primary,
  },
  orders: { gap: Spacing.md },
});
