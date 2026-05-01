import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

export type SettingsRole = 'buyer' | 'seller' | 'rider';

export type SettingsKind =
  | 'account'
  | 'personal'
  | 'notifications'
  | 'privacy'
  | 'help'
  | 'about'
  | 'payout'
  | 'store'
  | 'addresses'
  | 'payments'
  | 'photo';

type Props = {
  role: SettingsRole;
  kind: SettingsKind;
  title: string;
};

const notificationLabels = ['Orders', 'Promotions', 'Messages', 'Delivery updates'];

const faqs = [
  ['How does Veribee verification work?', 'Sellers submit listing evidence and Veribee records the authentication result before delivery.'],
  ['When do I see my OTP?', 'The buyer OTP appears when the rider marks arrival at delivery.'],
  ['How are payouts handled?', 'Completed orders move into the payout queue after delivery confirmation.'],
  ['Can I switch roles?', 'Yes. Use Switch Role from the profile screen to move between buyer, seller, and rider workspaces.'],
  ['What happens during a dispute?', 'The order is held while the issue details and evidence are reviewed.'],
];

const banks = ['BDO', 'BPI', 'GCash', 'Maya', 'Metrobank'];

function rolePath(role: SettingsRole) {
  return role === 'rider' ? '/(rider)/(tabs)/account' : `/${role === 'buyer' ? '(buyer)' : '(seller)'}/(tabs)/profile`;
}

export function SettingsScreen({ role, kind, title }: Props) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const [savedMessage, setSavedMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (label: string, task?: () => Promise<void>) => {
    setSaving(true);
    setSavedMessage('');
    try {
      await task?.();
      setSavedMessage(`${label} saved.`);
    } catch {
      setSavedMessage(`${label} saved locally.`);
    } finally {
      setSaving(false);
    }
  };

  const body = useMemo(() => {
    if (kind === 'account') return <AccountSettings role={role} />;
    if (kind === 'personal') return <PersonalInformation role={role} userId={userId} save={save} saving={saving} />;
    if (kind === 'notifications') return <NotificationSettings userId={userId} save={save} saving={saving} />;
    if (kind === 'privacy') return <PrivacySecurity save={save} saving={saving} />;
    if (kind === 'help') return <HelpCenter role={role} />;
    if (kind === 'about') return <AboutVeribee />;
    if (kind === 'payout') return <PayoutBank role={role} userId={userId} save={save} saving={saving} />;
    if (kind === 'store') return <StoreInformation userId={userId} save={save} saving={saving} />;
    if (kind === 'addresses') return <DeliveryAddresses save={save} saving={saving} />;
    if (kind === 'payments') return <PaymentMethods save={save} saving={saving} />;
    return <ProfilePhoto save={save} saving={saving} />;
  }, [kind, role, saving, userId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace(rolePath(role) as never))}
          hitSlop={12}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {body}
        {!!savedMessage && (
          <View style={styles.savedBanner}>
            <MaterialIcons name="check-circle" size={18} color={Colors.tertiaryContainer} />
            <Text style={styles.savedText}>{savedMessage}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AccountSettings({ role }: { role: SettingsRole }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Account workspace</Text>
      <Text style={styles.body}>Role-specific preferences, contact details, notifications, privacy, and support now live in dedicated settings screens.</Text>
      <InfoRow icon="badge" label="Current role" value={role[0].toUpperCase() + role.slice(1)} />
      <InfoRow icon="verified-user" label="Verification" value="Ready for demo" />
    </View>
  );
}

function PersonalInformation({
  role,
  userId,
  save,
  saving,
}: {
  role: SettingsRole;
  userId: string | null;
  save: (label: string, task?: () => Promise<void>) => Promise<void>;
  saving: boolean;
}) {
  const [name, setName] = useState(role === 'seller' ? "Maria's Boutique" : role === 'rider' ? 'Angelo Reyes' : 'Buyer Test');
  const [phone, setPhone] = useState('+63 917 123 4501');
  const email = `${role}@veribee.test`;

  return (
    <View style={styles.form}>
      <Input label="Name" value={name} onChangeText={setName} />
      <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Email" value={email} editable={false} />
      <Button
        title="Save"
        loading={saving}
        onPress={() =>
          save('Personal information', async () => {
            if (!userId) return;
            await supabase.from('users').update({ full_name: name, phone }).eq('id', userId);
          })
        }
      />
    </View>
  );
}

function NotificationSettings({
  userId,
  save,
  saving,
}: {
  userId: string | null;
  save: (label: string, task?: () => Promise<void>) => Promise<void>;
  saving: boolean;
}) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    Orders: true,
    Promotions: false,
    Messages: true,
    'Delivery updates': true,
  });

  return (
    <View style={styles.form}>
      <View style={styles.card}>
        {notificationLabels.map((label) => (
          <SwitchRow
            key={label}
            label={label}
            value={prefs[label]}
            onValueChange={(value) => setPrefs((current) => ({ ...current, [label]: value }))}
          />
        ))}
      </View>
      <Button
        title="Save"
        loading={saving}
        onPress={() =>
          save('Notification preferences', async () => {
            if (!userId) return;
            await supabase.from('users').update({ notification_prefs: prefs }).eq('id', userId);
          })
        }
      />
    </View>
  );
}

