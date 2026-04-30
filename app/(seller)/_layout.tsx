import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Type } from '@/constants/typography';

type TabIcon = keyof typeof MaterialIcons.glyphMap;

const tabIcon = (name: TabIcon) =>
  function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <MaterialIcons name={name} size={size} color={color} />;
  };

export default function SellerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopColor: Colors.outlineVariant,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          ...Type.labelCaps,
          fontSize: 10,
          lineHeight: 12,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: tabIcon('dashboard') }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Orders', tabBarIcon: tabIcon('receipt-long') }}
      />
      <Tabs.Screen
        name="products"
        options={{ title: 'Products', tabBarIcon: tabIcon('inventory') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person') }}
      />
    </Tabs>
  );
}
