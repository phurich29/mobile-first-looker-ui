// Utility functions for testing FCM notifications

export const testFCMNotification = (onNotificationReceived?: (notification: any) => void) => {
  // Simulate a received notification for testing
  const mockNotification = {
    notification: {
      title: "Test Notification",
      body: "This is a test notification to verify FCM is working",
      icon: "/favicon.ico"
    },
    data: {
      route: "/",
      type: "test"
    }
  };

  console.log('🔔 Simulating FCM notification:', mockNotification);
  
  if (onNotificationReceived) {
    onNotificationReceived(mockNotification);
  }

  // Also show browser notification if supported
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(mockNotification.notification.title, {
      body: mockNotification.notification.body,
      icon: mockNotification.notification.icon,
      data: mockNotification.data
    });

    notification.onclick = () => {
      console.log('🔔 Test notification clicked');
      notification.close();
    };

    setTimeout(() => {
      notification.close();
    }, 5000);
  }
};

export const checkFCMStatus = () => {
  const status = {
    notificationSupported: 'Notification' in window,
    notificationPermission: 'Notification' in window ? Notification.permission : 'not-supported',
    serviceWorkerSupported: 'serviceWorker' in navigator,
    fcmSupported: 'serviceWorker' in navigator && 'PushManager' in window
  };

  console.log('🔔 FCM Status Check:', status);
  return status;
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('🔔 Browser does not support notifications');
    return 'not-supported';
  }

  const permission = await Notification.requestPermission();
  console.log('🔔 Notification permission:', permission);
  return permission;
};