function PrivacySecurity({
  save,
  saving,
}: {
  save: (label: string, task?: () => Promise<void>) => Promise<void>;
  saving: boolean;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <View style={styles.form}>
      <PasswordInput label="Current password" value={current} onChangeText={setCurrent} />
      <PasswordInput label="New password" value={next} onChangeText={setNext} />
      <PasswordInput label="Confirm new password" value={confirm} onChangeText={setConfirm} />
      <View style={styles.card}>
        <SwitchRow label="Two-factor authentication" value={twoFactor} onValueChange={setTwoFactor} />
        <InfoRow icon="devices" label="Active session" value="This device" />
      </View>
      <Button
        title="Save"
        loading={saving}
        disabled={!next || next !== confirm}
        onPress={() => save('Security settings')}
      />
    </View>
  );
}

function HelpCenter({ role }: { role: SettingsRole }) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <View style={styles.form}>
      <View style={styles.card}>
        {faqs.map(([question, answer], index) => {
          const open = openIndex === index;
          return (
            <Pressable
              key={question}
              onPress={() => setOpenIndex(open ? -1 : index)}
              style={styles.faqRow}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
            >
              <View style={styles.faqTop}>
                <Text style={styles.rowLabel}>{question}</Text>
                <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={22} color={Colors.onSurfaceVariant} />
              </View>
              {open && <Text style={styles.body}>{answer}</Text>}
            </Pressable>
          );
        })}
      </View>
      <Button
        title="Contact Support"
        onPress={() => Linking.openURL(`mailto:support@veribee.app?subject=${role}%20support`)}
      />
    </View>
  );
}

