import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Radius } from '../../constants/theme';

export default function SetPasswordScreen() {
  const router = useRouter();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);

  async function handleSetPassword() {
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password set successfully!', [
        { text: 'OK', onPress: () => router.replace('/(member)') },
      ]);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.container}
    >
      <View style={s.inner}>
        <View style={s.logoWrap}>
          <Text style={s.logo}>IRON<Text style={s.logoAccent}>FORGE</Text></Text>
          <Text style={s.logoSub}>Set Your Password</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Create Password</Text>
          <Text style={s.subtitle}>Set a password for your account</Text>

          <View style={s.fieldWrap}>
            <Text style={s.label}>New Password</Text>
            <TextInput
              style={s.input}
              placeholder="Min 6 characters"
              placeholderTextColor={Colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Confirm Password</Text>
            <TextInput
              style={s.input}
              placeholder="Repeat password"
              placeholderTextColor={Colors.muted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleSetPassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={s.btnText}>Set Password</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.bg },
  inner:      { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap:   { alignItems: 'center', marginBottom: 40 },
  logo:       { fontSize: 36, fontWeight: '900', letterSpacing: 4, color: Colors.text },
  logoAccent: { color: Colors.accent },
  logoSub:    { fontSize: 13, color: Colors.text2, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' },
  card:       { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 24 },
  title:      { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle:   { fontSize: 14, color: Colors.text2, marginBottom: 24 },
  fieldWrap:  { marginBottom: 16 },
  label:      { fontSize: 11, fontWeight: '700', color: Colors.text2, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  input:      { height: 46, backgroundColor: Colors.card2, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, color: Colors.text, fontSize: 15 },
  btn:        { height: 50, backgroundColor: Colors.accent, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnDisabled:{ opacity: 0.6 },
  btnText:    { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
});
