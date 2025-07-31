# Firebase Cloud Messaging (FCM) Push Notifications

This implementation provides comprehensive FCM push notification support for your Capacitor-based React app with TypeScript.

## 🚀 Features

- ✅ **Cross-platform support** (Web, iOS, Android)
- ✅ **TypeScript support** with full type safety
- ✅ **React hooks** for easy integration
- ✅ **Background notifications** via service worker
- ✅ **Foreground notifications** with custom UI
- ✅ **Token management** with server sync
- ✅ **Error handling** and retry logic
- ✅ **Permission management**
- ✅ **Notification settings UI**

## 📦 Installation

The required packages are already installed:
```bash
npm install @capacitor/push-notifications firebase
```

## 🔧 Setup

### 1. Firebase Configuration

Update `src/services/firebase.ts` with your actual Firebase project details:

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

### 2. VAPID Key

Replace the VAPID key in `src/services/firebase.ts` with your Web Push certificate key from Firebase Console:

```typescript
const currentToken = await getToken(messaging, {
  vapidKey: 'your-vapid-key-here'
});
```

### 3. Service Worker

The Firebase messaging service worker is already created at `public/firebase-messaging-sw.js`. Update the Firebase config in this file to match your project.

### 4. Server Implementation

Implement the server-side API endpoints for token management:
- `POST /api/fcm/register` - Register FCM tokens
- `POST /api/fcm/unregister` - Remove FCM tokens
- `POST /api/fcm/send` - Send notifications

See `docs/FCM_SERVER_IMPLEMENTATION.md` for detailed server examples.

## 🎯 Usage

### Basic Integration

```typescript
import { useFCM } from '@/hooks/useFCM';

function MyComponent() {
  const { isInitialized, token, requestPermission } = useFCM({
    userId: 'user-123',
    autoSendToServer: true,
    onNotificationReceived: (notification) => {
      console.log('Received:', notification);
    },
    onNotificationOpened: (notification) => {
      console.log('Opened:', notification);
    }
  });

  return (
    <div>
      {!isInitialized && (
        <button onClick={requestPermission}>
          Enable Notifications
        </button>
      )}
      {token && <p>Token: {token}</p>}
    </div>
  );
}
```

### Notification Settings Component

```typescript
import { NotificationSettings } from '@/components/NotificationSettings';

function SettingsPage() {
  return (
    <NotificationSettings
      userId="user-123"
      onTokenReceived={(token) => console.log('Token:', token)}
      onNotificationReceived={(notification) => console.log('Notification:', notification)}
    />
  );
}
```

### Manual Service Usage

```typescript
import { fcmService } from '@/services/fcmService';

// Initialize
await fcmService.initialize();

// Get token
const token = fcmService.getToken();

// Send to server
await fcmService.sendTokenToServer(token, 'user-123');
```

## 🧪 Testing

Visit `/fcm-test` in your app to access the FCM test page where you can:
- Enable/disable notifications
- View FCM registration token
- Test notification payloads
- Monitor notification events

## 📱 Platform-Specific Setup

### Web
- Service worker automatically registers
- Requires HTTPS in production
- VAPID key needed for token generation

### Android
- `google-services.json` already configured
- Push notifications plugin auto-configured
- Background notifications work automatically

### iOS
- Apple Push Notification service (APNs) setup required
- Push notification capabilities needed
- Background modes for remote notifications

## 🔐 Security Best Practices

1. **Environment Variables**: Store sensitive config in environment variables
2. **Server Authentication**: Authenticate API requests for token management
3. **Token Validation**: Validate FCM tokens before storing
4. **Rate Limiting**: Implement rate limiting for notification endpoints
5. **HTTPS**: Always use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

1. **No token received**
   - Check Firebase configuration
   - Verify VAPID key
   - Ensure HTTPS in production

2. **Notifications not showing**
   - Check notification permissions
   - Verify service worker registration
   - Check browser console for errors

3. **Token registration fails**
   - Verify server endpoints
   - Check network connectivity
   - Review server logs

### Debug Mode

Enable debug logging by adding to your console:
```javascript
// Enable debug mode
window.FCM_DEBUG = true;
```

## 📚 API Reference

### useFCM Hook

```typescript
interface UseFCMOptions {
  onTokenReceived?: (token: string) => void;
  onNotificationReceived?: (notification: any) => void;
  onNotificationOpened?: (notification: any) => void;
  onError?: (error: any) => void;
  autoSendToServer?: boolean;
  userId?: string;
}

interface UseFCMReturn {
  isInitialized: boolean;
  token: string | null;
  error: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
  sendTokenToServer: (userId?: string) => Promise<void>;
  removeTokenFromServer: () => Promise<void>;
}
```

### FCMService Class

```typescript
class FCMService {
  initialize(): Promise<void>;
  getToken(): string | null;
  sendTokenToServer(token: string, userId?: string): Promise<void>;
  removeTokenFromServer(token: string): Promise<void>;
  
  // Event handlers
  onTokenReceived?: (token: string) => void;
  onNotificationReceived?: (notification: any) => void;
  onNotificationOpened?: (notification: any) => void;
  onRegistrationError?: (error: any) => void;
}
```

## 🔄 Migration from OneSignal

If migrating from OneSignal:

1. Keep existing OneSignal integration for backward compatibility
2. Gradually migrate users to FCM
3. Use feature flags to control rollout
4. Update server to handle both OneSignal and FCM tokens

## 📈 Production Checklist

- [ ] Update Firebase configuration with production values
- [ ] Replace VAPID key with production key
- [ ] Implement server-side token management
- [ ] Set up notification analytics
- [ ] Configure proper error monitoring
- [ ] Test on all target platforms
- [ ] Set up automated testing for notifications
- [ ] Document notification payload schemas
- [ ] Configure rate limiting and security
- [ ] Set up monitoring and alerting

## 🤝 Contributing

When contributing to FCM functionality:

1. Test on all platforms (web, iOS, Android)
2. Update TypeScript types for any new features
3. Add unit tests for new functionality
4. Update documentation
5. Test with various notification payloads

## 📞 Support

For issues with FCM implementation:

1. Check the debug console for error messages
2. Verify Firebase project configuration
3. Test with simple notification payloads first
4. Check server logs for token registration issues
5. Review platform-specific documentation
