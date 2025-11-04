# WaterGo Client App - MVP

A complete water delivery mobile app built with React Native + Expo, similar to Uber Eats or Bolt Food.

## Tech Stack

- **Framework**: React Native + Expo CLI (SDK 51)
- **Language**: TypeScript
- **Navigation**: React Navigation (native-stack)
- **State Management**: Context API
- **Styling**: StyleSheet + Flexbox
- **Icons**: expo-vector-icons
- **Animations**: Lottie, Reanimated

## Design System

- Background: `#FFFFFF` (White)
- Text: `#0C1633` (Dark)
- Primary: `#2D6FFF` (Blue)

## Features

### Auth Flow
1. Loading Screen (splash)
2. Welcome Slides (onboarding)
3. Select Language
4. Ask Name
5. Auth Phone
6. Verify Code
7. Enable Location
8. Address Select

### Main App
1. Home (Firms List)
2. Firm Details (Products)
3. Cart
4. Order Tracking
5. Profile

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- Expo Go app on your iOS/Android device

### Steps

1. **Install Dependencies**
   ```bash
   cd /Users/musabekisakov/claudeCode/clientApp
   npm install
   ```

2. **Start Expo Dev Server**
   ```bash
   npx expo start
   ```

3. **Run in Expo Go**
   - Open Expo Go app on your phone
   - Scan the QR code from the terminal
   - App will load on your device

## Project Structure

```
/
├── App.tsx                 # Main app entry with providers
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── assets/                # Images, fonts, Lottie files
├── components/            # Reusable UI components
│   ├── PrimaryButton.tsx
│   ├── TextField.tsx
│   ├── PhoneInput.tsx
│   ├── FirmCard.tsx
│   ├── ProductCard.tsx
│   ├── AddressCard.tsx
│   ├── DriverInfoCard.tsx
│   ├── StageBadge.tsx
│   └── HeaderBar.tsx
├── constants/             # Colors, mock data, etc.
│   ├── Colors.ts
│   └── MockData.ts
├── context/               # Context API providers
│   ├── UserContext.tsx
│   ├── CartContext.tsx
│   └── OrderContext.tsx
├── navigation/            # Navigation setup
│   └── AppNavigator.tsx
├── screens/               # All app screens
│   ├── LoadingScreen.tsx
│   ├── WelcomeScreen.tsx
│   ├── SelectLanguageScreen.tsx
│   ├── AskNameScreen.tsx
│   ├── AuthPhoneScreen.tsx
│   ├── VerifyCodeScreen.tsx
│   ├── EnableLocationScreen.tsx
│   ├── AddressSelectScreen.tsx
│   ├── HomeScreen.tsx
│   ├── FirmDetailsScreen.tsx
│   ├── CartScreen.tsx
│   ├── OrderTrackingScreen.tsx
│   └── ProfileScreen.tsx
├── services/              # API services
│   └── api.ts             # Mock API calls
└── types/                 # TypeScript types
    └── index.ts

```

## Mock Data

The app uses mock data for:
- 4 water delivery firms
- 8+ products (different water bottle sizes)
- 3 sample addresses
- Mock driver info
- Simulated API calls with delays

## Order Stages

1. `ORDER_PLACED` - Order confirmed
2. `IN_QUEUE` - Preparing your order
3. `COURIER_ON_THE_WAY` - Driver on the way
4. `DELIVERED` - Order delivered

## Testing the App

### Mock Verification Code
- Any 4-digit code works (e.g., `1234`)

### Test Flow
1. Skip through onboarding slides
2. Select a language
3. Enter your name
4. Enter a phone number
5. Enter any 4-digit code
6. Allow/skip location
7. Select an address
8. Browse firms
9. Add products to cart
10. Place order
11. Track order in real-time

## Backend Integration

To connect to a real backend:

1. Replace mock API calls in `/services/api.ts`
2. Update endpoints to your backend URLs
3. Add authentication tokens
4. Handle real-time updates for order tracking

## Next Steps

- [ ] Connect to real backend API
- [ ] Add payment integration
- [ ] Implement push notifications
- [ ] Add order history
- [ ] Real-time driver location tracking
- [ ] Add product images
- [ ] Implement search/filters
- [ ] Add reviews and ratings

## Run in Expo Go

1. `npx expo start`
2. Scan QR code with Expo Go app
3. Test on iOS/Android

---

**Made with React Native + Expo**
*Production-ready MVP for water delivery*
