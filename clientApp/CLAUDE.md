# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WaterGo is a React Native + Expo mobile app for water delivery service (similar to Uber Eats/Bolt Food), built with TypeScript. The app supports iOS and Android, uses Context API for state management, and features a complete authentication flow with real-time order tracking.

## Build & Development Commands

### Starting the App
- **Never run** `npm run dev` (not available in this project)
- Start development server: `npx expo start`
- Start with cache clear: `npx expo start -c`
- Run on iOS simulator: `npx expo run:ios`
- Run on Android emulator: `npx expo run:android`

### Building & Testing
- **Check TypeScript compilation**: `npm run built` or `npx tsc --noEmit`
- After making changes, run build check to verify code compiles
- Fix any TypeScript errors before proceeding

### Installation
```bash
npm install                    # Install dependencies
npx expo install <package>    # Add Expo-compatible package
```

## Architecture

### Core Stack
- **Framework**: React Native + Expo SDK 51
- **Language**: TypeScript (strict mode enabled)
- **Navigation**: React Navigation v6 (native-stack + bottom-tabs)
- **State Management**: Context API (UserContext, CartContext, OrderContext, ToastContext)
- **Maps**: Yandex MapKit (`react-native-yamap`)
- **Backend**: Express.js with PostgreSQL
- **Phone Auth**: SMS verification (console logs in dev mode)

### Application Flow

**Authentication Flow:**
1. LoadingScreen → WelcomeScreen → SelectLanguageScreen
2. AskNameScreen → AuthPhoneScreen (SMS verification)
3. VerifyCodeScreen → EnableLocationScreen
4. AddressSelectScreen (Yandex Maps integration)
5. → MainNavigator (tabs)

**Main App Navigation:**
- Bottom tabs: Home, Cart, Orders, Profile
- Stack screens: FirmDetails, OrderTracking, SelectAddress, PaymentMethod

### API Service Layer

The app uses a **dual-mode API system** controlled by `config/api.config.ts`:

1. **Mock API** (`services/mock-api.service.ts`): Default in development
2. **Real API** (`services/real-api.service.ts`): For production backend

Toggle modes via `useMockData` flag in config or runtime:
```typescript
import { setUseMockData } from './config/api.config';
setUseMockData(true);  // Use mock data
setUseMockData(false); // Use real backend
```

**Main API service**: `services/api.ts` (use this in components)
- Automatically routes to mock or real API
- Handles token storage, refresh, and retry logic
- All methods throw user-friendly error messages

### Key Directories

```
services/          # API layer: api.ts (main), mock/real implementations, storage
context/           # React Context providers: User, Cart, Order, Toast
screens/           # 19 screens (auth + main app)
components/        # Reusable UI components (buttons, cards, inputs)
navigation/        # AppNavigator with Auth/Main stacks
config/            # API, Supabase, MapKit configuration
types/             # TypeScript type definitions
constants/         # Colors, mock data
```

### Context Providers

**UserContext**: Manages user authentication state, profile data
**CartContext**: Shopping cart state (items, quantities, totals)
**OrderContext**: Current order state and tracking
**ToastContext**: App-wide toast notifications

All contexts are provided in `App.tsx` and accessible via hooks (`useUser`, `useCart`, etc.)

### Yandex Maps Integration

- **Required for**: AddressSelectScreen, SelectAddressScreen
- **Cannot run in Expo Go**: Requires custom development build
- Initialized in `App.tsx` with API key from `config/mapkit.config.ts`
- Build commands: `npx expo run:ios` or `npx expo run:android`
- See `YANDEX_MAPKIT_SETUP.md` for complete setup

### Environment Variables

