import React from 'react';
import { ScrollView, Text, StyleSheet, Button, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>歡迎使用 BeforePeak</Text>
      <Text style={styles.subtitle}>登入或註冊以繼續</Text>
      <View style={styles.actions}>
        <Button title="電郵登入" onPress={() => navigation.navigate('EmailSignIn')} />
        <View style={{ height: 8 }} />
        <Button title="電話登入" onPress={() => navigation.navigate('PhoneSignIn')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6B7280', marginBottom: 16 },
  actions: { maxWidth: 320 },
});

