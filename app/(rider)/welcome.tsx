import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

export default function RiderWelcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="local-shipping" size={56} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Ready to ride with Veribee</Text>
        <Text style={styles.subtitle}>Your rider account is verified and ready to go.</Text>
        <View style={styles.card}>
          <Step icon="route" title="Accept nearby jobs" />
          <Step icon="qr-code-scanner" title="Confirm secure pickup" />
          <Step icon="pin" title="Complete OTP handover" />
        </View>
        <Button title="Start Delivering" onPress={() => router.replace('/(rider)/(tabs)/job-feed')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({
  icon,
  title,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepIcon}>
        <MaterialIcons name={icon} size={22} color={Colors.primary} />
      </View>
      <Text style={styles.stepText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: {
    flexGrow: 1,
    padding: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  iconCircle: {
    width: 124,
    height: 124,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...Type.h2, color: Colors.primary, textAlign: 'center' },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  step: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
});
