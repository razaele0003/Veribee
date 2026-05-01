import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { formatPHP } from '@/lib/buyerData';
import { DEMO_ROUTE } from '@/lib/demoProfiles';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const reasons = [
  'Item not as described',
  'Received counterfeit product',
  'Item damaged',
  'Wrong item received',
  'Item not received',
];

export default function FileDispute() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    setSubmitted(true);
    setTimeout(() => router.replace('/(buyer)/(tabs)/orders'), 650);
  };

  const uploadEvidence = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setEvidenceCount(result.assets.length);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>File a Dispute</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>Order Reference</Text>
          <Text style={styles.referenceId}>Order #{DEMO_ROUTE.orderId}</Text>
          <View style={styles.referenceRow}>
            <View style={styles.thumb}>
              <MaterialIcons name="inventory-2" size={28} color={Colors.primary} />
            </View>
            <View style={styles.referenceCopy}>
              <Text style={styles.productName}>{DEMO_ROUTE.productName}</Text>
              <Text style={styles.productPrice}>{formatPHP(DEMO_ROUTE.price)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Reason for Dispute</Text>
        <View style={styles.reasonList}>
          {reasons.map((item) => {
            const isActive = reason === item;
            return (
              <Pressable
                key={item}
                onPress={() => setReason(item)}
                style={styles.reasonRow}
              >
                <View style={[styles.radio, isActive && styles.radioActive]}>
                  {isActive && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.reasonText, isActive && styles.reasonTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Upload Evidence</Text>
        <Pressable
          onPress={uploadEvidence}
          style={({ pressed }) => [styles.uploadBox, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Upload dispute evidence"
        >
          <View style={styles.uploadIcons}>
            <MaterialIcons name="photo-camera" size={26} color={Colors.outline} />
            <MaterialIcons name="photo-library" size={26} color={Colors.outline} />
          </View>
          <Text style={styles.uploadTitle}>
            {evidenceCount > 0 ? `${evidenceCount} photo${evidenceCount === 1 ? '' : 's'} selected` : 'Upload up to 5 photos'}
          </Text>
          <Text style={styles.uploadBody}>JPEG or PNG, max 10MB each</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue in detail..."
          placeholderTextColor={Colors.onSurfaceVariant}
          multiline
          style={styles.description}
        />

        {!!submitted && (
          <View style={styles.submittedBanner}>
            <MaterialIcons name="check-circle" size={18} color={Colors.tertiaryContainer} />
            <Text style={styles.submittedText}>Dispute submitted.</Text>
          </View>
        )}
        <Button title="Submit Dispute" onPress={submit} disabled={!reason || submitted} />
      </ScrollView>
    </SafeAreaView>
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
  referenceCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  referenceLabel: { ...Type.labelCaps, color: Colors.onSurfaceVariant },
  referenceId: { fontFamily: Fonts.manropeRegular, fontSize: 12, color: Colors.onSurfaceVariant },
  referenceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referenceCopy: { flex: 1 },
  productName: { fontFamily: Fonts.epilogueSemiBold, fontSize: 15, color: Colors.onSurface },
  productPrice: { fontFamily: Fonts.manropeBold, fontSize: 13, color: Colors.primary },
  sectionTitle: { fontFamily: Fonts.epilogueSemiBold, fontSize: 18, color: Colors.onSurface },
  reasonList: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    overflow: 'hidden',
  },
  reasonRow: {
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceVariant,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
  reasonText: {
    flex: 1,
    fontFamily: Fonts.manropeRegular,
    fontSize: 15,
    color: Colors.onSurface,
  },
  reasonTextActive: { color: Colors.primary, fontFamily: Fonts.manropeBold },
  uploadBox: {
    minHeight: 112,
    borderRadius: Radii.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  pressed: { opacity: 0.72 },
  uploadIcons: { flexDirection: 'row', gap: Spacing.sm },
  uploadTitle: { fontFamily: Fonts.manropeBold, fontSize: 13, color: Colors.onSurfaceVariant },
  uploadBody: { fontFamily: Fonts.manropeRegular, fontSize: 11, color: Colors.onSurfaceVariant },
  description: {
    minHeight: 104,
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
  submittedBanner: {
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.tertiaryFixed,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  submittedText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onTertiaryFixed,
  },
});
