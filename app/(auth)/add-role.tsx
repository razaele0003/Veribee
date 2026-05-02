import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';

import { Button } from '@/components/ui/Button';
import {
  captureIdImage,
  evaluateIdImages,
  type CapturedIdImage,
} from '@/lib/idVerification';
import { useAuthStore, Role } from '@/store/authStore';
import { Colors, Shadow } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Radii } from '@/constants/radii';

const ID_TYPES = ['National ID', "Driver's License", 'Passport', 'Postal ID'];

export default function AddRole() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const targetRole = role as Role;
  
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const roles = useAuthStore((s) => s.roles);
  const setRoles = useAuthStore((s) => s.setRoles);
  
  const [selectedIdType, setSelectedIdType] = useState<string>(ID_TYPES[0]);
  const [frontImage, setFrontImage] = useState<CapturedIdImage | null>(null);
  const [backImage, setBackImage] = useState<CapturedIdImage | null>(null);
  
  const [loading, setLoading] = useState(false);
  const idCheck = evaluateIdImages(selectedIdType, frontImage, backImage);

  const onComplete = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 800)); // Simulate upload
    
    const newRoles = roles.includes(targetRole) ? roles : [...roles, targetRole];
    setRoles(newRoles);
    setActiveRole(targetRole);
    
    setLoading(false);
    
    if (targetRole === 'seller') router.replace('/(seller)/(tabs)/dashboard');
    else if (targetRole === 'rider') router.replace('/(rider)/(tabs)/job-feed');
  };

  const roleName = targetRole === 'seller' ? 'Seller' : 'Rider';
  const roleDesc = targetRole === 'seller' 
    ? 'Start managing your inventory and selling to premium customers.' 
    : 'Join our fleet and deliver goods directly to our customers.';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Become a {roleName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.instructionBox}>
             <MaterialIcons name="security" size={48} color={Colors.primary} style={{ marginBottom: Spacing.sm }} />
             <Text style={styles.title}>Identity Verification</Text>
             <Text style={styles.subtitle}>{roleDesc}</Text>
             <Text style={styles.bodyText}>
               To ensure trust and safety across the Veribee platform, we require all our {roleName.toLowerCase()}s to provide a valid government-issued ID. Your data is encrypted and stored securely.
             </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.idTypeLabel}>Choose ID Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.idTypeScroll}>
              {ID_TYPES.map((type) => (
                <Pressable 
                  key={type} 
                  style={[styles.idTypePill, selectedIdType === type && styles.idTypePillActive]}
                  onPress={() => setSelectedIdType(type)}
                >
                  <Text style={[styles.idTypePillText, selectedIdType === type && styles.idTypePillTextActive]}>{type}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.uploadRow}>
                  <Pressable 
                    style={[styles.uploadBoxHalf, frontImage && styles.uploadBoxSuccess]} 
                    onPress={async () => setFrontImage(await captureIdImage())}
                  >
                    <MaterialIcons 
                      name={frontImage ? "check-circle" : "add-photo-alternate"} 
                      size={28} 
                      color={frontImage ? Colors.primary : Colors.onSurfaceVariant} 
                    />
                    <Text style={[styles.uploadBoxText, frontImage && styles.uploadBoxTextSuccess]}>
                      {frontImage ? "Front Captured" : "Upload Front"}
                    </Text>
                  </Pressable>

                  <Pressable 
                    style={[styles.uploadBoxHalf, backImage && styles.uploadBoxSuccess]} 
                    onPress={async () => setBackImage(await captureIdImage())}
                  >
                    <MaterialIcons 
                      name={backImage ? "check-circle" : "add-photo-alternate"} 
                      size={28} 
                      color={backImage ? Colors.primary : Colors.onSurfaceVariant} 
                    />
                    <Text style={[styles.uploadBoxText, backImage && styles.uploadBoxTextSuccess]}>
                      {backImage ? "Back Captured" : "Upload Back"}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.localCheckCard}>
                  <MaterialIcons name="manage-search" size={18} color={Colors.primary} />
                  <View style={styles.localCheckCopy}>
                    <Text style={styles.localCheckTitle}>Free local ID pre-check: {idCheck.score}/100</Text>
                    <Text style={styles.localCheckBody}>
                      {idCheck.status === 'ready_for_review'
                        ? 'Images are ready for manual KYC review.'
                        : 'Capture both ID sides before review.'}
                    </Text>
                  </View>
                </View>

                <Button
                  title="Complete Verification"
                  onPress={onComplete}
                  disabled={idCheck.status !== 'ready_for_review'}
              loading={loading}
              style={{marginTop: Spacing.xl}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { width: 40 },
  headerTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 16,
    color: Colors.onSurface,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  instructionBox: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    ...Shadow.card,
  },
  title: {
    ...Type.h3,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Type.bodyMd,
    fontFamily: Fonts.manropeBold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  bodyText: {
    ...Type.bodySm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: { gap: Spacing.sm },
  idTypeLabel: {
    fontFamily: Fonts.manropeBold,
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  idTypeScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  idTypePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  idTypePillActive: {
    backgroundColor: Colors.primaryFixed,
    borderColor: Colors.primary,
  },
  idTypePillText: {
    fontFamily: Fonts.manropeMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  idTypePillTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.manropeBold,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  uploadBoxHalf: {
    flex: 1,
    height: 120,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  uploadBoxSuccess: {
    backgroundColor: Colors.primaryFixed,
    borderColor: Colors.primary,
    borderStyle: 'solid',
  },
  uploadBoxText: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  uploadBoxTextSuccess: {
    color: Colors.primary,
  },
  localCheckCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  localCheckCopy: { flex: 1 },
  localCheckTitle: {
    fontFamily: Fonts.manropeBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  localCheckBody: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
