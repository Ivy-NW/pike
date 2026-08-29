import React from "react";
import { View, type ViewStyle, type StyleProp, TouchableOpacity } from "react-native";
import { useTheme } from "@/theme";

export type NeumorphVariant = "raised" | "flat" | "inset" | "pill";
export type NeumorphGlow = "none" | "blue" | "gold" | "success";

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

  let backgroundColor = c.neumorphSurface;
  let borderColor = c.neumorphBorder;
  let shadowColor = isDark ? "#000000" : "#a3b1c6";
  let shadowOffset = { width: 4, height: 5 };
  let shadowOpacity = isDark ? 0.65 : 0.45;
  let shadowRadius = 8;
  let elevation = 6;

  if (variant === "inset") {
    backgroundColor = c.neumorphInset;
    borderColor = isDark ? "rgba(0, 0, 0, 0.45)" : "rgba(163, 177, 198, 0.35)";
    shadowOpacity = 0;
    elevation = 0;
  } else if (variant === "flat") {
    shadowOffset = { width: 2, height: 3 };
    shadowOpacity = isDark ? 0.4 : 0.25;
    shadowRadius = 5;
    elevation = 3;
  }

  if (glow === "blue") {
    borderColor = isDark ? "rgba(79, 70, 229, 0.4)" : "rgba(37, 99, 235, 0.3)";
    shadowColor = isDark ? "#2563eb" : "#3b82f6";
    shadowOpacity = isDark ? 0.35 : 0.25;
    shadowRadius = 12;
  } else if (glow === "gold") {
    borderColor = isDark ? "rgba(245, 158, 11, 0.45)" : "rgba(238, 152, 0, 0.35)";
    shadowColor = "#f59e0b";
    shadowOpacity = isDark ? 0.4 : 0.3;
    shadowRadius = 12;
  } else if (glow === "success") {
    borderColor = "rgba(16, 185, 129, 0.4)";
    shadowColor = "#10B981";
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
