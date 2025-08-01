import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import OneSignal from 'react-onesignal';

export const OneSignalTestPage: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [onesignalId, setOnesignalId] = useState<string>('');
  const [permission, setPermission] = useState<string>('default');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ตรวจสอบสถานะปัจจุบัน
  const checkStatus = async () => {
    try {
      // ตรวจสอบ browser permission
      const browserPermission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
      setPermission(browserPermission);

      // ตรวจสอบ OneSignal subscription
      const subscribed = await OneSignal.User.PushSubscription.optedIn;
      setIsSubscribed(subscribed);

      // ตรวจสอบ OneSignal ID
      const userId = OneSignal.User.onesignalId;
      setOnesignalId(userId || 'ไม่มี ID');

      console.log('📊 OneSignal Status:', {
        browserPermission,
        subscribed,
        userId
      });
    } catch (error) {
      console.error('❌ Error checking status:', error);
    }
  };

  // Subscribe to notifications
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // ขออนุญาตจากเบราว์เซอร์
      if (typeof Notification !== 'undefined') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Subscribe กับ OneSignal
          await OneSignal.User.PushSubscription.optIn();
          
          toast({
            title: "✅ สำเร็จ!",
            description: "คุณได้สมัครรับการแจ้งเตือนแล้ว",
            variant: "default",
          });
          
          // อัพเดทสถานะ
          await checkStatus();
        } else {
          toast({
            title: "❌ ไม่ได้รับอนุญาต",
            description: "กรุณาอนุญาตการแจ้งเตือนในเบราว์เซอร์",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('❌ Subscribe error:', error);
      toast({
        title: "❌ เกิดข้อผิดพลาด",
        description: "ไม่สามารถสมัครรับการแจ้งเตือนได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from notifications
  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await OneSignal.User.PushSubscription.optOut();
      
      toast({
        title: "✅ ยกเลิกแล้ว",
        description: "คุณได้ยกเลิกการแจ้งเตือนแล้ว",
        variant: "default",
      });
      
      // อัพเดทสถานะ
      await checkStatus();
    } catch (error) {
      console.error('❌ Unsubscribe error:', error);
      toast({
        title: "❌ เกิดข้อผิดพลาด",
        description: "ไม่สามารถยกเลิกการแจ้งเตือนได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ส่งการแจ้งเตือนทดสอบ
  const sendTestNotification = async () => {
    if (!onesignalId || onesignalId === 'ไม่มี ID') {
      toast({
        title: "⚠️ ไม่พบ OneSignal ID",
        description: "กรุณาสมัครรับการแจ้งเตือนก่อน",
        variant: "destructive",
      });
      return;
    }

    try {
      // ส่งการแจ้งเตือนผ่าน Browser Notification API (สำหรับทดสอบ)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('🧪 การทดสอบจาก RiceFlow', {
          body: 'นี่คือการแจ้งเตือนทดสอบจากระบบ RiceFlow',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'test-notification',
          requireInteraction: true
        });

        toast({
          title: "📱 ส่งการแจ้งเตือนแล้ว",
          description: "ตรวจสอบการแจ้งเตือนที่ปรากฏขึ้น",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('❌ Test notification error:', error);
      toast({
        title: "❌ ไม่สามารถส่งการทดสอบได้",
        description: "เกิดข้อผิดพลาดในการส่งการแจ้งเตือน",
        variant: "destructive",
      });
    }
  };

  // ตรวจสอบสถานะเมื่อ component โหลด
  useEffect(() => {
    const timer = setTimeout(checkStatus, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500">อนุญาตแล้ว</Badge>;
      case 'denied':
        return <Badge variant="destructive">ปฏิเสธ</Badge>;
      default:
        return <Badge variant="secondary">ยังไม่ได้ถาม</Badge>;
    }
  };

  const getSubscriptionBadge = () => {
    return isSubscribed ? 
      <Badge variant="default" className="bg-blue-500">สมัครแล้ว</Badge> : 
      <Badge variant="outline">ยังไม่สมัคร</Badge>;
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔔 OneSignal Push Notification Test
          </CardTitle>
          <CardDescription>
            ทดสอบระบบการแจ้งเตือนของ RiceFlow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* สถานะปัจจุบัน */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">📊 สถานะปัจจุบัน</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Browser Permission:</span>
                {getPermissionBadge()}
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>OneSignal Subscription:</span>
                {getSubscriptionBadge()}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span>OneSignal ID:</span>
                <code className="text-sm bg-white px-2 py-1 rounded border">
                  {onesignalId || 'กำลังโหลด...'}
                </code>
              </div>
            </div>
          </div>

          {/* ปุ่มควบคุม */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">🎛️ การควบคุม</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                onClick={handleSubscribe}
                disabled={isLoading || isSubscribed}
                className="w-full"
              >
                {isLoading ? '⏳ กำลังดำเนินการ...' : '🔔 สมัครรับการแจ้งเตือน'}
              </Button>
              
              <Button 
                onClick={handleUnsubscribe}
                disabled={isLoading || !isSubscribed}
                variant="outline"
                className="w-full"
              >
                {isLoading ? '⏳ กำลังดำเนินการ...' : '🔕 ยกเลิกการแจ้งเตือน'}
              </Button>
            </div>
            
            <Button 
              onClick={sendTestNotification}
              disabled={!isSubscribed || permission !== 'granted'}
              variant="secondary"
              className="w-full"
            >
              🧪 ส่งการแจ้งเตือนทดสอบ
            </Button>
            
            <Button 
              onClick={checkStatus}
              variant="ghost"
              className="w-full"
            >
              🔄 รีเฟรชสถานะ
            </Button>
          </div>

          {/* คำแนะนำ */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">💡 คำแนะนำ</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. กดปุ่ม "สมัครรับการแจ้งเตือน" และอนุญาตในเบราว์เซอร์</p>
              <p>2. ตรวจสอบว่าสถานะเป็น "อนุญาตแล้ว" และ "สมัครแล้ว"</p>
              <p>3. กดปุ่ม "ส่งการแจ้งเตือนทดสอบ" เพื่อทดสอบ</p>
              <p>4. ไปที่ OneSignal Dashboard กดปุ่ม "New Push" เพื่อส่งจริง</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
