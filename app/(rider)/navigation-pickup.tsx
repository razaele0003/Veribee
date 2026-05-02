import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { ActiveDeliveryCard } from '@/components/rider/ActiveDeliveryCard';
import { MapCard } from '@/components/rider/MapCard';
import { DEMO_ROUTE } from '@/lib/demoProfiles';
import {
  getCurrentRiderCoordinate,
  publishCurrentRiderLocation,
  startRiderLocationTracking,
} from '@/lib/locationTracking';
import { getFreeRouteSummary, type Coordinate, type RouteSummary } from '@/lib/maps';
import { supabase } from '@/lib/supabase';
import { isLocalUserId } from '@/lib/localAuth';
import { ActiveDelivery, useRiderStore } from '@/store/riderStore';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

export default function NavigationPickup() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const updateActiveStatus = useRiderStore((s) => s.updateActiveStatus);
  const [riderCoordinate, setRiderCoordinate] = useState<Coordinate>(DEMO_ROUTE.riderStart);
  const [isLiveLocation, setIsLiveLocation] = useState(false);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);

  const pickupCoordinate = useMemo(
    () => makePickupCoordinate(activeDelivery),
    [activeDelivery],
  );

  useEffect(() => {
    if (!activeDelivery) return;
    let subscription: { remove: () => void } | null = null;
    let cancelled = false;
    if (userId && !isLocalUserId(userId)) {
      startRiderLocationTracking(activeDelivery.deliveryId).then((next) => {
        if (cancelled) {
          next?.remove();
          return;
        }
        subscription = next;
      });
    }
    getCurrentRiderCoordinate(DEMO_ROUTE.riderStart).then(({ coordinate, live }) => {
      if (cancelled) return;
      setRiderCoordinate(coordinate);
      setIsLiveLocation(live);
      getFreeRouteSummary(coordinate, pickupCoordinate).then((summary) => {
        if (!cancelled) setRouteSummary(summary);
      });
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [activeDelivery?.deliveryId, pickupCoordinate, userId]);

  if (!activeDelivery) return <Redirect href="/(rider)/(tabs)/job-feed" />;

  const onArrived = async () => {
    if (userId && !isLocalUserId(userId)) {
      await publishCurrentRiderLocation(activeDelivery.deliveryId);
      await supabase
        .from('deliveries')
        .update({ status: 'arrived_pickup' })
        .eq('id', activeDelivery.deliveryId);
    }
    updateActiveStatus('arrived_pickup');
    router.replace('/(rider)/pickup-confirm');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Pickup Navigation</Text>
        <View style={styles.iconButton} />
      </View>
      <View style={styles.mapWrap}>
        <MapCard
          label={activeDelivery.pickupAddress}
          height={360}
          origin={DEMO_ROUTE.riderStart}
          current={riderCoordinate}
          destination={pickupCoordinate}
          routeSummary={routeSummary ?? makeJobRouteSummary(activeDelivery)}
          isLive={isLiveLocation}
        />
      </View>
      <ActiveDeliveryCard
        delivery={activeDelivery}
        title={activeDelivery.pickupAddress}
        subtitle="Heading to pickup"
        actionLabel="I've Arrived at Pickup"
        onAction={onArrived}
      />
    </SafeAreaView>
  );
}

function makePickupCoordinate(delivery: ActiveDelivery | null): Coordinate {
  return {
    label: delivery?.pickupAddress ?? DEMO_ROUTE.pickup.label,
    address: delivery?.pickupAddress ?? DEMO_ROUTE.pickup.address,
    latitude: delivery?.pickupLatitude ?? DEMO_ROUTE.pickup.latitude,
    longitude: delivery?.pickupLongitude ?? DEMO_ROUTE.pickup.longitude,
  };
}

function makeJobRouteSummary(delivery: ActiveDelivery): RouteSummary {
  return {
    distanceKm: delivery.distanceKm,
    etaMinutes: delivery.etaMinutes,
    source: 'local',
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 56,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 17,
    color: Colors.primary,
  },
  mapWrap: {
    flex: 1,
    padding: Spacing.containerMargin,
    justifyContent: 'center',
  },
});