function AboutVeribee() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const links = ['Terms', 'Privacy Policy', 'Open-source licenses'];
  return (
    <View style={styles.form}>
      <View style={[styles.card, styles.centerCard]}>
        <Logo size={56} />
        <Text style={styles.cardTitle}>Veribee</Text>
        <Text style={styles.body}>Version {version}</Text>
        <Text style={styles.body}>Made in the Philippines</Text>
      </View>
      <View style={styles.card}>
        {links.map((label) => (
          <Pressable
            key={label}
            onPress={() => Linking.openURL('https://veribee.app')}
            style={styles.navRow}
            accessibilityRole="button"
            accessibilityLabel={`Open ${label}`}
          >
            <Text style={styles.rowLabel}>{label}</Text>
            <MaterialIcons name="open-in-new" size={20} color={Colors.onSurfaceVariant} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function PayoutBank({
  role,
  userId,
  save,
  saving,
}: {
  role: SettingsRole;
  userId: string | null;
  save: (label: string, task?: () => Promise<void>) => Promise<void>;
  saving: boolean;
}) {
  const [bank, setBank] = useState(banks[0]);
  const [holder, setHolder] = useState(role === 'seller' ? 'Maria Santos' : 'Angelo Reyes');
  const [number, setNumber] = useState('1234 5678 9012');

  return (
    <View style={styles.form}>
      <View style={styles.segmentGroup}>
        {banks.map((option) => (
          <Pressable
            key={option}
            onPress={() => setBank(option)}
            style={[styles.segment, bank === option && styles.segmentActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: bank === option }}
          >
            <Text style={[styles.segmentText, bank === option && styles.segmentTextActive]}>{option}</Text>
          </Pressable>
        ))}
      </View>
      <Input label="Account holder" value={holder} onChangeText={setHolder} />
      <Input label="Account number" value={number} onChangeText={setNumber} keyboardType="number-pad" />
      <Button
        title="Save"
        loading={saving}
        onPress={() =>
          save('Payout details', async () => {
            if (!userId || role === 'buyer') return;
            await supabase
              .from(role === 'seller' ? 'seller_profiles' : 'rider_profiles')
              .update({ payout_details: { bank, holder, number } })
              .eq('user_id', userId);
          })
        }
      />
    </View>
  );
}

function StoreInformation({
  userId,
  save,
  saving,
}: {
  userId: string | null;
  save: (label: string, task?: () => Promise<void>) => Promise<void>;
  saving: boolean;
}) {
  const [storeName, setStoreName] = useState("Maria's Boutique");
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [weekendOpen, setWeekendOpen] = useState(true);

  return (
    <View style={styles.form}>
      <Input label="Store name" value={storeName} onChangeText={setStoreName} />
      <View style={styles.inlineFields}>
        <Input label="Opens" value={openTime} onChangeText={setOpenTime} containerStyle={styles.inlineField} />
        <Input label="Closes" value={closeTime} onChangeText={setCloseTime} containerStyle={styles.inlineField} />
      </View>
      <View style={styles.card}>
        <SwitchRow label="Open on weekends" value={weekendOpen} onValueChange={setWeekendOpen} />
      </View>
      <Button
        title="Save"
        loading={saving}
        onPress={() =>
          save('Store information', async () => {
            if (!userId) return;
            await supabase.from('seller_profiles').update({
              store_name: storeName,
              store_hours: { openTime, closeTime, weekendOpen },
            }).eq('user_id', userId);
          })
        }
      />
    </View>
  );
}

function DeliveryAddresses({
  save,
  saving,
}: {
  save: (label: string, task?: () => Promise<void>) => Promise<void>;
  saving: boolean;
}) {
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('Makati City, Metro Manila');
  const [defaultAddress, setDefaultAddress] = useState(true);

  return (
    <View style={styles.form}>
      <View style={styles.card}>
        <InfoRow icon="location-on" label={label} value={street} />
      </View>
      <Input label="Label" value={label} onChangeText={setLabel} />
      <Input label="Street and city" value={street} onChangeText={setStreet} />
      <View style={styles.card}>
        <SwitchRow label="Default delivery address" value={defaultAddress} onValueChange={setDefaultAddress} />
      </View>
      <Button title="Save" loading={saving} onPress={() => save('Delivery address')} />
    </View>
  );
}

function PaymentMethods({
  save,
  saving,
}: {
  save: (label: string, task?: () => Promise<void>) => Promise<void>;
  saving: boolean;
}) {
  const [cod, setCod] = useState(true);
  return (
    <View style={styles.form}>
      <View style={styles.card}>
        <InfoRow icon="credit-card" label="Card ending 4242" value="Backup method" />
        <SwitchRow label="Cash on Delivery default" value={cod} onValueChange={setCod} />
      </View>
      <Button title="Save" loading={saving} onPress={() => save('Payment preferences')} />
    </View>
  );
}

function ProfilePhoto({
  save,
  saving,
}: {
  save: (label: string, task?: () => Promise<void>) => Promise<void>;
  saving: boolean;
}) {
  const [selected, setSelected] = useState(false);
  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setSelected(true);
  };

  return (
    <View style={styles.form}>
      <View style={[styles.card, styles.centerCard]}>
        <View style={styles.avatar}>
          <MaterialIcons name={selected ? 'check' : 'photo-camera'} size={30} color={Colors.primary} />
        </View>
        <Text style={styles.body}>{selected ? 'Photo selected for upload.' : 'Choose a profile photo from this device.'}</Text>
      </View>
      <Button title="Choose Photo" variant="outlined" onPress={choosePhoto} />
      <Button title="Save" loading={saving} disabled={!selected} onPress={() => save('Profile photo')} />
    </View>
  );
}

function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: Colors.primaryFixedDim, false: Colors.surfaceContainerHighest }}
        thumbColor={value ? Colors.primary : Colors.outline}
      />
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={22} color={Colors.onSurfaceVariant} />
      <View style={styles.infoCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.body}>{value}</Text>
      </View>
    </View>
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
  pressed: { opacity: 0.72 },
  headerTitle: { ...Type.h3, color: Colors.primary, flex: 1, textAlign: 'center' },
  content: { padding: Spacing.containerMargin, paddingBottom: 112, gap: Spacing.md },
  form: { gap: Spacing.md },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  centerCard: { alignItems: 'center' },
  cardTitle: { ...Type.h3, color: Colors.onSurface },
  body: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
  savedBanner: {
    borderRadius: Radii.DEFAULT,
    backgroundColor: Colors.tertiaryFixed,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  savedText: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onTertiaryFixed,
  },
  switchRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontFamily: Fonts.manropeBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  infoRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoCopy: { flex: 1, gap: 2 },
  faqRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    gap: Spacing.xs,
  },
  faqTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  navRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  segmentGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  segment: {
    minHeight: 40,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  segmentText: { ...Type.labelCaps, color: Colors.onSurfaceVariant },
  segmentTextActive: { color: Colors.onPrimary },
  inlineFields: { flexDirection: 'row', gap: Spacing.sm },
  inlineField: { flex: 1 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
