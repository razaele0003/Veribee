import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type DocumentType = 'National ID' | 'Driver License' | 'Passport';
type UploadKey = 'front' | 'back' | 'selfie';

const documentTypes: DocumentType[] = ['National ID', 'Driver License', 'Passport'];

export default function KycScreen() {
  const router = useRouter();
  const [documentType, setDocumentType] = useState<DocumentType>('National ID');
  const [uploads, setUploads] = useState<Record<UploadKey, string | null>>({
    front: null,
    back: null,
    selfie: null,
  });

  const chooseDocumentType = () => {
    Alert.alert('Document Type', 'Choose the ID you will upload.', [
      ...documentTypes.map((type) => ({
        text: type,
        onPress: () => setDocumentType(type),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const pickUpload = async (key: UploadKey) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to upload your document.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled) return;
    setUploads((current) => ({ ...current, [key]: result.assets[0].uri }));
  };

  const submit = () => {
    const missing = Object.values(uploads).some((value) => !value);
    if (missing) {
      Alert.alert('Uploads needed', 'Upload the front, back, and selfie photos first.');
      return;
    }
    Alert.alert('Verification submitted', 'Your local KYC status is now pending review.', [
      { text: 'OK', onPress: () => router.replace('/(seller)/(tabs)/profile') },
    ]);
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
        <Text style={styles.headerTitle}>Verification</Text>
        <Pressable
          onPress={() =>
            Alert.alert('KYC help', 'Use clear photos with all document edges visible.')
          }
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Verification help"
        >
          <MaterialIcons name="help-outline" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.shield}>
            <MaterialIcons name="shield" size={38} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Verify Your Account</Text>
          <Text style={styles.step}>Step 1 of 3: Document Upload</Text>
        </View>

        <View style={styles.progress}>
          <View style={styles.progressActive} />
          <View style={styles.progressRest} />
          <View style={styles.progressRest} />
        </View>

        <View style={styles.infoBanner}>
          <MaterialIcons name="info" size={22} color={Colors.secondary} />
          <Text style={styles.infoText}>
            Complete verification to list items above PHP 5,000.
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.fieldLabel}>Document Type</Text>
            <Pressable
              onPress={chooseDocumentType}
              style={({ pressed }) => [styles.select, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Choose document type"
            >
              <Text style={styles.selectText}>{documentType}</Text>
              <MaterialIcons name="expand-more" size={24} color={Colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <View style={styles.uploadRow}>
            <UploadCard
              label="Front of ID"
              icon="badge"
              uri={uploads.front}
              onPress={() => pickUpload('front')}
            />
            <UploadCard
              label="Back of ID"
              icon="credit-card"
              uri={uploads.back}
              onPress={() => pickUpload('back')}
            />
          </View>

          <View>
            <Text style={styles.fieldLabel}>Identity Verification</Text>
            <UploadCard
              label="Selfie with ID"
              icon="face"
              uri={uploads.selfie}
              onPress={() => pickUpload('selfie')}
              wide
            />
          </View>
        </View>

        <Button title="Submit Verification" onPress={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

function UploadCard({
  label,
  icon,
  uri,
  onPress,
  wide,
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  uri: string | null;
  onPress: () => void;
  wide?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.uploadCard,
        wide && styles.uploadCardWide,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Upload ${label}`}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.uploadImage} />
      ) : (
        <>
          <MaterialIcons name={icon} size={34} color={Colors.outline} />
          <Text style={styles.uploadTitle}>Tap to Upload</Text>
          <Text style={styles.uploadLabel}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
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
    fontFamily: Fonts.epilogueSemiBold,
    fontSize: 18,
    color: Colors.primary,
  },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  shield: {
    width: 64,
    height: 64,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { ...Type.h3, color: Colors.onBackground, textAlign: 'center' },
  step: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  progress: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  progressActive: {
    flex: 1,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
  progressRest: {
    flex: 1,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.secondaryFixedDim,
    padding: Spacing.md,
  },
  infoText: {
    flex: 1,
    ...Type.bodyMd,
    color: Colors.onSecondaryContainer,
  },
  form: { gap: Spacing.xl },
  fieldLabel: {
    ...Type.labelCaps,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  select: {
    minHeight: 52,
    borderRadius: Radii.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 18,
    color: Colors.onSurface,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  uploadCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    overflow: 'hidden',
  },
  uploadCardWide: {
    width: '100%',
    aspectRatio: undefined,
    minHeight: 150,
  },
  uploadImage: { width: '100%', height: '100%' },
  uploadTitle: {
    ...Type.labelCaps,
    color: Colors.onSurface,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  uploadLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
