import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { Linking } from 'react-native';

export default function AuthCallbackScreen() {
  const navigation = useNavigation<any>();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let mounted = true;
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      try {
        // Exchange the OAuth code in the callback URL for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) throw error;
        if (data?.session) {
          // Session is set; navigate to app
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        } else {
          Alert.alert('Authentication', 'Could not complete sign in.');
        }
      } catch (e: any) {
        Alert.alert('Authentication Error', e?.message || 'Please try again.');
      } finally {
        if (mounted) setProcessing(false);
      }
    };

    (async () => {
      const initial = await Linking.getInitialURL();
      await handleUrl(initial);
    })();

    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}

