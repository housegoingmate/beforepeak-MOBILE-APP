import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { verifyPayMePayment } from '../services/PaymentService';

export default function PaymentResultScreen() {
  const route = useRoute<any>();
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    const run = async () => {
      try {
        const query = (route.params || {}) as Record<string, string>;
        const res = await verifyPayMePayment(query);
        setStatus(res?.status === 'succeeded' ? 'success' : 'failed');
      } catch (e: any) {
        setStatus('failed');
        Alert.alert('支付驗證失敗', e?.message || '');
      }
    };
    run();
  }, [route.params]);

  if (status === 'pending') return (
    <ScrollView contentContainerStyle={styles.container}><ActivityIndicator /></ScrollView>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{status === 'success' ? '支付成功' : '支付失敗'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
});

