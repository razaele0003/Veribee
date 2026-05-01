import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Logo } from '@/components/ui/Logo';
import { ProductCard } from '@/components/buyer/ProductCard';
import { BUYER_PRODUCTS, BuyerProduct } from '@/lib/buyerData';
import { sellerProductToBuyerProduct, supabaseProductToBuyerProduct } from '@/lib/marketplaceProducts';
import { supabase } from '@/lib/supabase';
import { BUYER_LOCATIONS, BuyerLocation, useBuyerPrefsStore } from '@/store/buyerPrefsStore';
import { useSellerStore } from '@/store/sellerStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const categories = ['All', 'Electronics', 'Bags', 'Shoes', 'Jewelry'];

const commerceShortcuts: Array<{
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bg: string;
}> = [
  {
    id: 'deals',
    label: 'Flash Deals',
    icon: 'flash-on',
    color: Colors.deal,
    bg: Colors.dealContainer,
  },
  {
    id: 'verified',
    label: 'VSI 95+',
    icon: 'verified',
    color: Colors.tertiary,
    bg: Colors.tertiaryContainer,
  },
  {
    id: 'handover',
    label: 'OTP Safe',
    icon: 'pin',
    color: Colors.accentBlue,
    bg: Colors.accentBlueContainer,
  },
  {
    id: 'local',
    label: 'Nearby',
    icon: 'storefront',
    color: Colors.accentPink,
    bg: Colors.accentPinkContainer,
  },
];

const marketplacePerks: Array<{
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}> = [
  { id: 'voucher', icon: 'confirmation-number', label: 'Buyer perk', value: 'PHP 100 voucher' },
  { id: 'guard', icon: 'shield', label: 'Protected', value: 'OTP handover' },
  { id: 'route', icon: 'near-me', label: 'Metro Manila', value: 'Live rider route' },
];

type DemoNotification = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  body: string;
  time: string;
};

const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: 'n1',
    icon: 'verified',
    title: 'New verified seller nearby',
    body: "Maria's Boutique just got Trusted Seller status.",
    time: '2m',
  },
  {
    id: 'n2',
    icon: 'local-shipping',
    title: 'Order VB-9982 is on the way',
    body: 'Your rider is 8 minutes away.',
    time: '14m',
  },
  {
    id: 'n3',
    icon: 'discount',
    title: '₱100 off your next order',
    body: 'Limited-time perk for early Veribee buyers.',
    time: '1h',
  },
];

