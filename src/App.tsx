import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./components/AuthProvider";
import { CountdownProvider } from "./contexts/CountdownContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PWAProvider } from "./contexts/PWAContext";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { PWADebugComponent } from "./components/PWADebugComponent";
import { CountdownDebugger } from "./components/CountdownDebugger";
import { FCMDebugComponent } from "./components/FCMDebugComponent";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import OneSignal from 'react-onesignal';
import { useFCM } from "./hooks/useFCM";
import { NotificationPermissionPopup } from '@/components/NotificationPermissionPopup';
import { shouldInitializeOneSignal, shouldInitializeFCM, getPrimaryNotificationSystem } from '@/config/notification-config';

// Firebase config is now handled by src/lib/firebase.ts

// Create QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  
  // ฟังก์ชันสำหรับจัดการการยอมรับการแจ้งเตือน
  const handleAcceptNotification = async () => {
    setShowNotificationPopup(false);
    
    console.log('🔔 User clicked Accept - attempting to request permission...');
    
    // ขออนุญาตจากเบราว์เซอร์ (บังคับขอใหม่แม้ว่าจะถูก denied)
    if (typeof Notification !== 'undefined' && Notification.requestPermission) {
      try {
        console.log('🔔 Current permission before request:', Notification.permission);
        const browserPermission = await Notification.requestPermission();
        console.log('🔔 Browser permission result after request:', browserPermission);
        
        if (browserPermission === 'granted') {
          try {
            await OneSignal.User.PushSubscription.optIn();
            console.log('✅ Successfully subscribed to OneSignal!');
            
            // แสดงข้อความสำเร็จ
            toast({
              title: "✅ สำเร็จ!",
              description: "คุณจะได้รับการแจ้งเตือนจาก RiceFlow แล้ว",
              variant: "default",
            });
            
            // ส่งการแจ้งเตือนทดสอบ
            setTimeout(() => {
              new Notification('🎉 ยินดีต้อนรับสู่ RiceFlow!', {
                body: 'คุณได้เปิดใช้งานการแจ้งเตือนแล้ว จะได้รับข้อมูลอัพเดททันที',
                icon: '/favicon.ico'
              });
            }, 2000);
            
          } catch (optInError) {
            console.log('❌ Failed to subscribe to OneSignal:', optInError);
          }
        } else if (browserPermission === 'denied') {
          // ผู้ใช้ปฏิเสธ - เปิด browser settings โดยอัตโนมัติ
         
          
          // พยายามเปิด browser notification settings
          try {
            // สำหรับ Chrome/Edge
            if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
              window.open('chrome://settings/content/notifications', '_blank');
            }
            // สำหรับ Firefox
            else if (navigator.userAgent.includes('Firefox')) {
              window.open('about:preferences#privacy', '_blank');
            }
            // สำหรับ Safari
            else if (navigator.userAgent.includes('Safari')) {
              // Safari ไม่สามารถเปิด settings โดยตรงได้
              alert('กรุณาไปที่ Safari > Preferences > Websites > Notifications');
            }
            else {
              // เบราว์เซอร์อื่นๆ
              window.open('chrome://settings/content/notifications', '_blank');
            }
            
            toast({
              title: "🚀 เปิด Settings ให้แล้ว!",
              description: "หา localhost:8080 แล้วเปลี่ยนเป็น 'Allow' - ระบบจะตรวจสอบอัตโนมัติ",
              variant: "default",
            });
            
            // เริ่มตรวจสอบ permission ทุก 2 วินาที
            startPermissionMonitoring();
            
          } catch (error) {
            console.log('❌ Failed to open browser settings:', error);
            toast({
              title: "🛠️ ตั้งค่าแบบ Manual",
              description: "คลิกไอคอน 🔔 ข้าง URL แล้วเลือก 'Reset permission'",
              variant: "default",
            });
          }
        } else {
          // default หรือสถานะอื่นๆ
          toast({
            title: "ℹ️ ลองอีกครั้ง",
            description: "กรุณาลองคลิกปุ่ม 'อนุญาต' อีกครั้ง",
            variant: "default",
          });
        }
      } catch (error) {
        console.log('❌ Browser permission request failed:', error);
        toast({
          title: "❌ เกิดข้อผิดพลาด",
          description: "ไม่สามารถขออนุญาตได้ กรุณาตั้งค่าในเบราว์เซอร์",
          variant: "destructive",
        });
      }
    } else {
      // เบราว์เซอร์ไม่สนับสนุน Notification API
      toast({
        title: "⚠️ เบราว์เซอร์ไม่สนับสนุน",
        description: "เบราว์เซอร์นี้ไม่สามารถใช้การแจ้งเตือนได้",
        variant: "destructive",
      });
    }
  };
  
  // ฟังก์ชันสำหรับจัดการการปฏิเสธการแจ้งเตือน
  const handleDeclineNotification = () => {
    setShowNotificationPopup(false);
    toast({
      title: "💭 ไม่เป็นไร",
      description: "คุณสามารถเปิดการแจ้งเตือนได้ภายหลัง จากเมนูหรือการตั้งค่า",
      variant: "default",
    });
  };
  
  // ฟังก์ชันตรวจสอบ permission แบบ real-time
  const startPermissionMonitoring = () => {
    console.log('🔍 Starting permission monitoring...');
    
    // ประกาศตัวแปรก่อนใช้งาน
        let monitoringInterval: ReturnType<typeof setInterval>;
    
    const checkPermission = async () => {
      if (typeof Notification !== 'undefined') {
        const currentPermission = Notification.permission;
        console.log('🔍 Current permission status:', currentPermission);
        
        if (currentPermission === 'granted') {
          console.log('✅ Permission granted! Subscribing to OneSignal...');
          
          try {
            // Subscribe กับ OneSignal
            await OneSignal.User.PushSubscription.optIn();
            console.log('✅ Successfully subscribed to OneSignal!');
            
            // แสดงข้อความสำเร็จ
            toast({
              title: "✅ สำเร็จ!",
              description: "คุณจะได้รับการแจ้งเตือนจาก RiceFlow แล้ว!",
              variant: "default",
            });
            
            // ส่งการแจ้งเตือนทดสอบ
            setTimeout(() => {
              new Notification('🎉 ยินดีต้อนรับสู่ RiceFlow!', {
                body: 'คุณได้เปิดใช้งานการแจ้งเตือนแล้ว จะได้รับข้อมูลอัพเดททันที',
                icon: '/favicon.ico'
              });
            }, 1000);
            
            // หยุดการตรวจสอบเมื่อสำเร็จแล้ว
            if (monitoringInterval) {
              clearInterval(monitoringInterval);
            }
            
            // ทดสอบส่งการแจ้งเตือนผ่าน OneSignal API โดยตรง (debug เท่านั้น)
            try {
              const playerId = OneSignal.User.onesignalId;
              if (playerId) {
                console.log('📱 Sending test notification to player_id:', playerId);
                // Note: ควรมีฟังก์ชัน API call ไปยัง backend เพื่อส่งการแจ้งเตือนจริง
              }
            } catch (e) {
              console.error('Error sending test notification:', e);
            }
            
          } catch (error) {
            console.log('❌ Failed to subscribe to OneSignal:', error);
            // ลองใหม่อีกครั้ง
            try {
              console.log('🔄 Trying to subscribe again...');
              await new Promise(r => setTimeout(r, 1500));
              await OneSignal.User.PushSubscription.optIn();
              console.log('✅ Successfully subscribed on second attempt!');
            } catch (retryError) {
              console.error('❌ Second subscription attempt failed:', retryError);
            }
          }
        }
      }
    };
    
    // ตรวจสอบทุก 2 วินาที
    monitoringInterval = setInterval(checkPermission, 2000);
    
    // หยุดการตรวจสอบหลังจาก 30 วินาที
    setTimeout(() => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
      console.log('🔍 Permission monitoring stopped after 30 seconds');
    }, 30000);
    
    // Return cleanup function
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  };
  
  useEffect(() => {
    const initializeOneSignal = async () => {
      // Check if OneSignal should be initialized based on config
      if (!shouldInitializeOneSignal()) {
        console.log('🔔 OneSignal initialization skipped by configuration');
        return;
      }

      // Only initialize OneSignal if App ID is provided
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID || 'c77413d4-0f7d-4fe0-b7eb-99b132e451e0';
      
      if (!appId) {
        console.warn('OneSignal: VITE_ONESIGNAL_APP_ID is not set in environment variables');
        return;
      }

      try {
        console.log('🔔 Initializing OneSignal with App ID:', appId);
        
        await OneSignal.init({
          appId: appId,
          allowLocalhostAsSecureOrigin: true,
          autoRegister: false, // ปิดเพื่อควบคุม registration เอง
          autoResubscribe: true,
          // เพิ่ม Debug Mode เพื่อดู log ใน console
          debug: true,
          serviceWorkerParam: {
            scope: '/'
          },
          serviceWorkerPath: 'OneSignalSDKWorker.js',
          welcomeNotification: {
            disable: true,
            title: '',
            message: '',
          },
          notifyButton: {
            enable: true,
            displayPredicate: () => true, // แสดงปุ่ม Bell Icon เสมอ
            size: 'medium',
            position: 'bottom-right',
            prenotify: true,
            showCredit: false,
            text: {
              'tip.state.unsubscribed': 'Subscribe to notifications',
              'tip.state.subscribed': "You're subscribed to notifications",
              'tip.state.blocked': "You've blocked notifications",
              'message.prenotify': 'Click to subscribe to notifications',
              'message.action.subscribing': 'Subscribing...',
              'message.action.subscribed': "Thanks for subscribing!",
              'message.action.resubscribed': "You're subscribed to notifications",
              'message.action.unsubscribed': "You won't receive notifications again",
              'dialog.main.title': 'Manage Site Notifications',
              'dialog.main.button.subscribe': 'SUBSCRIBE',
              'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
              'dialog.blocked.title': 'Unblock Notifications',
              'dialog.blocked.message': "Follow these instructions to allow notifications:"
            }
          },
          persistNotification: true, // เก็บการแจ้งเตือนไว้จนกว่าจะกดปิด
        });
        
        console.log('✅ OneSignal initialized successfully');
        
        // 🔥 Manual Registration เพื่อให้แน่ใจว่า Service Worker ทำงาน
        try {
          // ตรวจสอบ Service Worker ก่อน
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            console.log('🔧 Service Worker registration:', registration);
            
            if (registration) {
              console.log('✅ Service Worker is registered');
            } else {
              console.log('⚠️ Service Worker not found, OneSignal will handle it');
            }
          }
          
          await OneSignal.User.PushSubscription.optIn();
          console.log('🔔 Manual registration successful');
        } catch (regError) {
          console.log('⚠️ Manual registration failed, will try later:', regError);
        }
        
        // ตั้งค่า external_id หรือ user_id เพื่อให้รับการแจ้งเตือนได้
        const userId = `user_${Date.now()}`; // ใช้เวลาเป็น unique ID หากไม่มีระบบ login
        await OneSignal.login(userId);
        console.log('👤 Set OneSignal external_id:', userId);
        
        // เพิ่ม tag เพื่อให้สามารถกำหนดเป้าหมายได้
        await OneSignal.User.addTags({
          user_type: 'tester',
          app_version: '1.0.0',
          environment: 'localhost'
        });
        console.log('🏷️ Added user tags for targeting');
        
        // 🔥 เพิ่ม Event Listeners สำหรับ Push Notifications
        OneSignal.Notifications.addEventListener('click', (event) => {
          console.log('🔔 Notification clicked:', event);
          // Handle notification click
        });
        
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
          console.log('🔔 Foreground notification will display:', event);
          // Notification received while app is in foreground
          event.preventDefault(); // ป้องกันไม่ให้แสดง notification ซ้ำ
          
          // แสดง toast แทน
          const notification = event.notification;
          toast({
            title: notification.title || "📱 การแจ้งเตือนใหม่",
            description: notification.body || "คุณมีการแจ้งเตือนใหม่จาก RiceFlow",
            variant: "default",
          });
        });
        
        OneSignal.Notifications.addEventListener('permissionChange', (granted) => {
          console.log('🔔 Permission changed:', granted);
          if (granted) {
            toast({
              title: "✅ เปิดการแจ้งเตือนสำเร็จ!",
              description: "คุณจะได้รับการแจ้งเตือนจาก RiceFlow แล้ว",
              variant: "default",
            });
          }
        });
        
        // รอให้ OneSignal สร้าง onesignalId ให้สมบูรณ์ (แบบไม่บล็อก UI)
        const waitForOnesignalId = async () => {
          let attempts = 0;
          const maxAttempts = 5; // ลดจำนวนครั้ง
          
          while (attempts < maxAttempts) {
            try {
              const onesignalId = OneSignal.User.onesignalId;
              if (onesignalId) {
                console.log('🆔 OneSignal ID obtained:', onesignalId);
                return onesignalId;
              }
              console.log(`🔄 Waiting for onesignalId... attempt ${attempts + 1}/${maxAttempts}`);
              await new Promise(resolve => setTimeout(resolve, 500)); // ลดเวลารอเป็น 0.5 วินาที
              attempts++;
            } catch (error) {
              console.log('⚠️ Error getting onesignalId:', error);
              attempts++;
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          console.log('⚠️ OneSignal ID not ready yet, but continuing...');
          return null;
        };
        
        // เรียกใช้แบบไม่รอ (non-blocking)
        waitForOnesignalId().then(onesignalId => {
          if (onesignalId) {
            console.log('✅ OneSignal ready with ID:', onesignalId);
          }
        }).catch(error => {
          console.log('❌ Error waiting for OneSignal ID:', error);
        });
        
        // ตรวจสอบสถานะการสมัครรับการแจ้งเตือน
        const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
        console.log('📱 OneSignal subscription status:', isSubscribed);
        
        // ตรวจสอบสิทธิ์การแจ้งเตือนจากเบราว์เซอร์
        const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
        console.log('🔐 Browser notification permission:', permission);
        
        if (permission === 'default') {
          // ยังไม่เคยถามสิทธิ์ - แสดงป๊อปอัพขออนุญาต
          console.log('🔔 Requesting notification permission...');
          
          // แสดงป๊อปอัพหลังจากโหลดหน้าเว็บเสร็จ
          setTimeout(() => {
            setShowNotificationPopup(true);
          }, 3000); // แสดงหลังจาก 3 วินาที
        } else if (permission === 'denied') {
          // ผู้ใช้เคยปฏิเสธแล้ว - แต่ยังให้โอกาสขออนุญาตใหม่
          console.log('🚫 Notifications are blocked, but showing popup anyway.');
          
          // แสดง popup ให้ผู้ใช้ลองขออนุญาตใหม่
          setTimeout(() => {
            setShowNotificationPopup(true);
          }, 3000);
          
          // แสดงข้อความแนะนำเพิ่มเติม
          toast({
            title: "💡 เปิดการแจ้งเตือน",
            description: "คลิกปุ่ม 'อนุญาต' เพื่อเปิดใช้งานการแจ้งเตือน หรือตั้งค่าในเบราว์เซอร์",
            variant: "default",
          });
        } else if (permission === 'granted') {
          // ได้รับอนุญาตแล้ว
          if (!isSubscribed) {
            console.log('🔔 Permission granted but not subscribed, subscribing...');
            try {
              await OneSignal.User.PushSubscription.optIn();
            } catch (error) {
              console.log('❌ Failed to subscribe:', error);
            }
          } else {
            const userId = OneSignal.User.onesignalId;
            console.log('👤 OneSignal User ID:', userId);
          }
        }
        
        // OneSignal initialized successfully (no toast notification)
        
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

  // Initialize FCM notifications only if configured
  const {
    isInitialized: fcmInitialized,
    token: fcmToken,
    error: fcmError,
  } = useFCM({
    enabled: shouldInitializeFCM(), // Add config check
    autoSendToServer: shouldInitializeFCM(),
    // userId: 'current-user-id', // Replace with actual user ID from auth context
    onTokenReceived: (token) => {
      if (shouldInitializeFCM()) {
        console.log("🔔 FCM Token received:", token);
      }
    },
    onNotificationReceived: (notification) => {
      if (shouldInitializeFCM()) {
        console.log("🔔 FCM Notification received:", notification);
        // Only show toast if OneSignal is not handling notifications
        if (getPrimaryNotificationSystem() === 'fcm') {
          toast({
            title: notification.title || "New Notification",
            description: notification.body || "You have a new notification",
          });
        }
      }
    },
    onNotificationOpened: (notification) => {
      if (shouldInitializeFCM()) {
        console.log("🔔 FCM Notification opened:", notification);
        // Handle navigation or actions when notification is tapped
        if (notification.data?.route) {
          // Navigate to specific route if provided in notification data
          window.location.href = notification.data.route;
        }
      }
    },
    onError: (error) => {
      if (shouldInitializeFCM()) {
        console.error("🔔 FCM Error:", error);
        toast({
          title: "FCM Notification Error",
          description: "Failed to setup FCM push notifications",
          variant: "destructive",
        });
      }
    },
  });

  // Register service worker for FCM
  useEffect(() => {
    const registerServiceWorker = async () => {
      // Register Service Worker only in production builds to avoid HMR reload loops in dev
      if (import.meta.env.PROD && !Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
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
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <LanguageProvider>
          <CountdownProvider>
            <PWAProvider>
              <AuthProvider>
                <QueryClientProvider client={queryClient}>
                  <RouterProvider router={router} />
                  <Toaster />
                  <PWAInstallBanner />
                  {showNotificationPopup && (
                    <NotificationPermissionPopup
                      isOpen={showNotificationPopup}
                      onAccept={handleAcceptNotification}
                      onDecline={handleDeclineNotification}
                    />
                  )}
                  {import.meta.env.VITE_DEBUG_MODE === "true" && (
                    <>
                      <PWADebugComponent />
                      <CountdownDebugger />
                      <FCMDebugComponent />
                    </>
                  )}
                </QueryClientProvider>
              </AuthProvider>
            </PWAProvider>
          </CountdownProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
