import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { signInWithGoogle, signInWithPhone } from "@/lib/firebase";
import { setIdentityToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { colors, radius } from "@/theme";

/**
 * FR-1: onboards with the same phone number / social login used to claim a WebAR reward —
 * no duplicate signup. Hitting /users/me right after sign-in both creates the account
 * (if new) and pulls back any rewards already claimed via WebAR under this identity.
 */
export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishLogin = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      await setIdentityToken(token);
      await api.me();
      router.replace("/(tabs)");
    } catch {
      setError("Could not sign in — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PIKE</Text>
      <Text style={styles.subtitle}>Sign in with the same phone or social login you used to claim a reward.</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity
        style={styles.primaryButton}
        disabled={loading || !phone}
        onPress={() => signInWithPhone(phone).then(finishLogin)}
      >
        <Text style={styles.primaryButtonText}>{loading ? "Signing in..." : "Continue with phone"}</Text>
      </TouchableOpacity>

      <TouchableOpacity disabled={loading} onPress={() => signInWithGoogle().then(finishLogin)}>
        <Text style={styles.link}>or continue with Google</Text>
      </TouchableOpacity>

      {error && <Text style={{ color: colors.danger, marginTop: 12 }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray, justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "700", color: colors.deepSlate, marginBottom: 8 },
  subtitle: { color: "#64748b", marginBottom: 24 },
  input: { backgroundColor: "white", borderRadius: radius, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  primaryButton: { backgroundColor: colors.pikeBlue, borderRadius: radius, padding: 16, alignItems: "center" },
  primaryButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
  link: { color: colors.pikeBlue, textAlign: "center", marginTop: 16 },
});
