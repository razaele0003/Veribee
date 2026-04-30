import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const { width: W } = Dimensions.get('window');

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

function Illustration({ kind }: { kind: Slide['illustration'] }) {
  if (kind === 'score') {
    return (
      <View style={[styles.illustration, { backgroundColor: Colors.surfaceContainerLow }]}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNum}>92</Text>
          <Text style={styles.scoreLabel}>TRUST SCORE</Text>
        </View>
      </View>
    );
  }
  const bg =
    kind === 'gold' ? Colors.secondaryContainer : Colors.tertiaryContainer;
  return <View style={[styles.illustration, { backgroundColor: bg }]} />;
}

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const goNext = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const skip = () => router.replace('/(auth)/login');
  const isLast = index === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {!isLast && (
        <Pressable style={styles.skip} onPress={skip} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Illustration kind={item.illustration} />
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
  skip: {
    position: 'absolute',
    top: 56,
    right: Spacing.containerMargin,
    zIndex: 10,
  },
  skipText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  slide: {
    width: W,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    alignItems: 'center',
  },
  illustration: {
    width: W - 48,
    height: 320,
    borderRadius: Radii.xl,
    marginBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
