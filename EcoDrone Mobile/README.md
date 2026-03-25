# EcoDrone Mobile

A React Native mobile app recreation of the EcoDrone web app — Ashesi University's campus drone food delivery platform.

---

## What This Is

This folder contains a full React Native (Expo) port of the original EcoDrone web app located at `../EcoDrone Mobile App UI`. Every screen, user flow, and design detail has been faithfully recreated using React Native primitives and mobile-appropriate patterns. The original web app code was not modified.

---

## Project Structure

```
EcoDrone Mobile/
├── App.tsx                          # Root entry point
├── app.json                         # Expo app configuration
├── package.json                     # Dependencies
├── babel.config.js                  # Babel config for Expo
├── tsconfig.json                    # TypeScript config
└── src/
    ├── theme/
    │   └── colors.ts                # Brand color palette (#8A1538 burgundy + semantic colors)
    ├── navigation/
    │   └── AppNavigator.tsx         # Stack + Bottom Tab navigator setup
    ├── components/
    │   ├── CustomButton.tsx         # Reusable button (primary / secondary / outline)
    │   ├── VendorCard.tsx           # Vendor card with image, rating, delivery time
    │   └── StatusIndicator.tsx      # Multi-step order progress indicator
    └── screens/
        ├── LoginScreen.tsx          # Email/password login with drone hero image
        ├── SignUpScreen.tsx         # Registration form (name, email, phone, password)
        ├── VendorBrowseScreen.tsx   # Home screen — vendor grid with search & quick stats
        ├── MenuOrderScreen.tsx      # Menu items, add/remove cart, delivery location input
        ├── CheckoutScreen.tsx       # Order review, Mobile Money payment, success screen
        ├── OrdersScreen.tsx         # Current & past orders list with status badges
        ├── OrderTrackingScreen.tsx  # Real-time delivery status with step indicator
        ├── OrderBreakdownScreen.tsx # Completed order detail view with payment summary
        ├── DroneTemperatureScreen.tsx # Live temperature chart + stats grid
        └── ProfileScreen.tsx        # User profile, quick stats, settings menu, logout
```

---

## Screens & Navigation

### Authentication (no bottom tab bar)

| Screen  | Description                                                           |
| ------- | --------------------------------------------------------------------- |
| Login   | Drone hero image, email/password fields, remember me, forgot password |
| Sign Up | Full registration form with terms & conditions checkbox               |

### Main App (with bottom tab bar)

| Tab     | Screens                                  |
| ------- | ---------------------------------------- |
| Home    | VendorBrowse → MenuOrder → Checkout      |
| Orders  | Orders → OrderTracking or OrderBreakdown |
| Temp    | DroneTemperature                         |
| Profile | Profile                                  |

---

## Tech Stack

| Library                                                                                       | Purpose                                          |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [Expo](https://expo.dev) ~51                                                                  | Build toolchain and runtime                      |
| [React Navigation v6](https://reactnavigation.org)                                            | Stack + Bottom Tab navigation                    |
| [@expo/vector-icons](https://docs.expo.dev/guides/icons/)                                     | Ionicons & MaterialIcons (replaces Lucide React) |
| [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)               | Temperature line chart                           |
| [react-native-svg](https://github.com/software-mansion/react-native-svg)                      | SVG support for charts                           |
| [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) | Safe area / notch handling                       |

---

## Design System

All design tokens are preserved from the original web app:

- **Primary color:** `#8A1538` (burgundy) — buttons, headers, accents
- **Font:** System default (Inter was loaded via Google Fonts in the web version; system fonts render similarly on iOS/Android)
- **Border radius:** 10–14px rounded cards
- **Shadows:** Consistent card elevation across Android and iOS

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode + iOS Simulator, or the [Expo Go](https://expo.dev/go) app
- For Android: Android Studio + emulator, or the [Expo Go](https://expo.dev/go) app

### Install & Run

```bash
cd "EcoDrone Mobile"
npm install
npx expo start
```

if the above doesn't work use watchman
. brew install watchman
. npx expo start -c

Then press:

- `i` to open in iOS Simulator
- `a` to open in Android emulator
- Scan the QR code with the Expo Go app on a physical device

---

## Key Differences from the Web App

| Web App                             | Mobile App                                       |
| ----------------------------------- | ------------------------------------------------ |
| Tailwind CSS                        | React Native `StyleSheet`                        |
| Lucide React icons                  | `@expo/vector-icons` (Ionicons / MaterialIcons)  |
| Recharts line chart                 | `react-native-chart-kit`                         |
| State-based navigation (`useState`) | React Navigation (Stack + Bottom Tabs)           |
| `<select>` dropdown                 | Custom in-line dropdown using `TouchableOpacity` |
| Fixed bottom nav (CSS)              | Native Bottom Tab Navigator                      |
| Browser safe area via CSS           | `react-native-safe-area-context`                 |

---

## Data

All data is mocked (identical to the web app):

- **4 vendors:** Akornor, Hallmark, Campus Café, Quick Bites
- **4 menu items:** Jollof Rice, Waakye Combo, Grilled Chicken & Fries, Fried Rice Special
- **7 past orders** with mixed statuses (Delivered, Cancelled, In Transit)
- **Temperature data:** 9 readings over 8 minutes (60°C – 65°C, safe range 55°C – 70°C)

---

_An Agile5 Product — Sustainable campus delivery at Ashesi University_
