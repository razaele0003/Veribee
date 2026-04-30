import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export default function DeliveryConfirmed() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        onPress={() => router.replace('/(buyer)/orders')}
        style={styles.closeButton}
        hitSlop={12}
      >
        <MaterialIcons name="close" size={24} color={Colors.onSurfaceVariant} />
      </Pressable>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <MaterialIcons name="check" size={54} color={Colors.onPrimary} />
        </View>
        <Text style={styles.title}>Delivered</Text>
        <Text style={styles.subtitle}>
          Your order has been successfully received and verified.
        </Text>

        <View style={styles.card}>
          <View style={styles.thumb}>
            <MaterialIcons name="inventory-2" size={28} color={Colors.primary} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>Classic Artisan Leather Tote</Text>
            <Text style={styles.cardBody}>Order #VB-9982</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailText}>Rider: Juan dela Cruz</Text>
          <Text style={styles.detailText}>April 20, 2026</Text>
        </View>

        <Button title="View Receipt" variant="outlined" onPress={() => router.replace('/(buyer)/orders')} />
        <Button
          title="Rate Your Experience"
          onPress={() => router.push('/(buyer)/rate-experience')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  closeButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.containerMargin,
  },
  content: {
    flex: 1,
    padding: Spacing.containerMargin,
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 36,
    color: Colors.onSurface,
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.md,
    ...Shadow.card,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontFamily: Fonts.manropeBold, fontSize: 15, color: Colors.onSurface },
  cardBody: { fontFamily: Fonts.manropeRegular, fontSize: 12, color: Colors.onSurfaceVariant },
  detailRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  detailText: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
});
