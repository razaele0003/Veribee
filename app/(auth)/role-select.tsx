import { useState } from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useAuthStore, Role } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

type RoleOption = {
  id: Role;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  available: boolean;
};

const roles: RoleOption[] = [
  {
    id: 'buyer',
    label: 'Buyer',
    description: 'Purchase premium artisan goods.',
    icon: 'shopping-bag',
    available: true,
  },
  {
    id: 'seller',
    label: 'Seller',
    description: 'Manage inventory and artisan shop.',
    icon: 'storefront',
    available: true,
  },
  {
    id: 'rider',
    label: 'Rider',
    description: 'Deliver products to customers.',
    icon: 'delivery-dining',
    available: false,
  },
];

const heroImage = require('@/assets/images/role-select-hero.png');

export default function RoleSelect() {
  const router = useRouter();
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const [selected, setSelected] = useState<Role | null>('buyer');
  const [saving, setSaving] = useState(false);

  const onTapRole = (r: RoleOption) => {
    if (!r.available) {
      Alert.alert(
        `${r.id[0].toUpperCase() + r.id.slice(1)} coming soon`,
        'Rider is not available yet. Buyer and Seller are active for now.',
      );
      return;
    }
    setSelected(r.id);
  };

  const onContinue = async () => {
    if (!selected) return;
    setSaving(true);
    setActiveRole(selected);
    setSaving(false);
    router.replace(selected === 'buyer' ? '/(buyer)/home' : '/(seller)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <View style={styles.brandRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons name="arrow-back" size={28} color={Colors.primary} />
          </Pressable>
          <Text style={styles.brand}>Veribee</Text>
        </View>
        <View style={styles.appBarSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How will you use Veribee?</Text>
        <Text style={styles.subtitle}>
          Choose your primary role to get started.
        </Text>

        <View style={styles.cards}>
          {roles.map((r) => {
            const isActive = selected === r.id;
            const dim = !r.available;
            return (
              <Pressable
                key={r.id}
                onPress={() => onTapRole(r)}
                style={[
                  styles.card,
                  isActive && styles.cardActive,
                  dim && styles.cardDisabled,
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    isActive && styles.iconCircleActive,
                  ]}
                >
                  <MaterialIcons
                    name={r.icon}
                    size={24}
                    color={
                      isActive ? Colors.primary : Colors.onSurfaceVariant
                    }
                  />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{r.label}</Text>
                    {dim && (
                      <View style={styles.soonPill}>
                        <Text style={styles.soonText}>Coming Soon</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardDesc}>{r.description}</Text>
                </View>
                <View style={[styles.radio, isActive && styles.radioActive]}>
                  {isActive && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <ImageBackground
          source={heroImage}
          imageStyle={styles.heroImage}
          style={styles.hero}
        >
          <View style={styles.heroTint} />
          <Text style={styles.heroText}>
            Empowering independent creators since 2024.
          </Text>
        </ImageBackground>

        <View style={styles.actions}>
          <Button
            title="Continue"
            onPress={onContinue}
            disabled={!selected}
            loading={saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  appBar: {
    height: 64,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  brand: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 26,
    lineHeight: 32,
    color: Colors.primary,
  },
  appBarSpacer: { width: 32 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    ...Type.h2,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Type.bodyMd,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xl,
  },
  cards: { gap: Spacing.md },
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardActive: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.primary,
    borderWidth: 2,
    ...Shadow.card,
  },
  cardDisabled: { opacity: 0.5 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: Colors.primaryFixed,
  },
  cardBody: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  cardTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 17,
    lineHeight: 23,
    color: Colors.onSurface,
  },
  cardDesc: {
    fontFamily: Fonts.manropeRegular,
    color: Colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
  },
  soonPill: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: Spacing.base,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  soonText: {
    ...Type.labelCaps,
    fontSize: 10,
    lineHeight: 12,
    color: Colors.onSurfaceVariant,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
  },
  hero: {
    minHeight: 190,
    marginTop: 'auto',
    borderRadius: Radii.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: { borderRadius: Radii.lg },
  heroTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    opacity: 0.44,
  },
  heroText: {
    fontFamily: Fonts.epilogueBold,
    fontSize: 22,
    lineHeight: 32,
    color: Colors.onPrimary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  actions: { marginTop: Spacing.xl },
});
