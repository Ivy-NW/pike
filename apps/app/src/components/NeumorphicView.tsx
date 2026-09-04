import React from "react";
import { View, type ViewStyle, type StyleProp, TouchableOpacity } from "react-native";
import { useTheme } from "@/theme";

export type NeumorphVariant = "raised" | "flat" | "inset" | "pill";
export type NeumorphGlow = "none" | "gold" | "blue" | "sapphire" | "premium" | "success" | "cyan";

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

  let backgroundColor = isDark ? "#141417" : "#ffffff";
  let borderColor = isDark ? "rgba(212, 175, 55, 0.15)" : "rgba(15, 23, 42, 0.08)";
  let shadowColor = isDark ? "#000000" : "#0f172a";
  let shadowOffset = { width: 0, height: 4 };
  let shadowOpacity = isDark ? 0.75 : 0.08;
  let shadowRadius = 8;
  let elevation = 4;

  if (variant === "inset") {
    backgroundColor = isDark ? "#0a0a0c" : "#e8edf5";
    borderColor = isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(15, 23, 42, 0.06)";
    shadowOpacity = 0;
    elevation = 0;
  } else if (variant === "flat") {
    shadowOffset = { width: 0, height: 2 };
    shadowOpacity = isDark ? 0.35 : 0.05;
    shadowRadius = 4;
    elevation = 2;
  }

  // Glow Variants (PIKE Logo: Imperial Gold & Cobalt Sapphire)
  if (glow === "gold") {
    borderColor = isDark ? "rgba(245, 158, 11, 0.6)" : "rgba(180, 83, 9, 0.45)";
    shadowColor = isDark ? "#f59e0b" : "#b45309";
    shadowOpacity = isDark ? 0.45 : 0.18;
    shadowRadius = 12;
  } else if (glow === "blue" || glow === "sapphire" || glow === "cyan") {
    borderColor = isDark ? "rgba(59, 130, 246, 0.6)" : "rgba(29, 78, 216, 0.45)";
    shadowColor = isDark ? "#3b82f6" : "#1d4ed8";
    shadowOpacity = isDark ? 0.45 : 0.18;
    shadowRadius = 12;
  } else if (glow === "premium") {
    borderColor = isDark ? "rgba(245, 158, 11, 0.65)" : "rgba(180, 83, 9, 0.5)";
    shadowColor = isDark ? "#d4af37" : "#b45309";
    shadowOpacity = 0.35;
    shadowRadius = 10;
  } else if (glow === "success") {
    borderColor = isDark ? "rgba(16, 185, 129, 0.6)" : "rgba(5, 150, 105, 0.45)";
    shadowColor = isDark ? "#10B981" : "#059669";
    shadowOpacity = 0.3;
    shadowRadius = 8;
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
