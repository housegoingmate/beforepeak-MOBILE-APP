/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform } from 'react-native';
import { Home, Search, Calendar, User, MapPin } from 'lucide-react-native';

// Import screens
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RestaurantsScreen } from './src/screens/RestaurantsScreen';
import { RestaurantDetailScreen } from './src/screens/RestaurantDetailScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { BookingsScreen } from './src/screens/BookingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MapScreen } from './src/screens/MapScreen';
import { LoadingScreen } from './src/screens/LoadingScreen';

// Import services
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import NotificationService from './src/services/NotificationService';
import ReviewService from './src/services/ReviewService';

// Import components
import { MandatoryReviewModal } from './src/components/MandatoryReviewModal';

// Import theme
import { colors, componentSpacing } from './src/theme';

// Import i18n
import './src/i18n/config';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          height: componentSpacing.tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary.purple,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          switch (route.name) {
            case 'Home':
              IconComponent = Home;
              break;
            case 'Restaurants':
              IconComponent = Search;
              break;
            case 'Map':
              IconComponent = MapPin;
              break;
            case 'Bookings':
              IconComponent = Calendar;
              break;
            case 'Profile':
              IconComponent = User;
              break;
            default:
              IconComponent = Home;
          }

          return <IconComponent size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Restaurants"
        component={RestaurantsScreen}
        options={{ tabBarLabel: 'Restaurants' }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarLabel: 'Map' }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReview, setPendingReview] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      await NotificationService.getInstance().initialize();
    };
    initializeServices();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);

      // Check for pending reviews when user logs in
      if (session) {
        checkPendingReviews();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      // Check for pending reviews when user logs in
      if (session) {
        checkPendingReviews();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkPendingReviews = async () => {
    try {
      const reviewService = ReviewService.getInstance();
      const pendingReview = await reviewService.checkMandatoryReview();

      if (pendingReview) {
        setPendingReview(pendingReview);
        setShowReviewModal(true);
      }
    } catch (error) {
      console.error('Failed to check pending reviews:', error);
    }
  };

  const handleReviewComplete = () => {
    setShowReviewModal(false);
    setPendingReview(null);
    // Check if there are more pending reviews
    setTimeout(checkPendingReviews, 1000);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background.primary}
        translucent={false}
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {session ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen
                name="RestaurantDetail"
                component={RestaurantDetailScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="Booking"
                component={BookingScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Mandatory Review Modal */}
      <MandatoryReviewModal
        visible={showReviewModal}
        pendingReview={pendingReview}
        onComplete={handleReviewComplete}
      />
    </>
  );
}
