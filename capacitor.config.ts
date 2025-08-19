import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'setup.riceflow.app',
  appName: 'Riceflow',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    FirebaseMessaging: {
      deliveryMetrics: true
    },
    App: {
      appUrlOpen: {
        iosCustomScheme: 'riceflow',
        androidCustomScheme: 'riceflow'
      }
    }
  },
  server: {
    androidScheme: 'https',
    hostname: 'setup.riceflow.app',
    iosScheme: 'https'
  }
};

export default config;
