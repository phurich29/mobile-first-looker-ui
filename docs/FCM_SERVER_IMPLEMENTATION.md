# FCM Server Implementation Example

This document provides example server-side code for handling FCM token registration and sending push notifications.

## Express.js Backend Example

### 1. Install Dependencies

```bash
npm install firebase-admin express cors helmet
npm install -D @types/express
```

### 2. Initialize Firebase Admin SDK

```typescript
// src/firebase-admin.ts
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/your/firebase-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'your-project-id'
});

export const messaging = admin.messaging();
export const db = admin.firestore();
```

### 3. Token Registration Endpoints

```typescript
// src/routes/fcm.ts
import express from 'express';
import { messaging, db } from '../firebase-admin';

const router = express.Router();

// Register FCM token
router.post('/register', async (req, res) => {
  try {
    const { token, userId, platform, timestamp } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Store token in database
    await db.collection('fcm_tokens').doc(token).set({
      token,
      userId,
      platform,
      timestamp,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Optional: Also store in user document for easy access
    if (userId) {
      await db.collection('users').doc(userId).update({
        fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({ success: true, message: 'Token registered successfully' });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Unregister FCM token
router.post('/unregister', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Mark token as inactive
    await db.collection('fcm_tokens').doc(token).update({
      active: false,
      deactivatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Token unregistered successfully' });
  } catch (error) {
    console.error('Error unregistering FCM token:', error);
    res.status(500).json({ error: 'Failed to unregister token' });
  }
});

// Send notification to specific user
router.post('/send', async (req, res) => {
  try {
    const { userId, title, body, data, imageUrl } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'userId, title, and body are required' });
    }

    // Get user's active FCM tokens
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const fcmTokens = userData?.fcmTokens || [];

    if (fcmTokens.length === 0) {
      return res.status(400).json({ error: 'No FCM tokens found for user' });
    }

    // Create notification payload
    const message = {
      notification: {
        title,
        body,
        imageUrl
      },
      data: data || {},
      tokens: fcmTokens
    };

    // Send multicast message
    const response = await messaging.sendMulticast(message);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx]);
          console.error('Failed to send to token:', fcmTokens[idx], resp.error);
        }
      });

      // Remove invalid tokens
      await db.collection('users').doc(userId).update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens)
      });
    }

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send notification to multiple users
router.post('/send-bulk', async (req, res) => {
  try {
    const { userIds, title, body, data, imageUrl } = req.body;

    if (!userIds || !Array.isArray(userIds) || !title || !body) {
      return res.status(400).json({ error: 'userIds (array), title, and body are required' });
    }

    // Get all FCM tokens for the users
    const allTokens: string[] = [];
    for (const userId of userIds) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const tokens = userData?.fcmTokens || [];
        allTokens.push(...tokens);
      }
    }

    if (allTokens.length === 0) {
      return res.status(400).json({ error: 'No FCM tokens found for users' });
    }

    // Create notification payload
    const message = {
      notification: {
        title,
        body,
        imageUrl
      },
      data: data || {},
      tokens: allTokens
    };

    // Send multicast message
    const response = await messaging.sendMulticast(message);

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: allTokens.length,
      message: 'Bulk notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    res.status(500).json({ error: 'Failed to send bulk notification' });
  }
});

export default router;
```

### 4. Main Server Setup

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fcmRoutes from './routes/fcm';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/fcm', fcmRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Usage Examples

### Register Token (Frontend)

```typescript
const registerToken = async (token: string, userId: string) => {
  const response = await fetch('/api/fcm/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      userId,
      platform: Capacitor.getPlatform(),
      timestamp: new Date().toISOString()
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to register token');
  }

  return response.json();
};
```

### Send Notification (Backend)

```typescript
const sendNotification = async (userId: string, title: string, body: string) => {
  const response = await fetch('/api/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serverApiKey}` // Add authentication
    },
    body: JSON.stringify({
      userId,
      title,
      body,
      data: {
        action: 'open_app',
        timestamp: new Date().toISOString()
      }
    }),
  });

  return response.json();
};
```

## Security Considerations

1. **Authentication**: Always authenticate API requests
2. **Rate Limiting**: Implement rate limiting for notification endpoints
3. **Token Validation**: Validate FCM tokens before storing
4. **Data Sanitization**: Sanitize notification content
5. **HTTPS**: Use HTTPS in production
6. **Environment Variables**: Store sensitive data in environment variables

## Environment Variables

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com

# Server
PORT=3000
NODE_ENV=production
API_SECRET_KEY=your-secret-key
```
