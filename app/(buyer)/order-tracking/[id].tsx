import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const steps = ['Confirmed', 'Picked Up', 'On the Way', 'Delivered'];

export default function OrderTracking() {
  const router = useRouter();
  const activeStep = 2;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.map}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <View style={styles.routeLine} />
        <View style={styles.riderMarker}>
          <MaterialIcons name="delivery-dining" size={28} color={Colors.onPrimary} />
        </View>
        <View style={styles.homeMarker}>
          <MaterialIcons name="home" size={26} color={Colors.onSecondaryContainer} />
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.title}>Track Order</Text>
          <MaterialIcons name="more-horiz" size={24} color={Colors.onSurfaceVariant} />
        </View>

        <View style={styles.stepper}>
          {steps.map((step, index) => {
            const isComplete = index < activeStep;
            const isActive = index === activeStep;
            return (
              <View key={step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    (isComplete || isActive) && styles.stepCircleActive,
                  ]}
                >
                  <MaterialIcons
                    name={isComplete ? 'check' : 'circle'}
                    size={isComplete ? 16 : 8}
                    color={(isComplete || isActive) ? Colors.onPrimary : Colors.onSurfaceVariant}
                  />
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.estimate}>
          <MaterialIcons name="schedule" size={22} color={Colors.primary} />
          <View style={styles.estimateCopy}>
            <Text style={styles.estimateLabel}>Estimated Arrival</Text>
            <Text style={styles.estimateValue}>12 mins</Text>
          </View>
          <Text style={styles.arrivalTime}>14:30</Text>
        </View>

        <View style={styles.riderCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
          <View style={styles.riderCopy}>
            <Text style={styles.riderName}>Juan dela Cruz</Text>
            <Text style={styles.riderMeta}>Plate AB 1234</Text>
          </View>
          <View style={styles.rating}>
            <MaterialIcons name="star" size={16} color={Colors.secondary} />
            <Text style={styles.ratingText}>4.9</Text>
          </View>
          <Pressable style={styles.chatButton}>
            <MaterialIcons name="chat" size={20} color={Colors.onPrimary} />
          </Pressable>
        </View>

        <Button
          title="Enter OTP to Receive"
          onPress={() => router.push('/(buyer)/otp-handover')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceContainerHigh },
  map: {
    flex: 1,
    backgroundColor: Colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.containerMargin,
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  routeLine: {
    width: '64%',
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryContainer,
  },
  riderMarker: {
    position: 'absolute',
    left: '24%',
    top: '42%',
    width: 54,
    height: 54,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeMarker: {
    position: 'absolute',
    right: '22%',
    top: '52%',
    width: 50,
    height: 50,
    borderRadius: Radii.full,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.containerMargin,
    gap: Spacing.md,
    ...Shadow.card,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...Type.h3, color: Colors.onSurface },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.xs },
  stepItem: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: Colors.primary },
  stepLabel: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  stepLabelActive: { color: Colors.primary, fontFamily: Fonts.manropeBold },
  estimate: {
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  estimateCopy: { flex: 1 },
  estimateLabel: { fontFamily: Fonts.manropeRegular, fontSize: 13, color: Colors.onSurfaceVariant },
  estimateValue: { fontFamily: Fonts.epilogueBold, fontSize: 18, color: Colors.onSurface },
  arrivalTime: { fontFamily: Fonts.manropeBold, fontSize: 13, color: Colors.onSurfaceVariant },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.surfaceVariant,
    paddingTop: Spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.epilogueBold, fontSize: 18, color: Colors.primary },
  riderCopy: { flex: 1 },
  riderName: { fontFamily: Fonts.manropeBold, fontSize: 14, color: Colors.onSurface },
  riderMeta: { fontFamily: Fonts.manropeRegular, fontSize: 12, color: Colors.onSurfaceVariant },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontFamily: Fonts.manropeBold, fontSize: 13, color: Colors.onSurface },
  chatButton: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
