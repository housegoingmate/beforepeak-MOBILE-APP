import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { listRestaurants, APIRestaurant } from '../services/RestaurantService';

export default function RestaurantsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<APIRestaurant[]>([]);
  const [sortBy, setSortBy] = useState<'rating'|'reviews'|'relevance'>('rating');
  const [searchText, setSearchText] = useState('');

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await listRestaurants({ sort: sortBy, search: searchText || undefined });
      setRestaurants(data || []);
    } catch (e) {
      console.warn('load restaurants', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, [sortBy]);

  const onSearch = () => {
    loadRestaurants();
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('search_title')}</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search_placeholder')}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
          <Text style={styles.searchBtnText}>{t('search_button')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <Text style={styles.filterLabel}>排序:</Text>
        {[
          { key: 'rating', label: '評分最高' },
          { key: 'reviews', label: '最多評價' },
          { key: 'relevance', label: '相關度' }
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, sortBy === f.key && styles.filterBtnActive]}
            onPress={() => setSortBy(f.key as any)}
          >
            <Text style={[styles.filterText, sortBy === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.grid}>
        {restaurants.map(r => (
          <TouchableOpacity key={r.id} style={styles.card} onPress={() => navigation.navigate('RestaurantDetail', { id: r.id })}>
            {r.cover_photo_url ? (
              <Image source={{ uri: r.cover_photo_url }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholder]} />
            )}
            <Text style={styles.name} numberOfLines={1}>{r.name_zh || r.name_en}</Text>
            <Text style={styles.meta}>{r.cuisine_type || r.cuisine_type_en}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { width: '48%', marginRight: '4%', marginBottom: 12 },
  image: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#E5E7EB' },
  placeholder: { backgroundColor: '#E5E7EB' },
  name: { marginTop: 8, fontWeight: '600' },
  meta: { color: '#6B7280', fontSize: 12 },
  searchRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  searchBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '500' },
  filters: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  filterLabel: { marginRight: 8, fontWeight: '500' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 4 },
  filterBtnActive: { backgroundColor: '#7C3AED' },
  filterText: { fontSize: 12, color: '#374151' },
  filterTextActive: { color: '#fff' },
});

