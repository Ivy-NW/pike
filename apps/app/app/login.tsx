import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { setIdentityToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { Logo } from "@/components/Logo";

type Mode = "signin" | "signup";

/**
 * FR-1: onboards with the same PIKE account used to claim a WebAR reward — no duplicate
 * signup. Hitting /users/me right after sign-in both confirms the account and pulls back
 * any rewards already claimed under it.
 *
 * PIKE's own auth (username/email + password) — no third-party identity provider, so this
 * doesn't need the social-login buttons shown in docs/ui designs/business_login.html (that
 * mockup's Google/Phone buttons don't correspond to anything the API implements).
 */
export default function LoginScreen() {
  const theme = useTheme();
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

  const c = theme.colors;
  const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: c.surface, justifyContent: "center", padding: 24 },
    logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
    title: { ...theme.font(theme.type.displayXl), color: c.onSurface },
    subtitle: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginBottom: 24, marginTop: 8 },
    input: {
      backgroundColor: c.surfaceContainerLow,
      borderRadius: theme.radius.card,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.borderStrong,
      color: c.onSurface,
      ...theme.font(theme.type.bodyMd),
    },
    primaryButton: { backgroundColor: c.primaryContainer, borderRadius: theme.radius.card, padding: 16, alignItems: "center" },
    primaryButtonText: { ...theme.font(theme.type.headlineSm), color: c.onPrimaryContainer },
    link: { ...theme.font(theme.type.bodyMd), color: c.primary, textAlign: "center", marginTop: 16 },
    error: { color: c.error, marginTop: 12 },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoRow}>
        <Logo size={36} />
        <Text style={styles.title}>PIKE</Text>
      </View>
      <Text style={styles.subtitle}>
        {mode === "signin" ? "Sign in to your PIKE account." : "Create your PIKE account — same one used to claim rewards."}
      </Text>

      {mode === "signin" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username or email"
            placeholderTextColor={c.onSurfaceVariant}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={c.onSurfaceVariant}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryButton, (loading || !identifier || !password) && { opacity: 0.6 }]}
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
            placeholderTextColor={c.onSurfaceVariant}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput style={styles.input} placeholder="Username" placeholderTextColor={c.onSurfaceVariant} value={username} onChangeText={setUsername} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={c.onSurfaceVariant} value={name} onChangeText={setName} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={c.onSurfaceVariant}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 8 characters)"
            placeholderTextColor={c.onSurfaceVariant}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryButton, (loading || !phone || !username || !name || !email || password.length < 8) && { opacity: 0.6 }]}
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

      {error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}
