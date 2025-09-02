import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { listRestaurants, APIRestaurant } from '../services/RestaurantService';
import RestaurantCard from '../components/RestaurantCard';
import Header from '../components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<APIRestaurant[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await listRestaurants({ sort: 'rating', limit: 6 });
        setFeaturedRestaurants(data || []);
      } catch (e) {
        console.warn('featured restaurants', e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      <Text style={styles.tagline}>{t('home_tagline')}</Text>
      <Text style={styles.title}>{t('home_title')}</Text>
      <Text style={styles.subtitle}>{t('home_subtitle')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home_featured')}</Text>
        {loading ? (
          <ActivityIndicator style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.grid}>
            {featuredRestaurants.map(r => (
              <RestaurantCard
                key={r.id}
                restaurant={{
                  name: r.name_en || '',
                  name_zh: r.name_zh,
                  image: r.cover_photo_url || r.restaurant_photos?.[0]?.url || '',
                  discount: '50%',
                  cuisine: r.cuisine_type || r.cuisine_type_en || '',
                  rating: r.average_rating || 0,
                  reviews: r.total_reviews || 0,
                  district: r.territory || '',
                  availableToday: (r.time_windows || []).length > 0,
                  nextSlot: (r.time_windows || [])[0]?.start_time ? (language==='zh-HK' ? `下個時段 ${r.time_windows[0].start_time}` : `Next slot ${r.time_windows[0].start_time}`) : undefined,
                }}
                onPress={() => navigation.navigate('RestaurantDetail', { id: r.id })}
                style="grid"
                size="medium"
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Restaurants')}>
          <Text style={styles.actionText}>{t('home_browse_all')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => (userId ? navigation.navigate('Bookings') : navigation.navigate('Welcome'))}
        >
          <Text style={styles.actionText}>{t('home_my_bookings')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{t('home_how_it_works')}</Text>
        <Text style={styles.infoText}>• {t('home_hiw_point1')}</Text>
        <Text style={styles.infoText}>• {t('home_hiw_point2')}</Text>
        <Text style={styles.infoText}>• {t('home_hiw_point3')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  tagline: { color: '#7C3AED', fontWeight: '600', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6, color: '#111827' },
  subtitle: { color: '#6B7280', marginBottom: 24, fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, backgroundColor: '#7C3AED', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '600' },
  infoCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16 },
  infoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  infoText: { color: '#374151', marginBottom: 4 },
});

