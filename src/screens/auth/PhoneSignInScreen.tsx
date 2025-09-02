import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, TextInput, Button, View, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function PhoneSignInScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone) return Alert.alert('錯誤', '請輸入電話號碼');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) return Alert.alert('發送失敗', error.message);
    setSent(true);
  };

  const verifyOtp = async () => {
    if (!otp) return Alert.alert('錯誤', '請輸入驗證碼');
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    setLoading(false);
    if (error) return Alert.alert('驗證失敗', error.message);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>電話登入</Text>
      <TextInput style={styles.input} placeholder="Phone e.g. +85212345678" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      {!sent ? (
        <Button title={loading ? '發送中...' : '發送驗證碼'} onPress={sendOtp} disabled={loading} />
      ) : (
        <View>
          <TextInput style={styles.input} placeholder="驗證碼" keyboardType="number-pad" value={otp} onChangeText={setOtp} />
          <Button title={loading ? '驗證中...' : '驗證'} onPress={verifyOtp} disabled={loading} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12 },
});

