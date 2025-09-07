import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, TrendingUp, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { Button } from '../components/ui/Button';
import { colors, typography, spacing, borderRadius, commonStyles } from '../theme';
import { UIRestaurant } from '../types/database';
import { fetchPopularRestaurants, fetchNearbyRestaurants } from '../services/restaurants';
import { hapticFeedback } from '../utils/haptics';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularRestaurants, setPopularRestaurants] = useState<UIRestaurant[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<UIRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [popular, nearby] = await Promise.all([
        fetchPopularRestaurants(),
        fetchNearbyRestaurants(22.3193, 114.1694), // Hong Kong coordinates
      ]);

      setPopularRestaurants(popular.slice(0, 5));
      setNearbyRestaurants(nearby.slice(0, 5));
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    hapticFeedback.light();
    navigation.navigate('Restaurants', { searchQuery });
  };

  const handleRestaurantPress = (restaurant: UIRestaurant) => {
    hapticFeedback.medium();
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const handleViewAllPopular = () => {
    hapticFeedback.light();
    navigation.navigate('Restaurants', { sortBy: 'rating' });
  };

  const handleViewAllNearby = () => {
    hapticFeedback.light();
    navigation.navigate('Restaurants', { sortBy: 'distance' });
  };

  const handleGetRecommendation = () => {
    hapticFeedback.light();
    navigation.navigate('Restaurants', { showRecommendations: true });
  };

  const renderRestaurantItem = ({ item }: { item: UIRestaurant }) => (
    <View style={styles.restaurantItem}>
      <RestaurantCard
        restaurant={item}
        onPress={handleRestaurantPress}
        showDistance={true}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.text.tertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('home.searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <Button
            title={t('common.search')}
            onPress={handleSearch}
            size="medium"
            style={styles.searchButton}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleGetRecommendation}>
            <Star size={24} color={colors.primary.purple} />
            <Text style={styles.quickActionText}>{t('home.getRecommendation')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleViewAllNearby}>
            <MapPin size={24} color={colors.primary.purple} />
            <Text style={styles.quickActionText}>Nearby</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleViewAllPopular}>
            <TrendingUp size={24} color={colors.primary.purple} />
            <Text style={styles.quickActionText}>Popular</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.popularRestaurants')}</Text>
            <TouchableOpacity onPress={handleViewAllPopular}>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularRestaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Nearby Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.nearbyRestaurants')}</Text>
            <TouchableOpacity onPress={handleViewAllNearby}>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={nearbyRestaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.primary.purple,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  searchButton: {
    paddingHorizontal: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickAction: {
    alignItems: 'center',
    padding: spacing.md,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  viewAllText: {
    ...typography.body2,
    color: colors.primary.purple,
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: spacing.lg,
  },
  restaurantItem: {
    marginRight: spacing.md,
    width: 280,
  },
});

