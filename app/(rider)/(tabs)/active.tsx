import { Pressable, ScrollView, StyleSheet, Text, View, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { ActiveDeliveryCard } from '@/components/rider/ActiveDeliveryCard';
import { MapCard } from '@/components/rider/MapCard';
import { useRiderStore } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function RiderActive() {
  const router = useRouter();
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const completedJobs = useRiderStore((s) => s.completedJobs);

  if (!activeDelivery) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerKicker}>RIDER ROUTE</Text>
            <Text style={styles.headerTitle}>Active Delivery</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyState}>
            {/* Soft background decor */}
            <View style={styles.emptyBlur} pointerEvents="none" />
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="local-mall" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No active delivery</Text>
            <Text style={styles.emptyBody}>
              You currently have no assigned orders. Check available jobs to start earning.
            </Text>
            <Button
              title="View Jobs"
              onPress={() => router.replace('/(rider)/(tabs)/job-feed')}
              icon={<MaterialIcons name="search" size={18} color={Colors.onPrimary} />}
              style={styles.emptyButton}
            />
          </View>
          <View style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Recently completed</Text>
              <Pressable hitSlop={12} onPress={() => router.push('/(rider)/job-history')}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            </View>
            <View style={styles.previewList}>
              {completedJobs.length > 0 ? (
                completedJobs.slice(0, 2).map((job) => (
                  <View key={job.deliveryId} style={styles.previewRow}>
                    <View style={styles.previewIconWrap}>
                      <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.previewCopy}>
                      <Text style={styles.previewLabel}>Order #{job.orderId.slice(0, 4).toUpperCase()}</Text>
                      <Text style={styles.previewTime}>Today, 2:15 PM</Text>
                    </View>
                    <View style={styles.previewRight}>
                      <Text style={styles.previewFee}>+ PHP {job.jobFee.toFixed(2)}</Text>
                      <View style={styles.completedPill}>
                        <View style={styles.completedDot} />
                        <Text style={styles.completedPillText}>Completed</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.previewRow}>
                  <View style={styles.previewIconWrap}>
                    <MaterialIcons name="history" size={24} color={Colors.onSurfaceVariant} />
                  </View>
                  <Text style={styles.previewBody}>Completed deliveries will appear here.</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const target =
    activeDelivery.status === 'heading_to_pickup' ||
    activeDelivery.status === 'arrived_pickup'
      ? activeDelivery.pickupAddress
      : activeDelivery.deliveryAddress;

  const titleText =
    activeDelivery.status === 'heading_to_pickup' ? 'Heading to Pickup' :
    activeDelivery.status === 'arrived_pickup' ? 'Arrived at Pickup' :
    activeDelivery.status === 'picked_up' ? 'Picked Up' :
    activeDelivery.status === 'heading_to_buyer' ? 'Heading to Delivery' :
    activeDelivery.status === 'arrived_buyer' ? 'Arrived at Delivery' : 'En Route';

  const contactName =
    activeDelivery.status === 'heading_to_pickup' || activeDelivery.status === 'arrived_pickup'
      ? activeDelivery.sellerName
      : activeDelivery.buyerName;

  const contactPhone =
    activeDelivery.status === 'heading_to_pickup' || activeDelivery.status === 'arrived_pickup'
      ? activeDelivery.sellerPhone
      : activeDelivery.buyerPhone;

  const nextRoute =
    activeDelivery.status === 'heading_to_pickup'
      ? '/(rider)/navigation-pickup'
      : activeDelivery.status === 'arrived_pickup'
        ? '/(rider)/pickup-confirm'
        : activeDelivery.status === 'heading_to_buyer'
          ? '/(rider)/navigation-delivery'
          : activeDelivery.status === 'arrived_buyer'
            ? '/(rider)/verify-delivery'
            : '/(rider)/navigation-pickup';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerKicker}>RIDER ROUTE</Text>
          <Text style={styles.headerTitle}>Delivery in Progress</Text>
        </View>
        <Pressable
          onPress={() => router.push(nextRoute)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Open active delivery"
        >
          <MaterialIcons name="open-in-new" size={24} color={Colors.onPrimary} />
        </Pressable>
      </View>
      <View style={styles.mapContainer}>
        <Image 
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxZTad_jHpx1uRF4cMn7_Ydjq6ZxRxlIWFDs04G-MuLUQbkynMbgwJtmiEB4PGGujfIdaR4fGmSYDZ-C8N4AaJ8uWMBzgBa5JRxdlCblk0dOg4YHT0pdiV4UyfQz1_djL_lbyB0Zc67cFR54vzIR8BHyqXH9A1tdl6gEk4YIga2tYSohOhpcLVVzA9gclByx-MEI1fkhVsdCFSOhnt7g8T6cOruW957RiAjCFlVxw87K5WwhqGMDlxK5IXK4zUYBVaB6COkFjUejQ' }} 
          style={StyleSheet.absoluteFillObject} 
        />
        
        {/* ETA Badge */}
        <View style={styles.etaBadge}>
          <MaterialIcons name="navigation" size={20} color={Colors.primary} />
          <Text style={styles.etaBadgeText}>{activeDelivery.etaMinutes} mins away</Text>
        </View>

        {/* Floating Card */}
        <View style={styles.floatingCard}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardScroll}>
            
            {/* Header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.enRouteText}>EN ROUTE</Text>
                <Text style={styles.titleText}>{titleText}</Text>
              </View>
              <View style={styles.orderIdPill}>
                <Text style={styles.orderIdText}>#{activeDelivery.orderId}</Text>
              </View>
            </View>

            {/* Customer Profile */}
            <View style={styles.profileRow}>
              <View style={styles.profileLeft}>
                 <View style={styles.avatarPlaceholder} />
                 <View>
                   <Text style={styles.profileName}>{contactName}</Text>
                   <Text style={styles.profileType}>Premium Client</Text>
                 </View>
              </View>
              <View style={styles.profileActions}>
                 <Pressable style={styles.iconBtn} onPress={() => router.push(`tel:${contactPhone}`)}>
                    <MaterialIcons name="call" size={20} color={Colors.primary} />
                 </Pressable>
                 <Pressable style={styles.iconBtn}>
                    <MaterialIcons name="chat-bubble" size={20} color={Colors.primary} />
                 </Pressable>
              </View>
            </View>

            {/* Delivery Details */}
            <View style={styles.detailsSection}>
               <View style={styles.locationRow}>
                 <View style={styles.locationIconWrap}>
                   <MaterialIcons name="location-on" size={20} color={Colors.primary} />
                 </View>
                 <View style={styles.locationCopy}>
                   <Text style={styles.locationLabel}>
                     {activeDelivery.status === 'heading_to_pickup' || activeDelivery.status === 'arrived_pickup' ? 'PICKUP ADDRESS' : 'DELIVERY ADDRESS'}
                   </Text>
                   <Text style={styles.locationAddress}>{target}</Text>
                 </View>
               </View>

               {/* Item Card */}
               <View style={styles.itemCard}>
                 <Image source={{ uri: activeDelivery.productImage }} style={styles.itemImage} />
                 <View style={styles.itemCopy}>
                   <Text style={styles.itemCategory}>{activeDelivery.category}</Text>
                   <Text style={styles.itemName} numberOfLines={1}>{activeDelivery.productName}</Text>
                   <Text style={styles.itemSecured}>INSURED & SECURED</Text>
                 </View>
               </View>
            </View>
          </ScrollView>

          {/* Primary Action */}
          <View style={styles.actionWrap}>
            <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]} onPress={() => router.push(nextRoute)}>
               <Text style={styles.actionButtonText}>Continue Delivery</Text>
               <MaterialIcons name="chevron-right" size={24} color={Colors.onPrimary} />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    minHeight: 72,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    color: Colors.onPrimary,
  },
  headerKicker: {
    ...Type.labelCaps,
    color: Colors.secondaryContainer,
    marginBottom: 3,
  },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.xl,
  },
  emptyState: {
    minHeight: 280,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.dealContainer,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  emptyBlur: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainer,
    opacity: 0.5,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 4,
  },
  emptyTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyBody: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: '80%',
  },
  emptyButton: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  previewSection: {
    gap: Spacing.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  previewTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
  },
  viewAllText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    color: Colors.primary,
  },
  previewList: {
    gap: Spacing.sm,
  },
  previewRow: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent', // In a real app we'd use pressable hover states here
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  previewIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCopy: { flex: 1 },
  previewLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: Colors.onSurface,
    marginBottom: 2,
  },
  previewTime: {
    ...Type.bodyMd,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  previewBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant, flex: 1 },
  previewRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  previewFee: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: Colors.onSurface,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  completedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e', // green-500
  },
  completedPillText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    letterSpacing: 0.2,
    color: Colors.onSurfaceVariant,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.surfaceContainer,
  },
  etaBadge: {
    position: 'absolute',
    top: Spacing.xl,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.card,
  },
  etaBadgeText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: '75%',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 16,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radii.full,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardScroll: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  enRouteText: {
    ...Type.labelCaps,
    color: Colors.primary,
    marginBottom: 4,
  },
  titleText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    color: Colors.onSurface,
  },
  orderIdPill: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.md,
  },
  orderIdText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    borderRadius: Radii.lg,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  profileName: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  profileType: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.secondary,
  },
  profileActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    ...Shadow.fab,
  },
  detailsSection: {
    gap: Spacing.xl,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  locationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryContainer + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  locationCopy: { flex: 1 },
  locationLabel: {
    ...Type.labelCaps,
    color: Colors.secondary,
    marginBottom: 4,
  },
  locationAddress: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 16,
    color: Colors.onSurface,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    ...Shadow.card,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
  },
  itemCopy: { flex: 1 },
  itemCategory: {
    ...Type.labelCaps,
    color: Colors.secondary,
    marginBottom: 4,
  },
  itemName: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  itemSecured: {
    ...Type.labelCaps,
    color: Colors.primary,
  },
  actionWrap: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surface,
  },
  actionButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.fab,
  },
  actionButtonText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onPrimary,
  },
  pressed: { opacity: 0.74 },
});
