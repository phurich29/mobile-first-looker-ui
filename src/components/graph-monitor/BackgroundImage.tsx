
import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export const BackgroundImage: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <>
      {/* Fixed background with softer, less yellow color */}
      <div 
        className="absolute inset-0 z-[-2]"
        style={{ 
          backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F2', // Even less yellow
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Soft gradient overlay with reduced opacity */}
      <div 
        className="absolute inset-0 z-[-1] bg-gradient-to-br"
        style={{
          backgroundImage: isDarkMode 
            ? 'linear-gradient(to bottom right, rgba(30, 30, 30, 0.95), rgba(20, 40, 20, 0.9))' 
            : 'linear-gradient(to bottom right, rgba(250, 250, 248, 0.8), rgba(245, 245, 242, 0.7))' // Even less yellow
        }}
      />
      
      {/* Rice logo pattern overlay with very reduced opacity */}
      <div 
        className="absolute inset-0 z-[-1] opacity-2 dark:opacity-1 pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='50' cy='20' rx='10' ry='15' transform='rotate(-15 50 20)' fill='%230A5A36' fill-opacity='0.02' stroke='%230A5A36' stroke-width='1' stroke-opacity='0.02'/%3E%3C/svg%3E")`,
          backgroundSize: '400px 400px',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Very subtle floating bubble effect with much reduced opacity */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute h-8 w-8 rounded-full bg-green-100 opacity-5 animate-bounce" 
             style={{top: '15%', left: '5%', animationDuration: '5s'}}></div>
        <div className="absolute h-6 w-6 rounded-full bg-green-100 opacity-5 animate-bounce" 
             style={{top: '35%', left: '95%', animationDuration: '7s'}}></div>
        <div className="absolute h-10 w-10 rounded-full bg-green-50 opacity-5 animate-bounce" 
             style={{top: '75%', left: '15%', animationDuration: '6s'}}></div>
      </div>
    </>
  );
};
