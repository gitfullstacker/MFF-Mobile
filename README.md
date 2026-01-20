# Macro Friendly Food React Native App

A mobile application for the Macro Friendly Food platform, providing users with healthy, macro-friendly recipes, meal planning functionality, and account management features on iOS and Android devices.

## 🚀 Features

- **Authentication System**: Secure login/registration with JWT integration
- **Recipe Management**: Browse, search, and filter macro-friendly recipes
- **Meal Planning**: Create and manage weekly meal plans
- **Favorites System**: Save favorite recipes for quick access
- **Nutrition Tracking**: Track macros (protein, carbs, fat) and calories
- **Support System**: In-app ticket system for user support

## 🛠️ Tech Stack

- **React Native**: 0.73.1
- **TypeScript**: Type-safe development
- **Navigation**: React Navigation 6
- **State Management**: Jotai
- **Form Handling**: React Hook Form + Yup
- **API Client**: Axios
- **Data Fetching**: React Query
- **UI Components**: React Native Paper, Vector Icons
- **Storage**: AsyncStorage

## 📱 Screenshots

<div align="center">
  <img src="screenshots/login.png" width="200" alt="Login Screen">
  <img src="screenshots/dashboard.png" width="200" alt="Dashboard">
  <img src="screenshots/recipes.png" width="200" alt="Recipe List">
  <img src="screenshots/meal-plan.png" width="200" alt="Meal Planning">
</div>

## 🚦 Getting Started

### Prerequisites

- Node.js >= 18
- Yarn or npm
- React Native development environment
- iOS: Xcode 15+
- Android: Android Studio with Android SDK

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-org/mff-mobile.git
cd mff-mobile
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Install iOS dependencies:

```bash
cd ios && pod install && cd ..
```

4. Configure environment:

```bash
cp .env.example .env
```

Edit `.env` file with your API endpoints and configuration.

### Running the App

#### iOS

```bash
npm run ios
# or
yarn ios
```

#### Android

```bash
npm run android
# or
yarn android
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/         # Screen components
├── navigation/      # Navigation configuration
├── services/        # API services
├── store/          # Jotai state management
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── theme/          # Design system (colors, typography, etc.)
```

## 🎨 Design System

The app follows a comprehensive design system with:

- **Colors**: Primary (#F24F48), semantic colors for success/error/warning
- **Typography**: Inter font family with defined size scales
- **Spacing**: 4px base unit with consistent multipliers
- **Components**: Reusable components following Material Design principles

## 🔐 Authentication Flow

The app implements a complete authentication flow:

1. **Login Screen**: Users enter credentials to authenticate
2. **Token Storage**: JWT tokens are securely stored in AsyncStorage
3. **Auto Authentication**: Tokens are automatically added to all API requests
4. **Session Persistence**: Users remain logged in between app launches
5. **Token Expiry**: 401 responses automatically clear auth and redirect to login

### Setup

1. Copy `.env.example` to `.env` and configure your API URL:

```bash
cp .env.example .env
```

2. Edit `.env` with your API endpoint:

```
API_BASE_URL=https://your-api-endpoint.com
```

3. Install dependencies:

```bash
npm install react-native-dotenv
# or
yarn add react-native-dotenv
```

### Auth State Management

- Authentication state is managed using Jotai atoms
- Bearer tokens are automatically included in all API requests
- User data is cached locally for offline access
- 401 responses trigger automatic logout

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests (Detox)
npm run test:e2e
```

## 📦 Building for Production

### iOS

```bash
cd ios
xcodebuild -workspace MFFMobile.xcworkspace -scheme MFFMobile -configuration Release
```

### Android

```bash
cd android
./gradlew assembleRelease
```

## 🚀 Deployment

### iOS

1. Configure code signing in Xcode
2. Archive the app
3. Upload to App Store Connect

### Android

1. Generate signed APK/AAB
2. Upload to Google Play Console

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Development Team**: MFF Mobile Development Team
- **Design Team**: MFF Design Team
- **Backend Team**: MFF Backend Team

## 📞 Support

For support, email contact@macrofriendlyfood.com or create a ticket in the app.

## 🏢 Company Information

**J&E Financial, LLC DBA Macro Friendly Food**
189 N Hwy 89 Ste C PMB 1047
North Salt Lake, UT 84054
United States
Phone: 801-200-3409

---

Built with ❤️ for the Macro Friendly Food community
