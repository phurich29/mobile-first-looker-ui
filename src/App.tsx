
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./components/AuthProvider";
import { CountdownProvider } from "./contexts/CountdownContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PWAProvider } from "./contexts/PWAContext";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { PWADebugComponent } from "./components/PWADebugComponent";
import { CountdownDebugger } from "./components/CountdownDebugger";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { useEffect } from "react";
import OneSignal from 'react-onesignal';

function App() {
  useEffect(() => {
    OneSignal.init({
      appId: "YOUR_APP_ID_HERE", // ใส่ App ID จาก Dashboard
      safari_web_id: "web.onesignal.auto.XXXXXX",
      notifyButton: {
        enable: true,
        prenotify: true,
        showCredit: false,
        text: {
          'tip.state.unsubscribed': 'Subscribe to notifications',
          'tip.state.subscribed': "You're subscribed to notifications",
          'tip.state.blocked': "You've blocked notifications",
          'message.prenotify': 'Click to subscribe to notifications',
          'message.action.subscribed': 'Thanks for subscribing!',
          'message.action.subscribing': 'Subscribing...',
          'message.action.resubscribed': "You're subscribed to notifications",
          'message.action.unsubscribed': 'You will no longer receive notifications',
          'dialog.main.title': 'Manage Site Notifications',
          'dialog.main.button.subscribe': 'SUBSCRIBE',
          'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
          'dialog.blocked.title': 'Unblock Notifications',
          'dialog.blocked.message': "Follow these instructions to allow notifications:"
        }
      },
    });
  }, []);

  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  const handleGlobalCountdownComplete = () => {
    const currentTime = new Date().toISOString();
    console.log("🕐 Global countdown complete at:", currentTime);
    console.log("🔄 Triggering data refresh across all components");
    
    // Log query client state before invalidation
    const queryCache = queryClient.getQueryCache();
    const allQueries = queryCache.getAll();
    console.log("📊 Query cache state before refresh:", {
      totalQueries: allQueries.length,
      notificationQueries: allQueries.filter(q => q.queryKey[0] === 'notifications').length,
      deviceQueries: allQueries.filter(q => q.queryKey[0] === 'devices').length
    });
    
    // Invalidate queries that should refresh on the global timer
    const invalidatedQueries = ['notifications', 'devices', 'measurements'];
    invalidatedQueries.forEach(queryKey => {
      const result = queryClient.invalidateQueries({ queryKey: [queryKey] });
      console.log(`🔄 Invalidated ${queryKey} queries:`, result);
    });
    
    console.log("✅ Global countdown refresh completed");
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <LanguageProvider>
            <PWAProvider>
              <CountdownProvider initialSeconds={60} onComplete={handleGlobalCountdownComplete}>
                <AuthProvider>
                  <RouterProvider router={router} />
                  <PWAInstallBanner />
                  <PWADebugComponent />
                  <CountdownDebugger />
                  <Toaster />
                </AuthProvider>
              </CountdownProvider>
            </PWAProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
