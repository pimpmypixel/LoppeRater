# LoppeRater - Danish Market Stall Rating App

A React Native Expo application for rating stalls at Danish flea markets (LoppeMarkeder). Scan stall information with OCR, rate stalls on multiple criteria, and help fellow shoppers find the best deals.

## 🌟 Features

- **📱 Cross-platform**: iOS, Android, and Web support via Expo
- **📷 Camera OCR**: Scan stall information and phone numbers automatically
- **⭐ Multi-criteria Rating**: Rate stalls on Selection, Friendliness, and Creativity
- **🇩🇰 Danish Localization**: Full Danish language support
- **🎨 Modern UI**: Clean, intuitive interface with visual feedback
- **📍 Location Services**: GPS integration for market discovery
- **🔒 Secure**: Secure storage with expo-secure-store

## 🚀 Quick Start

### Prerequisites
- **Bun** package manager: `curl -fsSL https://bun.sh/install | bash`
- **Node.js 18+** via fnm: `curl -fsSL https://fnm.vercel.app/install | bash && fnm install 18`
- **Expo CLI**: `bun install -g @expo/cli`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pimpmypixel/LoppeRater.git
   cd LoppeRater/mobile-app
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server:**
   ```bash
   bun start
   ```

5. **Run on devices:**
   ```bash
   bun ios        # iOS Simulator
   bun android    # Android device
   bun web        # Web browser
   ```

## 📱 Usage

### Rating a Stall
1. **Scan Information**: Use the camera to scan stall details and phone numbers
2. **Enter Details**: Add stall name and contact information
3. **Rate Quality**: Use sliders to rate Selection, Friendliness, and Creativity (1-10)
4. **Submit**: Save your rating to help other shoppers

### Camera Features
- **OCR Processing**: Automatically detects Danish phone numbers
- **Square View**: Centered camera interface for consistent scanning
- **Permission Handling**: Graceful camera permission requests

## 🛠️ Development

### Project Structure
```
mobile-app/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── CameraScanner.tsx    # Camera with OCR
│   │   └── StarRating.tsx       # Multi-slider rating
│   ├── screens/        # Screen components
│   ├── navigation/     # App navigation
│   ├── store/          # Zustand state management
│   ├── services/       # API integration
│   ├── i18n/           # Danish translations
│   ├── types/          # TypeScript definitions
│   └── utils/          # Helper functions
├── assets/             # Images and icons
└── *.config.*         # Configuration files
```

### Key Technologies
- **React Native 0.81.4** with Expo SDK 54
- **TypeScript** for type safety
- **Zustand** for state management
- **React Navigation 6** for routing
- **Expo Camera** for camera functionality
- **i18next** for internationalization

### Development Commands
```bash
bun run lint          # ESLint code quality
bun run lint:fix      # Auto-fix linting issues
bun run format        # Prettier code formatting
bun run type-check    # TypeScript compilation check
bun run build:android # Build Android APK
bun run build:ios     # Build iOS app
```

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Authentication
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id

# Services
EXPO_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_sid
EXPO_PUBLIC_MAPS_API_KEY=your_google_maps_key
```

### Permissions
The app requires the following permissions:
- **Camera**: For scanning stall information
- **Location**: For finding nearby markets
- **Storage**: For saving ratings locally

## 📊 Rating System

Stalls are rated on three criteria:
- **Selection** (1-10): Quality and variety of items
- **Friendliness** (1-10): Seller helpfulness and customer service
- **Creativity** (1-10): Unique or creative items and presentation

## 🌍 Localization

The app is fully localized for Danish with:
- Danish phone number validation
- Local market terminology
- Cultural context for flea market shopping

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Expo and React Native
- Danish flea market community
- Open source contributors