import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors, Radius } from "../../constants/theme";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
    setLoading(false);
    if (error) Alert.alert("Login Failed", error.message);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>
            IRON<Text style={styles.logoAccent}>FORGE</Text>
          </Text>
          <Text style={styles.logoSub}>Member Portal</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={Colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          IronForge Gym Management · Members Only
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 4,
    color: Colors.text,
  },
  logoAccent: {
    color: Colors.accent,
  },
  logoSub: {
    fontSize: 13,
    color: Colors.text2,
    letterSpacing: 2,
    marginTop: 4,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text2,
    marginBottom: 24,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text2,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: Colors.card2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border2,
    paddingHorizontal: 14,
    color: Colors.text,
    fontSize: 15,
  },
  btn: {
    height: 50,
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  footer: {
    textAlign: "center",
    color: Colors.muted,
    fontSize: 12,
    marginTop: 32,
  },
});
