import { useEffect, useState } from "react";
import { Redirect, Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getIdentityToken } from "@/lib/auth";
import { useTheme } from "@/theme";

export default function TabsLayout() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    getIdentityToken().then((token) => {
      setAuthed(Boolean(token));
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!authed) return <Redirect href="/login" />;

  // 5-icon bottom nav per UI doc section 4.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceContainerLow,
          borderTopColor: theme.colors.surfaceContainerHighest,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { ...theme.font(theme.type.labelSm), marginBottom: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <MaterialIcons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="map" options={{ title: "Explore", tabBarIcon: ({ color, size }) => <MaterialIcons name="map" color={color} size={size} /> }} />
      <Tabs.Screen name="quests" options={{ title: "Quests", tabBarIcon: ({ color, size }) => <MaterialIcons name="explore" color={color} size={size} /> }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards", tabBarIcon: ({ color, size }) => <MaterialIcons name="card-giftcard" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
