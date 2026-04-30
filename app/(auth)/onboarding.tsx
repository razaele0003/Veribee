import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  illustration: 'gold' | 'tertiary' | 'score';
};

const slides: Slide[] = [
  {
    key: '1',
    title: "Know What You're Buying",
    subtitle: 'Every product on Veribee is verified before it reaches you.',
    illustration: 'gold',
  },
  {
    key: '2',
    title: 'Safe Delivery, Guaranteed',
    subtitle: 'Receive your package only after verifying with OTP or biometrics.',
    illustration: 'tertiary',
  },
  {
    key: '3',
    title: 'Trust Scores, Not Just Stars',
    subtitle: 'Our Verified Seller Index scores sellers on real transactions.',
    illustration: 'score',
  },
];

function Illustration({
  kind,
  width,
}: {
  kind: Slide['illustration'];
  width: number;
}) {
  const frameStyle = [styles.illustration, { width }];

  if (kind === 'score') {
    return (
      <View style={[frameStyle, styles.scoreFrame]}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNum}>92</Text>
          <Text style={styles.scoreLabel}>TRUST SCORE</Text>
        </View>
      </View>
    );
  }

  if (kind === 'tertiary') {
    return (
      <View style={[frameStyle, styles.deliveryFrame]}>
        <View style={styles.routeLine} />
        <View style={[styles.routeDot, styles.routeDotStart]}>
          <MaterialIcons name="storefront" size={22} color={Colors.tertiary} />
        </View>
        <View style={styles.packageCard}>
          <MaterialIcons name="inventory-2" size={48} color={Colors.onTertiary} />
          <Text style={styles.packageText}>OTP Ready</Text>
        </View>
        <View style={[styles.routeDot, styles.routeDotEnd]}>
          <MaterialIcons name="person-pin-circle" size={24} color={Colors.tertiary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[frameStyle, styles.verifyFrame]}>
      <View style={styles.verifyCard}>
        <View style={styles.verifyIcon}>
          <MaterialIcons name="verified" size={38} color={Colors.primary} />
        </View>
        <View style={styles.productLines}>
          <View style={styles.lineWide} />
          <View style={styles.lineShort} />
        </View>
      </View>
      <View style={styles.checkList}>
        {['Serial checked', 'Seller verified', 'Safe checkout'].map((label) => (
          <View key={label} style={styles.checkRow}>
            <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
            <Text style={styles.checkText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const indexRef = useRef(0);
  const artWidth = Math.min(width - Spacing.containerMargin * 2, 380);

  const setActiveIndex = (nextIndex: number) => {
    const clampedIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);
    if (indexRef.current === clampedIndex) return;
    indexRef.current = clampedIndex;
    setIndex(clampedIndex);
  };

  const updateIndexFromOffset = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(nextIndex);
  };

  const goNext = () => {
    if (index < slides.length - 1) {
      const nextIndex = index + 1;
      setActiveIndex(nextIndex);
      listRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const skip = () => router.replace('/(auth)/login');
  const isLast = index === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {!isLast ? (
          <Pressable style={styles.skip} onPress={skip} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.skipSpacer} />
        )}
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={updateIndexFromOffset}
        scrollEventThrottle={16}
        onMomentumScrollEnd={updateIndexFromOffset}
        onScrollEndDrag={updateIndexFromOffset}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex,
        })}
        extraData={width}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Illustration kind={item.illustration} width={artWidth} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <Button title={isLast ? 'Get Started' : 'Next'} onPress={goNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    minHeight: 44,
    paddingHorizontal: Spacing.containerMargin,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skip: {
    paddingVertical: Spacing.base,
  },
  skipText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  skipSpacer: { height: 36 },
  slide: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.lg,
    alignItems: 'center',
  },
  illustration: {
    height: 300,
    borderRadius: Radii.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  verifyFrame: {
    backgroundColor: Colors.secondaryContainer,
    gap: Spacing.md,
  },
  verifyCard: {
    width: '74%',
    minHeight: 96,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  verifyIcon: {
    width: 58,
    height: 58,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productLines: { flex: 1, gap: Spacing.sm },
  lineWide: {
    height: 14,
    width: '82%',
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  lineShort: {
    height: 14,
    width: '56%',
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainer,
  },
  checkList: {
    width: '74%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  deliveryFrame: {
    backgroundColor: Colors.tertiaryContainer,
  },
  routeLine: {
    position: 'absolute',
    left: '23%',
    right: '23%',
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryFixed,
  },
  routeDot: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: Radii.full,
    backgroundColor: Colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeDotStart: { left: '16%' },
  routeDotEnd: { right: '16%' },
  packageCard: {
    width: 138,
    height: 138,
    borderRadius: Radii.xl,
    backgroundColor: Colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  packageText: {
    ...Type.labelCaps,
    color: Colors.onTertiary,
  },
  scoreFrame: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 56,
    color: Colors.onPrimary,
  },
  scoreLabel: {
    ...Type.labelCaps,
    color: Colors.onPrimary,
    marginTop: 4,
  },
  title: {
    ...Type.h3,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.outlineVariant,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
