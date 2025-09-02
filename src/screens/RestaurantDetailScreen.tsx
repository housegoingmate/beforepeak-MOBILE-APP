import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function RestaurantDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const id = route.params?.id as string;
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select(`
            *,
            restaurant_photos(url, alt_text, category, is_featured),
            time_windows(id, date, start_time, end_time, discount_percentage, max_capacity, current_bookings)
          `)
          .eq('id', id)
          .eq('is_active', true)
          .eq('is_verified', true)
          .single();
        if (error) throw error;
        setRestaurant(data);
      } catch (e) {
        console.warn('restaurant detail', e);
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!restaurant) return <View style={styles.center}><Text>未找到餐廳</Text></View>;

  const cover = restaurant.cover_photo_url || restaurant.restaurant_photos?.[0]?.url;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {cover ? <Image source={{ uri: cover }} style={styles.cover} /> : <View style={[styles.cover, styles.placeholder]} />}
      <Text style={styles.title}>{restaurant.name_zh || restaurant.name_en}</Text>
      <Text style={styles.subtitle}>{restaurant.cuisine_type || restaurant.cuisine_type_en}</Text>

      <Text style={styles.section}>可用時段（未來兩週）</Text>
      <View style={styles.slots}>
        {(restaurant.time_windows || []).slice(0, 12).map((tw: any) => (
          <TouchableOpacity
            key={tw.id}
            style={styles.pill}
            onPress={() => navigation.navigate('Booking', { restaurant_id: restaurant.id, time_window_id: tw.id })}
          >
            <Text style={styles.pillText}>{tw.date} {tw.start_time}</Text>
            <Text style={styles.pillDiscount}>{tw.discount_percentage}% off</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Reviews', { restaurant_id: restaurant.id })}>
          <Text style={styles.actionText}>查看評價</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('RestaurantMap', { restaurant_id: restaurant.id })}>
          <Text style={styles.actionText}>查看地圖</Text>
        </TouchableOpacity>
      </View>

      {restaurant.description_zh && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>餐廳介紹</Text>
          <Text style={styles.cardText}>{restaurant.description_zh}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>餐廳資訊</Text>
        <Text style={styles.cardText}>地址: {restaurant.address_zh || restaurant.address_en}</Text>
        <Text style={styles.cardText}>電話: {restaurant.phone}</Text>
        <Text style={styles.cardText}>評分: {restaurant.average_rating}/5 ({restaurant.total_reviews} 評價)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 200, borderRadius: 8, backgroundColor: '#E5E7EB', marginBottom: 12 },
  placeholder: { backgroundColor: '#E5E7EB' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#6B7280', marginBottom: 16 },
  section: { fontWeight: '600', marginBottom: 8 },
  slots: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#F3F4F6', borderRadius: 16, marginRight: 8, marginBottom: 8 },
  pillText: { fontSize: 12, color: '#111827' },
  pillDiscount: { fontSize: 10, color: '#DC2626', fontWeight: '600' },
  actions: { flexDirection: 'row', marginVertical: 16, gap: 12 },
  actionBtn: { flex: 1, backgroundColor: '#7C3AED', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  cardText: { color: '#374151', marginBottom: 4 },
});

