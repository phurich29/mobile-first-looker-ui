/**
 * FCM Testing Utilities
 * 
 * This file provides utilities for testing FCM notifications in development
 */

interface TestNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: 'info' | 'warning' | 'error' | 'success';
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export class FCMTester {
  private static instance: FCMTester;
  
  public static getInstance(): FCMTester {
    if (!FCMTester.instance) {
      FCMTester.instance = new FCMTester();
    }
    return FCMTester.instance;
  }

  /**
   * Test notifications for different scenarios
   */
  public getTestNotifications(): Record<string, TestNotification> {
    return {
      deviceAlert: {
        title: '🚨 Device Alert',
        body: 'Temperature sensor #001 has exceeded the safe threshold',
        type: 'error',
        data: {
          deviceId: 'sensor_001',
          alertType: 'temperature_high',
          currentValue: '85°C',
          threshold: '75°C',
          action: 'open_device',
          route: '/devices/sensor_001'
        }
      },

      measurementUpdate: {
        title: '📊 New Measurements',
        body: 'Latest quality measurements are now available',
        type: 'info',
        data: {
          measurementCount: 5,
          newDevices: 2,
          action: 'open_measurements',
          route: '/measurements'
        }
      },

      systemMaintenance: {
        title: '🔧 System Maintenance',
        body: 'Scheduled maintenance will begin in 30 minutes',
        type: 'warning',
        data: {
          maintenanceStart: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          estimatedDuration: '2 hours',
          action: 'show_modal',
          route: '/maintenance-info'
        }
      },

      lowBattery: {
        title: '🔋 Low Battery Warning',
        body: 'Device "Rice Quality Monitor" battery is running low (15%)',
        type: 'warning',
        data: {
          deviceId: 'monitor_001',
          batteryLevel: 15,
          deviceName: 'Rice Quality Monitor',
          action: 'open_device',
          route: '/devices/monitor_001'
        }
      },

      dataSync: {
        title: '🔄 Data Sync Complete',
        body: 'All device data has been synchronized successfully',
        type: 'success',
        data: {
          syncedDevices: 8,
          syncTime: new Date().toISOString(),
          action: 'open_dashboard',
          route: '/dashboard'
        }
      },

      connectionLost: {
        title: '📡 Connection Lost',
        body: 'Device "Humidity Sensor #3" has lost connection',
        type: 'error',
        data: {
          deviceId: 'humidity_003',
          deviceName: 'Humidity Sensor #3',
          lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          action: 'open_device',
          route: '/devices/humidity_003'
        }
      },

      newFeature: {
        title: '🎉 New Feature Available',
        body: 'Graph analytics with AI insights is now available!',
        type: 'info',
        data: {
          featureName: 'AI Graph Analytics',
          version: '2.1.0',
          action: 'open_page',
          route: '/features/ai-analytics'
        }
      },

      dailySummary: {
        title: '📈 Daily Summary',
        body: '12 devices monitored, 3 alerts resolved, all systems normal',
        type: 'info',
        data: {
          devicesMonitored: 12,
          alertsResolved: 3,
          systemStatus: 'normal',
          date: new Date().toDateString(),
          action: 'open_summary',
          route: '/summary'
        }
      }
    };
  }

  /**
   * Simulate receiving a test notification
   */
  public simulateNotification(type: keyof ReturnType<typeof this.getTestNotifications>): void {
    const notifications = this.getTestNotifications();
    const notification = notifications[type];
    
    if (!notification) {
      console.error('Unknown notification type:', type);
      return;
    }

    // Simulate receiving notification
    const mockNotificationEvent = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: notification.data
      },
      data: notification.data
    };

    // Dispatch custom event that FCM hook can listen to
    window.dispatchEvent(new CustomEvent('fcm-test-notification', {
      detail: mockNotificationEvent
    }));

    console.log('🧪 Test notification simulated:', mockNotificationEvent);
  }

  /**
   * Test notification display in browser
   */
  public async testBrowserNotification(type: keyof ReturnType<typeof this.getTestNotifications>): Promise<void> {
    const notifications = this.getTestNotifications();
    const notification = notifications[type];
    
    if (!notification) {
      console.error('Unknown notification type:', type);
      return;
    }

    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('Notification permission not granted');
        return;
      }
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: notification.data,
      requireInteraction: true
    });

    browserNotification.onclick = () => {
      console.log('🧪 Test notification clicked:', notification);
      browserNotification.close();
      
      // Simulate notification action
      if (notification.data?.route) {
        window.location.href = notification.data.route;
      }
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);
  }

  /**
   * Get notification icons for different types
   */
  public getNotificationIcon(type: TestNotification['type']): string {
    const icons = {
      info: '📱',
      warning: '⚠️',
      error: '🚨',
      success: '✅'
    };
    return icons[type || 'info'];
  }

  /**
   * Generate mock FCM token for testing
   */
  public generateMockToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 152; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Log notification data for debugging
   */
  public logNotificationData(notification: any): void {
    console.group('🔔 FCM Notification Debug');
    console.log('Title:', notification.title || notification.notification?.title);
    console.log('Body:', notification.body || notification.notification?.body);
    console.log('Data:', notification.data);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Platform:', navigator.userAgent);
    console.groupEnd();
  }
}

// Export singleton instance
export const fcmTester = FCMTester.getInstance();

// Global testing functions for console
if (typeof window !== 'undefined') {
  (window as any).fcmTest = {
    // Test different notification types
    deviceAlert: () => fcmTester.simulateNotification('deviceAlert'),
    measurement: () => fcmTester.simulateNotification('measurementUpdate'),
    maintenance: () => fcmTester.simulateNotification('systemMaintenance'),
    battery: () => fcmTester.simulateNotification('lowBattery'),
    sync: () => fcmTester.simulateNotification('dataSync'),
    connection: () => fcmTester.simulateNotification('connectionLost'),
    feature: () => fcmTester.simulateNotification('newFeature'),
    summary: () => fcmTester.simulateNotification('dailySummary'),
    
    // Test browser notifications
    browserTest: (type: string) => fcmTester.testBrowserNotification(type as any),
    
    // Generate mock token
    mockToken: () => fcmTester.generateMockToken(),
    
    // Get all test notifications
    list: () => fcmTester.getTestNotifications()
  };
  
  console.log('🧪 FCM Testing utilities loaded. Try:');
  console.log('- fcmTest.deviceAlert() - Test device alert');
  console.log('- fcmTest.measurement() - Test measurement update');
  console.log('- fcmTest.browserTest("deviceAlert") - Test browser notification');
  console.log('- fcmTest.list() - List all test notifications');
}
