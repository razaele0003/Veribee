import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

type LocationSubscription = {
  remove: () => void;
};

async function requestTrackingPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function publishCurrentRiderLocation(deliveryId: string) {
  try {
    const hasPermission = await requestTrackingPermission();
    if (!hasPermission) return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

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
