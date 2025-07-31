# 🔔 Firebase FCM Notification Handling - Complete Guide

## 📋 Overview

Your mobile app now has a comprehensive Firebase Cloud Messaging (FCM) system for handling push notifications across web, iOS, and Android platforms.

## 🏗️ Architecture

### Client-Side Components

1. **`src/services/firebase.ts`** - Firebase configuration and web messaging
2. **`src/services/fcmService.ts`** - Cross-platform FCM service
3. **`src/hooks/useFCM.ts`** - React hook for FCM integration
4. **`src/components/NotificationManager.tsx`** - UI component for notification management
5. **`src/utils/fcmTester.ts`** - Testing utilities for development
6. **`public/firebase-messaging-sw.js`** - Service worker for background notifications

### Server-Side Components

7. **`docs/FCM_SERVER_IMPLEMENTATION.md`** - Server implementation examples

## 🚀 How to Use

### 1. Basic Integration in Components

```tsx
import { useFCM } from '@/hooks/useFCM';

function MyComponent() {
  const {
    isInitialized,
    token,
    error,
    requestPermission,
    sendTokenToServer
  } = useFCM({
    autoSendToServer: true,
    userId: 'current-user-id',
    onNotificationReceived: (notification) => {
      console.log('New notification:', notification);
    },
    onNotificationOpened: (notification) => {
      // Handle notification tap
      if (notification.data?.route) {
        navigate(notification.data.route);
      }
    }
  });

  return (
    <div>
      <p>Status: {isInitialized ? 'Ready' : 'Not Ready'}</p>
      {token && <p>Token: {token.substring(0, 20)}...</p>}
      <button onClick={requestPermission}>Enable Notifications</button>
    </div>
  );
}
```

### 2. Using the Notification Manager

The `NotificationManager` component provides a complete UI for managing notifications:

```tsx
import { NotificationManager } from '@/components/NotificationManager';

function NotificationsPage() {
  return (
    <div>
      <h1>Push Notifications</h1>
      <NotificationManager />
    </div>
  );
}
```

### 3. Testing Notifications in Development

```javascript
// In browser console:
fcmTest.deviceAlert()        // Test device alert
fcmTest.measurement()        // Test measurement update  
fcmTest.browserTest("deviceAlert")  // Test browser notification
fcmTest.list()              // List all test notifications
```

## 📱 Platform-Specific Features

### Web Platform
- ✅ Service worker for background notifications
- ✅ Browser notification API
- ✅ Click actions and data handling
- ✅ Custom notification UI in foreground

### iOS Platform
- ✅ Native push notifications via APNS
- ✅ Badge count management
- ✅ Sound and vibration
- ✅ Background app refresh

### Android Platform
- ✅ Native push notifications via FCM
- ✅ Notification channels
- ✅ Custom notification icons
- ✅ Background processing

## 🔧 Configuration

### 1. Firebase Configuration

Update `src/services/firebase.ts` with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 2. VAPID Key Configuration

Update the VAPID key in `src/services/firebase.ts`:

```typescript
const currentToken = await getToken(messaging, {
  vapidKey: 'your-vapid-key-here'
});
```

### 3. Service Worker Configuration

The service worker is automatically registered and handles:
- Background message reception
- Notification display
- Click handling
- App opening/focusing

## 📊 Notification Types

The system supports various notification types:

### Device Alerts
```javascript
{
  title: "🚨 Device Alert",
  body: "Temperature sensor exceeded threshold",
  data: {
    deviceId: "sensor_001",
    alertType: "temperature_high",
    action: "open_device",
    route: "/devices/sensor_001"
  }
}
```

### Measurement Updates
```javascript
{
  title: "📊 New Measurements",
  body: "Latest quality measurements available",
  data: {
    measurementCount: 5,
    action: "open_measurements",
    route: "/measurements"
  }
}
```

### System Notifications
```javascript
{
  title: "🔧 System Maintenance",
  body: "Scheduled maintenance in 30 minutes",
  data: {
    maintenanceStart: "2025-07-31T10:00:00Z",
    action: "show_modal"
  }
}
```

## 🔄 Server Integration

### 1. Token Registration API

```typescript
// POST /api/fcm/register
{
  "token": "fcm_token_here",
  "userId": "user_123",
  "platform": "web|ios|android"
}
```

### 2. Send Notification API

```typescript
// POST /api/notifications/send
{
  "userId": "user_123",
  "title": "Notification Title",
  "body": "Notification Body",
  "data": {
    "type": "device_alert",
    "deviceId": "sensor_001",
    "action": "open_device",
    "route": "/devices/sensor_001"
  }
}
```

## 🧪 Development & Testing

### 1. Testing Utilities

Use the built-in testing utilities for development:

```javascript
// Test different notification scenarios
fcmTest.deviceAlert()
fcmTest.measurement()
fcmTest.maintenance()
fcmTest.battery()
fcmTest.sync()
fcmTest.connection()
```

### 2. Debug Mode

Enable detailed logging by checking the browser console for FCM-related logs marked with 🔔.

### 3. Token Validation

The system automatically validates tokens and handles errors gracefully.

## 🔐 Security Considerations

1. **Token Management**: Tokens are securely stored and automatically refreshed
2. **Server Validation**: All tokens are validated before storage
3. **Data Sanitization**: Notification data is properly sanitized
4. **Permission Handling**: Proper permission request flow

## 📈 Analytics & Monitoring

### Notification Logs
The `NotificationManager` component keeps a log of:
- Received notifications
- Opened notifications
- Timestamp data
- Custom data payloads

### Error Handling
- Registration errors
- Permission denials
- Network failures
- Invalid tokens

## 🚀 Production Deployment

### 1. Environment Variables
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### 2. Build Configuration

Ensure service worker is properly served:

```typescript
// vite.config.ts
export default defineConfig({
  // ... other config
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sw: resolve(__dirname, 'public/firebase-messaging-sw.js')
      }
    }
  }
});
```

### 3. Server Deployment

Deploy your FCM server implementation with proper:
- Firebase Admin SDK credentials
- Database for token storage
- API endpoints for token management
- Notification sending capabilities

## 📚 Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Web Push Protocol](https://web.dev/push-notifications/)

## 🐛 Troubleshooting

### Common Issues

1. **Notifications not working on iOS**: Ensure proper APNS configuration
2. **Service worker not registering**: Check HTTPS requirement and file path
3. **Token not generating**: Verify Firebase configuration and VAPID key
4. **Permissions denied**: Handle permission rejection gracefully

### Debug Steps

1. Check browser console for FCM logs
2. Verify service worker registration
3. Test with `fcmTest` utilities
4. Validate Firebase configuration
5. Check network requests in browser DevTools

Your FCM notification system is now ready for production use! 🎉
