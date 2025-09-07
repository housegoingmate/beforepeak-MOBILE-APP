# Expo Snack Setup for BeforePeak Mobile (UI/UX preview)

This Snack is meant to preview the UI/UX flows without native modules. We stub or avoid features that require native build (maps, geolocation, haptics, permissions, PayMe, etc.).

What works in Snack:
- Navigation, screens, and layout
- Supabase client usage that only calls HTTP endpoints (ensure you don't include secrets here)
- Static UI states for lists/cards/filters

What is disabled/stubbed:
- react-native-maps (map UI shows a placeholder)
- react-native-geolocation-service (button shows an alert)
- react-native-haptic-feedback (no-op functions)
- react-native-permissions (not used on Snack)
- react-native-fast-image (fallback to Image)
- react-native-vector-icons (use Lucide icons already bundled)
- react-native-webview (avoid rendering in Snack)

How to run on Snack:
1. Create a new Snack at https://snack.expo.dev
2. Copy these files/folders into the Snack project:
   - App.tsx
   - src/** (omit services that hit private endpoints if needed)
   - src/utils/haptics.ts (already uses stubs on Snack)
   - src/components/MapboxAddressInput.tsx (uses mock suggestions in dev)
3. Add package.json dependencies minimal:
   - react, react-native, @react-navigation/native, @react-navigation/native-stack, @react-navigation/bottom-tabs, lucide-react-native, i18next, react-i18next
4. Avoid adding native modules on Snack. The code paths detect Snack via `global.expoSnack` or the absence of native modules and use fallbacks.

Notes:
- Keep API keys out of the Snack or use mocked data.
- This is for design/interaction preview only; real booking/payments/reviews should be tested on device builds.

