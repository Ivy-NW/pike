import React, { ReactNode } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { Logo } from "./Logo";

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

  const topPadding = Platform.OS === "web" ? 16 : Math.max(insets.top, 16) + 6;

  const styles = StyleSheet.create({
    header: {
      backgroundColor: theme.mode === "dark" ? c.surfaceContainerLowest : c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.neumorphBorder,
      paddingTop: topPadding,
      paddingBottom: 14,
      paddingHorizontal: theme.spacing.containerPadding,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 100,
      shadowColor: theme.mode === "dark" ? "#000000" : "#a3b1c6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.mode === "dark" ? 0.45 : 0.15,
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
      letterSpacing: 1.5,
    },
    subtitle: {
      ...theme.font(theme.type.labelSm),
      color: c.onSurfaceVariant,
      marginTop: 2,
    },
    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showLogo ? <Logo size={28} /> : null}
        <View style={styles.titleCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightAction ? <View style={styles.right}>{rightAction as any}</View> : null}
    </View>
  );
}