Required in `.env` file (see `.env.example`):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_YANDEX_MAPKIT_KEY=your-mapkit-key
```

Accessed via:
```typescript
import Constants from 'expo-constants';
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
```

### Order Lifecycle

Orders progress through these stages (defined in `types/index.ts`):
1. `ORDER_PLACED` - Order confirmed
2. `IN_QUEUE` - Being prepared
3. `COURIER_ON_THE_WAY` - Driver delivering
4. `DELIVERED` - Completed

### TypeScript Configuration

- Strict mode enabled (`strict: true`)
- Path alias: `@/*` maps to project root
- Unused variables/parameters not allowed
- Import resolution via `moduleResolution: "node"`

## Backend Integration

### Current State
- App works with **mock data** by default
- Mock API simulates all endpoints with delays
- Backend ready to connect via `services/real-api.service.ts`

### Connecting Real Backend

1. Update `config/api.config.ts`:
   ```typescript
   development: {
     baseURL: 'http://YOUR_BACKEND_URL:3000/api',
     useMockData: false,
   }
   ```

2. Backend must implement all endpoints documented in `API_DOCUMENTATION.md`

3. Response format must match:
   ```json
   {
     "success": true,
     "data": { ... }
   }
   ```

### API Endpoints (see API_DOCUMENTATION.md)
- Auth: `/auth/send-code`, `/auth/verify-code`, `/auth/logout`
- User: `/user/profile`, `/user/addresses`
- Data: `/firms`, `/products`
- Orders: `/orders` (POST/GET), `/orders/:id/status`, `/orders/:id/driver`
- Location: `/location/reverse-geocode`

## Design System

### Visual Design Language

The app follows a **clean, modern, minimalist design** with emphasis on whitespace and clarity.

**Colors** (defined in `constants/Colors.ts`):
- Background: `#FFFFFF` (white)
- Text Primary: `#0C1633` (dark navy) - used for headings
- Text Secondary: `#8E99AB` (gray) - used for subtitles/descriptions
- Primary Button: `#2D6FFF` (vibrant blue) - main CTA buttons
- Secondary colors: success green, error red, warning yellow

### UI Patterns for Welcome/Onboarding Screens

Based on the onboarding design (see WelcomeScreen):

**Layout Structure:**
1. **Centered illustration** (top 50% of screen)
   - Large, colorful vector icons/illustrations
   - Generous whitespace around graphics
   - Icons should be simple, flat design style

2. **Main heading** (centered)
   - Large, bold text (28-32px)
   - Dark navy color (#0C1633)
   - Short, impactful messaging

3. **Subtitle/description** (centered, below heading)
   - Medium-sized text (16-18px)
   - Gray color (#8E99AB)
   - 2-3 lines maximum
   - Descriptive, friendly tone

4. **Pagination dots** (horizontal center)
   - Small circular indicators
   - Active dot: Primary blue (#2D6FFF)
   - Inactive dots: Light gray
   - Positioned above CTA button

5. **Primary CTA button** (bottom)
   - Full-width with horizontal margins (16-24px)
   - Bright blue background (#2D6FFF)
   - White text, bold weight
   - Large tap target (minimum 48px height)
   - Rounded corners (borderRadius: 12-16)
   - Fixed to bottom with safe area padding

**Typography Hierarchy:**
- Headings: Bold, 28-32px, #0C1633
- Body text: Regular, 16-18px, #8E99AB
- Button text: Semi-bold, 16-18px, #FFFFFF

**Component Spacing:**
- Screen padding: 24-32px horizontal
- Vertical spacing between elements: 16-24px
- Button bottom margin: Use safe area insets
- Minimum touch targets: 48x48px

**Icon/Illustration Guidelines:**
- Use simple, flat vector illustrations
- Primary colors: Blue (#2D6FFF), light blue tints
- Accent colors: Yellow/orange for highlights
- Style: Friendly, approachable, modern
- Size: Large enough to be focal point (200-300px)

### UI Patterns for Selection/List Screens

Based on language selection design (see SelectLanguageScreen):

**Layout Structure:**
1. **Header section** (top, centered)
   - Icon (globe, user, etc.) - 48-60px, dark navy (#0C1633)
   - Main heading - Bold, 28-32px, centered
   - Subtitle - Regular, 16-18px, gray (#8E99AB), centered
   - Generous top padding (60-80px from safe area)

2. **Selection cards** (scrollable list)
   - Each card is a pressable container
   - White background with subtle border/shadow
   - Border radius: 16-20px
   - Vertical spacing between cards: 12-16px
   - Horizontal margin: 16-24px from screen edges

3. **Card content layout** (horizontal flex)
   - **Left**: Flag/icon (48x48px with border radius 8px)
   - **Center**: Language name (vertical stack)
     - Primary text: Bold, 18-20px, dark navy
     - Secondary text: Regular, 14-16px, gray
   - **Right**: Selection indicator (if selected)
     - Blue checkmark circle (#2D6FFF)
     - 32-40px diameter
     - White checkmark icon inside

4. **Card states:**
   - Default: White background, light border (#E5E9F2)
   - Selected: White background, blue checkmark visible
   - Pressed: Slight opacity change (0.7-0.8)
   - Hover: Light gray background (web only)

**Selection Card Specifications:**
```
Card Structure:
├─ Padding: 16-20px
├─ Min height: 72-80px
├─ Border radius: 16-20px
├─ Border: 1px solid #E5E9F2 (optional)
├─ Shadow: subtle (elevation 1-2)
└─ Content:
   ├─ Icon/Flag (left): 48x48px, margin-right: 16px
   ├─ Text Stack (center, flex: 1):
   │  ├─ Primary: 18-20px, bold, #0C1633
   │  └─ Secondary: 14-16px, regular, #8E99AB
   └─ Checkmark (right): 32-40px circle, #2D6FFF, white icon
```

**Interactive Behavior:**
- Single selection (radio button behavior)
- Tap anywhere on card to select
- Smooth transition when selection changes
- Only one card can have checkmark at a time
- Consider adding haptic feedback on selection (iOS/Android)

## Important Implementation Notes

1. **Native dependencies**: Due to `react-native-yamap`, the app requires development builds, not Expo Go
2. **Location permissions**: Handled via `expo-location` plugin in `app.json`
3. **Phone authentication**: Uses SMS service (code logged to console in dev mode)
4. **Token management**: Automatic refresh on 401 errors via `services/http.service.ts`
5. **Storage**: SecureStore for tokens, AsyncStorage for user data

### Shadow Performance Best Practice

**CRITICAL**: When using shadows on Views, always set a `backgroundColor` to avoid performance warnings.

**❌ Incorrect (causes warning):**
```typescript
<View style={{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3, // Android
}}>
  {/* Content */}
