import { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getIdentityToken } from "@/lib/auth";
import { useTheme } from "@/theme";
import { NeumorphicView } from "@/components/NeumorphicView";

interface TabConfig {
  name: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const TABS: TabConfig[] = [
  { name: "index", label: "Home", icon: "home" },
  { name: "map", label: "Explore", icon: "map" },
  { name: "quests", label: "Quests", icon: "explore" },
  { name: "rewards", label: "Rewards", icon: "military-tech" },
  { name: "profile", label: "Profile", icon: "person" },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const isDark = theme.mode === "dark";
  const c = theme.colors;

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 16,
      left: 16,
      right: 16,
      backgroundColor: isDark ? "rgba(18, 18, 21, 0.96)" : "#ffffff",
      borderRadius: 28,
      height: 68,
      paddingHorizontal: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      borderWidth: 1,
      borderColor: isDark ? "rgba(212, 175, 55, 0.2)" : "rgba(217, 119, 6, 0.2)",
      shadowColor: isDark ? "#000000" : "#0f172a",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.75 : 0.12,
      shadowRadius: 14,
      elevation: 10,
    },
    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
    activeWell: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    inactiveContainer: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = TABS.find((t) => t.name === route.name) ?? {
          name: route.name,
          label: route.name,
          icon: "radio-button-unchecked" as any,
        };

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.tabButton}
          >
            {isFocused ? (
              <NeumorphicView
                variant="inset"
                glow="gold"
                radius={16}
                style={styles.activeWell}
              >
                <MaterialIcons
                  name={tab.icon}
                  size={24}
                  color={isDark ? "#f59e0b" : "#d97706"}
                />
              </NeumorphicView>
            ) : (
              <View style={styles.inactiveContainer}>
                <MaterialIcons
                  name={tab.icon}
                  size={24}
                  color={isDark ? "#71717a" : "#64748b"}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getIdentityToken().then(setToken);
  }, []);

  if (token === undefined) return null;
  if (token === null) return <Redirect href="/login" />;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Explore" }} />
      <Tabs.Screen name="quests" options={{ title: "Quests" }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
