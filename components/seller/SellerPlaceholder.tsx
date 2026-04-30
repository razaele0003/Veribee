import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Type } from '@/constants/typography';

type Props = {
  title: string;
  body: string;
};

export function SellerPlaceholder({ title, body }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
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
  title: { ...Type.h2, color: Colors.onSurface },
  body: { ...Type.bodyMd, color: Colors.onSurfaceVariant },
});
