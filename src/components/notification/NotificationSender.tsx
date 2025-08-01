import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image, Link, Bell } from 'lucide-react';
import { useOneSignalNotification, NotificationPayload } from '@/hooks/use-onesignal-notification';

interface NotificationData {
  title: string;
  message: string;
  imageUrl: string;
  launchUrl: string;
}

export const NotificationSender: React.FC = () => {
  const [notification, setNotification] = useState<NotificationData>({
    title: '',
    message: '',
    imageUrl: '',
    launchUrl: ''
  });
  const { sendNotification: sendNotificationHook, isLoading, error, clearError } = useOneSignalNotification();

  const handleInputChange = (field: keyof NotificationData, value: string) => {
    setNotification(prev => ({
      ...prev,
      [field]: value
    }));
    clearError();
  };

  const handleSendNotification = async () => {
    const payload: NotificationPayload = {
      title: notification.title,
      message: notification.message,
      imageUrl: notification.imageUrl || undefined,
      launchUrl: notification.launchUrl || undefined
    };

    const result = await sendNotificationHook(payload);
    
    if (result.success) {
      // Reset form on success
      setNotification({
        title: '',
        message: '',
        imageUrl: '',
        launchUrl: ''
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          ส่งแจ้งเตือนผ่าน OneSignal
        </CardTitle>
        <CardDescription>
          ส่งแจ้งเตือนแบบ Push Notification ไปยังผู้ใช้ทั้งหมด
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            หัวข้อแจ้งเตือน *
          </Label>
          <Input
            id="title"
            placeholder="ใส่หัวข้อแจ้งเตือน เช่น ข่าวสารสำคัญ"
            value={notification.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            ข้อความแจ้งเตือน *
          </Label>
          <Textarea
            id="message"
            placeholder="ใส่ข้อความที่ต้องการแจ้งเตือน"
            value={notification.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            URL รูปภาพ (ไม่บังคับ)
          </Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={notification.imageUrl}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="launchUrl" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Launch URL (ไม่บังคับ)
          </Label>
          <Input
            id="launchUrl"
            type="url"
            placeholder="https://example.com/page"
            value={notification.launchUrl}
            onChange={(e) => handleInputChange('launchUrl', e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSendNotification}
            disabled={isLoading || !notification.title.trim() || !notification.message.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                กำลังส่งแจ้งเตือน...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                ส่งแจ้งเตือน
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• หัวข้อและข้อความเป็นฟิลด์ที่จำเป็น</p>
          <p>• รูปภาพและ Launch URL เป็นฟิลด์ที่ไม่บังคับ</p>
          <p>• แจ้งเตือนจะถูกส่งไปยังผู้ใช้ที่ subscribe ทั้งหมด</p>
        </div>
      </CardContent>
    </Card>
  );
};
