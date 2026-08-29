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

  let backgroundColor = isDark ? "#141314" : c.neumorphSurface;
  let borderColor = isDark ? "rgba(255, 255, 255, 0.05)" : c.neumorphBorder;
  let shadowColor = isDark ? "#000000" : "#a3b1c6";
  let shadowOffset = { width: 5, height: 6 };
  let shadowOpacity = isDark ? 0.75 : 0.45;
  let shadowRadius = 10;
  let elevation = 6;

  if (variant === "inset") {
    backgroundColor = isDark ? "#0e0e0e" : c.neumorphInset;
    borderColor = isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(163, 177, 198, 0.35)";
    shadowOpacity = 0;
    elevation = 0;
  } else if (variant === "flat") {
    shadowOffset = { width: 2, height: 3 };
    shadowOpacity = isDark ? 0.45 : 0.25;
    shadowRadius = 5;
    elevation = 3;
  }

  if (glow === "cyan" || glow === "blue") {
    borderColor = "rgba(0, 240, 255, 0.4)";
    shadowColor = "#00f0ff";
    shadowOpacity = isDark ? 0.45 : 0.3;
    shadowRadius = 14;
  } else if (glow === "gold") {
    borderColor = "rgba(245, 158, 11, 0.45)";
    shadowColor = "#f59e0b";
    shadowOpacity = isDark ? 0.45 : 0.3;
    shadowRadius = 14;
  } else if (glow === "premium") {
    borderColor = "rgba(225, 210, 255, 0.4)";
    shadowColor = "#e1d2ff";
    shadowOpacity = 0.4;
    shadowRadius = 12;
  } else if (glow === "success") {
    borderColor = "rgba(16, 185, 129, 0.4)";
    shadowColor = "#10B981";
    shadowOpacity = 0.4;
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
