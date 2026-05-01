import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore, type Role } from '@/store/authStore';
import { Colors } from '@/constants/colors';
import { Fonts, Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

export default function AuthCallback() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setRoles = useAuthStore((s) => s.setRoles);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);

  useEffect(() => {
    let cancelled = false;

    async function finishOAuth() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user || cancelled) {
        router.replace('/(auth)/login');
        return;
      }

      const { data: roleRows } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const roles = ((roleRows ?? []).map((row: { role: string }) => row.role) as Role[]);
      const resolvedRoles = roles.length > 0 ? roles : (['buyer'] as Role[]);
      const primary = resolvedRoles[0];

      if (roles.length === 0) {
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? 'Veribee User',
          phone: user.phone ?? null,
        });
        await supabase.from('user_roles').upsert({
          user_id: user.id,
          role: primary,
        });
      }

      if (cancelled) return;
      setUser(user.id);
      setRoles(resolvedRoles);
      setActiveRole(primary);

      if (primary === 'seller') router.replace('/(seller)/(tabs)/dashboard');
      else if (primary === 'rider') router.replace('/(rider)/(tabs)/job-feed');
      else router.replace('/(buyer)/(tabs)/home');
    }

    finishOAuth();
    return () => {
      cancelled = true;
    };
  }, [router, setActiveRole, setRoles, setUser]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.title}>Signing you in</Text>
        <Text style={styles.body}>Finishing Google authentication with Supabase.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.containerMargin,
  },
  card: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLowest,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Type.h3,
    color: Colors.onSurface,
  },
  body: {
    fontFamily: Fonts.manropeRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
