import { Image } from "react-native";

/** Brand mark — transparent PNG, holds up on both light/dark surfaces (see apps/web/src/components/Logo.tsx). */
export function Logo({ size = 28 }: { size?: number }) {
  return <Image source={require("../../assets/logo.png")} style={{ width: size, height: size }} accessibilityElementsHidden />;
}
