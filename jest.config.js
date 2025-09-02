module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-url-polyfill|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-worklets|react-native-safe-area-context|react-native-screens)/)'
  ],
};
