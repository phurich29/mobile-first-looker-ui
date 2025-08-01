// Utility functions for testing FCM notifications

// Create in-app toast notification as backup
const createInAppToast = (title: string, body: string) => {
  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1f2937;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 350px;
    font-family: system-ui, -apple-system, sans-serif;
    border-left: 4px solid #10b981;
    animation: slideIn 0.3s ease-out;
  `;
  
  toast.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${title}</div>
    <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">${body}</div>
    <div style="position: absolute; top: 8px; right: 8px; cursor: pointer; opacity: 0.7; font-size: 18px;" onclick="this.parentElement.remove()">&times;</div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Add to page
  document.body.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
  
  console.log('🔔 In-app toast notification created!');
};

export const testFCMNotification = async (onNotificationReceived?: (notification: any) => void) => {
  // Simulate a received notification for testing
  const mockNotification = {
    notification: {
      title: "🔔 Test Notification",
      body: "This is a test notification to verify FCM is working perfectly!",
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

  // Check and request notification permission if needed
  if ('Notification' in window) {
    let permission = Notification.permission;
    
    // Request permission if not granted
    if (permission === 'default') {
      console.log('🔔 Requesting notification permission...');
      permission = await Notification.requestPermission();
    }
    
    // Show notification if permission granted
    if (permission === 'granted') {
      console.log('🔔 Creating browser notification...');
      
      // Create browser notification
      const notification = new Notification(mockNotification.notification.title, {
        body: mockNotification.notification.body,
        icon: mockNotification.notification.icon,
        data: mockNotification.data,
        requireInteraction: false,
        tag: 'fcm-test',
        silent: false
      });

      notification.onclick = () => {
        console.log('🔔 Test notification clicked');
        window.focus();
        notification.close();
      };

      notification.onshow = () => {
        console.log('🔔 Browser notification is showing');
      };

      notification.onerror = (error) => {
        console.error('🔔 Browser notification error:', error);
      };

      setTimeout(() => {
        notification.close();
      }, 5000);
      
      console.log('🔔 Browser notification created successfully!');
      
    } else {
      console.warn('🔔 Notification permission denied:', permission);
      alert(`Notification permission: ${permission}\nPlease enable notifications in browser settings.`);
    }
  } else {
    console.warn('🔔 Browser does not support notifications');
    alert('Your browser does not support notifications.');
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
