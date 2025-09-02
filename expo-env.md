# Expo migration notes

This repo is a bare React Native app. You asked to preview with Expo Go.

Expo Go supports apps created with Expo (managed or prebuild). To preview this app in Expo Go, we will:

1) Add expo-dev-client so we can run this bare app with npx expo start and scan a QR code.
2) Register deep links for beforepeak:// in app.json / Expo config.
3) Use npx expo start to serve the dev build; Expo Go (or dev client) will open it.

If you prefer full managed workflow, we can convert to Expo with `npx expo prebuild` and adjust native configs accordingly.

