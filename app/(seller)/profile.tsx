import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type SettingsRow = {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  route?: string;
  destructive?: boolean;
  onPress?: () => void;
};

const storeRows: SettingsRow[] = [
  { label: 'Store Information', icon: 'storefront' },
  { label: 'Payout & Bank Details', icon: 'account-balance', route: '/(seller)/earnings' },
  { label: 'Store Hours', icon: 'schedule' },
  { label: 'KYC Verification', icon: 'verified-user', route: '/(seller)/kyc' },
];

const securityRows: SettingsRow[] = [
  { label: 'Change Password', icon: 'lock' },
  { label: 'Two-Factor Auth', icon: 'password' },
];

const supportRows: SettingsRow[] = [
  { label: 'Help Center', icon: 'help-outline' },
  { label: 'Report Problem', icon: 'report-problem' },
  { label: 'About Veribee', icon: 'info' },
];

export default function Profile() {
  const router = useRouter();
  const resetAuth = useAuthStore((s) => s.reset);

  const navigateOrStub = (row: SettingsRow) => {
    if (row.route) {
      router.push(row.route as never);
      return;
    }
    Alert.alert(row.label, 'This setting comes next.');
  };

  const switchRole = () => {
    Alert.alert('Switch Role', 'Other roles are coming soon for Phase 1.');
  };

  const logOut = () => {
    Alert.alert('Log Out', 'Return to the login screen?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          resetAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Account</Text>
        <Pressable
          onPress={() => Alert.alert('Settings', 'Account settings come next.')}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <MaterialIcons name="settings" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <Text style={styles.storeName}>Maria's Boutique</Text>
          <Badge type="elite" label="Trusted Seller" />

          <View style={styles.identityRows}>
            <IdentityRow value="maria@boutique.com" />
            <IdentityRow value="+63 917 123 4501" />
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(seller)/vsi-score')}
          style={({ pressed }) => [styles.vsiCard, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="View full VSI score"
        >
          <View style={styles.miniGauge}>
            <Text style={styles.miniGaugeText}>87</Text>
          </View>
          <View style={styles.vsiCopy}>
            <Text style={styles.vsiTitle}>VSI Score: 87</Text>
            <Text style={styles.vsiBody}>Very Good</Text>
          </View>
          <Text style={styles.vsiLink}>View Full Score</Text>
        </Pressable>

        <SettingsGroup title="Store" rows={storeRows} onPress={navigateOrStub} />
        <SettingsGroup title="Security" rows={securityRows} onPress={navigateOrStub} />
        <SettingsGroup title="Support" rows={supportRows} onPress={navigateOrStub} />

        <View style={styles.accountActions}>
          <SettingsRowButton
            row={{ label: 'Switch Role', icon: 'swap-horiz' }}
            onPress={switchRole}
          />
          <SettingsRowButton
            row={{ label: 'Log Out', icon: 'logout', destructive: true }}
            onPress={logOut}
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IdentityRow({ value }: { value: string }) {
  return (
    <View style={styles.identityRow}>
      <Text style={styles.identityText}>{value}</Text>
      <MaterialIcons name="check-circle" size={16} color={Colors.primary} />
    </View>
  );
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
    <View>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>
        {rows.map((row, index) => (
          <SettingsRowButton
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

function SettingsRowButton({
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
      {!row.destructive && (
        <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
      )}
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
  headerSpacer: { width: 40 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72 },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    borderWidth: 4,
    borderColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 42,
    color: Colors.primary,
  },
  storeName: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  identityRows: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  identityText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  vsiCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.card,
  },
  miniGauge: {
    width: 52,
    height: 52,
    borderRadius: Radii.full,
    borderWidth: 5,
    borderColor: Colors.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  miniGaugeText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  vsiCopy: { flex: 1 },
  vsiTitle: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  vsiBody: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  vsiLink: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.primary,
  },
  groupTitle: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  groupCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Shadow.card,
  },
  row: {
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
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
  accountActions: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Shadow.card,
  },
});
