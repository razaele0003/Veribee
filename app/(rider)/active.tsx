import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { ActiveDeliveryCard } from '@/components/rider/ActiveDeliveryCard';
import { MapCard } from '@/components/rider/MapCard';
import { useRiderStore } from '@/store/riderStore';
import { Colors } from '@/constants/colors';
import { Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function RiderActive() {
  const router = useRouter();
  const activeDelivery = useRiderStore((s) => s.activeDelivery);

  if (!activeDelivery) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Active Delivery</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialIcons name="pending-actions" size={40} color={Colors.primary} />
          <Text style={styles.emptyTitle}>No active delivery</Text>
          <Text style={styles.emptyBody}>Accept a nearby request to start navigation.</Text>
          <Button title="View Jobs" onPress={() => router.replace('/(rider)/job-feed')} />
        </View>
      </SafeAreaView>
    );
  }

  const target =
    activeDelivery.status === 'heading_to_pickup' ||
    activeDelivery.status === 'arrived_pickup'
      ? activeDelivery.pickupAddress
      : activeDelivery.deliveryAddress;

  const nextRoute =
    activeDelivery.status === 'heading_to_pickup'
      ? '/(rider)/navigation-pickup'
      : activeDelivery.status === 'arrived_pickup'
        ? '/(rider)/pickup-confirm'
        : activeDelivery.status === 'heading_to_buyer'
          ? '/(rider)/navigation-delivery'
          : activeDelivery.status === 'arrived_buyer'
            ? '/(rider)/otp-entry'
            : '/(rider)/navigation-pickup';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Delivery</Text>
        <Pressable
          onPress={() => router.push(nextRoute)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Open active delivery"
        >
          <MaterialIcons name="open-in-new" size={24} color={Colors.primary} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MapCard label={target} height={260} />
        <ActiveDeliveryCard
          delivery={activeDelivery}
          title={target}
          subtitle="Current stop"
          actionLabel="Continue Delivery"
          onAction={() => router.push(nextRoute)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    margin: Spacing.containerMargin,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  emptyBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
