import 'react-native-url-polyfill/auto';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './src/contexts/LanguageContext';
import { useAuth } from './src/hooks/useAuth';

import { APP_SCHEME, DEEP_LINK_HOST, STRIPE_PUBLISHABLE_KEY } from './src/config/env';
import { supabase } from './src/lib/supabase';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import RestaurantsScreen from './src/screens/RestaurantsScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReferralsScreen from './src/screens/ReferralsScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import BookingScreen from './src/screens/BookingScreen';
import RestaurantMapScreen from './src/screens/RestaurantMapScreen';
import ModifyBookingScreen from './src/screens/ModifyBookingScreen';
import PaymentResultScreen from './src/screens/PaymentResultScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';

import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import EmailSignInScreen from './src/screens/auth/EmailSignInScreen';
import PhoneSignInScreen from './src/screens/auth/PhoneSignInScreen';
import AppleSignInScreen from './src/screens/auth/AppleSignInScreen';
import GoogleSignInScreen from './src/screens/auth/GoogleSignInScreen';
import AuthCallbackScreen from './src/screens/auth/AuthCallbackScreen';

// i18n
import './src/i18n';
import { LanguageProvider } from './src/contexts/LanguageContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function MainTabs() {
  const { t, i18n } = useTranslation();
  const { language } = useLanguage();
  const { userId: uid } = useAuth();
  return (
    <Tab.Navigator key={language}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Restaurants') iconName = 'search';
          else if (route.name === 'Bookings') iconName = 'event';
          else if (route.name === 'Referrals') iconName = 'card-giftcard';
          else if (route.name === 'Profile') iconName = 'person';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tab_home') }} />
      <Tab.Screen name="Restaurants" component={RestaurantsScreen} options={{ title: t('tab_restaurants') }} />
      {uid ? (
        <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: t('tab_bookings') }} />
      ) : null}
      <Tab.Screen name="Referrals" component={ReferralsScreen} options={{ title: t('tab_referrals') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tab_profile') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Welcome' | 'MainTabs'>('MainTabs');

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setInitialRoute('MainTabs'); // Always show home first; auth accessible via header
      supabase.auth.onAuthStateChange((_event) => {
        // No route switch; Home remains first-entry
      });
    };
    init();
  }, []);

  const linking = {
    prefixes: [`${APP_SCHEME}://`, `https://${DEEP_LINK_HOST}`],
    config: {
      screens: {
        Welcome: 'welcome',
        EmailSignIn: 'auth/email',
        PhoneSignIn: 'auth/phone',
        AppleSignIn: 'auth/apple',
        GoogleSignIn: 'auth/google',
        AuthCallback: 'auth/callback',
        MainTabs: {
          screens: {
            Home: 'home',
            Restaurants: 'restaurants',
            Bookings: 'bookings',
            Referrals: 'referrals',
            Profile: 'profile',
          },
        },
        RestaurantDetail: 'restaurant/:id',
        Booking: 'booking/:id',
        RestaurantMap: 'map',
        ModifyBooking: 'booking/:id/modify',
        PaymentResult: 'payment/result',
        Reviews: 'restaurant/:id/reviews',
      },
    },
  } as const;

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <LanguageProvider>
        <NavigationContainer linking={linking}>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator initialRouteName={initialRoute}>
          {/* Home-first flow; auth screens available via header action */}
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

          {/* Auth */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmailSignIn" component={EmailSignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PhoneSignIn" component={PhoneSignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AppleSignIn" component={AppleSignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="GoogleSignIn" component={GoogleSignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} options={{ headerShown: false }} />

          {/* Details */}
          <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: '餐廳詳情' }} />
          <Stack.Screen name="Booking" component={BookingScreen} options={{ title: '預訂' }} />
          <Stack.Screen name="RestaurantMap" component={RestaurantMapScreen} options={{ title: '地圖' }} />
          <Stack.Screen name="ModifyBooking" component={ModifyBookingScreen} options={{ title: '修改預訂' }} />
          <Stack.Screen name="PaymentResult" component={PaymentResultScreen} options={{ title: '支付結果' }} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: '評價' }} />
        </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </StripeProvider>
  );
}
