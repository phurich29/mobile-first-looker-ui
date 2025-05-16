
import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export const BackgroundImage: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <>
      <div 
        className="absolute inset-0 z-[-2] opacity-10 dark:opacity-20"
        style={{ 
          backgroundImage: `url('/rice-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: isDarkMode ? 'brightness(0.3) contrast(1.2)' : 'brightness(1.1)',
        }}
      />
      <div 
        className="absolute inset-0 z-[-1] bg-gradient-to-b from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40"
      />
    </>
  );
};
