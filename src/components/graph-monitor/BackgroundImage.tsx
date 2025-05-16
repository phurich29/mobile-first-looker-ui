
import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export const BackgroundImage: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <>
      {/* Fixed background with clean, simple color */}
      <div 
        className="absolute inset-0 z-[-1]"
        style={{ 
          backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5', // Simpler background colors
        }}
      />
      
      {/* Very subtle gradient overlay */}
      <div 
        className="absolute inset-0 z-[-1]"
        style={{
          backgroundImage: isDarkMode 
            ? 'linear-gradient(to bottom, rgba(26, 26, 26, 1), rgba(18, 18, 18, 1))' 
            : 'linear-gradient(to bottom, rgba(245, 245, 245, 1), rgba(240, 240, 240, 1))'
        }}
      />
    </>
  );
};
