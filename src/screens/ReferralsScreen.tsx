import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Share, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { getMyReferral, createMyReferral } from '../services/ReferralsService';

export default function ReferralsScreen() {
  const { userId, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referral, setReferral] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      try {
        let data = await getMyReferral(userId);
        if (!data) {
          data = await createMyReferral(userId);
        }
        setReferral(data);
      } catch (e) {
        console.warn('referral error', e);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) run();
  }, [authLoading, userId]);

  const onShare = async () => {
    if (!referral?.code) return;
    try {
      await Share.share({
        message: `使用我的推薦碼 ${referral.code} 在 BeforePeak 預訂餐廳，享受 50% 非繁忙時段優惠！我們都會獲得獎賞！`,
        title: 'BeforePeak 推薦碼',
      });
    } catch (e) {
      console.warn('share error', e);
    }
  };

  if (authLoading || loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>推薦朋友</Text>
      <Text style={styles.subtitle}>分享 BeforePeak，與朋友一齊享受餐飲優惠</Text>

      {referral && (
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>你的推薦碼</Text>
          <Text style={styles.code}>{referral.code}</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
            <Text style={styles.shareBtnText}>分享推薦碼</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>如何運作</Text>
        <Text style={styles.text}>• 分享你的推薦碼給朋友</Text>
        <Text style={styles.text}>• 朋友首次預訂成功後，你和朋友都會獲得獎賞</Text>
        <Text style={styles.text}>• 獎賞會以帳戶積分形式發放</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>獎賞詳情</Text>
        <Text style={styles.text}>• 你：HK$20 帳戶積分</Text>
        <Text style={styles.text}>• 朋友：首次預訂 10% 額外折扣</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6B7280', marginBottom: 16 },
  codeCard: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 20, marginBottom: 16, alignItems: 'center' },
  codeLabel: { color: '#E9D5FF', fontSize: 14, marginBottom: 8 },
  code: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', letterSpacing: 2, marginBottom: 16 },
  shareBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  shareBtnText: { color: '#7C3AED', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  text: { color: '#374151', marginBottom: 4 },
});

