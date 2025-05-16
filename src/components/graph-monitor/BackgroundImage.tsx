
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
      
      {/* Rice grain pattern overlay - fixed position to prevent movement */}
      <div 
        className="absolute inset-0 z-[-1] opacity-4 dark:opacity-2 pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32,8c-13.35,0-24,10.65-24,24c0,13.35,10.65,24,24,24s24-10.65,24-24C56,18.65,45.35,8,32,8z M32,52 c-11.03,0-20-8.97-20-20c0-11.03,8.97-20,20-20s20,8.97,20,20C52,43.03,43.03,52,32,52z' fill='%239C92AC' fill-opacity='0.2'/%3E%3Cpath d='M41.88,20.6c-0.94-0.2-1.91-0.31-2.88-0.31c-7.44,0-13.5,6.06-13.5,13.5c0,0.97,0.11,1.94,0.31,2.88 c-2.51,0.83-4.31,3.21-4.31,6c0,3.49,2.84,6.33,6.33,6.33c2.79,0,5.17-1.8,6-4.31c0.94,0.2,1.91,0.31,2.88,0.31 c7.44,0,13.5-6.06,13.5-13.5c0-0.98-0.11-1.94-0.31-2.88c2.51-0.83,4.31-3.21,4.31-6c0-3.49-2.84-6.33-6.33-6.33 C45.09,16.29,42.72,18.09,41.88,20.6z' fill='%239C92AC' fill-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          backgroundAttachment: 'fixed',
        }}
      />
    </>
  );
};
