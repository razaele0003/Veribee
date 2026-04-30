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

export default function RiderLayout() {
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
        name="job-feed"
        options={{ title: 'Jobs', tabBarIcon: tabIcon('local-shipping') }}
      />
      <Tabs.Screen
        name="active"
        options={{ title: 'Active', tabBarIcon: tabIcon('pending-actions') }}
      />
      <Tabs.Screen
        name="earnings"
        options={{ title: 'Earnings', tabBarIcon: tabIcon('payments') }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Account', tabBarIcon: tabIcon('person') }}
      />
      <Tabs.Screen name="welcome" options={{ href: null }} />
      <Tabs.Screen name="navigation-pickup" options={{ href: null }} />
      <Tabs.Screen name="pickup-confirm" options={{ href: null }} />
      <Tabs.Screen name="navigation-delivery" options={{ href: null }} />
      <Tabs.Screen name="otp-entry" options={{ href: null }} />
      <Tabs.Screen name="delivery-complete" options={{ href: null }} />
      <Tabs.Screen name="job-history" options={{ href: null }} />
      <Tabs.Screen name="vehicle-docs" options={{ href: null }} />
      <Tabs.Screen name="kyc" options={{ href: null }} />
    </Tabs>
  );
}
