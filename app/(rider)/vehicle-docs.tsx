import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const docs = [
  { label: 'Driver License', status: 'Verified' },
  { label: 'Vehicle Registration', status: 'Verified' },
  { label: 'OR/CR Document', status: 'Pending Review' },
  { label: 'Vehicle Photo', status: 'Verified' },
];

export default function VehicleDocs() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Vehicle Documents</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.vehicleCard}>
          <MaterialIcons name="two-wheeler" size={40} color={Colors.primary} />
          <View style={styles.vehicleCopy}>
            <Text style={styles.vehicleName}>Honda Click 125i</Text>
            <Text style={styles.vehicleMeta}>Plate ABX 1234</Text>
          </View>
        </View>

        {docs.map((doc) => (
          <Pressable
            key={doc.label}
            onPress={() => Alert.alert(doc.label, 'Local file upload comes next.')}
            style={({ pressed }) => [styles.docRow, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Open ${doc.label}`}
          >
            <View style={styles.docIcon}>
              <MaterialIcons name="description" size={22} color={Colors.primary} />
            </View>
            <View style={styles.docCopy}>
              <Text style={styles.docLabel}>{doc.label}</Text>
              <Text style={styles.docStatus}>{doc.status}</Text>
            </View>
            <MaterialIcons name="upload-file" size={22} color={Colors.onSurfaceVariant} />
          </Pressable>
        ))}

        <Button title="Submit Updates" onPress={() => Alert.alert('Submitted', 'Documents saved locally.')} />
      </ScrollView>
    </SafeAreaView>
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
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Type.h3, color: Colors.primary },
  content: { padding: Spacing.containerMargin, paddingBottom: Spacing.xl, gap: Spacing.md },
  vehicleCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  vehicleCopy: { flex: 1 },
  vehicleName: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 20,
    color: Colors.onSurface,
  },
  vehicleMeta: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  docRow: {
    minHeight: 76,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docCopy: { flex: 1 },
  docLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  docStatus: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 13,
    color: Colors.tertiaryContainer,
    marginTop: 2,
  },
  pressed: { opacity: 0.72 },
});
