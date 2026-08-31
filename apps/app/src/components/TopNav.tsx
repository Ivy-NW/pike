import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? "#0c0c0e" : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(212, 175, 55, 0.12)" : "rgba(15, 23, 42, 0.06)",
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
      color: isDark ? "#f59e0b" : "#1d4ed8",
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
          glow={isDark ? "gold" : "blue"}
          radius={20}
          style={styles.themeToggleBtn}
          onPress={theme.toggleTheme}
        >
          <MaterialIcons
            name={isDark ? "wb-sunny" : "nightlight-round"}
            size={20}
            color={isDark ? "#f59e0b" : "#1d4ed8"}
          />
        </NeumorphicView>
      </View>
    </View>
  );
}
