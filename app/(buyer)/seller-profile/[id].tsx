import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { BUYER_PRODUCTS, formatPHP } from '@/lib/buyerData';
import { resolveImageSource } from '@/constants/productImages';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function SellerProfilePreview() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const sellerProducts = BUYER_PRODUCTS.filter((product) => product.sellerId === id);
  const seller = sellerProducts[0] ?? BUYER_PRODUCTS[0];
  const products = sellerProducts.length > 0 ? sellerProducts : [seller];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Seller Profile</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{seller.sellerName[0]}</Text>
          </View>
          <Text style={styles.sellerName}>{seller.sellerName}</Text>
          <View style={styles.trustedPill}>
            <MaterialIcons name="verified" size={16} color={Colors.onSecondaryContainer} />
            <Text style={styles.trustedText}>Trusted Seller</Text>
          </View>
          <View style={styles.statsRow}>
            <Stat label="VSI" value={String(seller.sellerVsi)} />
            <Stat label="Listings" value={String(products.length)} />
            <Stat label="Rating" value="4.9" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Store details</Text>
          <InfoRow icon="schedule" label="Store hours" value="9:00 AM - 6:00 PM" />
          <InfoRow icon="location-on" label="Pickup area" value="Metro Manila" />
          <InfoRow icon="shield" label="Verification" value="KYC and product authentication active" />
        </View>

        <Text style={styles.sectionTitle}>Verified listings</Text>
        {products.map((product) => (
          <Pressable
            key={product.id}
            onPress={() => router.push(`/(buyer)/product/${product.id}`)}
            style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Open ${product.title}`}
          >
            {product.imageUrl ? (
              <Image source={resolveImageSource(product.imageUrl)} style={styles.productImage} />
            ) : (
              <View style={styles.productImage}>
                <MaterialIcons name="inventory-2" size={24} color={Colors.primary} />
              </View>
            )}
            <View style={styles.productCopy}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productPrice}>{formatPHP(product.price)}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={22} color={Colors.onSurfaceVariant} />
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
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
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72 },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: { padding: Spacing.containerMargin, paddingBottom: 112, gap: Spacing.md },
  profileCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.card,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 36,
    color: Colors.primary,
  },
  sellerName: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  trustedPill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trustedText: { ...Type.labelCaps, color: Colors.onSecondaryContainer },
  statsRow: { alignSelf: 'stretch', flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  statLabel: { ...Type.labelCaps, fontSize: 10, color: Colors.onSurfaceVariant },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  sectionTitle: { ...Type.h3, color: Colors.onSurface },
  infoRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoCopy: { flex: 1 },
  infoLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  infoValue: { ...Type.bodyMd, fontSize: 13, color: Colors.onSurfaceVariant },
  productCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  productImage: {
    width: 58,
    height: 58,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCopy: { flex: 1 },
  productTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  productPrice: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
});
