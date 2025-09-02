# Mobile Deployment Research & Recommendations

## ✅ Supabase Edge Functions - DEPLOYED!

**Good news**: I used the integrated Supabase tool and successfully deployed both Edge Functions:

- ✅ `stripe-payment-sheet-setup` - Function ID: a68eba9e-1269-4f2d-88ac-271ca17a51b6
- ✅ `stripe-webhook` - Function ID: 964bb28f-66bb-48be-bfdd-f479167dbf96

**URLs now live:**
- https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-payment-sheet-setup
- https://upnqezwtiehbvyurguja.functions.supabase.co/stripe-webhook

**Next step**: Set environment variables in Supabase Dashboard manually (the API didn't accept the format).

## 🗺️ Google Maps API Pricing Research

### **Google Maps Pricing (2024)**
- **Free Tier**: $200 credit per month (covers ~28,500 map loads)
- **After Free Tier**: $7 per 1,000 map loads
- **Mobile SDK**: Same pricing as web
- **For restaurant app**: Likely within free tier unless you have 1000+ daily users

### **Free Alternatives to Google Maps**

**1. OpenStreetMap + Mapbox (Recommended)**
```bash
npm install react-native-mapbox-gl
```
- **Free Tier**: 50,000 map views/month
- **Pricing**: $0.50 per 1,000 views after free tier
- **Pros**: Much cheaper, good Hong Kong coverage
- **Cons**: Slightly less detailed than Google

**2. Apple Maps (iOS) + OpenStreetMap (Android)**
```javascript
// Already configured in your app
import MapView from 'react-native-maps';
// Uses Apple Maps on iOS (free), Google Maps on Android (paid)
```
- **iOS**: Completely free (uses Apple Maps)
- **Android**: Would need Google Maps API key
- **Hybrid approach**: Free on iOS, paid on Android

**3. React Native Maps with Apple Maps Only**
```javascript
// Force Apple Maps on iOS, disable Android maps
<MapView 
  provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : null}
  // Only show maps on iOS
/>
```

### **Recommendation: Start with Apple Maps (Free)**
For initial launch, use Apple Maps on iOS only:
- Completely free
- Good coverage in Hong Kong
- Add Android maps later when revenue justifies cost

## 📱 Mobile Beta Testing Platforms Research

### **Free Options Comparison**

| Platform | Cost | Users | Platforms | Ease of Use | Reliability |
|----------|------|-------|-----------|-------------|-------------|
| **Firebase App Distribution** | Free | Unlimited | iOS + Android | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **TestFlight** | Free* | 10,000 | iOS only | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Google Play Internal Testing** | Free* | 100 | Android only | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

*Requires developer account ($99 Apple, $25 Google)

### **Winner: Firebase App Distribution**

**Why Firebase App Distribution is Best:**
- ✅ **Completely free** (no developer accounts needed initially)
- ✅ **Cross-platform** (iOS + Android)
- ✅ **Unlimited testers**
- ✅ **Easy sharing** via email/links
- ✅ **No app store review** required
- ✅ **Instant deployment**

**Setup Process:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init

# Deploy
firebase appdistribution:distribute app-release.apk \
  --app 1:123456789:android:abcd1234 \
  --testers "test@example.com,test2@example.com"
```

### **Deployment Strategy Recommendation**

**Phase 1: Firebase App Distribution (Free)**
- Test with team and early users
- No developer accounts needed
- Cross-platform testing
- Gather feedback and iterate

**Phase 2: TestFlight + Play Console (When ready for wider beta)**
- Get developer accounts ($124 total)
- Larger beta testing pools
- App store optimization testing

**Phase 3: App Store + Google Play (Production)**
- Full public release
- Revenue generation

## 🎯 Final Recommendations

### **Maps Solution**
**Option A (Recommended)**: Start iOS-only with Apple Maps (free)
```javascript
// Modify RestaurantMapScreen.tsx
{Platform.OS === 'ios' && (
  <MapView style={StyleSheet.absoluteFill} initialRegion={region}>
    <Marker coordinate={{ latitude: 22.3193, longitude: 114.1694 }} />
  </MapView>
)}
{Platform.OS === 'android' && (
  <Text>Map feature coming soon for Android</Text>
)}
```

**Option B**: Use Mapbox (50k free views/month)
- Better long-term solution
- Covers both platforms
- Much cheaper than Google

### **Beta Testing Solution**
**Firebase App Distribution** for initial testing:
- Zero upfront cost
- Test both iOS and Android
- Easy stakeholder sharing
- No app store bureaucracy

### **Cost Breakdown**
- **Phase 1 (Firebase)**: $0
- **Phase 2 (Beta)**: $124 (developer accounts)
- **Phase 3 (Production)**: $124/year ongoing

### **Next Steps**
1. ✅ Edge Functions deployed (done!)
2. Set Stripe environment variables in Supabase Dashboard
3. Choose maps solution (Apple Maps free vs Mapbox)
4. Set up Firebase App Distribution
5. Build and test on devices
6. Share with beta testers

**The most cost-effective path is Firebase App Distribution + Apple Maps only initially, then expand based on user feedback and revenue.**
