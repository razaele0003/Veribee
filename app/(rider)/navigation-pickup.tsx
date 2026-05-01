import { useEffect, useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ActiveDeliveryCard } from '@/components/rider/ActiveDeliveryCard';
import { MapCard } from '@/components/rider/MapCard';
import { DEMO_ROUTE, makeGoogleMapsDirectionsUrl } from '@/lib/demoProfiles';
import { publishCurrentRiderLocation, startRiderLocationTracking } from '@/lib/locationTracking';
import { supabase } from '@/lib/supabase';
import { useRiderStore } from '@/store/riderStore';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

export default function NavigationPickup() {
  const router = useRouter();
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const updateActiveStatus = useRiderStore((s) => s.updateActiveStatus);

  const mapsUrl = useMemo(
    () => makeGoogleMapsDirectionsUrl(DEMO_ROUTE.riderStart, DEMO_ROUTE.pickup),
    [],
  );

  useEffect(() => {
    if (!activeDelivery) return;
    let subscription: { remove: () => void } | null = null;
    let cancelled = false;
    startRiderLocationTracking(activeDelivery.deliveryId).then((next) => {
      if (cancelled) {
        next?.remove();
        return;
      }
      subscription = next;
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [activeDelivery?.deliveryId]);

  if (!activeDelivery) return <Redirect href="/(rider)/(tabs)/job-feed" />;

  const onArrived = async () => {
    await publishCurrentRiderLocation(activeDelivery.deliveryId);
    updateActiveStatus('arrived_pickup');
    await supabase
      .from('deliveries')
      .update({ status: 'arrived_pickup' })
      .eq('id', activeDelivery.deliveryId);
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
          onOpenMaps={() => Linking.openURL(mapsUrl)}
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
