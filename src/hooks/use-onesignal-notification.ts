import { useState, useCallback } from 'react';
import OneSignal from 'react-onesignal';
import { toast } from '@/components/ui/use-toast';

export interface NotificationPayload {
  title: string;
  message: string;
  imageUrl?: string;
  launchUrl?: string;
  targetSegments?: string[];
  targetUserIds?: string[];
}

export interface NotificationResult {
  success: boolean;
  recipients?: number;
  notificationId?: string;
  error?: string;
}

export const useOneSignalNotification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePayload = useCallback((payload: NotificationPayload): boolean => {
    if (!payload.title.trim()) {
      setError('กรุณาใส่หัวข้อแจ้งเตือน');
      return false;
    }
    if (!payload.message.trim()) {
      setError('กรุณาใส่ข้อความแจ้งเตือน');
      return false;
    }
    return true;
  }, []);

  const checkOneSignalConfig = useCallback((): boolean => {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    const restApiKey = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;

    if (!appId) {
      setError('VITE_ONESIGNAL_APP_ID ไม่ได้ถูกตั้งค่าใน environment variables');
      return false;
    }

    if (!restApiKey) {
      setError('VITE_ONESIGNAL_REST_API_KEY ไม่ได้ถูกตั้งค่าใน environment variables');
      return false;
    }

    return true;
  }, []);

  const sendNotification = useCallback(async (payload: NotificationPayload): Promise<NotificationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate payload
      if (!validatePayload(payload)) {
        return { success: false, error: error || 'ข้อมูลไม่ถูกต้อง' };
      }

      // Check OneSignal configuration
      if (!checkOneSignalConfig()) {
        return { success: false, error: error || 'การตั้งค่า OneSignal ไม่ถูกต้อง' };
      }

      // Check if OneSignal is initialized
      if (!OneSignal.User) {
        throw new Error('OneSignal ยังไม่ได้เริ่มต้นระบบ');
      }

      // Create notification payload for OneSignal API
      const notificationPayload = {
        app_id: import.meta.env.VITE_ONESIGNAL_APP_ID,
        headings: { en: payload.title, th: payload.title },
        contents: { en: payload.message, th: payload.message },
        ...(payload.imageUrl && { 
          big_picture: payload.imageUrl,
          large_icon: payload.imageUrl,
          chrome_web_image: payload.imageUrl,
          firefox_icon: payload.imageUrl
        }),
        ...(payload.launchUrl && { 
          url: payload.launchUrl,
          web_url: payload.launchUrl
        }),
        // Target segments or specific users
        ...(payload.targetSegments && payload.targetSegments.length > 0 
          ? { included_segments: payload.targetSegments }
          : { included_segments: ['All'] }
        ),
        ...(payload.targetUserIds && payload.targetUserIds.length > 0 
          ? { include_player_ids: payload.targetUserIds }
          : {}
        ),
        // Web-specific settings
        web_buttons: payload.launchUrl ? [{
          id: 'open-url',
          text: 'เปิดลิงก์',
          url: payload.launchUrl
        }] : undefined,
        // Chrome web push settings
        chrome_web_icon: payload.imageUrl,
        chrome_web_badge: payload.imageUrl,
        // Additional settings for better delivery
        priority: 10,
        ttl: 86400, // 24 hours
      };

      // Send notification using OneSignal REST API
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${import.meta.env.VITE_ONESIGNAL_REST_API_KEY}`
        },
        body: JSON.stringify(notificationPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.errors?.[0] || 
          `การส่งแจ้งเตือนล้มเหลว: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      
      // Show success toast
      toast({
        title: "ส่งแจ้งเตือนสำเร็จ! ✅",
        description: `ส่งแจ้งเตือนไปยัง ${result.recipients || 'ผู้ใช้'} คน`,
      });

      return {
        success: true,
        recipients: result.recipients,
        notificationId: result.id
      };

    } catch (error) {
      console.error('Error sending notification:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งแจ้งเตือน';
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: "การส่งแจ้งเตือนล้มเหลว ❌",
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [validatePayload, checkOneSignalConfig, error]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendNotification,
    isLoading,
    error,
    clearError
  };
};
