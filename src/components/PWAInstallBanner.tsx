
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone, Share, Plus, AlertTriangle } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { usePWAContext } from '@/contexts/PWAContext';
import { cn } from '@/lib/utils';

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, installApp, dismissInstallPrompt, isInstalling, isIOS } = usePWAInstall();
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();
  const { needRefresh, updateServiceWorker } = usePWAContext();
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // แสดง PWA Install Banner เสมอ (ไม่ต้องรอ canInstall)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000); // แสดงหลังจาก 5 วินาที (หลังจาก notification popup)
    
    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    
    try {
      await installApp();
      setIsVisible(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleUpdate = () => {
    updateServiceWorker();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setIsVisible(false);
    setShowIOSInstructions(false);
  };

  if (!isVisible) {
    return null;
  }

  const getInstallMessage = () => {
    if (needRefresh) {
      return 'มีการอัปเดตใหม่สำหรับ Riceflow - จะต้องเข้าสู่ระบบใหม่หลังอัปเดต';
    } else if (isIOS) {
      return 'เพิ่ม Riceflow ไปยังหน้าจอโฮมของ iPhone/iPad';
    } else if (isMobile) {
      return 'ติดตั้ง Riceflow เป็นแอปบนมือถือของคุณ';
    } else if (isTablet) {
      return 'ติดตั้ง Riceflow เป็นแอปบนแท็บเล็ตของคุณ';
    } else {
      return 'ติดตั้ง Riceflow เป็นแอปบนเดสก์ท็อปของคุณ';
    }
  };

  const getInstallButtonText = () => {
    if (needRefresh) return 'อัปเดตเลย';
    if (isInstalling) return 'กำลังติดตั้ง...';
    if (isIOS) return 'ดูวิธีติดตั้ง';
    return 'ติดตั้งแอป';
  };

  // iOS Instructions Modal Content
  if (showIOSInstructions && isIOS) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <Card className="bg-white max-w-sm w-full">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Smartphone className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">วิธีติดตั้ง Riceflow</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-100 rounded-full p-1 mt-0.5">
                  <Share className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium">1. แตะปุ่ม Share</div>
                  <div className="text-gray-600">แตะปุ่ม Share ที่ด้านล่างของ Safari</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-emerald-100 rounded-full p-1 mt-0.5">
                  <Plus className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium">2. เลือก "เพิ่มไปยังหน้าจอโฮม"</div>
                  <div className="text-gray-600">เลื่อนลงและแตะ "เพิ่มไปยังหน้าจอโฮม"</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-emerald-100 rounded-full p-1 mt-0.5">
                  <Download className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium">3. แตะ "เพิ่ม"</div>
                  <div className="text-gray-600">แตะ "เพิ่ม" เพื่อติดตั้งแอป</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                เข้าใจแล้ว
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cardClassName = needRefresh 
    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg border-0"
    : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg border-0";

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300 ease-in-out",
      isMobile || isTablet 
        ? "bottom-20 left-4 right-4"
        : "bottom-4 right-4 max-w-sm"
    )}>
      <Card className={cardClassName}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {needRefresh ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Smartphone className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                {needRefresh ? 'อัปเดต Riceflow' : 'ติดตั้ง Riceflow'}
              </h3>
              <p className="text-xs text-white/90 mb-3 leading-relaxed">
                {getInstallMessage()}
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={needRefresh ? handleUpdate : handleInstall}
                  disabled={isInstalling && !isIOS && !needRefresh}
                  size="sm"
                  className={needRefresh 
                    ? "bg-white text-orange-600 hover:bg-orange-50 text-xs px-3 py-1.5 h-auto font-medium"
                    : "bg-white text-emerald-600 hover:bg-emerald-50 text-xs px-3 py-1.5 h-auto font-medium"
                  }
                >
                  {needRefresh ? (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  ) : isIOS ? (
                    <Share className="h-3 w-3 mr-1" />
                  ) : (
                    <Download className="h-3 w-3 mr-1" />
                  )}
                  {getInstallButtonText()}
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 text-xs px-2 py-1.5 h-auto"
                >
                  ไว้ทีหลัง
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 text-white hover:bg-white/20 p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
