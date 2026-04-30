import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { formatPHP } from '@/lib/buyerData';
import { CartItem, useCartStore } from '@/store/cartStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function BuyerCart() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const authFee = useCartStore((s) => s.authFee());
  const deliveryFee = useCartStore((s) => s.deliveryFee());
  const grandTotal = useCartStore((s) => s.grandTotal());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length > 0 ? (
          items.map((item) => <CartRow key={item.productId} item={item} />)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="shopping-cart" size={38} color={Colors.primary} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyBody}>Add verified products from the home feed.</Text>
            <Button title="Browse Products" onPress={() => router.replace('/(buyer)/home')} />
          </View>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.summary}>
          <FeeRow label="Subtotal" value={formatPHP(totalPrice)} />
          <FeeRow label="Authentication Fee" value={formatPHP(authFee)} />
          <FeeRow label="Delivery Fee" value={formatPHP(deliveryFee)} />
          <View style={styles.summaryDivider} />
          <FeeRow label="Total" value={formatPHP(grandTotal)} total />
          <Button title="Proceed to Checkout" onPress={() => router.push('/(buyer)/checkout')} />
        </View>
      )}
    </SafeAreaView>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <View style={styles.cartRow}>
      <View style={styles.thumb}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <MaterialIcons name="inventory-2" size={30} color={Colors.primary} />
        )}
      </View>
      <View style={styles.cartCopy}>
        <Text style={styles.seller}>{item.sellerName}</Text>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>{formatPHP(item.price)}</Text>
      </View>
      <View style={styles.quantity}>
        <Pressable onPress={() => updateQuantity(item.productId, item.quantity - 1)}>
          <MaterialIcons name="remove" size={20} color={Colors.onSurfaceVariant} />
        </Pressable>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <Pressable onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
          <MaterialIcons name="add" size={20} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>
      <Pressable onPress={() => removeItem(item.productId)} hitSlop={10}>
        <MaterialIcons name="delete-outline" size={22} color={Colors.error} />
      </Pressable>
    </View>
  );
}

function FeeRow({ label, value, total }: { label: string; value: string; total?: boolean }) {
  return (
    <View style={styles.feeRow}>
      <Text style={[styles.feeLabel, total && styles.totalLabel]}>{label}</Text>
      <Text style={[styles.feeValue, total && styles.totalValue]}>{value}</Text>
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
  pressed: { opacity: 0.72 },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: 260,
    gap: Spacing.lg,
  },
  cartRow: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  cartCopy: { flex: 1, gap: 2 },
  seller: { ...Type.labelCaps, fontSize: 10, color: Colors.onSurfaceVariant },
  itemTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.onSurface,
  },
  itemPrice: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 16,
    color: Colors.primary,
  },
  quantity: {
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  quantityText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  summary: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    borderTopWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surface,
    padding: Spacing.containerMargin,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  feeLabel: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  feeValue: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  totalLabel: { ...Type.h3, color: Colors.onSurface },
  totalValue: { ...Type.h3, color: Colors.primary },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.surfaceVariant,
    marginVertical: Spacing.xs,
  },
  emptyState: {
    minHeight: 320,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  emptyTitle: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  emptyBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
