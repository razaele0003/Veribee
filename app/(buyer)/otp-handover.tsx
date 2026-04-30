import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const code = ['8', '2', '1', '9', '4', '6'];

export default function OtpHandover() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Logo size={30} />
      </View>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <MaterialIcons name="door-front" size={76} color={Colors.primary} />
          <MaterialIcons name="delivery-dining" size={54} color={Colors.secondary} />
        </View>
        <Text style={styles.title}>Your Rider Has Arrived</Text>
        <Text style={styles.subtitle}>Show this code to confirm your delivery.</Text>

        <View style={styles.otpBox}>
          {code.map((digit, index) => (
            <View key={`${digit}-${index}`} style={styles.digitWrap}>
              <Text style={styles.digit}>{digit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.countdown}>
          <Text style={styles.countdownTime}>9:45</Text>
        </View>
        <Text style={styles.expires}>Code expires automatically</Text>

        <Button
          title="Use Biometrics Instead"
          variant="outlined"
          onPress={() => router.replace('/(buyer)/delivery-confirmed')}
        />
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backLink}>Back to tracking</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    height: 56,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.containerMargin,
    alignItems: 'center',
    gap: Spacing.md,
  },
  illustration: {
    width: '100%',
    maxWidth: 280,
    height: 200,
    borderRadius: Radii.lg,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.lg,
  },
  title: { ...Type.h2, color: Colors.onSurface, textAlign: 'center' },
  subtitle: { ...Type.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center' },
  otpBox: {
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  digitWrap: {
    width: 36,
    alignItems: 'center',
  },
  digit: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 36,
    color: Colors.onSurface,
  },
  countdown: {
    width: 66,
    height: 66,
    borderRadius: Radii.full,
    borderWidth: 4,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownTime: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 18,
    color: Colors.primary,
  },
  expires: { ...Type.labelCaps, color: Colors.onSurfaceVariant, textAlign: 'center' },
  backLink: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.primary,
  },
});
