import { useEffect, useState } from "react";
import { Redirect, Tabs } from "expo-router";
import { getIdentityToken } from "@/lib/auth";
import { colors } from "@/theme";

export default function TabsLayout() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    getIdentityToken().then((token) => {
      setAuthed(Boolean(token));
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!authed) return <Redirect href="/login" />;

  // 5-icon bottom nav per UI doc section 4; Map is a Phase 2/3 discovery feature (venue
  // browsing ties to the macro-quest/leaderboard mechanic) so it's not wired up yet.
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.pikeBlue }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="quests" options={{ title: "Quests" }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
