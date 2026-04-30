import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const rows: Array<{ icon: keyof typeof MaterialIcons.glyphMap; label: string }> = [
  { icon: 'person-outline', label: 'Personal Information' },
  { icon: 'location-on', label: 'Delivery Addresses' },
  { icon: 'credit-card', label: 'Payment Methods' },
  { icon: 'notifications-none', label: 'Notification Settings' },
  { icon: 'shield', label: 'Privacy & Security' },
  { icon: 'help-outline', label: 'Help & Support' },
  { icon: 'info', label: 'About Veribee' },
];

export default function BuyerProfile() {
  const router = useRouter();
  const reset = useAuthStore((s) => s.reset);

  const logOut = () => {
    reset();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          onPress={() => Alert.alert('Settings', 'Buyer settings come next.')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <MaterialIcons name="settings" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>B</Text>
            <View style={styles.camera}>
              <MaterialIcons name="photo-camera" size={14} color={Colors.onPrimary} />
            </View>
          </View>
          <Text style={styles.name}>Buyer Test</Text>
          <Text style={styles.email}>buyer@veribee.test</Text>
          <View style={styles.verifiedPill}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value="42" label="Orders" />
          <Stat value="12" label="Saved" />
          <Stat value="8" label="Reviews" />
        </View>

        <View style={styles.list}>
          {rows.map((row) => (
            <Pressable
              key={row.label}
              onPress={() => Alert.alert(row.label, 'This screen comes next.')}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <MaterialIcons name={row.icon} size={20} color={Colors.onSurfaceVariant} />
              <Text style={styles.rowLabel}>{row.label}</Text>
              <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
            </Pressable>
          ))}
          <Pressable
            onPress={() => Alert.alert('Switch Role', 'Seller is available; Rider comes in Phase 3.')}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <MaterialIcons name="swap-horiz" size={20} color={Colors.primary} />
            <Text style={styles.switchLabel}>Switch Role</Text>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>Buyer</Text>
            </View>
          </Pressable>
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
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: { width: 40 },
  headerTitle: { ...Type.h3, color: Colors.primary },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.lg,
  },
  topSection: { alignItems: 'center', gap: Spacing.xs },
  avatar: {
    width: 82,
    height: 82,
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
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  email: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  verifiedPill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  verifiedText: {
    ...Type.labelCaps,
    color: Colors.onSecondaryContainer,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.card,
  },
  statValue: { ...Type.h3, color: Colors.onSurface },
  statLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  list: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Shadow.card,
  },
  row: {
    minHeight: 54,
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
});
