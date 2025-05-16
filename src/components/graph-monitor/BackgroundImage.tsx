
import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export const BackgroundImage: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <>
      {/* Fixed background with soft cream color like the logo background */}
      <div 
        className="absolute inset-0 z-[-2]"
        style={{ 
          backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF9DF',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Gradient overlay with subtle pattern */}
      <div 
        className="absolute inset-0 z-[-1] bg-gradient-to-b from-white/95 to-white/85 dark:from-gray-900/90 dark:to-gray-900/80"
      />
      
      {/* Rice logo pattern overlay - very subtle in background */}
      <div 
        className="absolute inset-0 z-[-1] opacity-3 dark:opacity-2 pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M43,20 C43,15 45,10 50,10 C55,10 57,15 57,20 C57,25 55,30 50,30 C45,30 43,25 43,20 Z' fill='%23FFD966' fill-opacity='0.03' stroke='%230A5A36' stroke-width='2' stroke-opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          backgroundAttachment: 'fixed',
        }}
      />
    </>
  );
};
