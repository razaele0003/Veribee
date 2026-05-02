import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ProductImageSource, resolveImageSource } from '@/constants/productImages';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type Props = {
  photos: ProductImageSource[];
  onAdd?: () => void;
};

export function EvidenceUploader({ photos, onAdd }: Props) {
  const availableSlots = 8 - photos.length;

  return (
    <View style={styles.wrap}>
      {photos.length === 0 ? (
        <Pressable
          style={styles.emptyAction}
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel="Add product photos"
          accessibilityHint="Opens your photo library. You can add up to 8 photos."
        >
          <MaterialIcons name="photo-camera" size={40} color={Colors.primary} />
          <Text style={styles.title}>Add Product Photos</Text>
          <Text style={styles.subtitle}>Up to 8 photos</Text>
        </Pressable>
      ) : (
        <>
          <View style={styles.grid}>
            {photos.slice(0, 8).map((photo, index) => (
              <View
                key={String(photo)}
                style={styles.slot}
                accessibilityLabel={`Product photo ${index + 1}`}
              >
                <Image source={resolveImageSource(photo)} style={styles.image} />
                <View style={styles.numberPill}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
              </View>
            ))}
            {photos.length < 8 && (
              <Pressable
                style={[styles.slot, styles.addSlot]}
                onPress={onAdd}
                accessibilityRole="button"
                accessibilityLabel="Add another product photo"
                accessibilityHint={`${availableSlots} photo slots remaining.`}
              >
                <View style={styles.addCircle}>
                  <MaterialIcons name="add" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.counter}>{photos.length}/8 photos added</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 164,
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyAction: {
    minHeight: 132,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  title: { ...Type.h3, color: Colors.onSurface, textAlign: 'center' },
  subtitle: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  slot: {
    width: '22%',
    minWidth: 64,
    aspectRatio: 1,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  addSlot: {
    backgroundColor: Colors.primaryFixed,
    borderStyle: 'dashed',
    gap: Spacing.xs,
  },
  addCircle: {
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.primary,
  },
  counter: {
    ...Type.labelCaps,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  numberPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    minWidth: 22,
    height: 22,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  numberText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 11,
    color: Colors.onPrimary,
  },
});
