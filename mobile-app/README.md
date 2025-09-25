# LoppeRate Mobile App

React Native Expo app for rating Danish flea market stalls.

## Development Setup

### Prerequisites
- **Bun** (package manager) - `curl -fsSL https://bun.sh/install | bash`
- **Node.js 18+** via fnm - `curl -fsSL https://fnm.vercel.app/install | bash && fnm install 18 && fnm use 18`
- **Expo CLI** - `bun install -g @expo/cli`
- **EAS CLI** - `bun install -g eas-cli`
- **Xcode** (for iOS simulator)
- **Android Studio** (optional - using physical device)

### Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

3. **Start the development server:**
   ```bash
   bun start
   ```

4. **Run on devices:**
   ```bash
   # iOS Simulator (macOS only)
   bun ios
   
   # Android Device (OnePlus 10 Pro)
   bun android
   
   # Web (for quick UI testing)
   bun web
   ```

### OnePlus 10 Pro Setup
1. Enable Developer Options: Settings → About Phone → Tap Build Number 7 times
2. Enable USB Debugging: Settings → Developer Options → USB Debugging
3. Connect via USB and authorize computer
4. Verify: `adb devices` should show device

### Development Commands

```bash
# Code quality
bun run lint          # Run ESLint
bun run lint:fix      # Fix ESLint issues
bun run format        # Format with Prettier
bun run type-check    # TypeScript type checking

# Building
bun run build:android # Build Android APK/AAB
bun run build:ios     # Build iOS app
```

### Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/         # Screen components
├── navigation/      # Navigation setup
├── store/          # Zustand state management
├── services/       # API services
├── i18n/           # Internationalization
├── types/          # TypeScript type definitions
└── utils/          # Helper functions
```

### Key Features Implemented

- ✅ Project setup with Expo 51 + React Native 0.74
- ✅ TypeScript configuration
- ✅ Danish internationalization (i18next)
- ✅ Navigation setup (React Navigation 6)
- ✅ State management (Zustand)
- ✅ API service structure
- ✅ Basic screens (Welcome, Markets, Settings)
- ✅ Location services integration
- ✅ Authentication flow structure
- ✅ Utility functions for Danish phone validation

### Next Steps

1. **Backend Integration:** Connect to Laravel API when ready
2. **Camera/OCR Implementation:** Implement MobilePay number scanning
3. **Rating System:** Build star rating component
4. **Authentication:** Implement Google/Facebook OAuth
5. **Push Notifications:** Set up notification handling
6. **Testing:** Add unit and integration tests

### Environment Variables

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
EXPO_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_sid
EXPO_PUBLIC_MAPS_API_KEY=your_google_maps_key
```

### Architecture

- **Frontend:** React Native + Expo 51
- **State:** Zustand for global state management
- **Navigation:** React Navigation 6 with stack + tabs
- **Styling:** React Native StyleSheet (ready for NativeWind)
- **i18n:** react-i18next for Danish localization
- **API:** Axios with interceptors for authentication
- **Storage:** expo-secure-store + AsyncStorage
- **Location:** expo-location for GPS features
- **Camera:** expo-camera for photos + OCR