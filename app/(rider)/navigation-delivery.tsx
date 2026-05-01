import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ActiveDeliveryCard } from '@/components/rider/ActiveDeliveryCard';
import { MapCard } from '@/components/rider/MapCard';
import { supabase } from '@/lib/supabase';
import { useRiderStore } from '@/store/riderStore';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

export default function NavigationDelivery() {
  const router = useRouter();
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const updateActiveStatus = useRiderStore((s) => s.updateActiveStatus);


  if (!activeDelivery) return <Redirect href="/(rider)/(tabs)/job-feed" />;

  const onArrived = async () => {
    updateActiveStatus('arrived_buyer');
    await supabase
      .from('deliveries')
      .update({
        status: 'arrived_buyer',
        otp_code: activeDelivery.otpCode,
        rider_current_lat: 14.5547,
        rider_current_lng: 121.0244,
      })
      .eq('id', activeDelivery.deliveryId);
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
        <MapCard label={activeDelivery.deliveryAddress} height={360} />
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
