import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Type } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

export default function SellerDashboardStub() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.label}>Seller</Text>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.body}>
          Foundation ready. PROMPT 2 will replace this with the Stitch-driven seller
          dashboard (VSI hero, stats row, recent orders, bottom nav).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  inner: {
    flex: 1,
    padding: Spacing.containerMargin,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  label: { ...Type.labelCaps, color: Colors.primary },
  title: { ...Type.h1, color: Colors.onSurface },
  body: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
});
