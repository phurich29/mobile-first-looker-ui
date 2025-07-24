import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
interface HeaderLogoProps {
  appName: string;
}
export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  appName
}) => {
  const {
    language,
    toggleLanguage
  } = useLanguage();
  return <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center gap-1 sm:gap-2 text-white hover:bg-white/10 hover:text-white min-h-[40px] px-2 sm:px-3" title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}>
        <Languages className="h-4 w-4 sm:h-4 sm:w-4" />
        <span className="font-medium text-sm sm:text-base">
          {language === 'th' ? 'TH' : 'EN'}
        </span>
      </Button>
      
    </div>;
};