import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Smartphone, TestTube } from 'lucide-react';
import { mobileAudioService } from '@/services/MobileAudioService';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { Capacitor } from '@capacitor/core';

export const MobileAudioTestButton: React.FC = () => {
  const { t, language } = useTranslation();
  const [isTesting, setIsTesting] = useState(false);
  const [audioInfo, setAudioInfo] = useState<any>(null);

  const testMobileAudio = async () => {
    if (isTesting) return;
    
    setIsTesting(true);
    
    try {
      console.log('🎵 Testing mobile audio notification...');
      
      // Get audio info
      const info = mobileAudioService.getAudioInfo();
      setAudioInfo(info);
      
      // Test audio
      const success = await mobileAudioService.testAudio();
      
      if (success) {
        toast.success(
          language === 'th' 
            ? '✅ เสียงแจ้งเตือนทำงานปกติบนอุปกรณ์นี้' 
            : '✅ Audio notifications working on this device'
        );
      } else {
        toast.error(
          language === 'th' 
            ? '❌ ไม่สามารถเล่นเสียงแจ้งเตือนได้' 
            : '❌ Cannot play audio notifications'
        );
      }
    } catch (error) {
      console.error('Mobile audio test failed:', error);
      toast.error(
        language === 'th' 
          ? '❌ การทดสอบเสียงล้มเหลว' 
          : '❌ Audio test failed'
      );
    } finally {
      setIsTesting(false);
    }
  };

  const isNativePlatform = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  return (
    <div className="space-y-3">
      <Button
        onClick={testMobileAudio}
        disabled={isTesting}
        variant="outline"
        className="w-full flex items-center gap-2"
      >
        {isTesting ? (
          <TestTube className="w-4 h-4 animate-spin" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {language === 'th' ? 'ทดสอบเสียงแจ้งเตือน' : 'Test Audio Notification'}
      </Button>
      
      {audioInfo && (
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3 h-3" />
            <span>
              {language === 'th' ? 'แพลตฟอร์ม' : 'Platform'}: {platform}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isNativePlatform ? (
              <Volume2 className="w-3 h-3 text-green-600" />
            ) : (
              <VolumeX className="w-3 h-3 text-yellow-600" />
            )}
            <span>
              {language === 'th' ? 'รองรับเสียงแบบ Native' : 'Native Audio'}: 
              {isNativePlatform ? 
                (language === 'th' ? ' ใช่' : ' Yes') : 
                (language === 'th' ? ' ไม่ (ใช้ Web Audio)' : ' No (Web Audio)')}
            </span>
          </div>
          <div>
            <span>
              {language === 'th' ? 'สถานะ' : 'Status'}: 
              {audioInfo.initialized ? 
                (language === 'th' ? ' พร้อมใช้งาน' : ' Ready') : 
                (language === 'th' ? ' ยังไม่พร้อม' : ' Not Ready')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};