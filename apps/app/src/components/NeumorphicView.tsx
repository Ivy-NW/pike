import React from "react";
import { View, type ViewStyle, type StyleProp, TouchableOpacity } from "react-native";
import { useTheme, RADIUS_CARD } from "@/theme";

export type NeumorphVariant = "raised" | "flat" | "inset" | "pill";

/**
 * Intent-based accent, not a raw color name (docs/pike_ui_design.md §2's
 * gold-discipline rule: a caller must declare *why* it wants an accent, not
 * just pick "gold"/"blue" and possibly get it backwards).
 * - "action" -- Pike Blue, the interactive/primary color.
 * - "reward" -- Pike Gold, reward/XP/badge/VIP moments only.
 * - "success" -- unchanged, quest-completed/positive-state green.
 */
export type NeumorphAccent = "none" | "action" | "reward" | "success";

export interface NeumorphicViewProps {
  children?: any;
  variant?: NeumorphVariant;
  accent?: NeumorphAccent;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
}

export function NeumorphicView({
  children,
  variant = "raised",
  accent = "none",
  radius = RADIUS_CARD,
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

  // Accent variants (PIKE: Pike Blue = action, Smoked Gold = reward-only)
  if (accent === "reward") {
    borderColor = isDark ? "rgba(156, 124, 74, 0.6)" : "rgba(126, 96, 48, 0.45)";
    shadowColor = isDark ? "#9C7C4A" : "#7E6030";
    shadowOpacity = isDark ? 0.45 : 0.18;
    shadowRadius = 12;
  } else if (accent === "action") {
    borderColor = isDark ? "rgba(59, 130, 246, 0.6)" : "rgba(29, 78, 216, 0.45)";
    shadowColor = isDark ? "#3b82f6" : "#1d4ed8";
    shadowOpacity = isDark ? 0.45 : 0.18;
    shadowRadius = 12;
  } else if (accent === "success") {
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
