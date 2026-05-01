import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

// ─── Helpers ────────────────────────────────────────────────────────────────

function asString(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? '';
}

function formatPeso(value: number) {
  return `PHP ${Math.round(value).toLocaleString('en-PH')}`;
}

// ─── Timeline config ────────────────────────────────────────────────────────

type TimelineStep = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  statuses: string[];
};

const TIMELINE: TimelineStep[] = [
  { label: 'Order placed',        icon: 'shopping-bag',     statuses: ['new', 'processing', 'picked_up', 'heading_to_buyer', 'arrived_buyer', 'delivered'] },
  { label: 'Payment captured',    icon: 'payments',         statuses: ['processing', 'picked_up', 'heading_to_buyer', 'arrived_buyer', 'delivered'] },
  { label: 'Rider pickup',        icon: 'local-shipping',   statuses: ['picked_up', 'heading_to_buyer', 'arrived_buyer', 'delivered'] },
  { label: 'Out for delivery',    icon: 'two-wheeler',      statuses: ['heading_to_buyer', 'arrived_buyer', 'delivered'] },
  { label: 'Delivered to buyer',  icon: 'check-circle',     statuses: ['delivered'] },
];

function resolveDeliveryStatus(orderStatus: string, deliveryStatus: string): string {
  if (deliveryStatus) return deliveryStatus;
  if (orderStatus === 'new') return 'new';
  if (orderStatus === 'processing') return 'processing';
  return orderStatus;
}

// ─── Pulse animation ────────────────────────────────────────────────────────

function usePulse() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.18, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [anim]);
  return anim;
}

// ─── Rider location mock (x/y offsets in map space) ─────────────────────────

type RiderLocation = { x: number; y: number };

function statusToLocation(status: string): RiderLocation {
  switch (status) {
    case 'picked_up':           return { x: 0.20, y: 0.45 };
    case 'heading_to_buyer':    return { x: 0.40, y: 0.48 };
    case 'arrived_buyer':       return { x: 0.72, y: 0.52 };
    case 'delivered':           return { x: 0.75, y: 0.52 };
    default:                    return { x: 0.18, y: 0.42 };
  }
}

// ─── Main screen ────────────────────────────────────────────────────────────

