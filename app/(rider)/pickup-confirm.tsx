import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { isLocalUserId } from '@/lib/localAuth';
import { useRiderStore } from '@/store/riderStore';
import { useAuthStore } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';
import { useState } from 'react';

export default function PickupConfirm() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const activeDelivery = useRiderStore((s) => s.activeDelivery);
  const updateActiveStatus = useRiderStore((s) => s.updateActiveStatus);
  const [checked, setChecked] = useState([false, false, false]);


  if (!activeDelivery) return <Redirect href="/(rider)/(tabs)/job-feed" />;

  const onConfirm = async () => {
    updateActiveStatus('heading_to_buyer');
    if (userId && !isLocalUserId(userId)) {
      await supabase
        .from('deliveries')
        .update({ status: 'heading_to_buyer', picked_up_at: new Date().toISOString() })
        .eq('id', activeDelivery.deliveryId);
    }
    router.replace('/(rider)/navigation-delivery');
  };

  const allChecked = checked.every(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Pickup Confirmation</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <MaterialIcons name="storefront" size={34} color={Colors.onPrimary} />
          <Text style={styles.bannerTitle}>Confirm package pickup</Text>
          <Text style={styles.bannerBody}>
            Check the product, seller handoff, and Veribee seal before continuing.
          </Text>
        </View>

        <View style={styles.productCard}>
          <Image source={{ uri: activeDelivery.productImage }} style={styles.productImage} />
          <View style={styles.productCopy}>
            <Text style={styles.productName}>{activeDelivery.productName}</Text>
            <Text style={styles.meta}>Order {activeDelivery.orderId}</Text>
            <Text style={styles.meta}>Seller: {activeDelivery.sellerName}</Text>
          </View>
        </View>

        {[
          'Package matches order details',
          'Veribee seal is intact',
          'Seller confirms rider identity',
        ].map((label, index) => (
          <ChecklistItem
            key={label}
            label={label}
            checked={checked[index]}
            onPress={() =>
              setChecked((current) =>
                current.map((value, itemIndex) => (itemIndex === index ? !value : value)),
              )
            }
          />
        ))}

        <Button title="Confirm Pickup" onPress={onConfirm} disabled={!allChecked} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ChecklistItem({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.checkRow, pressed && styles.pressed]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
    <View style={[styles.checkIcon, !checked && styles.checkIconEmpty]}>
        {checked && <MaterialIcons name="check" size={18} color={Colors.onPrimary} />}
      </View>
      <Text style={styles.checkText}>{label}</Text>
    </Pressable>
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
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  banner: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  bannerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 28,
    lineHeight: 34,
    color: Colors.onPrimary,
  },
  bannerBody: { ...Type.bodyMd, color: Colors.onPrimary },
  productCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  productImage: { width: 78, height: 78, borderRadius: Radii.md },
  productCopy: { flex: 1 },
  productName: {
    fontFamily: Fonts.manropeBold,
    fontSize: 17,
    lineHeight: 22,
    color: Colors.onSurface,
  },
  meta: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  checkRow: {
    minHeight: 60,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconEmpty: {
    backgroundColor: Colors.surfaceContainerLowest,
  },
  checkText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  pressed: { opacity: 0.72 },
});
