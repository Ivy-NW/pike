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

  // 5-icon floating bottom nav dock with Neumorphic elevation.
  const isDark = theme.mode === "dark";
  const c = theme.colors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.onSurfaceVariant,
        tabBarStyle: {
          position: "absolute",
          bottom: 14,
          left: 14,
          right: 14,
          backgroundColor: isDark ? "rgba(19, 27, 46, 0.95)" : "rgba(233, 240, 252, 0.95)",
          borderRadius: 24,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderWidth: 1,
          borderColor: c.neumorphBorder,
          shadowColor: isDark ? "#000000" : "#a3b1c6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.6 : 0.25,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarLabelStyle: { ...theme.font(theme.type.labelSm), fontSize: 10, marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <MaterialIcons name="home" color={color} size={size + 2} /> }} />
      <Tabs.Screen name="map" options={{ title: "Explore", tabBarIcon: ({ color, size }) => <MaterialIcons name="map" color={color} size={size + 2} /> }} />
      <Tabs.Screen name="quests" options={{ title: "Quests", tabBarIcon: ({ color, size }) => <MaterialIcons name="explore" color={color} size={size + 2} /> }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards", tabBarIcon: ({ color, size }) => <MaterialIcons name="card-giftcard" color={color} size={size + 2} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size + 2} /> }} />
    </Tabs>
  );
}