export default function BuyerHome() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [locationOpen, setLocationOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [liveProducts, setLiveProducts] = useState<BuyerProduct[]>([]);
  const location = useBuyerPrefsStore((s) => s.location);
  const setLocation = useBuyerPrefsStore((s) => s.setLocation);
  const sellerProducts = useSellerStore((s) => s.products);
  const unreadNotifications = DEMO_NOTIFICATIONS.length;

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, category, price, description, seller_id, images, seller:seller_profiles(store_name, vsi_score)')
        .eq('auth_status', 'verified')
        .range(0, 19);

      if (cancelled) return;
      setLiveProducts(error || !data ? [] : data.map(supabaseProductToBuyerProduct));
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const marketplaceProducts = useMemo(
    () => [
      ...sellerProducts
        .filter((product) => product.authStatus === 'verified')
        .map(sellerProductToBuyerProduct),
      ...(liveProducts.length > 0 ? liveProducts : BUYER_PRODUCTS),
    ],
    [liveProducts, sellerProducts],
  );

  const products = useMemo(
    () =>
      activeCategory === 'All'
        ? marketplaceProducts
        : marketplaceProducts.filter((product) => product.category === activeCategory),
    [activeCategory, marketplaceProducts],
  );

  const chooseLocation = (next: BuyerLocation) => {
    setLocation(next);
    setLocationOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogoBubble}>
            <Logo size={30} />
          </View>
          <Text style={styles.brand}>Veribee</Text>
        </View>
        <Pressable
          onPress={() => setLocationOpen(true)}
          style={({ pressed }) => [styles.locationPill, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Change location, currently ${location}`}
        >
          <MaterialIcons name="location-on" size={14} color={Colors.onPrimary} />
          <Text style={styles.locationText}>{location}</Text>
          <MaterialIcons name="expand-more" size={16} color={Colors.onPrimary} />
        </Pressable>
        <Pressable
          onPress={() => setNotificationsOpen(true)}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <MaterialIcons name="notifications-none" size={24} color={Colors.onPrimary} />
          {unreadNotifications > 0 && <View style={styles.notificationDot} />}
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(product) => product.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={[Colors.primaryContainer, Colors.primary, '#d22517']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadge}>
                  <MaterialIcons name="verified-user" size={15} color={Colors.onSecondaryContainer} />
                  <Text style={styles.heroBadgeText}>VERIFIED MARKETPLACE</Text>
                </View>
                <Text style={styles.heroLocation}>{location}</Text>
              </View>
              <Text style={styles.heroTitle}>Shop authenticated finds from trusted local sellers.</Text>
              <Text style={styles.heroCopy}>
                Every product is routed through Veribee checks before it reaches your cart.
              </Text>
              <View style={styles.heroDealRow}>
                <View style={styles.heroDealPill}>
                  <MaterialIcons name="local-fire-department" size={16} color={Colors.onWarningContainer} />
                  <Text style={styles.heroDealText}>Launch vouchers live</Text>
                </View>
                <View style={styles.heroDealPillAlt}>
                  <Text style={styles.heroDealTextAlt}>COD + OTP</Text>
                </View>
              </View>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{marketplaceProducts.length}</Text>
                  <Text style={styles.heroStatLabel}>Listings</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>98%</Text>
                  <Text style={styles.heroStatLabel}>Seller trust</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>24h</Text>
                  <Text style={styles.heroStatLabel}>Review target</Text>
                </View>
              </View>
            </LinearGradient>

            <Pressable
              onPress={() => router.push('/(buyer)/(tabs)/search')}
              style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Search verified products"
            >
              <MaterialIcons name="search" size={20} color={Colors.outline} />
              <Text style={styles.searchText}>Search verified products...</Text>
              <View style={styles.searchHotTag}>
                <Text style={styles.searchHotText}>Tote</Text>
              </View>
            </Pressable>

            <View style={styles.perkRail}>
              {marketplacePerks.map((perk) => (
                <View key={perk.id} style={styles.perkCard}>
                  <View style={styles.perkIcon}>
                    <MaterialIcons name={perk.icon} size={17} color={Colors.primary} />
                  </View>
                  <Text style={styles.perkLabel}>{perk.label}</Text>
                  <Text style={styles.perkValue} numberOfLines={1}>{perk.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.shortcutGrid}>
              {commerceShortcuts.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    if (item.id === 'deals') setActiveCategory('All');
                    if (item.id === 'verified') setActiveCategory('Jewelry');
                    if (item.id === 'local') setLocationOpen(true);
                  }}
                  style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <View style={[styles.shortcutIcon, { backgroundColor: item.bg }]}>
                    <MaterialIcons name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={styles.shortcutLabel} numberOfLines={2}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.dealBand}>
              <View style={styles.dealBandLeft}>
                <View style={styles.dealBadge}>
                  <MaterialIcons name="bolt" size={14} color={Colors.onDealContainer} />
                  <Text style={styles.dealBadgeText}>HOT NOW</Text>
                </View>
                <Text style={styles.dealBandTitle}>Verified deals before tonight</Text>
                <Text style={styles.dealBandBody}>Fast review, seller VSI, and secure handover in one order.</Text>
              </View>
              <View style={styles.dealTimer}>
                <Text style={styles.dealTimerValue}>24h</Text>
                <Text style={styles.dealTimerLabel}>target</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => setActiveCategory(category)}
                    style={[styles.chip, isActive && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionKicker}>CURATED FOR YOU</Text>
                <Text style={styles.sectionTitle}>Verified products</Text>
              </View>
              <Text style={styles.resultCount}>{products.length} items</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/(buyer)/product/${item.id}`)}
          />
        )}
      />

      <Modal
        transparent
        animationType="slide"
        visible={locationOpen}
        onRequestClose={() => setLocationOpen(false)}
      >
        <Pressable style={styles.sheetScrim} onPress={() => setLocationOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choose your city</Text>
            <Text style={styles.sheetBody}>
              We'll show verified sellers and riders available in your area.
            </Text>
            <View style={styles.sheetList}>
              {BUYER_LOCATIONS.map((option) => {
                const selected = option === location;
                return (
                  <Pressable
                    key={option}
                    onPress={() => chooseLocation(option)}
                    style={({ pressed }) => [
                      styles.sheetRow,
                      pressed && styles.sheetRowPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color={selected ? Colors.primary : Colors.onSurfaceVariant}
                    />
                    <Text
                      style={[styles.sheetRowLabel, selected && styles.sheetRowLabelActive]}
                    >
                      {option}
                    </Text>
                    {selected && (
                      <MaterialIcons name="check" size={20} color={Colors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={notificationsOpen}
        onRequestClose={() => setNotificationsOpen(false)}
      >
        <Pressable style={styles.sheetScrim} onPress={() => setNotificationsOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.notifHeader}>
              <Text style={styles.sheetTitle}>Notifications</Text>
              <Pressable
                onPress={() => setNotificationsOpen(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
              >
                <MaterialIcons name="close" size={22} color={Colors.onSurfaceVariant} />
              </Pressable>
            </View>
            <View style={styles.sheetList}>
              {DEMO_NOTIFICATIONS.map((item) => (
                <View key={item.id} style={styles.notifRow}>
                  <View style={styles.notifIconWrap}>
                    <MaterialIcons name={item.icon} size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.notifBody}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifText}>{item.body}</Text>
                  </View>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  appBar: {
    minHeight: 64,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: 0,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandLogoBubble: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  brand: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
    color: Colors.onPrimary,
  },
  locationPill: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  locationText: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onPrimary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.primaryContainer,
  },
  pressed: { opacity: 0.72 },
  content: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.md,
    paddingBottom: 112,
    gap: Spacing.md,
  },
  heroCard: {
    borderRadius: Radii.DEFAULT,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 18,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.fab,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  heroBadge: {
    minHeight: 30,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBadgeText: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSecondaryContainer,
  },
  heroLocation: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    lineHeight: 18,
    color: Colors.onPrimary,
  },
  heroTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 30,
    lineHeight: 36,
    color: Colors.onPrimary,
  },
  heroCopy: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onPrimaryContainer,
  },
  heroStats: {
    minHeight: 68,
    borderRadius: Radii.DEFAULT,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  heroDealRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  heroDealPill: {
    minHeight: 34,
    borderRadius: Radii.full,
    backgroundColor: Colors.warningContainer,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDealText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onWarningContainer,
  },
  heroDealPillAlt: {
    minHeight: 34,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDealTextAlt: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onPrimary,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  heroStatValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 21,
    lineHeight: 25,
    color: Colors.onPrimary,
  },
  heroStatLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onPrimaryContainer,
    textAlign: 'center',
  },
  heroStatDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  searchBar: {
    minHeight: 52,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  searchText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 15,
    color: Colors.outline,
    flex: 1,
  },
  searchHotTag: {
    minHeight: 28,
    borderRadius: Radii.full,
    backgroundColor: Colors.dealContainer,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchHotText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onDealContainer,
  },
  perkRail: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  perkCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: Radii.card,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: Spacing.sm,
    gap: 3,
    ...Shadow.card,
  },
  perkIcon: {
    width: 30,
    height: 30,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  perkLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  perkValue: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.onSurface,
  },
  shortcutGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  shortcut: {
    flex: 1,
    minHeight: 86,
    borderRadius: Radii.card,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    gap: 6,
    ...Shadow.card,
  },
  shortcutIcon: {
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    lineHeight: 14,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  dealBand: {
    minHeight: 112,
    borderRadius: Radii.card,
    backgroundColor: Colors.deal,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.fab,
  },
  dealBandLeft: {
    flex: 1,
    gap: 5,
  },
  dealBadge: {
    alignSelf: 'flex-start',
    minHeight: 28,
    borderRadius: Radii.full,
    backgroundColor: Colors.warningContainer,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealBadgeText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onDealContainer,
  },
  dealBandTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    lineHeight: 25,
    color: Colors.onPrimary,
  },
  dealBandBody: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 13,
    lineHeight: 18,
    color: '#fff5ee',
  },
  dealTimer: {
    width: 74,
    height: 74,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealTimerValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
    color: Colors.deal,
  },
  dealTimerLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  chips: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  chip: {
    minHeight: 36,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1.5,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: { color: Colors.onPrimary },
  productRow: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionKicker: {
    ...Type.labelCaps,
    color: Colors.primary,
    marginBottom: 4,
  },
  sectionTitle: {
    ...Type.h3,
    color: Colors.onSurface,
  },
  resultCount: {
    ...Type.labelMd,
    color: Colors.onSurfaceVariant,
  },
  sheetScrim: {
    flex: 1,
    backgroundColor: Colors.inverseSurface,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    ...Shadow.sheet,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.outlineVariant,
    marginBottom: Spacing.sm,
  },
  sheetTitle: { ...Type.h3, color: Colors.onSurface },
  sheetBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  sheetList: {
    marginTop: Spacing.sm,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  sheetRow: {
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceVariant,
  },
  sheetRowPressed: { backgroundColor: Colors.surfaceContainerLow },
  sheetRowLabel: {
    flex: 1,
    fontFamily: Fonts.manropeMedium,
    fontSize: 15,
    color: Colors.onSurface,
  },
  sheetRowLabelActive: {
    fontFamily: Fonts.manropeBold,
    color: Colors.primary,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifRow: {
    minHeight: 64,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceVariant,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBody: { flex: 1, gap: 2 },
  notifTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  notifText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  notifTime: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
});
