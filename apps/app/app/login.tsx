import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { setIdentityToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { colors, radius } from "@/theme";

type Mode = "signin" | "signup";

/**
 * FR-1: onboards with the same PIKE account used to claim a WebAR reward — no duplicate
 * signup. Hitting /users/me right after sign-in both confirms the account and pulls back
 * any rewards already claimed under it.
 *
 * PIKE's own auth (username/email + password) — no third-party identity provider.
 */
export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishLogin = async (token: string) => {
    await setIdentityToken(token);
    router.replace("/(tabs)");
  };

  const handleSignin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.signinConsumer({ identifier, password });
      await finishLogin(token);
    } catch (e: any) {
      console.error("[signin]", e?.message ?? e);
      setError("Invalid username/email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.signupConsumer({ phone, username, name, email, password });
      await finishLogin(token);
    } catch (e: any) {
      console.error("[signup]", e?.message ?? e);
      setError("Could not create your account — check your details and try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>PIKE</Text>
      <Text style={styles.subtitle}>
        {mode === "signin" ? "Sign in to your PIKE account." : "Create your PIKE account — same one used to claim rewards."}
      </Text>

      {mode === "signin" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username or email"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryButton}
            disabled={loading || !identifier || !password}
            onPress={handleSignin}
          >
            <Text style={styles.primaryButtonText}>{loading ? "Signing in..." : "Sign in"}</Text>
          </TouchableOpacity>

          <TouchableOpacity disabled={loading} onPress={() => { setMode("signup"); setError(null); }}>
            <Text style={styles.link}>New here? Create an account</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Phone number (e.g. +15551234567)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 8 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryButton}
            disabled={loading || !phone || !username || !name || !email || password.length < 8}
            onPress={handleSignup}
          >
            <Text style={styles.primaryButtonText}>{loading ? "Creating account..." : "Create account"}</Text>
          </TouchableOpacity>

          <TouchableOpacity disabled={loading} onPress={() => { setMode("signin"); setError(null); }}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </>
      )}

      {error && <Text style={{ color: colors.danger, marginTop: 12 }}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.lightGray, justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "700", color: colors.deepSlate, marginBottom: 8 },
  subtitle: { color: "#64748b", marginBottom: 24 },
  input: { backgroundColor: "white", borderRadius: radius, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  primaryButton: { backgroundColor: colors.pikeBlue, borderRadius: radius, padding: 16, alignItems: "center" },
  primaryButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
  link: { color: colors.pikeBlue, textAlign: "center", marginTop: 16 },
});
