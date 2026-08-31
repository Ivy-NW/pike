import React from "react";
import { View, type ViewStyle, type StyleProp, TouchableOpacity } from "react-native";
import { useTheme } from "@/theme";

export type NeumorphVariant = "raised" | "flat" | "inset" | "pill";
export type NeumorphGlow = "none" | "cyan" | "gold" | "premium" | "blue" | "success";

export interface NeumorphicViewProps {
  children?: any;
  variant?: NeumorphVariant;
  glow?: NeumorphGlow;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
}

export function NeumorphicView({
  children,
  variant = "raised",
  glow = "none",
  radius = 20,
  style,
  onPress,
  activeOpacity = 0.85,
}: NeumorphicViewProps) {
  const theme = useTheme();
  const c = theme.colors;
  const isDark = theme.mode === "dark";

  let backgroundColor = isDark ? "#141314" : "#ffffff";
  let borderColor = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.08)";
  let shadowColor = isDark ? "#000000" : "#94a3b8";
  let shadowOffset = { width: 3, height: 4 };
  let shadowOpacity = isDark ? 0.75 : 0.25;
  let shadowRadius = 8;
  let elevation = 4;

  if (variant === "inset") {
    backgroundColor = isDark ? "#0e0e0e" : "#e8edf5";
    borderColor = isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(148, 163, 184, 0.35)";
    shadowOpacity = 0;
    elevation = 0;
  } else if (variant === "flat") {
    shadowOffset = { width: 1, height: 2 };
    shadowOpacity = isDark ? 0.4 : 0.15;
    shadowRadius = 4;
    elevation = 2;
  }

  // Glow Variants (Sapphire Blue & Imperial Gold from Logo)
  if (glow === "cyan" || glow === "blue") {
    borderColor = isDark ? "rgba(0, 240, 255, 0.5)" : "rgba(29, 78, 216, 0.4)";
    shadowColor = isDark ? "#00f0ff" : "#1d4ed8";
    shadowOpacity = isDark ? 0.45 : 0.25;
    shadowRadius = 12;
  } else if (glow === "gold") {
    borderColor = isDark ? "rgba(245, 158, 11, 0.5)" : "rgba(180, 83, 9, 0.4)";
    shadowColor = isDark ? "#f59e0b" : "#b45309";
    shadowOpacity = isDark ? 0.45 : 0.25;
    shadowRadius = 12;
  } else if (glow === "premium") {
    borderColor = isDark ? "rgba(225, 210, 255, 0.4)" : "rgba(147, 51, 234, 0.35)";
    shadowColor = isDark ? "#e1d2ff" : "#9333ea";
    shadowOpacity = 0.35;
    shadowRadius = 10;
  } else if (glow === "success") {
    borderColor = isDark ? "rgba(16, 185, 129, 0.5)" : "rgba(5, 150, 105, 0.4)";
    shadowColor = isDark ? "#10B981" : "#059669";
    shadowOpacity = 0.35;
    shadowRadius = 10;
  }

  const containerStyle: ViewStyle = {
    backgroundColor,
    borderRadius: radius,
    borderWidth: 1,
    borderColor,
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[containerStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
}
