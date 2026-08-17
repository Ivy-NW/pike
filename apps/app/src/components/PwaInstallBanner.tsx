import { useCallback, useEffect, useState } from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { canInstallPwa, installPwa } from "@/lib/pwa";
import { useTheme } from "@/theme";

/**
 * PWA-only install banner: appears on web (Android Chrome / desktop Chromium) when the
 * browser is offering to install PIKE to the home screen. Captured via beforeinstallprompt
 * in initPwa(); dismissed until the page reloads. Renders nothing on native.
 */
export function PwaInstallBanner() {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    // beforeinstallprompt fires some time after load; poll briefly for the deferred prompt.
    const id = setInterval(() => {
      if (canInstallPwa()) {
        setVisible(true);
        clearInterval(id);
      }
    }, 1000);
    const timeout = setTimeout(() => clearInterval(id), 20000);
    return () => {
      clearInterval(id);
      clearTimeout(timeout);
    };
  }, []);

  const onInstall = useCallback(async () => {
    await installPwa();
    setVisible(false);
  }, []);

  if (!visible) return null;

  const c = theme.colors;
  const styles = StyleSheet.create({
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.surfaceContainerLow,
      borderRadius: theme.radius.card,
      padding: theme.spacing.stackMd,
      marginBottom: theme.spacing.stackMd,
      borderWidth: 1,
      borderColor: c.primaryContainer,
    },
    text: { ...theme.font(theme.type.bodyMd), color: c.onSurface, flex: 1 },
    iconButton: { padding: 8 },
  });

  return (
    <View style={styles.banner}>
      <MaterialIcons name="install-mobile" size={22} color={c.primary} />
      <Text style={styles.text}>Install PIKE for faster access to your quests and rewards.</Text>
      <TouchableOpacity onPress={onInstall} hitSlop={8} style={styles.iconButton}>
        <MaterialIcons name="download" size={22} color={c.primary} />
      </TouchableOpacity>
    </View>
  );
}