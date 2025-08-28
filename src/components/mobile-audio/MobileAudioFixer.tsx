import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { Capacitor } from '@capacitor/core';

export const MobileAudioFixer: React.FC = () => {
  const { t, language } = useTranslation();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Check if mobile device
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth <= 768 ||
                   Capacitor.isNativePlatform();

  const fixAudioContext = async () => {
    console.log('🔧 Attempting to fix audio context for mobile...');
    
    try {
      // Create new AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }

      const ctx = new AudioContextClass();
      console.log(`🎵 AudioContext created, state: ${ctx.state}`);

      // Force resume if suspended
      if (ctx.state === 'suspended') {
        console.log('🔓 Attempting to resume suspended AudioContext...');
        await ctx.resume();
        console.log(`🔓 AudioContext resume result: ${ctx.state}`);
      }

      if (ctx.state === 'running') {
        setAudioContext(ctx);
        setIsFixed(true);
        
        // Test with a simple beep
        console.log('🧪 Testing audio with simple beep...');
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        
        toast.success(
          language === 'th' ? 
          '✅ แก้ไขระบบเสียงสำเร็จ! ลองเล่นเสียงแจ้งเตือนดูครับ' : 
          '✅ Audio system fixed! Try playing notification sounds now'
        );
        
        console.log('✅ Audio context successfully fixed and tested');
      } else {
        throw new Error(`AudioContext state is ${ctx.state}, expected 'running'`);
      }

    } catch (error) {
      console.error('❌ Failed to fix audio context:', error);
      toast.error(
        language === 'th' ? 
        '❌ ไม่สามารถแก้ไขระบบเสียงได้ อาจเป็นเพราะข้อจำกัดของ browser' : 
        '❌ Cannot fix audio system, may be due to browser limitations'
      );
    }
  };

  const testCurrentAudio = async () => {
    if (!audioContext || audioContext.state !== 'running') {
      toast.error(
        language === 'th' ? 
        'กรุณาแก้ไขระบบเสียงก่อน' : 
        'Please fix audio system first'
      );
      return;
    }

    setIsTesting(true);
    
    try {
      console.log('🧪 Testing current audio system...');
      
      // Play test sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Second beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        
        osc2.frequency.setValueAtTime(660, audioContext.currentTime);
        osc2.type = 'sine';
        
        gain2.gain.setValueAtTime(0, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.01);
        gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
        
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      }, 200);
      
      toast.success(
        language === 'th' ? 
        '🔊 ระบบเสียงทำงานปกติ!' : 
        '🔊 Audio system is working!'
      );
      
      console.log('✅ Audio test completed successfully');
      
    } catch (error) {
      console.error('❌ Audio test failed:', error);
      toast.error(
        language === 'th' ? 
        '❌ การทดสอบเสียงล้มเหลว' : 
        '❌ Audio test failed'
      );
    } finally {
      setTimeout(() => setIsTesting(false), 1000);
    }
  };

  // Show only on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <Smartphone className="w-5 h-5" />
          {language === 'th' ? 'แก้ไขเสียงแจ้งเตือนบน Mobile' : 'Fix Mobile Audio Notifications'}
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          {language === 'th' ? 
            'หากเสียงแจ้งเตือนไม่ทำงานบน mobile browser กรุณาคลิกปุ่มด้านล่าง' : 
            'If notification sounds are not working on mobile browser, click the button below'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
          {isFixed ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-600" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isFixed ? 
                (language === 'th' ? 'ระบบเสียงพร้อมใช้งาน' : 'Audio System Ready') :
                (language === 'th' ? 'ระบบเสียงต้องการการแก้ไข' : 'Audio System Needs Fixing')
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {audioContext ? 
                `AudioContext: ${audioContext.state}` : 
                (language === 'th' ? 'AudioContext ยังไม่ได้สร้าง' : 'AudioContext not created')
              }
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={fixAudioContext}
            className="flex-1"
            variant={isFixed ? "outline" : "default"}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {language === 'th' ? 'แก้ไขระบบเสียง' : 'Fix Audio System'}
          </Button>
          
          {isFixed && (
            <Button
              onClick={testCurrentAudio}
              disabled={isTesting}
              variant="outline"
            >
              {isTesting ? '...' : (language === 'th' ? 'ทดสอบ' : 'Test')}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            {language === 'th' ? 
              '💡 หลังจากแก้ไขแล้ว ให้ลองกดปุ่ม "ฟัง" ในการตั้งค่าเสียงแจ้งเตือน' :
              '💡 After fixing, try clicking the "Play" button in notification sound settings'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};