export default function SellerOrderDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string | string[];
    buyer?: string | string[];
    product?: string | string[];
    price?: string | string[];
    status?: string | string[];
    placedAt?: string | string[];
  }>();

  const id       = asString(params.id)      || 'VB-0000';
  const buyer    = asString(params.buyer)   || 'Buyer';
  const product  = asString(params.product) || 'Order item';
  const status   = (asString(params.status) || 'new').toLowerCase();
  const price    = Number(asString(params.price)) || 0;
  const placedAt = asString(params.placedAt) || new Date().toISOString();

  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [riderName, setRiderName]           = useState('Juan dela Cruz');
  const [riderPlate, setRiderPlate]         = useState('AB 1234');
  const [riderRating, setRiderRating]       = useState(4.9);
  const [mapSize, setMapSize]               = useState({ width: 1, height: 1 });

  const combinedStatus = resolveDeliveryStatus(status, deliveryStatus);
  const riderLocation  = statusToLocation(combinedStatus);
  const pulseAnim      = usePulse();

  const { height: screenHeight } = useWindowDimensions();
  const SNAP_TOP = screenHeight * 0.15;
  const SNAP_MID = screenHeight * 0.5;
  const SNAP_BOTTOM = screenHeight - 64; // Collapsed

  const sheetY = useRef(new Animated.Value(SNAP_MID)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderGrant: () => sheetY.extractOffset(),
      onPanResponderMove: (_, gesture) => sheetY.setValue(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        sheetY.flattenOffset();
        // @ts-ignore - access internal value
        const currentY = sheetY._value;
        let toValue;

        if (gesture.vy < -0.5) {
          toValue = currentY > SNAP_MID + 40 ? SNAP_MID : SNAP_TOP;
        } else if (gesture.vy > 0.5) {
          toValue = currentY < SNAP_MID - 40 ? SNAP_MID : SNAP_BOTTOM;
        } else {
          const dTop = Math.abs(currentY - SNAP_TOP);
          const dMid = Math.abs(currentY - SNAP_MID);
          const dBot = Math.abs(currentY - SNAP_BOTTOM);
          if (dTop < dMid && dTop < dBot) toValue = SNAP_TOP;
          else if (dMid < dTop && dMid < dBot) toValue = SNAP_MID;
          else toValue = SNAP_BOTTOM;
        }

        Animated.spring(sheetY, { toValue, tension: 50, friction: 8, useNativeDriver: false }).start();
      },
    })
  ).current;

  // Animated rider marker position
  const markerX = useRef(new Animated.Value(riderLocation.x)).current;
  const markerY = useRef(new Animated.Value(riderLocation.y)).current;

  const animateMarker = useCallback((loc: RiderLocation) => {
    Animated.parallel([
      Animated.timing(markerX, { toValue: loc.x, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(markerY, { toValue: loc.y, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, [markerX, markerY]);

  // Supabase realtime: delivery status + rider info
  useEffect(() => {
    if (!id || id === 'VB-0000') return;

    // Initial fetch
    (async () => {
      const { data } = await supabase
        .from('deliveries')
        .select('status, rider:users!deliveries_rider_id_fkey(full_name)')
        .eq('order_id', id)
        .maybeSingle();

      if (data?.status) setDeliveryStatus(String(data.status));
    })();

    // Realtime subscription
    const channel = supabase
      .channel(`seller-delivery-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deliveries', filter: `order_id=eq.${id}` },
        (payload: any) => {
          const next = payload.new ?? {};
          if (next.status) {
            setDeliveryStatus(String(next.status));
            animateMarker(statusToLocation(String(next.status)));
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, animateMarker]);

  // Animate marker when status changes (local orders)
  useEffect(() => {
    animateMarker(riderLocation);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedStatus]);

  const isDeliveryActive = combinedStatus.includes('pickup') ||
    combinedStatus === 'picked_up' ||
    combinedStatus === 'heading_to_buyer' ||
    combinedStatus === 'arrived_buyer';

  const isDelivered = combinedStatus === 'delivered';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Live Map Area ── */}
      <View
        style={styles.map}
        onLayout={(e) => setMapSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        {/* Map placeholder tiles */}
        <View style={styles.mapGrid}>
          {[...Array(20)].map((_, i) => (
            <View key={i} style={styles.mapCell} />
          ))}
        </View>

        {/* Route line from seller to buyer */}
        <View style={styles.routeLine} />

        {/* Seller origin dot */}
        <View style={[styles.originDot, { left: '14%', top: '38%' }]}>
          <MaterialIcons name="storefront" size={18} color={Colors.onPrimary} />
        </View>

        {/* Destination (buyer home) */}
        <View style={[styles.destDot, { right: '16%', top: '46%' }]}>
          <MaterialIcons name="home" size={20} color={Colors.onSecondaryContainer} />
        </View>

        {/* Animated rider marker */}
        <Animated.View
          style={[
            styles.riderMarker,
            {
              left: markerX.interpolate({ inputRange: [0, 1], outputRange: [0, mapSize.width - 54] }),
              top:  markerY.interpolate({ inputRange: [0, 1], outputRange: [0, mapSize.height - 54] }),
            },
          ]}
        >
          <Animated.View style={[styles.riderPulse, { transform: [{ scale: pulseAnim }] }]} />
          <MaterialIcons name="delivery-dining" size={26} color={Colors.onPrimary} />
        </Animated.View>

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={22} color={Colors.primary} />
        </Pressable>

        {/* Order ID label */}
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>Order #{id}</Text>
        </View>

        {/* Live indicator */}
        {isDeliveryActive && (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* ── Bottom Sheet ── */}
      <Animated.View style={[styles.sheet, { top: sheetY }]}>
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status + price */}
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.productTitle} numberOfLines={1}>{product}</Text>
              <Text style={styles.price}>{formatPeso(price)}</Text>
              <Text style={styles.meta}>Placed {new Date(placedAt).toLocaleString('en-PH')}</Text>
            </View>
            <View style={[styles.statusPill, isDelivered && styles.statusPillDone]}>
              <Text style={[styles.statusText, isDelivered && styles.statusTextDone]}>
                {isDelivered ? 'Delivered' : combinedStatus.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          {/* Buyer row */}
          <View style={styles.buyerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{buyer.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{buyer}</Text>
              <Text style={styles.rowBody}>Verified Veribee buyer</Text>
            </View>
            <MaterialIcons name="verified" size={18} color={Colors.secondary} />
          </View>

          {/* Rider info (show once picked up) */}
          {(isDeliveryActive || isDelivered) && (
            <View style={styles.riderCard}>
              <View style={styles.riderAvatar}>
                <Text style={styles.riderAvatarText}>{riderName[0]}</Text>
              </View>
              <View style={styles.riderCopy}>
                <Text style={styles.riderName}>{riderName}</Text>
                <Text style={styles.riderMeta}>Plate {riderPlate}  ·  ⭐ {riderRating}</Text>
              </View>
              <MaterialIcons name="two-wheeler" size={22} color={Colors.primary} />
            </View>
          )}

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery timeline</Text>
            <View style={styles.timeline}>
              {TIMELINE.map((step, index) => {
                const active = step.statuses.includes(combinedStatus);
                const isCurrent = TIMELINE.findIndex(s => s.statuses.includes(combinedStatus)) === index;
                return (
                  <View key={step.label} style={styles.timelineRow}>
                    {/* Connector line */}
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, active && styles.timelineDotActive, isCurrent && styles.timelineDotCurrent]}>
                        <MaterialIcons
                          name={active ? (isCurrent ? step.icon : 'check') : step.icon}
                          size={isCurrent ? 18 : 14}
                          color={active ? Colors.onPrimary : Colors.outline}
                        />
                      </View>
                      {index < TIMELINE.length - 1 && (
                        <View style={[styles.timelineConnector, active && styles.timelineConnectorActive]} />
                      )}
                    </View>
                    <Text style={[styles.timelineLabel, active && styles.timelineLabelActive, isCurrent && styles.timelineLabelCurrent]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Payment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.paymentCard}>
              <PayRow label="Subtotal" value={formatPeso(price)} />
              <PayRow label="Authentication fee" value={formatPeso(50)} />
              <PayRow label="Delivery fee" value={formatPeso(85)} />
              <View style={styles.divider} />
              <PayRow label="Total" value={formatPeso(price + 50 + 85)} bold />
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function PayRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.paymentRow}>
      <Text style={[styles.paymentLabel, bold && styles.paymentLabelBold]}>{label}</Text>
      <Text style={[styles.paymentValue, bold && styles.paymentValueBold]}>{value}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.tertiaryFixed },

  /* Map */
  map: {
    flex: 1,
    backgroundColor: Colors.tertiaryFixed,
    overflow: 'hidden',
  },
  mapGrid: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.25,
  },
  mapCell: {
    width: '20%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.tertiaryContainer,
    aspectRatio: 1,
  },
  routeLine: {
    position: 'absolute',
    left: '16%',
    right: '18%',
    top: '49%',
    height: 3,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
  originDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  destDot: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  riderMarker: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.fab,
  },
  riderPulse: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    opacity: 0.25,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.containerMargin,
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  pressed: { opacity: 0.72 },
  orderBadge: {
    position: 'absolute',
    top: Spacing.lg,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    ...Shadow.card,
  },
  orderBadgeText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.primary,
  },
  livePill: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.containerMargin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.onPrimary,
  },
  liveText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.onPrimary,
  },

  /* Sheet */
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: Colors.surfaceContainerLowest,
    ...Shadow.sheet,
  },
  handleArea: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  sheetContent: {
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },

  /* Summary row */
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  productTitle: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 16,
    color: Colors.onSurface,
    flexShrink: 1,
  },
  price: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 26,
    color: Colors.primary,
    lineHeight: 32,
  },
  meta: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  statusPill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusPillDone: { backgroundColor: Colors.tertiaryFixed },
  statusText: { ...Type.labelCaps, color: Colors.onSecondaryContainer },
  statusTextDone: { color: Colors.tertiary },

  /* Buyer row */
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.card,
    padding: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.manropeBold, fontSize: 14, color: Colors.primary },
  rowCopy: { flex: 1 },
  rowTitle: { fontFamily: Fonts.manropeBold, fontSize: 14, color: Colors.onSurface },
  rowBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant, marginTop: 1 },

  /* Rider card */
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryFixed,
    borderRadius: Radii.card,
    padding: Spacing.md,
  },
  riderAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderAvatarText: { fontFamily: Fonts.epilogueBold, fontSize: 18, color: Colors.onPrimary },
  riderCopy: { flex: 1 },
  riderName: { fontFamily: Fonts.manropeBold, fontSize: 14, color: Colors.onSurface },
  riderMeta: { fontFamily: Fonts.manropeRegular, fontSize: 12, color: Colors.onSurfaceVariant },

  /* Timeline */
  section: { gap: Spacing.xs },
  sectionTitle: { ...Type.labelCaps, color: Colors.onSurfaceVariant, marginLeft: 2 },
  timeline: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.card,
    padding: Spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    minHeight: 48,
  },
  timelineLeft: { alignItems: 'center', width: 32 },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: { backgroundColor: Colors.onSurfaceVariant },
  timelineDotCurrent: { backgroundColor: Colors.primary },
  timelineConnector: {
    flex: 1,
    width: 2,
    minHeight: 14,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    marginTop: 2,
  },
  timelineConnectorActive: { backgroundColor: Colors.primary, opacity: 0.4 },
  timelineLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.outline,
    paddingTop: 6,
    flex: 1,
  },
  timelineLabelActive: { color: Colors.onSurfaceVariant },
  timelineLabelCurrent: { fontFamily: Fonts.manropeBold, color: Colors.onSurface },

  /* Payment */
  paymentCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radii.card,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  paymentLabel: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  paymentLabelBold: { ...Type.h3, color: Colors.onSurface },
  paymentValue: { fontFamily: Fonts.manropeBold, fontSize: 14, color: Colors.onSurface },
  paymentValueBold: { ...Type.h3, color: Colors.primary },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.surfaceVariant,
    marginVertical: Spacing.xs,
  },
});
