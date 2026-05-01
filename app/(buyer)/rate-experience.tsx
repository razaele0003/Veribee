import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const chips = ['On Time', 'Friendly', 'Handled Carefully', 'Verified Properly'];

export default function RateExperience() {
  const router = useRouter();
  const [productRating, setProductRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleChip = (chip: string) => {
    setSelected((current) =>
      current.includes(chip)
        ? current.filter((value) => value !== chip)
        : [...current, chip],
    );
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // In production: save to Supabase here
      // await supabase.from('ratings').insert({ ... });
    } catch {
      // non-blocking — navigate regardless
    } finally {
      router.replace('/(buyer)/(tabs)/orders');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Rate Delivery</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Your feedback helps us improve our service.</Text>
        <RatingSection title="Rate the Product" value={productRating} onChange={setProductRating} />
        <RatingSection title="Rate the Delivery" value={deliveryRating} onChange={setDeliveryRating} />

        <View style={styles.riderCard}>
          <Text style={styles.riderLabel}>Your Rider</Text>
          <View style={styles.riderRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>J</Text>
            </View>
            <Text style={styles.riderName}>Juan dela Cruz</Text>
            <View style={styles.riderRating}>
              <MaterialIcons name="star" size={16} color={Colors.secondary} />
              <Text style={styles.riderRatingText}>4.9</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>What went well?</Text>
        <View style={styles.chips}>
          {chips.map((chip) => {
            const isActive = selected.includes(chip);
            return (
              <Pressable
                key={chip}
                onPress={() => toggleChip(chip)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Leave a comment for your rider..."
          placeholderTextColor={Colors.onSurfaceVariant}
          multiline
          style={styles.comment}
        />

        <Button
          title={submitting ? 'Submitting…' : 'Submit Rating'}
          onPress={submit}
          loading={submitting}
          disabled={productRating === 0 || deliveryRating === 0 || submitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function RatingSection({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.ratingSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={8}>
            <MaterialIcons
              name={star <= value ? 'star' : 'star-border'}
              size={36}
              color={star <= value ? Colors.secondary : Colors.surfaceContainerHigh}
            />
          </Pressable>
        ))}
      </View>
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
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.epilogueSemiBold, fontSize: 20, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  subtitle: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  ratingSection: { gap: Spacing.sm },
  sectionTitle: {
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 18,
    color: Colors.onSurface,
  },
  stars: { flexDirection: 'row', gap: Spacing.base },
  riderCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  riderLabel: { ...Type.labelCaps, color: Colors.onSurfaceVariant },
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.epilogueBold, fontSize: 20, color: Colors.primary },
  riderName: { flex: 1, fontFamily: Fonts.epilogueSemiBold, fontSize: 17, color: Colors.onSurface },
  riderRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  riderRatingText: { fontFamily: Fonts.manropeBold, fontSize: 13, color: Colors.onSurface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFixed },
  chipText: { fontFamily: Fonts.manropeBold, fontSize: 13, color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.primary },
  comment: {
    minHeight: 90,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurface,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as any,
});
