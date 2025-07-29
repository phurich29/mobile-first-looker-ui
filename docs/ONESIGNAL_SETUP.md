# OneSignal Push Notifications Setup Guide

This guide will help you integrate OneSignal push notifications into your Capacitor-based React app.

## 📋 Prerequisites

- OneSignal account (free at https://onesignal.com)
- Your app configured in OneSignal Dashboard
- Firebase project (for Android) and Apple Developer account (for iOS)

## 🚀 Quick Setup

### 1. **OneSignal Account Setup**

1. Go to [OneSignal Dashboard](https://app.onesignal.com)
2. Create a new app
3. Configure your platforms:
   - **iOS**: Upload your APNs certificates or key
   - **Android**: Add your Firebase Server Key
4. Copy your **App ID** from the settings

### 2. **Environment Configuration**

Add your OneSignal App ID to your `.env` file:

```env
REACT_APP_ONESIGNAL_APP_ID=your_onesignal_app_id_here
```

### 3. **Initialize OneSignal in Your App**

Add OneSignal initialization to your main App component:

```tsx
// App.tsx
import { useEffect } from 'react';
import { oneSignalService } from './services/OneSignalService';

function App() {
  useEffect(() => {
    const initOneSignal = async () => {
      await oneSignalService.initialize({
        appId: process.env.REACT_APP_ONESIGNAL_APP_ID!,
        requiresUserPrivacyConsent: false,
        promptForPushNotificationsWithUserResponse: true,
      });
    };

    initOneSignal();
  }, []);

  return (
    // Your app content
  );
}
```

### 4. **Using OneSignal in Components**

Use the provided hook to manage OneSignal in your components:

```tsx
import { useOneSignal } from '@/hooks/useOneSignal';

function NotificationSettings() {
  const {
    isInitialized,
    hasPermission,
    isPushEnabled,
    setSubscription,
    sendTags,
  } = useOneSignal();

  const handleToggleNotifications = async () => {
    await setSubscription(!isPushEnabled);
  };

  const handleSetUserTags = async () => {
    await sendTags({
      user_type: 'premium',
      device_type: 'mobile',
      last_login: new Date().toISOString(),
    });
  };

  return (
    <div>
      <p>Notifications: {isPushEnabled ? 'Enabled' : 'Disabled'}</p>
      <button onClick={handleToggleNotifications}>
        Toggle Notifications
      </button>
      <button onClick={handleSetUserTags}>
        Update User Tags
      </button>
    </div>
  );
}
```

## 📱 Platform-Specific Setup

### Android Setup

1. **Add to `android/app/build.gradle`:**
```gradle
dependencies {
    implementation 'com.onesignal:OneSignal:[5.0.0, 5.99.99]'
}
```

2. **Update `android/app/src/main/AndroidManifest.xml`:**
```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### iOS Setup

1. **Add to `ios/App/Podfile`:**
```ruby
pod 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'
```

2. **Enable Push Notifications capability** in Xcode
3. **Add Notification Service Extension** (optional, for rich media)

## 🔧 Build Process

After making these changes, rebuild your native projects:

```bash
# Install new dependencies
npm install

# Sync with native projects
npx cap sync

# Build for production
npm run build

# Copy to native projects
npx cap copy

# Open in native IDEs for final setup
npx cap open ios
npx cap open android
```

## 💡 Usage Examples

### Send User-Specific Tags
```tsx
const { sendTags, setExternalUserId } = useOneSignal();

// Set user ID for targeting
await setExternalUserId(user.id);

// Send user segmentation tags
await sendTags({
  user_type: 'premium',
  subscription_plan: 'pro',
  device_count: '5',
  last_active: new Date().toISOString(),
});
```

### Handle Notification Data
Notifications can include custom data that your app can use for navigation:

```json
{
  "headings": {"en": "Rice Storage Alert"},
  "contents": {"en": "Your rice moisture level is too high"},
  "data": {
    "screen": "DeviceDetails",
    "deviceCode": "RICE001",
    "alertType": "moisture_high"
  }
}
```

### Check Notification Status
```tsx
const { hasPermission, isPushEnabled, deviceState } = useOneSignal();

console.log('Permission granted:', hasPermission);
console.log('Push enabled:', isPushEnabled);
console.log('Player ID:', deviceState?.userId);
```

## 🎯 Integration with Your Notification System

Since you already have a notification system, you can integrate OneSignal:

```tsx
// In your existing notification service
import { oneSignalService } from './OneSignalService';

export const enhanceNotificationWithPush = async (notification: Notification) => {
  // Store in your existing system
  await saveNotificationToDatabase(notification);
  
  // Get OneSignal player ID for the user
  const playerId = await oneSignalService.getPlayerId();
  
  if (playerId) {
    // Send via OneSignal API (server-side)
    await sendPushNotification({
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [playerId],
      headings: { en: notification.title },
      contents: { en: notification.message },
      data: {
        deviceCode: notification.deviceCode,
        screen: 'DeviceDetails',
      },
    });
  }
};
```

## 🔐 Security Considerations

1. **Environment Variables**: Never commit your OneSignal App ID or API keys
2. **User Consent**: Always request permission before sending notifications
3. **Data Privacy**: Be careful with user data in notification tags

## 🐛 Troubleshooting

### Common Issues:

1. **"OneSignal not initialized"**
   - Ensure you're calling `initialize()` before other methods
   - Check if running on a native platform

2. **"Permission denied"**
   - Request permission explicitly using `requestPermission()`
   - Check device notification settings

3. **"Player ID is null"**
   - Wait for initialization to complete
   - Ensure the device has internet connection

### Debug Mode:
Enable detailed logging:
```tsx
await oneSignalService.initialize({
  appId: 'your-app-id',
  // Add debug logging
});
```

## 📚 Additional Resources

- [OneSignal React Native SDK](https://documentation.onesignal.com/docs/react-native-sdk-setup)
- [OneSignal REST API](https://documentation.onesignal.com/reference/create-notification)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)

## 🎉 Next Steps

1. Set up your OneSignal app and get your App ID
2. Configure platform-specific settings (APNs, FCM)
3. Test notifications on physical devices
4. Implement server-side notification sending
5. Add notification analytics and tracking
