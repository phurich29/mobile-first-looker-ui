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
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
