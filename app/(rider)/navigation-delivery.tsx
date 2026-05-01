import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ActiveDeliveryCard } from '@/components/rider/ActiveDeliveryCard';
import { MapCard } from '@/components/rider/MapCard';
import { DEMO_ROUTE, makeGoogleMapsDirectionsUrl } from '@/lib/demoProfiles';
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

export default function NavigationDelivery() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const updateActiveStatus = useRiderStore((s) => s.updateActiveStatus);
  const [riderCoordinate, setRiderCoordinate] = useState<Coordinate>(DEMO_ROUTE.pickup);
  const [isLiveLocation, setIsLiveLocation] = useState(false);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);

  const deliveryCoordinate = useMemo(
    () => makeDeliveryCoordinate(activeDelivery),
    [activeDelivery],
  );

  const mapsUrl = useMemo(
    () => makeGoogleMapsDirectionsUrl(riderCoordinate, deliveryCoordinate),
    [deliveryCoordinate, riderCoordinate],
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
    getCurrentRiderCoordinate(DEMO_ROUTE.pickup).then(({ coordinate, live }) => {
      if (cancelled) return;
      setRiderCoordinate(coordinate);
      setIsLiveLocation(live);
      getFreeRouteSummary(coordinate, deliveryCoordinate).then((summary) => {
        if (!cancelled) setRouteSummary(summary);
      });
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [activeDelivery?.deliveryId, deliveryCoordinate, userId]);

  if (!activeDelivery) return <Redirect href="/(rider)/(tabs)/job-feed" />;

  const onArrived = async () => {
    const currentLocation =
      userId && !isLocalUserId(userId)
        ? await publishCurrentRiderLocation(activeDelivery.deliveryId)
        : null;
    updateActiveStatus('arrived_buyer');
    if (userId && !isLocalUserId(userId)) {
      await supabase
        .from('deliveries')
        .update({
          status: 'arrived_buyer',
          otp_code: activeDelivery.otpCode,
          rider_current_lat: currentLocation?.latitude ?? DEMO_ROUTE.dropoff.latitude,
          rider_current_lng: currentLocation?.longitude ?? DEMO_ROUTE.dropoff.longitude,
        })
        .eq('id', activeDelivery.deliveryId);
    }
    router.replace('/(rider)/verify-delivery');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Customer Navigation</Text>
        <Pressable
          onPress={() => Linking.openURL(`tel:${activeDelivery.buyerPhone}`)}
          hitSlop={12}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Call buyer"
        >
          <MaterialIcons name="call" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>
      <View style={styles.mapWrap}>
        <MapCard
          label={activeDelivery.deliveryAddress}
          height={360}
          origin={DEMO_ROUTE.pickup}
          current={riderCoordinate}
          destination={deliveryCoordinate}
          routeSummary={routeSummary ?? makeJobRouteSummary(activeDelivery)}
          isLive={isLiveLocation}
          onOpenMaps={() => Linking.openURL(mapsUrl)}
        />
      </View>
      <ActiveDeliveryCard
        delivery={activeDelivery}
        title={activeDelivery.deliveryAddress}
        subtitle="Heading to buyer"
        actionLabel="I've Arrived at Customer"
        onAction={onArrived}
      />
    </SafeAreaView>
  );
}

function makeDeliveryCoordinate(delivery: ActiveDelivery | null): Coordinate {
  return {
    label: delivery?.deliveryAddress ?? DEMO_ROUTE.dropoff.label,
    address: delivery?.deliveryAddress ?? DEMO_ROUTE.dropoff.address,
    latitude: delivery?.deliveryLatitude ?? DEMO_ROUTE.dropoff.latitude,
    longitude: delivery?.deliveryLongitude ?? DEMO_ROUTE.dropoff.longitude,
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
