import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useRiderStore } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function VerifyDelivery() {
  const router = useRouter();
  const activeDelivery = useRiderStore((s) => s.activeDelivery);

  if (!activeDelivery) return <Redirect href="/(rider)/(tabs)/job-feed" />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Verify Delivery</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero illustration */}
        <View style={styles.heroCard}>
          <View style={styles.illustration}>
            <View style={styles.illustrationIcon}>
              <MaterialIcons name="home" size={48} color={Colors.primary} />
            </View>
            <View style={styles.illustrationRider}>
              <MaterialIcons name="delivery-dining" size={38} color={Colors.onPrimary} />
            </View>
          </View>
          <Text style={styles.heroTitle}>You've Arrived!</Text>
          <Text style={styles.heroSubtitle}>
            You have reached {activeDelivery.buyerName}'s location.{'\n'}
            Choose how to confirm the handover.
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>CHOOSE VERIFICATION</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* OTP Option */}
        <Pressable
          style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
          onPress={() => router.replace('/(rider)/otp-entry')}
        >
          <View style={[styles.optionIcon, { backgroundColor: Colors.primaryFixed }]}>
            <MaterialIcons name="pin" size={32} color={Colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Enter OTP Code</Text>
            <Text style={styles.optionBody}>
              Ask the buyer for the 6-digit code shown in their app
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>

        {/* Biometric Option */}
        <Pressable
          style={({ pressed }) => [
            styles.optionCard,
            styles.optionCardBiometric,
            pressed && styles.optionCardPressed,
          ]}
          onPress={() => router.replace('/(rider)/biometric-confirm')}
        >
          <View style={[styles.optionIcon, { backgroundColor: Colors.secondaryContainer }]}>
            <MaterialIcons name="fingerprint" size={32} color={Colors.secondary} />
          </View>
          <View style={styles.optionText}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.optionTitle}>Use Biometrics</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            </View>
            <Text style={styles.optionBody}>
              Customer confirms via Face ID or Fingerprint on their phone
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
        </Pressable>

        {/* Info note */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={16} color={Colors.tertiary} />
          <Text style={styles.infoText}>
            Both methods are equally secure and valid for confirming delivery.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  content: {
    padding: Spacing.containerMargin,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  // Hero
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  illustration: {
    width: '100%',
    height: 160,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  illustrationIcon: {
    width: 80,
    height: 80,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationRider: {
    width: 68,
    height: 68,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 26,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.outlineVariant,
  },
  dividerLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: Colors.onSurfaceVariant,
  },

  // Option cards
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  optionCardBiometric: {
    borderColor: Colors.secondary,
  },
  optionCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  optionTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 17,
    color: Colors.onSurface,
  },
  optionBody: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondary,
  },
  newBadgeText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 10,
    color: Colors.onSecondary,
    letterSpacing: 0.8,
  },

  // Info
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.tertiaryContainer,
    borderRadius: Radii.lg,
    padding: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.tertiary,
    lineHeight: 18,
  },
});
