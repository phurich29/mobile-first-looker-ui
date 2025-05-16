
import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export const BackgroundImage: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <>
      {/* Fixed background with softer color */}
      <div 
        className="absolute inset-0 z-[-2]"
        style={{ 
          backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F7F2', // Changed from #FFF9DF to #F8F7F2 (less yellow)
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
            : 'linear-gradient(to bottom right, rgba(248, 247, 242, 0.8), rgba(240, 238, 230, 0.7))' // Less yellow gradient
        }}
      />
      
      {/* Rice logo pattern overlay with very reduced opacity */}
      <div 
        className="absolute inset-0 z-[-1] opacity-3 dark:opacity-2 pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M43,20 C43,15 45,10 50,10 C55,10 57,15 57,20 C57,25 55,30 50,30 C45,30 43,25 43,20 Z' fill='%230A5A36' fill-opacity='0.05' stroke='%230A5A36' stroke-width='1' stroke-opacity='0.05'/%3E%3Cpath d='M65,20 L75,15' stroke='%230A5A36' stroke-width='1' stroke-opacity='0.05' stroke-linecap='round'/%3E%3Cpath d='M65,30 L78,30' stroke='%230A5A36' stroke-width='1' stroke-opacity='0.05' stroke-linecap='round'/%3E%3Cpath d='M65,40 L75,45' stroke='%230A5A36' stroke-width='1' stroke-opacity='0.05' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundSize: '400px 400px', // Larger pattern
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Very subtle floating bubble effect with much reduced opacity */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute h-8 w-8 rounded-full bg-emerald-100 opacity-10 animate-bounce" 
             style={{top: '15%', left: '5%', animationDuration: '5s'}}></div>
        <div className="absolute h-6 w-6 rounded-full bg-green-100 opacity-10 animate-bounce" 
             style={{top: '35%', left: '95%', animationDuration: '7s'}}></div>
        <div className="absolute h-10 w-10 rounded-full bg-emerald-50 opacity-10 animate-bounce" 
             style={{top: '75%', left: '15%', animationDuration: '6s'}}></div>
      </div>
    </>
  );
};
