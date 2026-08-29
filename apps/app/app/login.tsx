import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { setIdentityToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { useTheme } from "@/theme";
import { Logo } from "@/components/Logo";
import { NeumorphicView } from "@/components/NeumorphicView";

type Mode = "signin" | "signup";

/**
 * FR-1: onboards with the same PIKE account used to claim a WebAR reward.
 * Upgraded with tactile neumorphic surfaces, debossed inputs, and glowing CTAs.
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
  const [showPassword, setShowPassword] = useState(false);
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
      const cleanIdentifier = identifier.trim();
      const { token } = await api.signinConsumer({ identifier: cleanIdentifier, password });
      await finishLogin(token);
    } catch (e: any) {
      console.error("[signin]", e?.message ?? e);
      setError(e?.message ?? "Invalid username/email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.signupConsumer({
        phone: phone.trim(),
        username: username.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await finishLogin(token);
    } catch (e: any) {
      console.error("[signup]", e?.message ?? e);
      setError(e?.message ?? "Could not create your account — check your details and try again");
    } finally {
      setLoading(false);
    }
  };

  const c = theme.colors;
  const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: c.surface, justifyContent: "center", padding: 24 },
    logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
    title: { ...theme.font(theme.type.displayXl), color: c.onSurface, letterSpacing: 1.5 },
    subtitle: { ...theme.font(theme.type.bodyMd), color: c.onSurfaceVariant, marginBottom: 20, marginTop: 4 },
    modeToggleTrack: {
      flexDirection: "row",
      padding: 4,
      marginBottom: 24,
      height: 48,
      alignItems: "center",
    },
    modeToggleItem: {
      flex: 1,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    modeToggleText: {
      ...theme.font(theme.type.labelCaps),
      color: c.onSurfaceVariant,
      fontSize: 11,
      letterSpacing: 1,
    },
    modeToggleTextActive: {
      color: c.primary,
      fontWeight: "700",
    },
    inputWrapper: {
      marginBottom: 14,
      justifyContent: "center",
    },
    input: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: c.onSurface,
      ...theme.font(theme.type.bodyMd),
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: c.onSurface,
      ...theme.font(theme.type.bodyMd),
    },
    eyeButton: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    primaryButton: {
      padding: 16,
      alignItems: "center",
      marginTop: 8,
    },
    primaryButtonText: { ...theme.font(theme.type.headlineSm), color: "#ffffff", letterSpacing: 1 },
    link: { ...theme.font(theme.type.bodyMd), color: c.primary, textAlign: "center", marginTop: 20 },
    error: { ...theme.font(theme.type.bodyMd), color: c.error, marginTop: 14, textAlign: "center" },
  });

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.logoRow}>
        <Logo size={38} />
        <Text style={styles.title}>PIKE</Text>
      </View>
      <Text style={styles.subtitle}>
        {mode === "signin" ? "Sign in to your PIKE vanguard account." : "Create your PIKE account — same one used to claim rewards."}
      </Text>

      {/* Segmented Neumorphic Toggle */}
      <NeumorphicView variant="inset" radius={24} style={styles.modeToggleTrack}>
        <TouchableOpacity
          style={styles.modeToggleItem}
          onPress={() => { setMode("signin"); setError(null); }}
        >
          {mode === "signin" ? (
            <NeumorphicView variant="raised" radius={20} style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
              <Text style={[styles.modeToggleText, styles.modeToggleTextActive]}>SIGN IN</Text>
            </NeumorphicView>
          ) : (
            <Text style={styles.modeToggleText}>SIGN IN</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeToggleItem}
          onPress={() => { setMode("signup"); setError(null); }}
        >
          {mode === "signup" ? (
            <NeumorphicView variant="raised" radius={20} style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
              <Text style={[styles.modeToggleText, styles.modeToggleTextActive]}>CREATE ACCOUNT</Text>
            </NeumorphicView>
          ) : (
            <Text style={styles.modeToggleText}>CREATE ACCOUNT</Text>
          )}
        </TouchableOpacity>
      </NeumorphicView>

      {mode === "signin" ? (
        <>
          <NeumorphicView variant="inset" radius={16} style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Username or email"
              placeholderTextColor={c.onSurfaceVariant}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />
          </NeumorphicView>

          <NeumorphicView variant="inset" radius={16} style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={c.onSurfaceVariant}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={c.onSurfaceVariant}
              />
            </TouchableOpacity>
          </NeumorphicView>

          <NeumorphicView
            variant="raised"
            glow="blue"
            radius={20}
            style={[styles.primaryButton, (loading || !identifier || !password) && { opacity: 0.6 }]}
            onPress={loading || !identifier || !password ? undefined : handleSignin}
          >
            <Text style={styles.primaryButtonText}>{loading ? "SIGNING IN..." : "SIGN IN"}</Text>
          </NeumorphicView>

          <TouchableOpacity disabled={loading} onPress={() => { setMode("signup"); setError(null); }}>
            <Text style={styles.link}>New here? Create an account</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <NeumorphicView variant="inset" radius={16} style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Phone number (e.g. +15551234567)"
              placeholderTextColor={c.onSurfaceVariant}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </NeumorphicView>
          <NeumorphicView variant="inset" radius={16} style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="Username" placeholderTextColor={c.onSurfaceVariant} value={username} onChangeText={setUsername} autoCapitalize="none" />
          </NeumorphicView>
          <NeumorphicView variant="inset" radius={16} style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={c.onSurfaceVariant} value={name} onChangeText={setName} />
          </NeumorphicView>
          <NeumorphicView variant="inset" radius={16} style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={c.onSurfaceVariant}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </NeumorphicView>

          <NeumorphicView variant="inset" radius={16} style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password (min 8 characters)"
              placeholderTextColor={c.onSurfaceVariant}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={c.onSurfaceVariant}
              />
            </TouchableOpacity>
          </NeumorphicView>

          <NeumorphicView
            variant="raised"
            glow="blue"
            radius={20}
            style={[styles.primaryButton, (loading || !phone || !username || !name || !email || password.length < 8) && { opacity: 0.6 }]}
            onPress={loading || !phone || !username || !name || !email || password.length < 8 ? undefined : handleSignup}
          >
            <Text style={styles.primaryButtonText}>{loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</Text>
          </NeumorphicView>

          <TouchableOpacity disabled={loading} onPress={() => { setMode("signin"); setError(null); }}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}
