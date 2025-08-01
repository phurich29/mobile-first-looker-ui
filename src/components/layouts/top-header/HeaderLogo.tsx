import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
interface HeaderLogoProps {
  appName: string;
}
export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  appName
}) => {
  const {
    language,
    setLanguage
  } = useLanguage();

  const getLanguageDisplay = (lang: string) => {
    switch (lang) {
      case 'th': return 'ไทย';
      case 'en': return 'English';
      case 'zh': return '中文';
      default: return lang.toUpperCase();
    }
  };

  const getCurrentLanguageCode = () => {
    switch (language) {
      case 'th': return 'TH';
      case 'en': return 'EN';
      case 'zh': return 'ZH';
      default: return 'TH';
    }
  };

  return <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 text-white hover:bg-white/10 hover:text-white min-h-[40px] px-2 sm:px-3">
            <Languages className="h-4 w-4 sm:h-4 sm:w-4" />
            <span className="font-medium text-sm sm:text-base">
              {getCurrentLanguageCode()}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border border-border">
          <DropdownMenuItem 
            onClick={() => setLanguage('th')}
            className={language === 'th' ? 'bg-accent' : ''}
          >
            ไทย (TH)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setLanguage('en')}
            className={language === 'en' ? 'bg-accent' : ''}
          >
            English (EN)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setLanguage('zh')}
            className={language === 'zh' ? 'bg-accent' : ''}
          >
            中文 (ZH)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>;
};