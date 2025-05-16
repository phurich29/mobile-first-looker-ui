
import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export const BackgroundImage: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <>
      {/* Fixed background with reduced opacity for stability */}
      <div 
        className="absolute inset-0 z-[-2] opacity-10 dark:opacity-8"
        style={{ 
          backgroundImage: `url('/lovable-uploads/rice-field-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: isDarkMode ? 'brightness(0.3) contrast(1.1)' : 'brightness(1.05)',
        }}
      />
      
      {/* Gradient overlay - simplified with reduced animation potential */}
      <div 
        className="absolute inset-0 z-[-1] bg-gradient-to-b from-white/95 to-white/85 dark:from-gray-900/90 dark:to-gray-900/80"
      />
      
      {/* Rice plant pattern overlay - fixed position to prevent movement */}
      <div 
        className="absolute inset-0 z-[-1] opacity-3 dark:opacity-2 pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50,120 L50,60 C50,60 48,40 50,30 C52,20 55,10 50,0' fill='none' stroke='%23557153' stroke-width='2' stroke-opacity='0.2' stroke-linecap='round'/%3E%3Cpath d='M50,80 C60,70 70,75 80,65' fill='none' stroke='%23557153' stroke-width='2' stroke-opacity='0.2' stroke-linecap='round'/%3E%3Cpath d='M50,70 C60,65 75,70 85,60' fill='none' stroke='%23557153' stroke-width='2' stroke-opacity='0.2' stroke-linecap='round'/%3E%3Cpath d='M50,60 C40,50 30,55 20,45' fill='none' stroke='%23557153' stroke-width='2' stroke-opacity='0.2' stroke-linecap='round'/%3E%3Cpath d='M50,50 C40,45 25,50 15,40' fill='none' stroke='%23557153' stroke-width='2' stroke-opacity='0.2' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px',
          backgroundAttachment: 'fixed',
        }}
      />
    </>
  );
};
