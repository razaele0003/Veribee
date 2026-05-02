import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@/components/ui/MaterialIcons';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

type TabIcon = keyof typeof MaterialIcons.glyphMap;

const tabIcon = (name: TabIcon) =>
  function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <MaterialIcons name={name} size={size} color={color} />;
  };

export default function BuyerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarStyle: {
          minHeight: 64,
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopColor: Colors.outlineVariant,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: Spacing.xs,
          paddingBottom: Spacing.xs,
        },
        tabBarItemStyle: {
          minHeight: 52,
          borderRadius: Radii.DEFAULT,
          marginVertical: Spacing.xs,
          marginHorizontal: Spacing.xs,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.manropeBold,
          fontSize: 10,
          lineHeight: 14,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: tabIcon('shopping-cart') }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: tabIcon('receipt-long') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}
