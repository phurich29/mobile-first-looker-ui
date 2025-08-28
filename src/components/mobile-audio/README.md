# Mobile Audio Notification System

This system provides native audio notification support for mobile tablets and devices using Capacitor.

## Features

- ✅ Native mobile audio support through Capacitor
- ✅ Web audio fallback for browsers  
- ✅ User interaction-based initialization
- ✅ Sound queue management to prevent overlapping
- ✅ Platform detection and optimization
- ✅ Multiple notification sound types

## Components

### MobileAudioService
Main service that handles audio playback with platform-specific optimizations.

### useMobileNotificationSound  
React hook for integrating mobile audio notifications into components.

### MobileAudioTestButton
UI component for testing audio functionality.

## Usage

```typescript
import { useMobileNotificationSound } from '@/hooks/useMobileNotificationSound';

const MyComponent = () => {
  const { playSound, testAudio } = useMobileNotificationSound(isAlertActive, {
    enabled: true,
    playOnce: true,
    repeatCount: 2
  });
  
  return <button onClick={testAudio}>Test Audio</button>;
};
```

## Mobile Deployment

For native mobile apps, ensure you have:

1. Capacitor properly configured
2. Audio permissions in native app manifests
3. Run `npx cap sync` after any audio-related changes

## Troubleshooting

- If audio doesn't work on iOS, ensure user interaction has occurred first
- For Android, check audio permissions in the app settings
- Web browsers require user gesture before playing audio