</View>
```

**✅ Correct:**
```typescript
<View style={{
  backgroundColor: '#FFFFFF', // REQUIRED for efficient shadow rendering
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3, // Android
  borderRadius: 16,
}}>
  {/* Content */}
</View>
```

**Why**: React Native cannot efficiently calculate shadows on transparent backgrounds. Always specify a solid `backgroundColor` on any View with shadow properties.

**Common shadow styles used in app:**
- Cards: `backgroundColor: '#FFFFFF'` + subtle shadow (opacity: 0.08-0.1)
- Elevated buttons: `backgroundColor: '#2D6FFF'` + medium shadow (opacity: 0.15-0.2)
- Floating elements: Stronger shadows (opacity: 0.2-0.25)

## Common Development Patterns

### Making API Calls
```typescript
import ApiService from './services/api';

// In component
const firms = await ApiService.getFirms();
const order = await ApiService.createOrder(orderData);
```

### Using Context
```typescript
import { useCart } from './context/CartContext';

const { cart, addToCart, removeFromCart } = useCart();
```

### Navigation
```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('FirmDetails', { firmId: '123' });
```

## Documentation Files

- `API_DOCUMENTATION.md` - Complete API specification
- `API_INTEGRATION_GUIDE.md` - Detailed backend integration guide
- `QUICK_START.md` - Quick reference for running the app
- `USAGE_EXAMPLES.md` - Code examples for common tasks
- `YANDEX_MAPKIT_SETUP.md` - Maps integration setup

## Troubleshooting

### Build Issues
- Run `npx expo start -c` to clear cache
- Delete `node_modules`, run `npm install`
- For iOS: `cd ios && pod install && cd ..`
- For Android: `cd android && ./gradlew clean && cd ..`

### TypeScript Errors
- Run `npx tsc --noEmit` to check errors
- Ensure all types are imported from `types/index.ts`

### Map Not Working
- Verify development build (not Expo Go)
- Check `EXPO_PUBLIC_YANDEX_MAPKIT_KEY` in `.env`
- Verify permissions in `app.json`
