import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, TextInput, Button, View, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function EmailSignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const onSignIn = async () => {
    if (!email || !password) return Alert.alert('Error', 'Enter email and password');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return Alert.alert('Sign in failed', error.message);
  };

  const onSignUp = async () => {
    if (!email || !password) return Alert.alert('Error', 'Enter email and password');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'beforepeak://auth/callback' } });
    setLoading(false);
    if (error) return Alert.alert('Sign up failed', error.message);
    Alert.alert('Check your email', 'We sent you a confirmation link to complete sign up.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Sign In with Email'}</Text>
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <View style={{ height: 12 }} />
      {isSignUp ? (
        <Button title={loading ? 'Creating...' : 'Sign Up'} onPress={onSignUp} disabled={loading} />
      ) : (
        <Button title={loading ? 'Signing in...' : 'Sign In'} onPress={onSignIn} disabled={loading} />
      )}
      <TouchableOpacity onPress={() => setIsSignUp(s => !s)} style={{ marginTop: 12, alignSelf: 'center' }}>
        <Text style={{ color: '#7C3AED', fontWeight: '600' }}>{isSignUp ? 'Have an account? Sign In' : "Don't have an account? Sign Up"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12 },
});

