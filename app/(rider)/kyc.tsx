import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

const requirements = [
  'Government ID front and back',
  'Driver license photo',
  'Selfie with ID',
  'Emergency contact details',
];

export default function RiderKyc() {
  const router = useRouter();

  const onSubmit = () => {
    Alert.alert('KYC submitted', 'Local rider verification is marked ready for testing.', [
      { text: 'Go to Jobs', onPress: () => router.replace('/(rider)/job-feed') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Rider KYC</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.shield}>
          <MaterialIcons name="verified-user" size={52} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Verify your rider account</Text>
        <Text style={styles.subtitle}>
          Complete identity and vehicle checks before accepting live delivery jobs.
        </Text>

        <View style={styles.list}>
          {requirements.map((item) => (
            <View key={item} style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="check" size={18} color={Colors.onTertiary} />
              </View>
              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => Alert.alert('Upload', 'Document picker comes next.')}
          style={({ pressed }) => [styles.uploadBox, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Upload KYC documents"
        >
          <MaterialIcons name="cloud-upload" size={38} color={Colors.primary} />
          <Text style={styles.uploadTitle}>Upload documents</Text>
          <Text style={styles.uploadBody}>Local mode records this step without Supabase storage.</Text>
        </Pressable>

        <Button title="Submit KYC" onPress={onSubmit} />
      </ScrollView>
    </SafeAreaView>
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
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: {
    padding: Spacing.containerMargin,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  shield: {
    width: 112,
    height: 112,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
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
  list: { alignSelf: 'stretch', gap: Spacing.sm },
  row: {
    minHeight: 56,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  uploadBox: {
    alignSelf: 'stretch',
    minHeight: 170,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  uploadTitle: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
  },
  uploadBody: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  pressed: { opacity: 0.72 },
});
