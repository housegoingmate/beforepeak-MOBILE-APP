# Android Development Setup for Windows

## 🚨 Current Issues Found

From `npx react-native doctor`, you need to install:
- ✖ **JDK** (Java Development Kit)
- ✖ **Android Studio**
- ✖ **ANDROID_HOME** environment variable
- ✖ **Android SDK**
- ✖ **ADB** (Android Debug Bridge)
- ✖ **Android device/emulator**

## 🛠️ Step-by-Step Installation

### Step 1: Install Java Development Kit (JDK)

**Download JDK 17 (recommended for React Native):**
1. Go to: https://adoptium.net/temurin/releases/
2. Select **JDK 17** (LTS)
3. Choose **Windows x64**
4. Download and install the `.msi` file
5. During installation, check "Set JAVA_HOME variable"

**Verify installation:**
```bash
java -version
javac -version
```

### Step 2: Install Android Studio

**Download Android Studio:**
1. Go to: https://developer.android.com/studio
2. Download **Android Studio**
3. Run the installer
4. Follow the setup wizard:
   - ✅ Install Android SDK
   - ✅ Install Android SDK Platform
   - ✅ Install Android Virtual Device

**During setup, note the SDK location (usually):**
```
C:\Users\YourUsername\AppData\Local\Android\Sdk
```

### Step 3: Set Environment Variables

**Add to Windows Environment Variables:**

1. **Open System Properties:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click "Environment Variables"

2. **Add ANDROID_HOME:**
   - Click "New" under System Variables
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`

3. **Add to PATH:**
   - Find "Path" in System Variables, click "Edit"
   - Add these paths:
     ```
     %ANDROID_HOME%\platform-tools
     %ANDROID_HOME%\tools
     %ANDROID_HOME%\tools\bin
     ```

4. **Restart your computer** for changes to take effect

### Step 4: Install Android SDK Components

**Open Android Studio:**
1. Go to **Tools** → **SDK Manager**
2. Install these components:
   - ✅ **Android SDK Platform 35** (API Level 35)
   - ✅ **Android SDK Build-Tools 35.0.0**
   - ✅ **Android SDK Platform-Tools**
   - ✅ **Android SDK Tools**

**In SDK Tools tab:**
   - ✅ **Android SDK Build-Tools**
   - ✅ **Android SDK Platform-Tools**
   - ✅ **Android SDK Tools**
   - ✅ **Intel x86 Emulator Accelerator (HAXM installer)**

### Step 5: Create Android Virtual Device (AVD)

**In Android Studio:**
1. Go to **Tools** → **AVD Manager**
2. Click **"Create Virtual Device"**
3. Choose **Phone** → **Pixel 4** (or similar)
4. Select **API Level 35** (Android 14)
5. Click **"Next"** → **"Finish"**
6. **Start the emulator**

### Step 6: Verify Setup

**After restarting your computer:**
```bash
# Check Java
java -version

# Check Android SDK
adb version

# Check environment variables
echo $ANDROID_HOME
```

**Run React Native doctor again:**
```bash
cd mobile-app/beforepeak
npx react-native doctor
```

**Expected result:**
```
✓ Node.js
✓ npm
✓ JDK
✓ Android Studio
✓ ANDROID_HOME
✓ Gradlew
✓ Android SDK
✓ Adb
```

## 🚀 Test Your Android App

**Once setup is complete:**

1. **Start Android emulator** (from Android Studio AVD Manager)

2. **Run your app:**
```bash
cd mobile-app/beforepeak
npx react-native run-android
```

3. **Expected result:**
   - App builds successfully
   - App installs on emulator
   - App opens and shows your BeforePeak interface

## 🐛 Common Issues & Solutions

**Issue: "ANDROID_HOME not found"**
- Solution: Restart computer after setting environment variables

**Issue: "adb not recognized"**
- Solution: Add `%ANDROID_HOME%\platform-tools` to PATH

**Issue: "No connected devices"**
- Solution: Start Android emulator from Android Studio

**Issue: "Build failed"**
- Solution: Clean and rebuild:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 📱 Alternative: Use Physical Device

**Instead of emulator:**
1. Enable **Developer Options** on your Android phone
2. Enable **USB Debugging**
3. Connect phone via USB
4. Run: `adb devices` (should show your device)
5. Run: `npx react-native run-android`

## ⏱️ Estimated Setup Time

- **JDK installation**: 10 minutes
- **Android Studio download**: 20-30 minutes (depending on internet)
- **Android Studio setup**: 15 minutes
- **Environment variables**: 5 minutes
- **SDK components**: 10 minutes
- **AVD creation**: 5 minutes
- **Testing**: 10 minutes

**Total: ~1.5 hours**

## 🎯 Next Steps After Setup

1. ✅ Complete Android development environment
2. ✅ Test BeforePeak app on Android emulator
3. ✅ Fix any bugs found during testing
4. ✅ Build release APK for Firebase App Distribution
5. ✅ Deploy to beta testers

**Once Android is working perfectly, we'll apply the same fixes to iOS!**
