import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRootNavigationState, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useSellerStore } from '@/store/sellerStore';
import { calculateSellerVsiFromProducts } from '@/lib/veribeeScoring';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';
import { useEffect, useState } from 'react';

// VSI score (87/100) → circumference = 2π×40 ≈ 251.2 → offset = 251.2 × (1 - 0.87) ≈ 32.7
const GAUGE_R = 40;
const GAUGE_C = 2 * Math.PI * GAUGE_R;

type SettingsRow = {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  route?: string;
  destructive?: boolean;
  badge?: string;
};

const storeRows: SettingsRow[] = [
  { label: 'Information', icon: 'info-outline', route: '/(seller)/settings/store-information' },
  { label: 'Payouts', icon: 'account-balance-wallet', route: '/(seller)/settings/payout-bank' },
  { label: 'Hours', icon: 'schedule', route: '/(seller)/settings/store-hours' },
  { label: 'KYC Verification', icon: 'assignment-ind', route: '/(seller)/kyc', badge: 'PENDING' },
];

const securityRows: SettingsRow[] = [
  { label: 'Change Password', icon: 'lock-outline', route: '/(seller)/settings/change-password' },
  { label: 'Two-Factor Auth', icon: 'password', route: '/(seller)/settings/two-factor-auth' },
];

const supportRows: SettingsRow[] = [
  { label: 'Help Center', icon: 'help-outline', route: '/(seller)/settings/help-center' },
  { label: 'Report Problem', icon: 'report-problem', route: '/(seller)/settings/report-problem' },
  { label: 'About Veribee', icon: 'info', route: '/(seller)/settings/about-veribee' },
];

