import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { OrderItem, OrderItemData } from '@/components/seller/OrderItem';
import { supabase } from '@/lib/supabase';
import { isLocalUserId } from '@/lib/localAuth';
import { useAuthStore } from '@/store/authStore';
import { useSellerStore } from '@/store/sellerStore';
import { calculateSellerVsiFromProducts } from '@/lib/veribeeScoring';
import { DEMO_ACCOUNTS } from '@/lib/demoProfiles';
import { ProductImages } from '@/constants/productImages';
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

type SellerNotification = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  body: string;
  time: string;
};

const fallbackOrders: OrderItemData[] = [
  {
    id: 'preview-1',
    buyerName: 'Nico V.',
    productTitle: 'Artisan Honey x2',
    price: 1200,
    status: 'processing',
    thumbnailUrl: ProductImages.tote,
  },
  {
    id: 'preview-2',
    buyerName: 'Sarah L.',
    productTitle: 'Beeswax Candles',
    price: 850,
    status: 'pending auth',
    thumbnailUrl: ProductImages.pendant,
  },
];

const fallbackDashboard: DashboardState = {
  displayName: DEMO_ACCOUNTS.seller.fullName.split(' ')[0],
  vsiScore: 87,
  ordersToday: 3,
  pendingAuth: 2,
  totalSales: 45000,
  recentOrders: fallbackOrders,
};

const sellerNotifications: SellerNotification[] = [
  {
    id: 'seller-n1',
    icon: 'shopping-bag',
    title: 'New order received',
    body: 'VB-1042 is ready for authentication review.',
    time: '3m',
  },
  {
    id: 'seller-n2',
    icon: 'verified',
    title: 'VSI score updated',
    body: 'Your store stayed in Trusted Seller range this week.',
    time: '28m',
  },
  {
    id: 'seller-n3',
    icon: 'inventory-2',
    title: 'Inventory check',
    body: 'Two listed products are close to low stock.',
    time: '2h',
  },
];

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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const storeUserId = useAuthStore((s) => s.userId);
  const localProducts = useSellerStore((s) => s.products);
  const [data, setData] = useState<DashboardState>(fallbackDashboard);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isCompact = width < 380;

  const progressWidth = useMemo(
    () => `${Math.min(Math.max(data.vsiScore, 0), 100)}%` as `${number}%`,
    [data.vsiScore],
  );

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    let userId = storeUserId;

    if (isLocalUserId(userId)) {
      setData({
        ...fallbackDashboard,
        vsiScore: calculateSellerVsiFromProducts(localProducts),
        pendingAuth: localProducts.filter((product) => product.authStatus === 'pending').length,
      });
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
  }, [localProducts, storeUserId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const goToOrders = () => router.push('/(seller)/(tabs)/orders');

  return (
    <View style={styles.container}>
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.brandRow}>
          <View style={styles.logoBubble}>
            <Logo size={30} />
          </View>
          <Text style={styles.brand}>Veribee</Text>
        </View>
        <Pressable
          onPress={() => setNotificationsOpen(true)}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open seller notifications"
        >
          <MaterialIcons
            name="notifications-none"
            size={28}
            color={Colors.onPrimary}
          />
          <View style={styles.notificationDot} />
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
          <Text style={styles.greetingKicker}>SELLER OPERATIONS</Text>
          <Text style={styles.greeting}>Good morning, {data.displayName}</Text>
          <Text style={styles.subtitle}>
            Here's your store overview for today.
          </Text>
        </View>

        <View style={styles.marketStrip}>
          <View style={styles.marketPill}>
            <MaterialIcons name="local-offer" size={18} color={Colors.onSecondaryContainer} />
            <Text style={styles.marketPillText}>Campaign-ready</Text>
          </View>
          <View style={styles.marketPillBlue}>
            <MaterialIcons name="bolt" size={18} color={Colors.onAccentBlueContainer} />
            <Text style={styles.marketPillBlueText}>24h auth queue</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(seller)/vsi-score')}
          style={({ pressed }) => [styles.vsiCard, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open VSI score breakdown"
        >
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
            <View style={[styles.trustedPill, isCompact && styles.trustedPillCompact]}>
              <MaterialIcons
                name="verified"
                size={isCompact ? 16 : 18}
                color={Colors.onSecondaryContainer}
              />
              <Text
                style={styles.trustedText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.86}
              >
                Trusted Seller
              </Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </Pressable>

        <View style={styles.statsRow}>
          <StatCard value={String(data.ordersToday)} label="Orders Today" />
          <StatCard value={String(data.pendingAuth)} label="Pending Auth" />
          <StatCard value={formatPeso(data.totalSales)} label="Sales" compact />
        </View>

        <View style={styles.actions}>
          <Button
            title={isCompact ? "+ Add\nProduct" : '+ Add Product'}
            onPress={() => router.push('/(seller)/add-product/step1-basic')}
            style={styles.actionButton}
          />
          <Button
            title="Manage Products"
            variant="outlined"
            onPress={() => router.push('/(seller)/(tabs)/products')}
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

      <Modal
        transparent
        animationType="slide"
        visible={notificationsOpen}
        onRequestClose={() => setNotificationsOpen(false)}
      >
        <Pressable
          style={styles.sheetScrim}
          onPress={() => setNotificationsOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close seller notifications"
        >
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Notifications</Text>
              <Pressable
                onPress={() => setNotificationsOpen(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
              >
                <MaterialIcons name="close" size={22} color={Colors.onSurfaceVariant} />
              </Pressable>
            </View>
            <View style={styles.notificationList}>
              {sellerNotifications.map((item) => (
                <View key={item.id} style={styles.notificationRow}>
                  <View style={styles.notificationIcon}>
                    <MaterialIcons name={item.icon} size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.notificationCopy}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationBody}>{item.body}</Text>
                  </View>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
  container: { flex: 1, backgroundColor: Colors.background },
  appBar: {
    minHeight: 64,
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBubble: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 26,
    lineHeight: 32,
    color: Colors.onPrimary,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
  },
  pressed: { opacity: 0.72 },
  content: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: 112,
    gap: Spacing.xl,
  },
  greetingBlock: { gap: Spacing.base },
  greetingKicker: {
    ...Type.labelCaps,
    color: Colors.primary,
  },
  greeting: { ...Type.h1, color: Colors.onSurface },
  subtitle: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  marketStrip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  marketPill: {
    minHeight: 44,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  marketPillText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSecondaryContainer,
  },
  marketPillBlue: {
    minHeight: 44,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.accentBlueContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  marketPillBlueText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onAccentBlueContainer,
  },
  vsiCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    gap: Spacing.xl,
    overflow: 'hidden',
    ...Shadow.fab,
  },
  vsiHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    maxWidth: '100%',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  trustedPillCompact: {
    alignSelf: 'flex-start',
  },
  trustedText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSecondaryContainer,
    flexShrink: 1,
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
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radii.card,
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
    gap: Spacing.sm,
  },
  actionButton: { flex: 1, minWidth: 0 },
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
  sheetScrim: {
    flex: 1,
    backgroundColor: Colors.inverseSurface,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.outlineVariant,
    marginBottom: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: { ...Type.h3, color: Colors.onSurface },
  notificationList: {
    marginTop: Spacing.sm,
    borderRadius: Radii.card,
    backgroundColor: Colors.surfaceContainerLow,
    overflow: 'hidden',
  },
  notificationRow: {
    minHeight: 64,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceVariant,
  },
  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCopy: { flex: 1, gap: 2 },
  notificationTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  notificationBody: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  notificationTime: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
});
