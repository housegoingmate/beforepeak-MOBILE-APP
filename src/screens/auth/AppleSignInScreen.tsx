import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export default function AppleSignInScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Apple 登入</Text>
      <Text style={styles.subtitle}>稍後會連接 Apple OAuth</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6B7280' },
});