export default function Profile() {
  const router = useRouter();
  const navState = useRootNavigationState();
  const resetAuth = useAuthStore((s) => s.reset);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const roles = useAuthStore((s) => s.roles);
  const products = useSellerStore((s) => s.products);
  const vsiScore = calculateSellerVsiFromProducts(products);
  const gaugeOffset = GAUGE_C * (1 - vsiScore / 100);

  useEffect(() => {
    if (!navState?.key) return;
    if (activeRole === 'buyer') {
      router.replace('/(buyer)/(tabs)/profile');
    } else if (activeRole === 'rider') {
      router.replace('/(rider)/(tabs)/account');
    }
  }, [activeRole, router, navState?.key]);

  const navigateOrStub = (row: SettingsRow) => {
    if (row.route) {
      router.push(row.route as never);
      return;
    }
    router.push('/(seller)/settings/account-settings');
  };

  const chooseRole = (role: 'buyer' | 'rider') => {
    setActiveRole(role);
    router.replace(role === 'buyer' ? '/(buyer)/(tabs)/home' : '/(rider)/(tabs)/job-feed');
  };

  const logOut = () => {
    resetAuth();
    setTimeout(() => router.replace('/(auth)/login'), 0);
  };

  if (activeRole === 'buyer' || activeRole === 'rider') return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Header ── */}
        <View style={styles.profileSection}>
          <Text style={styles.profileKicker}>SELLER PROFILE</Text>
          {/* Avatar with gold verified badge */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>M</Text>
            </View>
            <View style={styles.verifiedBadgeOverlay}>
              <MaterialIcons name="verified" size={18} color={Colors.onSurface} />
            </View>
          </View>

          <Text style={styles.storeName}>Maria's Boutique</Text>

          {/* Verified pills */}
          <View style={styles.verifiedPills}>
            <VerifiedPill icon="mail" label="Verified" />
            <VerifiedPill icon="phone-iphone" label="Verified" />
          </View>

          {/* Trusted Seller badge */}
          <View style={styles.trustedBadge}>
            <Text style={styles.trustedBadgeText}>TRUSTED SELLER</Text>
          </View>
        </View>

        {/* ── VSI Score Bento Card ── */}
        <Pressable
          onPress={() => router.push('/(seller)/vsi-score')}
          style={({ pressed }) => [styles.vsiCard, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="View full VSI score"
        >
          {/* Subtle glow blob */}
          <View style={styles.vsiGlow} />

          <View style={styles.vsiLeft}>
            <Text style={styles.vsiLabel}>VERIBEE TRUST INDEX</Text>
            <View style={styles.vsiScoreRow}>
              <Text style={styles.vsiScore}>{vsiScore}</Text>
              <Text style={styles.vsiOf}>/100</Text>
            </View>
            <View style={styles.vsiLinkRow}>
              <Text style={styles.vsiLink}>View Full Score</Text>
              <MaterialIcons name="arrow-forward" size={14} color={Colors.primary} />
            </View>
          </View>

          {/* Circular SVG gauge */}
          <View style={styles.vsiGauge}>
            <Svg width={96} height={96} style={styles.gaugeRotate}>
              <Circle
                cx={48}
                cy={48}
                r={GAUGE_R}
                fill="transparent"
                stroke={Colors.outlineVariant}
                strokeWidth={8}
              />
              <Circle
                cx={48}
                cy={48}
                r={GAUGE_R}
                fill="transparent"
                stroke={Colors.primary}
                strokeWidth={8}
                strokeDasharray={GAUGE_C}
                strokeDashoffset={gaugeOffset}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.gaugeIcon}>
              <MaterialIcons name="shield" size={28} color={Colors.primary} />
            </View>
          </View>
        </Pressable>

        {/* ── Grouped Settings ── */}
        <SettingsGroup title="Store" rows={storeRows} onPress={navigateOrStub} />
        <SettingsGroup title="Security" rows={securityRows} onPress={navigateOrStub} />
        <SettingsGroup title="Support" rows={supportRows} onPress={navigateOrStub} />

        <SettingsGroup 
          title="Expand Your Journey" 
          rows={[
             { label: roles.includes('buyer') ? 'Switch to Customer Dashboard' : 'Become a Customer', icon: 'shopping-bag' },
             { label: roles.includes('rider') ? 'Switch to Rider Dashboard' : 'Become a Rider', icon: 'two-wheeler' }
          ]}
          onPress={(row) => {
             if (row.label.includes('Customer')) {
                if (roles.includes('buyer')) chooseRole('buyer');
                else {
                  useAuthStore.getState().setRoles([...roles, 'buyer']);
                  chooseRole('buyer');
                }
             } else {
                if (roles.includes('rider')) chooseRole('rider');
                else router.push('/(auth)/add-role?role=rider');
             }
          }}
        />

        {/* ── Account Actions ── */}
        <View style={styles.actionsCard}>
          <SettingsRowItem
            row={{ label: 'Log Out', icon: 'logout', destructive: true }}
            onPress={logOut}
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Sub-components ── */

function VerifiedPill({ icon, label }: { icon: keyof typeof MaterialIcons.glyphMap; label: string }) {
  return (
    <View style={styles.pill}>
      <MaterialIcons name={icon} size={14} color={Colors.primary} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function getIconForGroup(title: string): keyof typeof MaterialIcons.glyphMap {
  if (title === 'Store') return 'storefront';
  if (title === 'Security') return 'security';
  if (title === 'Support') return 'help';
  return 'settings';
}

function SettingsGroup({
  title,
  rows,
  onPress,
}: {
  title: string;
  rows: SettingsRow[];
  onPress: (row: SettingsRow) => void;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <MaterialIcons name={getIconForGroup(title)} size={24} color={Colors.primary} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        {rows.map((row, index) => (
          <SettingsRowItem
            key={row.label}
            row={row}
            onPress={() => onPress(row)}
            last={index === rows.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

function SettingsRowItem({
  row,
  onPress,
  last,
}: {
  row: SettingsRow;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={row.label}
    >
      <View style={styles.rowLabelWrap}>
        {!!row.icon && (
          <MaterialIcons
            name={row.icon}
            size={22}
            color={row.destructive ? Colors.error : Colors.onSurfaceVariant}
          />
        )}
        <Text style={[styles.rowLabel, row.destructive && styles.rowLabelDanger]}>
          {row.label}
        </Text>
      </View>
      <View style={styles.rowRight}>
        {!!row.badge && (
          <View style={styles.rowBadge}>
            <Text style={styles.rowBadgeText}>{row.badge}</Text>
          </View>
        )}
        {!row.destructive && (
          <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
        )}
      </View>
    </Pressable>
  );
}

/* ── Styles ── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: { width: 40 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72 },
  headerTitle: { ...Type.h3, color: Colors.onPrimary },

  // Scroll
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },

  // Profile section
  profileSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    ...Shadow.fab,
  },
  profileKicker: {
    ...Type.labelCaps,
    color: Colors.secondaryContainer,
  },
  avatarWrap: { position: 'relative', marginBottom: Spacing.xs },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 4,
    borderColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 44,
    color: Colors.onSecondaryContainer,
  },
  verifiedBadgeOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryFixedDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  storeName: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
    color: Colors.onPrimary,
    textAlign: 'center',
  },
  verifiedPills: { flexDirection: 'row', gap: Spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  pillText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  trustedBadge: {
    marginTop: Spacing.xs,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.primaryFixedDim,
  },
  trustedBadgeText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.onSecondaryContainer,
  },

  // VSI bento card
  vsiCard: {
    borderRadius: Radii.card,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Shadow.card,
  },
  vsiGlow: {
    position: 'absolute',
    right: -16,
    top: -16,
    width: 120,
    height: 120,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    opacity: 0.25,
  },
  vsiLeft: { flex: 1, gap: 4 },
  vsiLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  vsiScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  vsiScore: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 48,
    color: Colors.primary,
    lineHeight: 56,
  },
  vsiOf: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  vsiLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 6 },
  vsiLink: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.primary,
  },
  vsiGauge: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeRotate: { transform: [{ rotate: '-90deg' }] },
  gaugeIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Groups
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
    padding: Spacing.md,
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
  actionsCard: {
    borderRadius: Radii.card,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Shadow.card,
  },

  // Row
  row: {
    minHeight: 58,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  rowPressed: { backgroundColor: Colors.surfaceContainerLow },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  rowLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowLabel: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 16,
    color: Colors.onSurface,
  },
  rowLabelDanger: { color: Colors.error },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  rowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.secondaryFixed,
    borderRadius: Radii.DEFAULT,
  },
  rowBadgeText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onSecondaryFixed,
    textTransform: 'uppercase',
  },

  // Role sheet
  sheetScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: Colors.surface,
    padding: Spacing.containerMargin,
    gap: Spacing.sm,
  },
  sheetTitle: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  sheetBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
