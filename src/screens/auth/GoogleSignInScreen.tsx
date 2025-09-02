import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { APP_SCHEME } from '../../config/env';

export default function GoogleSignInScreen() {
  const [loading, setLoading] = useState(false);

  const onGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${APP_SCHEME}://auth/callback`,
        },
      });
      if (error) throw error;
      // Browser opens; AuthCallbackScreen will handle exchange when it returns
    } catch (e: any) {
      Alert.alert('Google Sign-in failed', e?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign in with Google</Text>
      <TouchableOpacity style={styles.button} onPress={onGoogleSignIn} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue with Google</Text>}
      </TouchableOpacity>
      <Text style={styles.note}>If nothing happens, ensure the redirect URL beforepeak://auth/callback is added in Supabase > Authentication > URL Configuration.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  button: { backgroundColor: '#7C3AED', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  note: { color: '#6B7280', marginTop: 12, fontSize: 12 },
});
