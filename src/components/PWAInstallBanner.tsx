
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, installApp, dismissInstallPrompt, isInstalling } = usePWAInstall();
  const { isMobile, isTablet, isDesktop, isIOS, supportsInstallPrompt } = useDeviceDetection();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner if user can install and hasn't dismissed it recently
    if (canInstall && supportsInstallPrompt) {
      // Add a small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [canInstall, supportsInstallPrompt]);

  const handleInstall = async () => {
    try {
      await installApp();
      setIsVisible(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setIsVisible(false);
  };

  if (!isVisible || !canInstall) {
    return null;
  }

  // Different messages for different devices
  const getInstallMessage = () => {
    if (isMobile) {
      return isIOS 
        ? 'เพิ่ม Riceflow ลงหน้าจอหลักของคุณเพื่อประสบการณ์ที่ดีขึ้น'
        : 'ติดตั้ง Riceflow เป็นแอปบนมือถือของคุณ';
    } else if (isTablet) {
      return 'ติดตั้ง Riceflow เป็นแอปบนแท็บเล็ตของคุณ';
    } else {
      return 'ติดตั้ง Riceflow เป็นแอปบนเดสก์ท็อปของคุณ';
    }
  };

  const getInstallButtonText = () => {
    if (isInstalling) return 'กำลังติดตั้ง...';
    if (isIOS) return 'เพิ่มลงหน้าจอหลัก';
    return 'ติดตั้งแอป';
  };

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300 ease-in-out",
      isMobile || isTablet 
        ? "bottom-20 left-4 right-4" // Above mobile footer nav
        : "bottom-4 right-4 max-w-sm" // Desktop positioning
    )}>
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Smartphone className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                ติดตั้ง Riceflow
              </h3>
              <p className="text-xs text-emerald-50 mb-3 leading-relaxed">
                {getInstallMessage()}
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  size="sm"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 text-xs px-3 py-1.5 h-auto font-medium"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {getInstallButtonText()}
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-emerald-600 text-xs px-2 py-1.5 h-auto"
                >
                  ไว้ทีหลัง
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 text-white hover:bg-emerald-600 p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
