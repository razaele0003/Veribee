import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useRiderStore } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';



export default function RiderAccount() {
  const router = useRouter();
  const reset = useAuthStore((s) => s.reset);
  const roles = useAuthStore((s) => s.roles);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const todayEarnings = useRiderStore((s) => s.todayEarnings);
  const completedJobs = useRiderStore((s) => s.completedJobs.length);

  const chooseRole = (role: 'buyer' | 'seller') => {
    setActiveRole(role);
    router.replace(role === 'buyer' ? '/(buyer)/(tabs)/home' : '/(seller)/(tabs)/dashboard');
  };

  const openSetting = (label: string) => {
    const routes: Record<string, string> = {
      Settings: '/(rider)/settings/account-settings',
      'Profile Photo': '/(rider)/settings/profile-photo',
      'Personal Information': '/(rider)/settings/personal-information',
      'Bank/Payout Details': '/(rider)/settings/payout-bank',
    };
    router.push((routes[label] ?? '/(rider)/settings/account-settings') as never);
  };



  const onLogout = () => {
    reset();
    setTimeout(() => router.replace('/(auth)/login'), 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconButton} />
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileBlock}>
          {/* Subtle background glow */}
          <View style={styles.profileGlow} pointerEvents="none" />
          
          <View style={styles.avatarContainer}>
            <Pressable
              onPress={() => openSetting('Profile Photo')}
              style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              <Text style={styles.avatarText}>AR</Text>
            </Pressable>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.name}>Angelo Reyes</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>ACTIVE RIDER</Text>
            </View>
            <View style={styles.ratingPill}>
              <MaterialIcons name="star" size={14} color={Colors.secondaryContainer} />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>
          
          <Text style={styles.joinDate}>Joined Jan 2023 • Metro Manila</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Earnings</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>PHP {todayEarnings}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Rating</Text>
            <View style={styles.ratingStatRow}>
              <Text style={styles.statValue}>4.9</Text>
              <MaterialIcons name="star" size={18} color={Colors.tertiaryFixedDim} />
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Acceptance</Text>
            <Text style={styles.statValue}>98%</Text>
          </View>
        </View>

        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Text style={styles.groupLabel}>Vehicle Information</Text>
            <Pressable
              onPress={() => router.push('/(rider)/vehicle-docs')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Edit vehicle information"
            >
              <Text style={styles.editText}>EDIT</Text>
            </Pressable>
          </View>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIcon}>
              <MaterialIcons name="two-wheeler" size={28} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.vehicleName}>Honda Click 125i</Text>
              <View style={styles.vehicleMetaRow}>
                <Text style={styles.plate}>ABC 1234</Text>
                <Text style={styles.vehicleColor}>• Black</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
             <View style={styles.headerTitleRow}>
               <MaterialIcons name="contact-page" size={24} color={Colors.primary} />
               <Text style={styles.cardTitle}>Personal Info</Text>
             </View>
             <Pressable onPress={() => openSetting('Personal Information')} hitSlop={10}>
                <Text style={styles.editText}>EDIT</Text>
             </Pressable>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.dataGroup}>
               <Text style={styles.dataLabel}>Email Address</Text>
               <View style={styles.dataValueBox}>
                 <MaterialIcons name="mail" size={18} color={Colors.secondary} />
                 <Text style={styles.dataValue}>angelo.reyes@example.com</Text>
               </View>
            </View>
            <View style={styles.dataGroup}>
               <Text style={styles.dataLabel}>Phone Number</Text>
               <View style={styles.dataValueBox}>
                 <MaterialIcons name="phone-iphone" size={18} color={Colors.secondary} />
                 <Text style={styles.dataValue}>+63 917 123 4567</Text>
               </View>
            </View>
            <View style={styles.dataGroup}>
               <Text style={styles.dataLabel}>Home Address</Text>
               <View style={styles.dataValueBox}>
                 <MaterialIcons name="home" size={18} color={Colors.secondary} />
                 <Text style={styles.dataValue}>123 Sampaguita St, Brgy. San Lorenzo, Makati City</Text>
               </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
             <View style={styles.headerTitleRow}>
               <MaterialIcons name="account-balance" size={24} color={Colors.primary} />
               <Text style={styles.cardTitle}>Payout Details</Text>
             </View>
             <Pressable onPress={() => openSetting('Bank/Payout Details')} hitSlop={10}>
                <Text style={styles.editText}>EDIT</Text>
             </Pressable>
          </View>
          <View style={styles.cardBody}>
             <View style={styles.bankCardBg}>
               <View style={styles.bankCardHeader}>
                 <Text style={styles.bankCardLabel}>Primary Account</Text>
                 <MaterialIcons name="credit-card" size={20} color={Colors.onPrimary} />
               </View>
               <Text style={styles.bankAccountNumber}>**** **** **** 8821</Text>
               <View style={styles.bankCardFooter}>
                 <View>
                   <Text style={styles.bankCardFooterLabel}>BANK NAME</Text>
                   <Text style={styles.bankCardFooterValue}>BDO Unibank</Text>
                 </View>
                 <View style={{ alignItems: 'flex-end' }}>
                   <Text style={styles.bankCardFooterLabel}>ACCOUNT HOLDER</Text>
                   <Text style={styles.bankCardFooterValue}>Angelo Reyes</Text>
                 </View>
               </View>
             </View>
             <View style={styles.verifiedRow}>
               <View style={styles.verifiedIconWrap}>
                 <MaterialIcons name="verified" size={16} color={Colors.primary} />
               </View>
               <View>
                 <Text style={styles.verifiedTitle}>Account Verified</Text>
                 <Text style={styles.verifiedSubtitle}>Ready for weekly payouts</Text>
               </View>
             </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
             <View style={styles.headerTitleRow}>
               <MaterialIcons name="how-to-reg" size={24} color={Colors.primary} />
               <Text style={styles.cardTitle}>KYC Verification</Text>
             </View>
             <Pressable onPress={() => router.push('/(rider)/kyc')} hitSlop={10}>
                <Text style={styles.editText}>VIEW</Text>
             </Pressable>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.kycDesc}>To maintain security and compliance, the following documents have been verified by our team.</Text>
            
            <View style={styles.docCard}>
              <View style={styles.docIconWrap}>
                <MaterialIcons name="badge" size={20} color={Colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>Driver's License</Text>
                <Text style={styles.docSubtitle}>ID: N01-**-******</Text>
                <View style={styles.docStatusRow}>
                  <MaterialIcons name="check-circle" size={14} color={Colors.primary} />
                  <Text style={styles.docStatusText}>Verified</Text>
                </View>
              </View>
            </View>

            <View style={styles.docCard}>
              <View style={styles.docIconWrap}>
                <MaterialIcons name="description" size={20} color={Colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>Vehicle Registration (OR/CR)</Text>
                <Text style={styles.docSubtitle}>Valid until: 12/2024</Text>
                <View style={styles.docStatusRow}>
                  <MaterialIcons name="check-circle" size={14} color={Colors.primary} />
                  <Text style={styles.docStatusText}>Verified</Text>
                </View>
              </View>
            </View>

            <View style={styles.docCardPending}>
              <View style={styles.docIconWrapPending}>
                <MaterialIcons name="health-and-safety" size={20} color={Colors.tertiaryContainer} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>Health Certificate</Text>
                <Text style={styles.docSubtitle}>Annual requirement</Text>
                <View style={styles.docStatusRow}>
                  <MaterialIcons name="schedule" size={14} color={Colors.tertiaryContainer} />
                  <Text style={[styles.docStatusText, { color: Colors.tertiaryContainer }]}>Update Needed Soon</Text>
                </View>
              </View>
            </View>

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
            {/* Customer Option */}
            <Pressable
              onPress={() => {
                if (roles.includes('buyer')) chooseRole('buyer');
                else {
                  useAuthStore.getState().setRoles([...roles, 'buyer']);
                  chooseRole('buyer');
                }
              }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <MaterialIcons name="shopping-bag" size={20} color={Colors.primary} />
              <Text style={styles.rowLabel}>{roles.includes('buyer') ? 'Switch to Customer Dashboard' : 'Become a Customer'}</Text>
              <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
            </Pressable>
            
            {/* Seller Option */}
            <Pressable
              onPress={() => roles.includes('seller') ? chooseRole('seller') : router.push('/(auth)/add-role?role=seller')}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed, { borderBottomWidth: 0 }]}
            >
              <MaterialIcons name="storefront" size={20} color={Colors.primary} />
              <Text style={styles.rowLabel}>{roles.includes('seller') ? 'Switch to Seller Dashboard' : 'Become a Seller'}</Text>
              <MaterialIcons name="chevron-right" size={22} color={Colors.onSurfaceVariant} />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
        >
          <MaterialIcons name="logout" size={20} color={Colors.onSurfaceVariant} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
  profileBlock: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.card,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.3)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  profileGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixedDim,
    opacity: 0.2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 4,
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
    fontSize: 28,
    color: Colors.onSurfaceVariant,
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
    fontSize: 28,
    color: Colors.onSurface,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusPill: {
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
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
    backgroundColor: Colors.primary,
  },
  statusText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: Colors.primary,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.tertiaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  ratingText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 10,
    color: Colors.onTertiaryContainer,
  },
  joinDate: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
  vehicleCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.3)',
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  groupLabel: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  editText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  vehicleIcon: {
    width: 64,
    height: 64,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: {
    ...Type.bodyLg,
    fontFamily: Fonts.epilogueBold,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  vehicleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plate: {
    borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurface,
  },
  vehicleColor: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    height: 96,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: 'rgba(211, 218, 234, 0.3)',
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
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
    padding: Spacing.md,
    gap: Spacing.md,
  },
  dataGroup: {
    gap: 4,
  },
  dataLabel: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  dataValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dataValue: {
    fontFamily: Fonts.manropeSemiBold,
    fontSize: 14,
    color: Colors.onSurface,
    flex: 1,
  },
  bankCardBg: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  bankCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  bankCardLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onPrimary,
    letterSpacing: 0.5,
  },
  bankAccountNumber: {
    fontFamily: Fonts.manropeBold,
    fontSize: 20,
    color: Colors.onPrimary,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  bankCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bankCardFooterLabel: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  bankCardFooterValue: {
    fontFamily: Fonts.manropeSemiBold,
    fontSize: 14,
    color: Colors.onPrimary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    padding: Spacing.sm,
    borderRadius: Radii.md,
  },
  verifiedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  verifiedSubtitle: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  kycDesc: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontFamily: Fonts.manropeSemiBold,
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: 2,
  },
  docSubtitle: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  docStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  docStatusText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.primary,
  },
  docCardPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.tertiaryFixedDim,
    backgroundColor: Colors.tertiaryFixed,
  },
  docIconWrapPending: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logout: {
    height: 48,
    marginTop: Spacing.sm,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoutText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.72 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLabel: {
    flex: 1,
    fontFamily: Fonts.manropeMedium,
    fontSize: 14,
    color: Colors.onSurface,
  },
});
