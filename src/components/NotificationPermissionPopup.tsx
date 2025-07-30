import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X, Check, Shield } from 'lucide-react';

interface NotificationPermissionPopupProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function NotificationPermissionPopup({ 
  isOpen, 
  onAccept, 
  onDecline 
}: NotificationPermissionPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-2 animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            🔔 การแจ้งเตือนจาก RiceFlow
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            เพื่อให้คุณไม่พลาดข้อมูลสำคัญและอัพเดทล่าสุด
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="p-1 bg-green-100 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span>รับข้อมูลข่าวสารและอัพเดทล่าสุด</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="p-1 bg-green-100 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span>แจ้งเตือนเมื่อมีข้อมูลใหม่ที่สำคัญ</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="p-1 bg-green-100 rounded-full">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <span>สามารถปิดหรือเปิดได้ตลอดเวลา</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 text-center">
              💡 เราจะส่งการแจ้งเตือนเฉพาะข้อมูลที่สำคัญเท่านั้น ไม่รบกวนคุณ
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-3 pt-6">
          <Button 
            variant="outline" 
            onClick={onDecline}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            ไม่อนุญาต
          </Button>
          
          <Button 
            onClick={onAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Bell className="h-4 w-4 mr-2" />
            ยอมรับ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
