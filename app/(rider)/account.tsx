import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useRiderStore } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

type Row = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};

export default function RiderAccount() {
  const router = useRouter();
  const reset = useAuthStore((s) => s.reset);
  const todayEarnings = useRiderStore((s) => s.todayEarnings);
  const completedJobs = useRiderStore((s) => s.completedJobs.length);

  const rows: Row[] = [
    {
      icon: 'person-outline',
      label: 'Personal Information',
      onPress: () => Alert.alert('Personal information', 'Local profile editing comes next.'),
    },
    {
      icon: 'account-balance',
      label: 'Bank/Payout Details',
      onPress: () => Alert.alert('Payout details', 'Local payout setup comes next.'),
    },
    {
      icon: 'description',
      label: 'Vehicle Documents',
      onPress: () => router.push('/(rider)/vehicle-docs'),
    },
    {
      icon: 'verified-user',
      label: 'KYC Verification',
      onPress: () => router.push('/(rider)/kyc'),
    },
    {
      icon: 'history',
      label: 'Job History',
      onPress: () => router.push('/(rider)/job-history'),
    },
  ];

  const onLogout = () => {
    reset();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconButton} />
        <Text style={styles.headerTitle}>Account</Text>
        <Pressable
          onPress={() => Alert.alert('Settings', 'Rider settings come next.')}
          hitSlop={12}
          style={styles.iconButton}
        >
          <MaterialIcons name="settings" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AR</Text>
            <View style={styles.camera}>
              <MaterialIcons name="photo-camera" size={16} color={Colors.onPrimary} />
            </View>
          </View>
          <Text style={styles.name}>Angelo Reyes</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>4.9</Text>
            <MaterialIcons name="star" size={16} color={Colors.secondary} />
            <Text style={styles.ratingMeta}>{238 + completedJobs} deliveries</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active Rider</Text>
          </View>
        </View>

        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Text style={styles.groupLabel}>Vehicle Information</Text>
            <Text style={styles.editText}>Edit</Text>
          </View>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIcon}>
              <MaterialIcons name="two-wheeler" size={28} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.vehicleName}>Honda Click 125i</Text>
              <Text style={styles.plate}>ABX 1234</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Today" value={`PHP ${todayEarnings}`} />
          <Stat label="Rating" value="4.9" />
          <Stat label="Acceptance" value="96%" />
        </View>

        <View style={styles.group}>
          {rows.map((row) => (
            <Pressable
              key={row.label}
              onPress={row.onPress}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={row.label}
            >
              <MaterialIcons name={row.icon} size={22} color={Colors.onSurfaceVariant} />
              <Text style={styles.rowText}>{row.label}</Text>
              <MaterialIcons name="chevron-right" size={22} color={Colors.outline} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
        >
          <MaterialIcons name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 112,
    gap: Spacing.lg,
  },
  profileBlock: { alignItems: 'center', gap: Spacing.sm },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    borderWidth: 4,
    borderColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  avatarText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 34,
    color: Colors.primary,
  },
  camera: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { ...Type.h3, color: Colors.onSurface },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rating: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  ratingMeta: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  statusPill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryFixed,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
  },
  statusText: { ...Type.labelCaps, color: Colors.onTertiaryFixedVariant },
  vehicleCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.card,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupLabel: { ...Type.labelCaps, color: Colors.onSurfaceVariant },
  editText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.primary,
  },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  vehicleIcon: {
    width: 52,
    height: 52,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  plate: {
    alignSelf: 'flex-start',
    borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: Spacing.base,
    paddingVertical: 2,
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
    overflow: 'hidden',
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
    gap: Spacing.xs,
  },
  statValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  statLabel: { ...Type.labelCaps, fontSize: 10, color: Colors.onSurfaceVariant },
  group: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  row: {
    minHeight: 58,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceVariant,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  logout: {
    minHeight: 52,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.errorContainer,
    backgroundColor: Colors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoutText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.error,
  },
  pressed: { opacity: 0.72 },
});
