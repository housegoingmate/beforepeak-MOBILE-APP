# Mobile App Deployment Guide

## 🚀 Mobile Deployment Options

Unlike web apps (Netlify), mobile apps require different deployment strategies:

### 1. **App Store Distribution** (Recommended for Production)

**iOS App Store**
- Requires Apple Developer Account ($99/year)
- Uses Xcode and App Store Connect
- Review process: 1-7 days
- Automatic updates for users

**Google Play Store**
- Requires Google Play Developer Account ($25 one-time)
- Uses Android Studio and Google Play Console
- Review process: 1-3 days
- Automatic updates for users

### 2. **Beta Testing Platforms**

**TestFlight (iOS)**
- Free with Apple Developer Account
- Up to 10,000 beta testers
- No App Store review for internal testing

**Google Play Internal Testing (Android)**
- Free with Google Play Developer Account
- Up to 100 internal testers
- Instant deployment

**Firebase App Distribution**
- Free for both iOS and Android
- Easy sharing via email/links
- Good for stakeholder testing

### 3. **Enterprise Distribution**

**iOS Enterprise**
- Requires Apple Enterprise Developer Account ($299/year)
- Internal distribution only
- No App Store required

**Android APK**
- Direct APK distribution
- Requires "Unknown Sources" enabled
- Good for internal testing

## 📋 Pre-Deployment Checklist

### 1. **Environment Setup**
```bash
# Install dependencies
npm install -g react-native-cli
npm install -g @react-native-community/cli

# iOS requirements (macOS only)
sudo gem install cocoapods
cd ios && pod install

# Android requirements
# Install Android Studio and SDK
# Set ANDROID_HOME environment variable
```

### 2. **App Configuration**

**Update App Identity**
```javascript
// android/app/src/main/res/values/strings.xml
<string name="app_name">BeforePeak</string>

// ios/beforepeak/Info.plist
<key>CFBundleDisplayName</key>
<string>BeforePeak</string>
```

**Set Bundle IDs**
```javascript
// android/app/build.gradle
applicationId "com.beforepeak.app"

// ios/beforepeak.xcodeproj
Bundle Identifier: com.beforepeak.app
```

### 3. **API Keys & Environment**
```typescript
// src/config/env.ts - Already configured with your keys
SUPABASE_URL: "https://upnqezwtiehbvyurguja.supabase.co"
SUPABASE_ANON_KEY: "your-anon-key"
STRIPE_PUBLISHABLE_KEY: "pk_test_51RNPjZ..." // ✅ Added
```

**Google Maps API Key**
```xml
<!-- android/app/src/main/res/values/strings.xml -->
<string name="google_maps_api_key">YOUR_GOOGLE_MAPS_API_KEY</string>
```

## 🔧 Build Process

### **Development Builds**
```bash
# iOS (requires macOS)
npx react-native run-ios

# Android
npx react-native run-android
```

### **Production Builds**

**iOS Release Build**
```bash
cd ios
xcodebuild -workspace beforepeak.xcworkspace \
  -scheme beforepeak \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath beforepeak.xcarchive \
  archive
```

**Android Release Build**
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

## 📱 Recommended Deployment Strategy

### **Phase 1: Internal Testing**
1. **Firebase App Distribution**
   - Quick setup for team testing
   - Share with stakeholders
   - Gather initial feedback

### **Phase 2: Beta Testing**
1. **TestFlight (iOS)** + **Google Play Internal Testing (Android)**
   - Invite beta users
   - Test payment flows
   - Validate restaurant booking process

### **Phase 3: Production Release**
1. **App Store** + **Google Play Store**
   - Full public release
   - App Store Optimization (ASO)
   - Marketing and user acquisition

## 🛠 CI/CD Options

### **GitHub Actions** (Recommended)
```yaml
# .github/workflows/mobile-build.yml
name: Mobile Build
on: [push]
jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Build iOS
        run: npx react-native run-ios --configuration Release
```

### **Fastlane** (Advanced)
- Automates build and deployment
- Handles certificates and provisioning
- Integrates with App Store Connect and Google Play

### **EAS Build (Expo)** 
- Cloud-based builds
- No local setup required
- Works with bare React Native projects

## 📊 App Store Optimization

### **App Store Listing**
- **Name**: BeforePeak
- **Subtitle**: 非繁忙時段餐廳優惠
- **Keywords**: restaurant, booking, discount, Hong Kong, dining
- **Description**: Highlight 50% off-peak discounts

### **Screenshots Required**
- iPhone: 6.7", 6.5", 5.5" displays
- iPad: 12.9", 11" displays  
- Android: Phone and tablet sizes

### **App Icon**
- iOS: 1024x1024px
- Android: 512x512px
- Design should reflect BeforePeak branding

## 🔐 Security for Production

### **Code Signing**
- **iOS**: Apple Developer certificates
- **Android**: Generate keystore for signing

### **API Security**
- Never expose Stripe secret key in app
- Use Supabase RLS policies
- Implement certificate pinning for production

## 💰 Cost Breakdown

### **Development Accounts**
- Apple Developer: $99/year
- Google Play Developer: $25 one-time
- Total: ~$124 first year, $99/year after

### **Optional Services**
- Firebase App Distribution: Free
- Fastlane: Free (open source)
- EAS Build: $29/month (if using Expo)

## 🎯 Next Steps

1. **Set up developer accounts** (Apple + Google)
2. **Configure app signing** (certificates/keystores)
3. **Add Google Maps API key**
4. **Deploy Supabase Edge Functions** (for Stripe)
5. **Build and test** on physical devices
6. **Submit for beta testing** (TestFlight/Play Console)
7. **Gather feedback** and iterate
8. **Submit for production** release

The mobile app is production-ready code-wise. The deployment process is more involved than web (Netlify) but follows standard mobile app distribution channels.
