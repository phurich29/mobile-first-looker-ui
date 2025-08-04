import { fcmService } from '../services/fcmService';

export const testFCMRegistration = async () => {
  try {
    console.log('🧪 Testing FCM Registration...');
    
    // Initialize FCM service
    await fcmService.initialize();
    console.log('✅ FCM Service initialized');
    
    // Get device info to check device ID generation
    const deviceInfo = await fcmService.getDeviceInfo();
    console.log('📱 Device Info:', deviceInfo);
    console.log('🆔 Device ID:', deviceInfo.deviceId);
    
    // Get FCM token
    const token = fcmService.getToken();
    console.log('🔑 FCM Token:', token ? token.substring(0, 20) + '...' : 'No token available');
    
    if (token) {
      // Test sending token to server
      console.log('📤 Sending token to server...');
      await fcmService.sendTokenToServer(token, 'test-user-id');
      console.log('✅ Token sent successfully');
    } else {
      console.log('⚠️ No FCM token available to send');
    }
    
    return {
      success: true,
      deviceId: deviceInfo.deviceId,
      token: token,
      deviceInfo: deviceInfo
    };
  } catch (error) {
    console.error('❌ FCM Registration test failed:', error);
    return {
      success: false,
      error: error
    };
  }
};

// Make it available globally for testing in browser console
(window as any).testFCMRegistration = testFCMRegistration;
