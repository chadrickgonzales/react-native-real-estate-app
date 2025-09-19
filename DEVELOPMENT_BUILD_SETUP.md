# Development Build Setup for Push Notifications

## Issue
The app is currently using Expo Go, which doesn't support Android push notifications in SDK 53+. To enable full push notification functionality, you need to create a development build.

## Solution

### Option 1: Create Development Build (Recommended)

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

4. **Create Development Build**:
   ```bash
   # For Android
   eas build --profile development --platform android
   
   # For iOS
   eas build --profile development --platform ios
   ```

5. **Install the development build** on your device and use it instead of Expo Go.

### Option 2: Use Expo Dev Client (Alternative)

1. **Install Expo Dev Client**:
   ```bash
   npx expo install expo-dev-client
   ```

2. **Create development build locally**:
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

## Current Workaround

The app has been updated to handle the Expo Go limitation gracefully:
- Push notifications are disabled when running in Expo Go on Android
- A warning message is logged instead of throwing an error
- The app continues to function normally for other features

## Testing Push Notifications

To test push notifications:
1. Create a development build using one of the methods above
2. Install the development build on your device
3. Run the app from the development build instead of Expo Go
4. Push notifications will work normally

## Production Considerations

For production deployment:
- Use EAS Build to create production builds
- Configure push notification certificates for iOS
- Set up Firebase Cloud Messaging for Android
- Test notifications thoroughly before release

## Files Modified

- `lib/useNotifications.ts` - Added Expo Go detection and graceful fallback
- Added this documentation file

The app will now work in both Expo Go (with limited notification functionality) and development builds (with full functionality).
