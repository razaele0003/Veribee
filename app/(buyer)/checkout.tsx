import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { formatPHP } from '@/lib/buyerData';
import { useCartStore } from '@/store/cartStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function Checkout() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const grandTotal = useCartStore((s) => s.grandTotal());

  const placeOrder = () => {
    if (items.length === 0) {
      router.replace('/(buyer)/home');
      return;
    }
    clearCart();
    Alert.alert('Order placed', 'Your local buyer order is now processing.', [
      { text: 'Track Order', onPress: () => router.replace('/(buyer)/orders') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="Delivery Address">
          <View style={styles.rowCard}>
            <MaterialIcons name="location-on" size={24} color={Colors.primary} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Home</Text>
              <Text style={styles.rowBody}>Makati City, Metro Manila</Text>
            </View>
          </View>
        </Section>

        <Section title="Payment Method">
          <View style={[styles.rowCard, styles.rowCardSelected]}>
            <MaterialIcons name="payments" size={24} color={Colors.primary} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Cash on Delivery</Text>
              <Text style={styles.rowBody}>Pay after OTP handover verification</Text>
            </View>
            <MaterialIcons name="radio-button-checked" size={22} color={Colors.primary} />
          </View>
        </Section>

        <Section title="Order Summary">
          {items.map((item) => (
            <View key={item.productId} style={styles.summaryItem}>
              <Text style={styles.summaryName} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.summaryPrice}>{formatPHP(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totalLine} />
          <View style={styles.summaryItem}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPHP(grandTotal)}</Text>
          </View>
        </Section>

        <Button title="Place Order" onPress={placeOrder} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
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
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  section: { gap: Spacing.sm },
  sectionTitle: { ...Type.h3, color: Colors.onSurface },
  sectionCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...Shadow.card,
  },
  rowCard: {
    minHeight: 78,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowCardSelected: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  rowCopy: { flex: 1 },
  rowTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  rowBody: { ...Type.bodyMd, fontSize: 14, color: Colors.onSurfaceVariant },
  summaryItem: {
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  summaryName: {
    flex: 1,
    fontFamily: Fonts.manropeMedium,
    fontSize: 15,
    color: Colors.onSurface,
  },
  summaryPrice: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.primary,
  },
  totalLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.surfaceVariant,
  },
  totalLabel: { ...Type.h3, color: Colors.onSurface },
  totalValue: { ...Type.h3, color: Colors.primary },
});
