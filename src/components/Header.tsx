import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

export default function Header() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { language, toggle } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>BeforePeak</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.langBtn} onPress={toggle}>
          <Text style={styles.langText}>{language === 'en' ? '繁' : 'EN'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.authBtn}
          onPress={() => navigation.navigate('Welcome')}
          accessibilityLabel={t('sign_in_up')}
        >
          <Text style={styles.authText}>{t('sign_in_up')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 18, fontWeight: '700', color: '#111827' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  authText: { color: '#fff', fontWeight: '600' },
  langBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  langText: { fontWeight: '600', color: '#111827' },
});

