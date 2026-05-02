import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { LiveOsmMap } from '@/components/rider/LiveOsmMap';
import { DEMO_ACCOUNTS, DEMO_ROUTE } from '@/lib/demoProfiles';
import type { Coordinate } from '@/lib/maps';
import { supabase } from '@/lib/supabase';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const steps = ['Confirmed', 'Picked Up', 'On the Way', 'Delivered'];

export default function OrderTracking() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [deliveryStatus, setDeliveryStatus] = useState('heading_to_buyer');
  const [otpReady, setOtpReady] = useState(false);
  const [riderCoordinate, setRiderCoordinate] = useState<Coordinate>(DEMO_ROUTE.riderStart);
  const activeStep = useMemo(() => {
    if (deliveryStatus === 'delivered') return 3;
    if (deliveryStatus === 'heading_to_buyer' || deliveryStatus === 'arrived_buyer') return 2;
    if (deliveryStatus === 'picked_up') return 1;
    return 0;
  }, [deliveryStatus]);

  useEffect(() => {
    if (!id) return;

    // Append a timestamp to the channel name so each mount gets a fresh
    // channel. This prevents "cannot add postgres_changes callbacks after
    // subscribe()" which occurs when React StrictMode double-fires
    // useEffect or the user navigates back/forward before cleanup completes.
    const channelName = `delivery-${id}-${Date.now()}`;
    let active = true;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deliveries', filter: `order_id=eq.${id}` },
        (payload: any) => {
          if (!active) return;
          const next = payload.new ?? {};
          if (next.status) setDeliveryStatus(String(next.status));
          if (next.otp_code) setOtpReady(true);
          if (next.rider_current_lat && next.rider_current_lng) {
            setRiderCoordinate({
              label: `${DEMO_ACCOUNTS.rider.fullName} live location`,
              latitude: Number(next.rider_current_lat),
              longitude: Number(next.rider_current_lng),
            });
          }
          if (next.status === 'delivered') router.replace('/(buyer)/delivery-confirmed');
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [id, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.map}>
        <LiveOsmMap origin={DEMO_ROUTE.riderStart} destination={DEMO_ROUTE.dropoff} current={riderCoordinate} />
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>
            Live rider GPS active
          </Text>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.title}>Track Order</Text>
          <MaterialIcons name="more-horiz" size={24} color={Colors.onSurfaceVariant} />
        </View>

        <View style={styles.stepper}>
          {steps.map((step, index) => {
            const isComplete = index < activeStep;
            const isActive = index === activeStep;
            return (
              <View key={step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    (isComplete || isActive) && styles.stepCircleActive,
                  ]}
                >
                  <MaterialIcons
                    name={isComplete ? 'check' : 'circle'}
                    size={isComplete ? 16 : 8}
                    color={(isComplete || isActive) ? Colors.onPrimary : Colors.onSurfaceVariant}
                  />
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.estimate}>
          <MaterialIcons name="schedule" size={22} color={Colors.primary} />
          <View style={styles.estimateCopy}>
            <Text style={styles.estimateLabel}>Estimated Arrival</Text>
            <Text style={styles.estimateValue}>12 mins</Text>
          </View>
          <Text style={styles.arrivalTime}>14:30</Text>
        </View>

        <View style={styles.riderCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={styles.riderCopy}>
            <Text style={styles.riderName}>{DEMO_ACCOUNTS.rider.fullName}</Text>
            <Text style={styles.riderMeta}>
              {DEMO_ACCOUNTS.rider.vehicle} - Plate {DEMO_ACCOUNTS.rider.plate}
            </Text>
          </View>
          <View style={styles.rating}>
            <MaterialIcons name="star" size={16} color={Colors.secondary} />
            <Text style={styles.ratingText}>{DEMO_ACCOUNTS.rider.rating}</Text>
          </View>
          <Pressable style={styles.chatButton}>
            <MaterialIcons name="chat" size={20} color={Colors.onPrimary} />
          </Pressable>
        </View>

      </View>

      {/* Dev Tool: Simulate rider arriving and triggering handover */}
      <Pressable
        style={styles.devFab}
        onPress={() => router.push('/(buyer)/handover-select')}
        accessibilityRole="button"
      >
        <MaterialIcons name="bug-report" size={20} color="#fff" />
        <Text style={styles.devFabText}>Trigger Handover (Dev)</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerHigh },
  map: {
    flex: 1,
    backgroundColor: Colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
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
  routeLine: {
    width: '64%',
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
  },
  liveBadge: {
    position: 'absolute',
    top: Spacing.xl + 54,
    left: Spacing.containerMargin,
    right: Spacing.containerMargin,
    minHeight: 40,
    borderRadius: Radii.DEFAULT,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.card,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.success,
  },
  liveBadgeText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onSurface,
  },
  riderMarker: {
    position: 'absolute',
    left: '24%',
    top: '42%',
    width: 54,
    height: 54,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeMarker: {
    position: 'absolute',
    right: '22%',
    top: '52%',
    width: 50,
    height: 50,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapsButton: {
    position: 'absolute',
    left: Spacing.containerMargin,
    bottom: Spacing.lg,
    minHeight: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...Shadow.card,
  },
  mapsButtonText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onPrimary,
  },
  mapAttribution: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: 72,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontFamily: Fonts.manropeBold,
    fontSize: 9,
    color: Colors.onSurfaceVariant,
  },
  pressed: {
    opacity: 0.74,
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.onSurface,
  },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.xs },
  stepItem: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: Colors.primary },
  stepLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  stepLabelActive: { color: Colors.primary, fontFamily: Fonts.manropeBold },
  estimate: {
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  estimateCopy: { flex: 1 },
  estimateLabel: { fontFamily: Fonts.manropeRegular, fontSize: 13, color: Colors.onSurfaceVariant },
  estimateValue: { fontFamily: Fonts.epilogueBold, fontSize: 18, color: Colors.onSurface },
  arrivalTime: { fontFamily: Fonts.manropeBold, fontSize: 13, color: Colors.onSurfaceVariant },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.surfaceVariant,
    paddingTop: Spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.epilogueBold, fontSize: 18, color: Colors.primary },
  riderCopy: { flex: 1 },
  riderName: { fontFamily: Fonts.manropeBold, fontSize: 14, color: Colors.onSurface },
  riderMeta: { fontFamily: Fonts.manropeRegular, fontSize: 12, color: Colors.onSurfaceVariant },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontFamily: Fonts.manropeBold, fontSize: 13, color: Colors.onSurface },
  chatButton: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devFab: {
    position: 'absolute',
    bottom: Spacing.xl + Spacing.sm,
    right: Spacing.containerMargin,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  devFabText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: '#fff',
  },
});
