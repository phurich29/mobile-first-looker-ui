# FCM Notification Troubleshooting Guide

## Issue: `onNotificationReceived` not working

The FCM notifications are not working due to several configuration and implementation issues.

## Problems Identified:

### 1. **Invalid Firebase Configuration**
- The Firebase config contains placeholder values that don't correspond to a real Firebase project
- Without valid credentials, FCM token generation fails
- Service worker registration may fail with invalid config

### 2. **Missing Environment Variables**
- Firebase configuration should be loaded from environment variables
- VAPID key is hardcoded with a placeholder value

### 3. **Service Worker Issues**
- Service worker registration lacks proper error handling
- Background message handling might not work with invalid config

## Solutions Applied:

### 1. **Updated Firebase Configuration**
```typescript
// Updated firebase.ts to use environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "fallback-value",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fallback-value",
  // ... other config
};
```

### 2. **Enhanced Error Handling**
- Added comprehensive logging to FCM service
- Better error messages for debugging
- Improved service worker registration with error handling

### 3. **Debug Tools**
- Created `FCMDebugComponent` to test and diagnose issues
- Added `fcmTestUtils` for testing notifications
- Enhanced logging throughout the FCM flow

### 4. **Fixed Notification Flow**
```typescript
// Fixed order in handleForegroundMessage
private handleForegroundMessage(payload: any): void {
  // Call callback first
  this.onNotificationReceived?.(payload);
  
  // Then show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    // ... show notification
  }
}
```

## Steps to Fix:

### 1. **Set up Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Cloud Messaging
4. Get configuration values from Project Settings

### 2. **Configure Environment Variables**
1. Copy `.env.example` to `.env`
2. Replace placeholder values with your actual Firebase config:
```bash
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### 3. **Generate VAPID Key**
1. In Firebase Console > Project Settings > Cloud Messaging
2. Go to "Web Push certificates" section
3. Generate or use existing key pair
4. Copy the "Key pair" value to `VITE_FIREBASE_VAPID_KEY`

### 4. **Update Service Worker**
Update `/public/firebase-messaging-sw.js` with your actual Firebase config.

### 5. **Test Implementation**
1. Use the `FCMDebugComponent` (temporarily added to App.tsx)
2. Check browser console for detailed logs
3. Test notifications using the debug panel
4. Verify permissions are granted

## Testing Steps:

1. **Open browser dev tools** and check console for FCM logs
2. **Allow notifications** when prompted
3. **Use FCM Debug Component** to:
   - Check status
   - Request permissions
   - Test notifications
   - Initialize FCM
4. **Send test notification** from Firebase Console

## Common Issues:

### Permission Denied
- Browser notification permission was denied
- Use debug component to request permission again

### Invalid Configuration
- Firebase config values are still placeholders
- Check environment variables are loaded correctly

### Service Worker Not Registered
- Service worker registration failed
- Check browser console for registration errors

### Token Generation Failed
- Invalid VAPID key or Firebase config
- Check Firebase Console configuration

## Production Considerations:

1. **Remove FCMDebugComponent** from production build
2. **Secure environment variables** - never commit real values to git
3. **Test on different browsers** and devices
4. **Implement proper error handling** for production users
5. **Monitor FCM token refresh** for long-running sessions

## Next Steps:

1. Set up real Firebase project with valid configuration
2. Test FCM with actual server-side implementation
3. Implement proper user authentication for targeted notifications
4. Add notification preferences and unsubscribe functionality
