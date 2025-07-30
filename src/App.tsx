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

// Create QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    const initializeOneSignal = async () => {
      // Only initialize OneSignal if App ID is provided
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      
      if (!appId) {
        console.warn('OneSignal: VITE_ONESIGNAL_APP_ID is not set in environment variables');
        return;
      }

      try {
        console.log('🔔 Initializing OneSignal with App ID:', appId);
        
        await OneSignal.init({
          appId: appId,
          allowLocalhostAsSecureOrigin: true,
          autoRegister: true,
          autoResubscribe: true,
          notifyButton: {
            enable: true,
            prenotify: true,
            showCredit: false,
            text: {
              'tip.state.unsubscribed': 'คลิกเพื่อรับการแจ้งเตือน',
              'tip.state.subscribed': "คุณได้สมัครรับการแจ้งเตือนแล้ว",
              'tip.state.blocked': "คุณได้บล็อกการแจ้งเตือน",
              'message.prenotify': 'คลิกเพื่อสมัครรับการแจ้งเตือน',
              'message.action.subscribed': 'ขอบคุณที่สมัครรับการแจ้งเตือน!',
              'message.action.subscribing': 'กำลังสมัคร...',
              'message.action.resubscribed': "คุณได้สมัครรับการแจ้งเตือนแล้ว",
              'message.action.unsubscribed': 'คุณจะไม่ได้รับการแจ้งเตือนอีกต่อไป',
              'dialog.main.title': 'จัดการการแจ้งเตือน',
              'dialog.main.button.subscribe': 'สมัครรับ',
              'dialog.main.button.unsubscribe': 'ยกเลิก',
              'dialog.blocked.title': 'ยกเลิกการบล็อกการแจ้งเตือน',
              'dialog.blocked.message': "ทำตามขั้นตอนเหล่านี้เพื่ออนุญาตการแจ้งเตือน:"
            }
          },
        });
        
        console.log('✅ OneSignal initialized successfully');
        
        // Check subscription status
        const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
        console.log('📱 OneSignal subscription status:', isSubscribed);
        
        // Get user ID if subscribed
        if (isSubscribed) {
          const userId = OneSignal.User.onesignalId;
          console.log('👤 OneSignal User ID:', userId);
        }
        
        // Show success toast
        toast({
          title: "OneSignal พร้อมใช้งาน",
          description: "ระบบการแจ้งเตือนพร้อมทำงานแล้ว",
          variant: "default",
        });
        
      } catch (error) {
        console.error('❌ OneSignal initialization failed:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเริ่มต้นระบบการแจ้งเตือนได้",
          variant: "destructive",
        });
      }
    };

    // Initialize OneSignal after a short delay to ensure DOM is ready
    const timer = setTimeout(initializeOneSignal, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
