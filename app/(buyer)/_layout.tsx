import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Type } from '@/constants/typography';
import { Radii } from '@/constants/radii';
import { Spacing } from '@/constants/spacing';

type TabIcon = keyof typeof MaterialIcons.glyphMap;

const tabIcon = (name: TabIcon) =>
  function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <MaterialIcons name={name} size={size} color={color} />;
  };

export default function BuyerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarActiveBackgroundColor: Colors.primaryFixed,
        tabBarStyle: {
          minHeight: 64,
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopColor: Colors.outlineVariant,
          borderTopWidth: 1,
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
          ...Type.labelCaps,
          fontSize: 10,
          lineHeight: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: tabIcon('home') }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Search', tabBarIcon: tabIcon('search') }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Orders', tabBarIcon: tabIcon('receipt-long') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person') }}
      />
      <Tabs.Screen name="product/[id]" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="order-tracking/[id]" options={{ href: null }} />
      <Tabs.Screen name="otp-handover" options={{ href: null }} />
      <Tabs.Screen name="delivery-confirmed" options={{ href: null }} />
      <Tabs.Screen name="rate-experience" options={{ href: null }} />
      <Tabs.Screen name="dispute" options={{ href: null }} />
    </Tabs>
  );
}
