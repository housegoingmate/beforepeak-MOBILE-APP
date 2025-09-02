import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const { userId, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Try to get profile from users table
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        setProfile({
          email: userData.user?.email,
          phone: userData.user?.phone,
          ...profileData
        });

        // Get account credits (mock for now)
        setCredits(0);
      } catch (e) {
        console.warn('profile load', e);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) run();
  }, [authLoading, userId]);

  const onSignOut = async () => {
    Alert.alert('登出', '確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '登出', onPress: async () => {
        await supabase.auth.signOut();
      }}
    ]);
  };

  if (authLoading || loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>我的帳戶</Text>

      <View style={styles.profileCard}>
        <Text style={styles.profileName}>{profile?.first_name} {profile?.last_name}</Text>
        <Text style={styles.profileEmail}>{profile?.email}</Text>
        {profile?.phone && <Text style={styles.profilePhone}>{profile.phone}</Text>}
      </View>

      <View style={styles.creditsCard}>
        <Text style={styles.creditsTitle}>帳戶積分</Text>
        <Text style={styles.creditsAmount}>HK${credits}</Text>
        <Text style={styles.creditsNote}>可用於未來預訂或退款</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>編輯個人資料</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>預訂記錄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>推薦朋友</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>客戶服務</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>關於我們</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
        <Text style={styles.signOutText}>登出</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  profileCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, alignItems: 'center', elevation: 2 },
  profileName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  profileEmail: { color: '#6B7280', marginBottom: 2 },
  profilePhone: { color: '#6B7280' },
  creditsCard: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  creditsTitle: { fontSize: 14, color: '#166534', marginBottom: 4 },
  creditsAmount: { fontSize: 24, fontWeight: '700', color: '#166534', marginBottom: 4 },
  creditsNote: { fontSize: 12, color: '#166534' },
  menuSection: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, elevation: 1 },
  menuItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuText: { fontSize: 16, color: '#374151' },
  signOutBtn: { backgroundColor: '#FEE2E2', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  signOutText: { color: '#DC2626', fontWeight: '600' },
});

