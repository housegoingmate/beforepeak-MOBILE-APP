import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function ModifyBookingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userId } = useAuth();
  const bookingId = route.params?.bookingId as string;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [newPartySize, setNewPartySize] = useState(2);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        // Load current booking
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            restaurants(name_en, name_zh),
            time_windows(id, date, start_time, end_time, discount_percentage)
          `)
          .eq('id', bookingId)
          .eq('user_id', userId)
          .single();
        if (bookingError) throw bookingError;
        setBooking(bookingData);
        setNewPartySize(bookingData.party_size);

        // Load available slots for the same restaurant (next 2 weeks)
        const today = new Date();
        const twoWeeks = new Date();
        twoWeeks.setDate(today.getDate() + 14);

        const { data: slotsData, error: slotsError } = await supabase
          .from('time_windows')
          .select('*')
          .eq('restaurant_id', bookingData.restaurant_id)
          .gte('date', today.toISOString().split('T')[0])
          .lte('date', twoWeeks.toISOString().split('T')[0])
          .order('date')
          .order('start_time');
        if (slotsError) throw slotsError;
        setAvailableSlots(slotsData || []);
      } catch (e) {
        console.warn('modify booking load', e);
        Alert.alert('載入失敗', '無法載入預訂資料');
      } finally {
        setLoading(false);
      }
    };
    if (bookingId && userId) run();
  }, [bookingId, userId]);

  const onSave = async () => {
    if (!booking) return;

    const updates: any = {};
    if (newPartySize !== booking.party_size) updates.party_size = newPartySize;
    if (selectedSlot && selectedSlot !== booking.time_window_id) updates.time_window_id = selectedSlot;

    if (Object.keys(updates).length === 0) {
      return Alert.alert('沒有變更', '你沒有修改任何內容');
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .eq('user_id', userId);
      if (error) throw error;

      Alert.alert('修改成功', '你的預訂已更新', [
        { text: '確定', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('修改失敗', e?.message || '請稍後再試');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!booking) return <View style={styles.center}><Text>找不到預訂</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>修改預訂</Text>
      <Text style={styles.subtitle}>{booking.restaurants?.name_zh || booking.restaurants?.name_en}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>目前預訂</Text>
        <Text style={styles.detail}>日期: {booking.time_windows?.date}</Text>
        <Text style={styles.detail}>時間: {booking.time_windows?.start_time}</Text>
        <Text style={styles.detail}>人數: {booking.party_size}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>修改人數</Text>
        <View style={styles.pillRow}>
          {[2,3,4,5,6].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.pill, newPartySize === n && styles.pillActive]}
              onPress={() => setNewPartySize(n)}
            >
              <Text style={[styles.pillText, newPartySize === n && styles.pillTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>選擇新時段</Text>
        <View style={styles.slots}>
          {availableSlots.slice(0, 20).map(slot => (
            <TouchableOpacity
              key={slot.id}
              style={[styles.slotPill, selectedSlot === slot.id && styles.slotPillActive]}
              onPress={() => setSelectedSlot(slot.id)}
            >
              <Text style={[styles.slotText, selectedSlot === slot.id && styles.slotTextActive]}>
                {slot.date} {slot.start_time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>儲存修改</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#6B7280', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  detail: { color: '#374151', marginBottom: 4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  pillActive: { backgroundColor: '#7C3AED' },
  pillText: { color: '#374151' },
  pillTextActive: { color: '#fff' },
  slots: { flexDirection: 'row', flexWrap: 'wrap' },
  slotPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  slotPillActive: { backgroundColor: '#10B981' },
  slotText: { fontSize: 12, color: '#374151' },
  slotTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

