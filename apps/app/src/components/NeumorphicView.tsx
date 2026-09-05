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

  let backgroundColor = isDark ? "#0d0d0d" : "#FFFDF8";
  let borderColor = isDark ? "rgba(156, 124, 74, 0.15)" : "rgba(31, 26, 20, 0.08)";
  let shadowColor = isDark ? "#000000" : "#1F1A14";
  let shadowOffset = { width: 0, height: 4 };
  let shadowOpacity = isDark ? 0.75 : 0.08;
  let shadowRadius = 8;
  let elevation = 4;

  if (variant === "inset") {
    backgroundColor = isDark ? "#000000" : "#EDE8DD";
    borderColor = isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(31, 26, 20, 0.06)";
    shadowOpacity = 0;
    elevation = 0;
  } else if (variant === "flat") {
    shadowOffset = { width: 0, height: 2 };
    shadowOpacity = isDark ? 0.35 : 0.05;
    shadowRadius = 4;
    elevation = 2;
  }

  // Glow Variants (PIKE Logo: Smoked Gold & Cobalt Sapphire)
  if (glow === "gold") {
    borderColor = isDark ? "rgba(156, 124, 74, 0.6)" : "rgba(126, 96, 48, 0.45)";
    shadowColor = isDark ? "#9C7C4A" : "#7E6030";
    shadowOpacity = isDark ? 0.45 : 0.18;
    shadowRadius = 12;
  } else if (glow === "blue" || glow === "sapphire" || glow === "cyan") {
    borderColor = isDark ? "rgba(59, 130, 246, 0.6)" : "rgba(29, 78, 216, 0.45)";
    shadowColor = isDark ? "#3b82f6" : "#1d4ed8";
    shadowOpacity = isDark ? 0.45 : 0.18;
    shadowRadius = 12;
  } else if (glow === "premium") {
    borderColor = isDark ? "rgba(183, 154, 94, 0.65)" : "rgba(140, 107, 52, 0.5)";
    shadowColor = isDark ? "#b79a5e" : "#8C6B34";
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
