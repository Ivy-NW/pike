import React from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { Logo } from "./Logo";
import { NeumorphicView } from "./NeumorphicView";

import { router } from "expo-router";

interface TopNavProps {
  title?: string;
  showLogo?: boolean;
  subtitle?: string;
  rightAction?: React.ReactElement | null;
}

export function TopNav({ title = "PIKE", showLogo = true, subtitle, rightAction }: TopNavProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const topPadding = Platform.OS === "web" ? 14 : Math.max(insets.top, 14) + 4;

  const handleNotificationPress = () => {
    router.push("/notifications");
  };

  const styles = StyleSheet.create({
    header: {
      backgroundColor: isDark ? "#141314" : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.04)",
      paddingTop: topPadding,
      paddingBottom: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 100,
      shadowColor: isDark ? "#000000" : "#a3b1c6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    titleCol: {
      justifyContent: "center",
    },
    title: {
      ...theme.font(theme.type.headlineLgMobile),
      color: c.primary,
      fontWeight: "700",
      letterSpacing: -0.5,
      fontSize: 22,
    },
    subtitle: {
      ...theme.font(theme.type.labelSm),
      color: "#00dbe9",
      fontSize: 11,
      marginTop: 1,
    },
    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    bellButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showLogo ? <Logo size={26} /> : null}
        <View style={styles.titleCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.right}>
        {rightAction ? rightAction : (
          <NeumorphicView
            variant="raised"
            radius={19}
            style={styles.bellButton}
            onPress={handleNotificationPress}
          >
            <MaterialIcons name="notifications-none" size={20} color={c.primary} />
          </NeumorphicView>
        )}
      </View>
    </View>
  );
}
