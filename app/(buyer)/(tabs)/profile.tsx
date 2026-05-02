import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRootNavigationState, useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';
import { useEffect, useState } from 'react';
import { DEMO_ACCOUNTS } from '@/lib/demoProfiles';

const rows: Array<{ icon: keyof typeof MaterialIcons.glyphMap; label: string; route: string }> = [
  { icon: 'person-outline', label: 'Personal Information', route: '/(buyer)/settings/personal-information' },
  { icon: 'location-on', label: 'Delivery Addresses', route: '/(buyer)/settings/delivery-addresses' },
  { icon: 'credit-card', label: 'Payment Methods', route: '/(buyer)/settings/payment-methods' },
  { icon: 'notifications-none', label: 'Notification Settings', route: '/(buyer)/settings/notifications' },
  { icon: 'shield', label: 'Privacy & Security', route: '/(buyer)/settings/privacy-security' },
  { icon: 'help-outline', label: 'Help & Support', route: '/(buyer)/settings/help-center' },
  { icon: 'info', label: 'About Veribee', route: '/(buyer)/settings/about-veribee' },
];

export default function BuyerProfile() {
  const router = useRouter();
  const navState = useRootNavigationState();
  const reset = useAuthStore((s) => s.reset);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const roles = useAuthStore((s) => s.roles);

  useEffect(() => {
    if (!navState?.key) return;
    if (activeRole === 'seller') {
      router.replace('/(seller)/(tabs)/profile');
    } else if (activeRole === 'rider') {
      router.replace('/(rider)/(tabs)/account');
    }
  }, [activeRole, router, navState?.key]);

  const logOut = () => {
    reset();
    setTimeout(() => router.replace('/(auth)/login'), 0);
  };

  const switchRole = (role: 'seller' | 'rider') => {
    setActiveRole(role);
    router.replace(role === 'seller' ? '/(seller)/(tabs)/dashboard' : '/(rider)/(tabs)/job-feed');
  };

  if (activeRole === 'seller' || activeRole === 'rider') {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Buyer Profile</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileBlock}>
          <View style={styles.profileGlow} pointerEvents="none" />
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NV</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.name}>{DEMO_ACCOUNTS.buyer.fullName}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>ACTIVE CUSTOMER</Text>
            </View>
          </View>
          <Text style={styles.joinDate}>Joined Mar 2026 - Metro Manila</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat value="42" label="Orders" />
          <Stat value="12" label="Saved" />
          <Stat value="8" label="Reviews" />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
             <View style={styles.headerTitleRow}>
               <MaterialIcons name="person" size={24} color={Colors.primary} />
               <Text style={styles.cardTitle}>Account Management</Text>
             </View>
          </View>
          <View style={styles.cardBody}>
            {rows.slice(0, 3).map((row) => (
              <Pressable
                key={row.label}
                onPress={() => router.push(row.route as never)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <MaterialIcons name={row.icon} size={20} color={Colors.onSurfaceVariant} />
                <Text style={styles.rowLabel}>{row.label}</Text>
                <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
             <View style={styles.headerTitleRow}>
               <MaterialIcons name="security" size={24} color={Colors.primary} />
               <Text style={styles.cardTitle}>Preferences & Security</Text>
             </View>
          </View>
          <View style={styles.cardBody}>
            {rows.slice(3, 5).map((row) => (
              <Pressable
                key={row.label}
                onPress={() => router.push(row.route as never)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <MaterialIcons name={row.icon} size={20} color={Colors.onSurfaceVariant} />
                <Text style={styles.rowLabel}>{row.label}</Text>
                <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
             <View style={styles.headerTitleRow}>
               <MaterialIcons name="help" size={24} color={Colors.primary} />
               <Text style={styles.cardTitle}>Support</Text>
             </View>
          </View>
          <View style={styles.cardBody}>
            {rows.slice(5, 7).map((row) => (
              <Pressable
                key={row.label}
                onPress={() => router.push(row.route as never)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <MaterialIcons name={row.icon} size={20} color={Colors.onSurfaceVariant} />
                <Text style={styles.rowLabel}>{row.label}</Text>
                <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
             <View style={styles.headerTitleRow}>
               <MaterialIcons name="explore" size={24} color={Colors.primary} />
               <Text style={styles.cardTitle}>Expand Your Journey</Text>
             </View>
          </View>
          <View style={styles.cardBody}>
            {/* Seller Option */}
            <Pressable
              onPress={() => roles.includes('seller') ? switchRole('seller') : router.push('/(auth)/add-role?role=seller')}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <MaterialIcons name="storefront" size={20} color={Colors.primary} />
              <Text style={styles.rowLabel}>{roles.includes('seller') ? 'Switch to Seller Dashboard' : 'Become a Seller'}</Text>
              <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
            </Pressable>
            
            {/* Rider Option */}
            <Pressable
              onPress={() => roles.includes('rider') ? switchRole('rider') : router.push('/(auth)/add-role?role=rider')}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed, { borderBottomWidth: 0 }]}
            >
              <MaterialIcons name="two-wheeler" size={20} color={Colors.primary} />
              <Text style={styles.rowLabel}>{roles.includes('rider') ? 'Switch to Rider Dashboard' : 'Become a Rider'}</Text>
              <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
            </Pressable>
          </View>
        </View>

        <Button title="Log Out" variant="outlined" onPress={logOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 58,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: { width: 40 },
  headerTitle: { ...Type.h3, color: Colors.onPrimary },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72 },
  content: {
    padding: Spacing.md,
    paddingBottom: 112,
    gap: Spacing.md,
  },
  profileBlock: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radii.DEFAULT,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    ...Shadow.fab,
    overflow: 'hidden',
  },
  profileGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    opacity: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 3,
    borderColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 24,
    color: Colors.onSecondaryContainer,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 23,
    color: Colors.onPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusPill: {
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
  },
  statusText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: Colors.onPrimary,
  },
  joinDate: {
    ...Type.bodyMd,
    color: Colors.onPrimaryContainer,
    marginTop: Spacing.xs,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statCard: {
    flex: 1,
    height: 68,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.3)',
    backgroundColor: Colors.dealContainer,
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.primary,
    lineHeight: 28,
  },
  statLabel: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  infoCard: {
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.3)',
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  cardBody: {
    padding: 0,
  },
  row: {
    minHeight: 50,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceVariant,
  },
  rowPressed: { backgroundColor: Colors.surfaceContainerLow },
  rowLabel: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 15,
    color: Colors.onSurface,
  },
  switchLabel: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.primary,
  },
  rolePill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  roleText: { ...Type.labelCaps, fontSize: 10, color: Colors.primary },
  sheetScrim: {
    flex: 1,
    backgroundColor: Colors.inverseSurface,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: Colors.surface,
    padding: Spacing.containerMargin,
    gap: Spacing.md,
  },
  sheetTitle: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
});
