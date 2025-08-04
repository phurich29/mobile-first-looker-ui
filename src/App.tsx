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
import { Capacitor } from "@capacitor/core";
import { useFCM } from "./hooks/useFCM";

// for web app, ensure you have firebase-messaging-sw.js in public folder
const firebaseConfig = {
  apiKey: "AIzaSyDO5lYCkbXExFEmf3x7H1WSC6qiE2W-Jrs",
  authDomain: "riceflow-958a2.firebaseapp.com",
  projectId: "riceflow-958a2",
  storageBucket: "riceflow-958a2.firebasestorage.app",
  messagingSenderId: "1043235929904",
  appId: "1:1043235929904:web:c455598cba730e3af292f5",
  measurementId: "G-BZGJVXZ6LE",
};

function App() {
  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  // Initialize FCM notifications
  const {
    isInitialized: fcmInitialized,
    token: fcmToken,
    error: fcmError,
  } = useFCM({
    autoSendToServer: true,
    userId: 'default-user-id', // Replace with actual user ID from auth context when available
    onTokenReceived: (token) => {
      console.log("🔔 FCM Token received:", token);
    },
    onNotificationReceived: (notification) => {
      console.log("🔔 Notification received:", notification);
      // toast({
      //   title: notification.title || "New Notification",
      //   description: notification.body || "You have a new notification",
      // });
    },
    onNotificationOpened: (notification) => {
      console.log("🔔 Notification opened:", notification);
      // Handle navigation or actions when notification is tapped
      if (notification.data?.route) {
        // Navigate to specific route if provided in notification data
        window.location.href = notification.data.route;
      }
    },
    onError: (error) => {
      console.error("🔔 FCM Error:", error);
      toast({
        title: "Notification Error",
        description: `Failed to setup push notifications: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Register service worker for FCM
  useEffect(() => {
    const registerServiceWorker = async () => {
      // Register Service Worker only in production builds to avoid HMR reload loops in dev
      if (process.env.NODE_ENV === "production" && !Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
        try {
          console.log("🔔 Registering Firebase messaging service worker...");
          // Register Firebase messaging service worker
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
            {
              scope: "/",
            }
          );
          console.log(
            "🔔 Firebase messaging service worker registered successfully:",
            registration.scope
          );

          // Wait for the service worker to be ready
          await navigator.serviceWorker.ready;
          console.log("🔔 Service worker is ready");
        } catch (error) {
          console.error("🔔 Service worker registration failed:", error);
          toast({
            title: "Service Worker Error",
            description: "Failed to register push notification service",
            variant: "destructive",
          });
        }
      } else {
        console.log(
          "🔔 Service worker registration skipped (native platform or not supported)"
        );
      }
    };

    registerServiceWorker();
  }, []);

  // Log FCM status
  useEffect(() => {
    if (fcmInitialized) {
      console.log("🔔 FCM initialized successfully");
      if (fcmToken) {
        console.log(
          "🔔 FCM Token available:",
          fcmToken.substring(0, 20) + "..."
        );
      }
    }
    if (fcmError) {
      console.error("🔔 FCM Error:", fcmError);
    }
  }, [fcmInitialized, fcmToken, fcmError]);

  const handleGlobalCountdownComplete = () => {
    const currentTime = new Date().toISOString();
    console.log("🕐 Global countdown complete at:", currentTime);
    console.log("🔄 Triggering data refresh across all components");

    // Log query client state before invalidation
    const queryCache = queryClient.getQueryCache();
    const allQueries = queryCache.getAll();
    console.log("📊 Query cache state before refresh:", {
      totalQueries: allQueries.length,
      notificationQueries: allQueries.filter(
        (q) => q.queryKey[0] === "notifications"
      ).length,
      deviceQueries: allQueries.filter((q) => q.queryKey[0] === "devices")
        .length,
    });

    // Invalidate queries that should refresh on the global timer
    const invalidatedQueries = ["notifications", "devices", "measurements"];
    invalidatedQueries.forEach((queryKey) => {
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
              <CountdownProvider
                initialSeconds={60}
                onComplete={handleGlobalCountdownComplete}
              >
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
