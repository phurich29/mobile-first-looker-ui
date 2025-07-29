
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import oneSignalService from './services/OneSignalService.ts';

await oneSignalService.initialize({
  appId: '30ee6a4e-100f-4fb1-9a60-0d9d50f7cc97',
  requiresUserPrivacyConsent: false,
  promptForPushNotificationsWithUserResponse: true
});

createRoot(document.getElementById("root")!).render(<App />);
