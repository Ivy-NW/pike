import React from "react";
import { Text, type TextProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/theme";

/**
 * docs/pike_ui_design.md §2: "keep gold exclusive to rewards... enforced at
 * the component level (e.g. a <RewardAccent> wrapper that's the only place
 * gold is allowed to render)". React Native has no CSS `color: inherit`
 * cascade, so unlike the web apps' `.reward-accent` class, this can't be a
 * plain wrapping View -- text/icon color has to be set directly. These are
 * the only sanctioned call sites for gold as a text/icon color: XP amounts,
 * wallet balances, badge names/labels. `NeumorphicView accent="reward"`
 * remains the mechanism for gold glow/border on cards.
 */
export function useRewardColor(): string {
  return useTheme().colors.primary;
}

export function RewardText({ style, ...props }: TextProps) {
  const color = useRewardColor();
  return <Text {...props} style={[{ color }, style]} />;
}

export function RewardIcon({
  name,
  size = 20,
}: {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  size?: number;
}) {
  const color = useRewardColor();
  return <MaterialIcons name={name} size={size} color={color} />;
}
