import React from "react";
import { View, Text, StyleSheet, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { Logo } from "./Logo";
import { NeumorphicView } from "./NeumorphicView";

export function TopNav({
  title,
  subtitle,
  showLogo = true,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  rightAction?: any;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  // Dynamic safe area inset preventing status bar & camera notch collisions on Android / iOS
  const topInset = Math.max(
    insets.top,
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 16
  ) + 8;

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: topInset,
      paddingBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? "#0c0c0e" : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(212, 175, 55, 0.15)" : "rgba(217, 119, 6, 0.12)",
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    title: {
      ...theme.font(theme.type.headlineLgMobile),
      color: c.onSurface,
      fontSize: 22,
      fontWeight: "700",
    },
    subtitle: {
      ...theme.font(theme.type.labelCaps),
      color: isDark ? "#f59e0b" : "#d97706",
      fontSize: 10,
      letterSpacing: 1.2,
      fontWeight: "700",
      marginTop: 2,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    themeToggleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showLogo && <Logo size={32} />}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.actions}>
        {rightAction}

        {/* Day / Night Mode Quantum Neumorphic Toggle */}
        <NeumorphicView
          variant="raised"
          glow="gold"
          radius={20}
          style={styles.themeToggleBtn}
          onPress={theme.toggleTheme}
        >
          <MaterialIcons
            name={isDark ? "wb-sunny" : "nightlight-round"}
            size={20}
            color={isDark ? "#f59e0b" : "#d97706"}
          />
        </NeumorphicView>
      </View>
    </View>
  );
}
