import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { DEMO_ROUTE } from '@/lib/demoProfiles';
import type { Coordinate } from '@/lib/maps';

type LocationSubscription = {
  remove: () => void;
};

async function requestTrackingPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export function getDemoRiderCoordinate(): Coordinate {
  return DEMO_ROUTE.riderStart;
}

export async function getCurrentRiderCoordinate(fallback: Coordinate = DEMO_ROUTE.riderStart) {
  try {
    const hasPermission = await requestTrackingPermission();
    if (!hasPermission) return { coordinate: fallback, live: false };

    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 60_000,
      requiredAccuracy: 250,
    });

    const position =
      lastKnown ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }));

    return {
      coordinate: {
        label: 'Current rider location',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      live: true,
    };
  } catch {
    return { coordinate: fallback, live: false };
  }
}

export async function publishCurrentRiderLocation(deliveryId: string) {
  try {
    const hasPermission = await requestTrackingPermission();
    if (!hasPermission) return null;

    const { coordinate: coords } = await getCurrentRiderCoordinate();

    await supabase
      .from('deliveries')
      .update({
        rider_current_lat: coords.latitude,
        rider_current_lng: coords.longitude,
      })
      .eq('id', deliveryId);

    return coords;
  } catch {
    return null;
  }
}

export async function startRiderLocationTracking(deliveryId: string) {
  try {
    const hasPermission = await requestTrackingPermission();
    if (!hasPermission) return null;

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 10,
        timeInterval: 5000,
      },
      async (position) => {
        await supabase
          .from('deliveries')
          .update({
            rider_current_lat: position.coords.latitude,
            rider_current_lng: position.coords.longitude,
          })
          .eq('id', deliveryId);
      },
    );

    return subscription as LocationSubscription;
  } catch {
    return null;
  }
}
