import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { formatRiderMoney, useRiderStore } from '@/store/riderStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

export default function DeliveryComplete() {
  const router = useRouter();
  const { orderId, fee } = useLocalSearchParams<{ orderId?: string; fee?: string }>();
  const todayEarnings = useRiderStore((s) => s.todayEarnings);
  const feeValue = Number(fee ?? 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.completeIcon}>
          <MaterialIcons name="check" size={52} color={Colors.onTertiary} />
        </View>
        <Text style={styles.title}>Delivery complete</Text>
        <Text style={styles.subtitle}>
          {orderId ?? 'This order'} is now closed and the buyer handover was verified.
        </Text>

        <View style={styles.earningsCard}>
          <Text style={styles.cardLabel}>Job Earnings</Text>
          <Text style={styles.jobFee}>{formatRiderMoney(feeValue)}</Text>
          <Pressable
            onPress={() => router.push('/(rider)/earnings')}
            style={styles.totalRow}
            accessibilityRole="button"
            accessibilityLabel="Open rider earnings"
          >
            <View>
              <Text style={styles.totalLabel}>Today's total</Text>
              <Text style={styles.totalValue}>{formatRiderMoney(todayEarnings)}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.outline} />
          </Pressable>
        </View>

        <Button title="Back to Jobs" onPress={() => router.replace('/(rider)/job-feed')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: {
    flexGrow: 1,
    padding: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  completeIcon: {
    width: 116,
    height: 116,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...Type.h2, color: Colors.onSurface, textAlign: 'center' },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 330,
  },
  earningsCard: {
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  cardLabel: { ...Type.labelCaps, color: Colors.onSurfaceVariant },
  jobFee: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 42,
    lineHeight: 48,
    color: Colors.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  totalValue: {
    fontFamily: Fonts.manropeBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
});
