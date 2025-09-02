import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, Button, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { createBooking } from '../services/BookingService';
import { useStripe } from '@stripe/stripe-react-native';
import { createPaymentSheetSession } from '../services/StripeService';

function bookingFeeHKD(partySize: number) {
  // From platform overview: $50 (2), $70 (3), $80 (4), $100 (5+)
  if (partySize <= 2) return 50;
  if (partySize === 3) return 70;
  if (partySize === 4) return 80;
  return 100;
}

export default function BookingScreen() {
  const route = useRoute<any>();
  const { userId } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const restaurant_id = route.params?.restaurant_id as string;
  const time_window_id = route.params?.time_window_id as string;

  const [partySize, setPartySize] = useState(2);
  const [loading, setLoading] = useState(false);
  const [exclusions, setExclusions] = useState({ minBeverage: false, setMenu: false });

  const onConfirmAndPay = useCallback(async () => {
    if (!userId) return Alert.alert('請先登入');
    if (!restaurant_id || !time_window_id) return Alert.alert('資料不完整');
    setLoading(true);
    try {
      // 1) Create pending booking in Supabase
      const booking = await createBooking({ user_id: userId, restaurant_id, time_window_id, party_size: partySize });

      // 2) Prepare Stripe PaymentSheet session via Edge Function
      const amountHKD = bookingFeeHKD(partySize);
      const session = await createPaymentSheetSession({ amountHKD, userId, bookingId: booking.id });

      const init = await initPaymentSheet({
        merchantDisplayName: 'BeforePeak',
        paymentIntentClientSecret: session.paymentIntent,
        customerId: session.customer,
        customerEphemeralKeySecret: session.ephemeralKey,
        defaultBillingDetails: { name: 'BeforePeak User' },
      });
      if (init.error) throw new Error(init.error.message);

      const present = await presentPaymentSheet();
      if (present.error) throw new Error(present.error.message);

      Alert.alert('支付成功', '你的訂座已確認');
      // TODO: call a verify endpoint or rely on webhook to mark booking confirmed
    } catch (e: any) {
      console.warn('payment error', e);
      Alert.alert('支付失敗', e?.message || '請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [userId, restaurant_id, time_window_id, partySize, initPaymentSheet, presentPaymentSheet]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>預訂</Text>
      <Text style={styles.subtitle}>選擇用餐人數與時段，確認訂座</Text>

      <View style={styles.row}>
        <Text style={styles.label}>人數</Text>
        <View style={styles.pillRow}>
          {[2,3,4,5,6].map(n => (
            <Text key={n} style={[styles.pill, partySize === n && styles.pillActive]} onPress={() => setPartySize(n)}>{n}</Text>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>訂座費</Text>
        <Text style={styles.value}>HK${bookingFeeHKD(partySize)}</Text>
      </View>

      <View style={styles.exclusionsCard}>
        <Text style={styles.exclusionsTitle}>餐廳政策</Text>
        <View style={styles.exclusionRow}>
          <Text style={styles.exclusionText}>最低消費要求</Text>
          <TouchableOpacity
            style={[styles.toggle, exclusions.minBeverage && styles.toggleActive]}
            onPress={() => setExclusions(prev => ({ ...prev, minBeverage: !prev.minBeverage }))}
          >
            <Text style={[styles.toggleText, exclusions.minBeverage && styles.toggleTextActive]}>
              {exclusions.minBeverage ? '已接受' : '點擊接受'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.exclusionRow}>
          <Text style={styles.exclusionText}>套餐限制</Text>
          <TouchableOpacity
            style={[styles.toggle, exclusions.setMenu && styles.toggleActive]}
            onPress={() => setExclusions(prev => ({ ...prev, setMenu: !prev.setMenu }))}
          >
            <Text style={[styles.toggleText, exclusions.setMenu && styles.toggleTextActive]}>
              {exclusions.setMenu ? '已接受' : '點擊接受'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.exclusionNote}>
          接受這些條款表示你同意餐廳的特殊要求。如有疑問，請在預訂前聯絡餐廳。
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
        onPress={onConfirmAndPay}
        disabled={loading}
      >
        <Text style={styles.confirmBtnText}>{loading ? '處理中...' : '確認並付款'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6B7280', marginBottom: 16 },
  row: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 6 },
  pillRow: { flexDirection: 'row' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6', marginRight: 8 },
  pillActive: { backgroundColor: '#7C3AED', color: '#fff' },
  value: { fontWeight: '700' },
  exclusionsCard: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, marginBottom: 16 },
  exclusionsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#92400E' },
  exclusionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  exclusionText: { flex: 1, color: '#92400E' },
  toggle: { backgroundColor: '#FDE68A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleActive: { backgroundColor: '#10B981' },
  toggleText: { fontSize: 12, color: '#92400E', fontWeight: '500' },
  toggleTextActive: { color: '#fff' },
  exclusionNote: { fontSize: 12, color: '#92400E', marginTop: 8, fontStyle: 'italic' },
  confirmBtn: { backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#9CA3AF' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

