import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ActiveDeliveryCard } from '@/components/rider/ActiveDeliveryCard';
import { MapCard } from '@/components/rider/MapCard';
import { useRiderStore } from '@/store/riderStore';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

export default function NavigationPickup() {
  const router = useRouter();
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const updateActiveStatus = useRiderStore((s) => s.updateActiveStatus);

  if (!activeDelivery) {
    router.replace('/(rider)/job-feed');
    return null;
  }

  const onArrived = () => {
    updateActiveStatus('arrived_pickup');
    router.push('/(rider)/pickup-confirm');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Pickup Navigation</Text>
        <Pressable
          onPress={() => Alert.alert('Map layers', 'Live map layers come with Supabase GPS.')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <MaterialIcons name="layers" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>
      <View style={styles.mapWrap}>
        <MapCard label={activeDelivery.pickupAddress} height={360} />
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
