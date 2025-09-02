import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function RestaurantMapScreen() {
  const region = {
    latitude: 22.3193,
    longitude: 114.1694,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={region}
        >
          <Marker coordinate={{ latitude: 22.3193, longitude: 114.1694 }} title="BeforePeak" />
        </MapView>
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>地圖功能</Text>
          <Text style={styles.fallbackText}>Android 版本的地圖功能即將推出</Text>
          <Text style={styles.fallbackText}>目前請使用 iOS 版本查看餐廳位置</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  fallbackTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  fallbackText: { color: '#6B7280', textAlign: 'center', marginBottom: 8 },
});

