import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type TransactionStatus = 'Completed' | 'Pending' | 'Refunded';
type Filter = 'All' | TransactionStatus;

type Transaction = {
  id: string;
  product: string;
  buyer: string;
  date: string;
  amount: number;
  status: TransactionStatus;
};

const filters: Filter[] = ['All', 'Completed', 'Pending', 'Refunded'];

const transactions: Transaction[] = [
  {
    id: 'VB-9982',
    product: 'Leather Satchel',
    buyer: 'David K.',
    date: 'Apr 20',
    amount: 345,
    status: 'Completed',
  },
  {
    id: 'VB-9981',
    product: 'Artisan Honey Set',
    buyer: 'Sarah M.',
    date: 'Apr 19',
    amount: 1250,
    status: 'Completed',
  },
  {
    id: 'VB-9978',
    product: 'Ceramic Mug Duo',
    buyer: 'James L.',
    date: 'Apr 18',
    amount: 850,
    status: 'Pending',
  },
  {
    id: 'VB-9975',
    product: 'Woven Basket L',
    buyer: 'Elena R.',
    date: 'Apr 15',
    amount: 2100,
    status: 'Refunded',
  },
];

function money(value: number) {
  return `PHP ${value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function EarningsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('All');
  const [payoutRequested, setPayoutRequested] = useState(false);
  const filteredTransactions = useMemo(
    () =>
      filter === 'All'
        ? transactions
        : transactions.filter((transaction) => transaction.status === filter),
    [filter],
  );

  const requestPayout = () => {
    setPayoutRequested(true);
  };

  const cycleFilter = () => {
    const index = filters.indexOf(filter);
    setFilter(filters[(index + 1) % filters.length]);
  };

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
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Total Earnings</Text>
          <Text style={styles.heroValue}>PHP 45,200.00</Text>
          <Text style={styles.heroBody}>
            Available for Payout <Text style={styles.heroStrong}>PHP 12,400.00</Text>
          </Text>
          <Pressable
            onPress={requestPayout}
            disabled={payoutRequested}
            style={({ pressed }) => [styles.payoutButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Request payout"
          >
            <MaterialIcons
              name="account-balance-wallet"
              size={20}
              color={Colors.onSecondaryContainer}
            />
            <Text style={styles.payoutText}>
              {payoutRequested ? 'Payout Requested' : 'Request Payout'}
            </Text>
          </Pressable>
        </View>
        {payoutRequested && (
          <View style={styles.savedBanner}>
            <MaterialIcons name="check-circle" size={18} color={Colors.tertiaryContainer} />
            <Text style={styles.savedText}>Payout request queued for review.</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <StatCard label="This Month" value="PHP 8,200" />
          <StatCard label="Last Month" value="PHP 15,400" />
          <StatCard label="Pending" value="PHP 2,100" muted />
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <Pressable
            onPress={cycleFilter}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Cycle transaction filter"
          >
            <MaterialIcons name="tune" size={22} color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((item) => {
            const isActive = filter === item;
            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.transactionList}>
          {filteredTransactions.map((transaction, index) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              last={index === filteredTransactions.length - 1}
            />
          ))}
        </View>

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No transactions</Text>
            <Text style={styles.emptyBody}>There are no matching payout records yet.</Text>
          </View>
        )}

        <Button
          title="Back to Dashboard"
          variant="outlined"
          onPress={() => router.replace('/(seller)/(tabs)/dashboard')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, muted && styles.statValueMuted]}>{value}</Text>
    </View>
  );
}

function TransactionRow({
  transaction,
  last,
}: {
  transaction: Transaction;
  last?: boolean;
}) {
  return (
    <View style={[styles.transactionRow, !last && styles.transactionDivider]}>
      <View style={styles.transactionCopy}>
        <Text style={styles.orderId}>#{transaction.id}</Text>
        <Text style={styles.productName} numberOfLines={1}>
          {transaction.product}
        </Text>
        <Text style={styles.transactionMeta}>
          {transaction.buyer} - {transaction.date}
        </Text>
      </View>
      <Text style={styles.amount}>+{money(transaction.amount)}</Text>
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
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72 },
  headerTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.primary,
  },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  hero: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.primaryContainer,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  heroLabel: {
    ...Type.labelCaps,
    color: Colors.onPrimaryContainer,
  },
  heroValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 36,
    lineHeight: 42,
    color: Colors.onPrimary,
  },
  heroBody: {
    ...Type.bodyMd,
    color: Colors.onPrimaryContainer,
    marginBottom: Spacing.md,
  },
  heroStrong: { fontFamily: Fonts.manropeBold },
  payoutButton: {
    minHeight: 48,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  payoutText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSecondaryContainer,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    ...Shadow.card,
  },
  statLabel: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.onSurface,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  statValueMuted: { color: Colors.outline },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { ...Type.h3, color: Colors.onSurface },
  filters: { gap: Spacing.sm, paddingRight: Spacing.containerMargin },
  filterChip: {
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryFixed,
    borderColor: Colors.primaryFixedDim,
  },
  filterText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  filterTextActive: { color: Colors.primary },
  transactionList: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    ...Shadow.card,
  },
  transactionRow: {
    minHeight: 82,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  transactionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  transactionCopy: { flex: 1, gap: 2 },
  orderId: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.outline,
  },
  productName: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  transactionMeta: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  amount: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.tertiaryContainer,
  },
  emptyState: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface },
  emptyBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  savedBanner: {
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.tertiaryFixed,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  savedText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onTertiaryFixed,
  },
});
