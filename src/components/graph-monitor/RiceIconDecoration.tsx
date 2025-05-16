
import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface RiceIconDecorationProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const RiceIconDecoration: React.FC<RiceIconDecorationProps> = ({ position }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  // Position classes based on the specified position prop
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-20 left-4 md:bottom-4",
    "bottom-right": "bottom-20 right-4 md:bottom-4"
  };
  
  return (
    <div 
      className={`absolute hidden md:flex z-10 opacity-30 ${isDarkMode ? 'opacity-20' : 'opacity-30'} ${positionClasses[position]}`}
      aria-hidden="true"
    >
      <RiceGrainIcon className={`w-28 h-28 text-emerald-700 dark:text-emerald-400 ${position.includes('right') ? 'transform rotate-45' : 'transform -rotate-45'}`} />
    </div>
  );
};

// Custom Rice Grain SVG Icon
const RiceGrainIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 64 64" 
      className={className}
      fill="currentColor"
    >
      <path d="M32,8c-13.35,0-24,10.65-24,24c0,13.35,10.65,24,24,24s24-10.65,24-24C56,18.65,45.35,8,32,8z M32,52
        c-11.03,0-20-8.97-20-20c0-11.03,8.97-20,20-20s20,8.97,20,20C52,43.03,43.03,52,32,52z" />
      <path d="M41.88,20.6c-0.94-0.2-1.91-0.31-2.88-0.31c-7.44,0-13.5,6.06-13.5,13.5c0,0.97,0.11,1.94,0.31,2.88
        c-2.51,0.83-4.31,3.21-4.31,6c0,3.49,2.84,6.33,6.33,6.33c2.79,0,5.17-1.8,6-4.31c0.94,0.2,1.91,0.31,2.88,0.31
        c7.44,0,13.5-6.06,13.5-13.5c0-0.98-0.11-1.94-0.31-2.88c2.51-0.83,4.31-3.21,4.31-6c0-3.49-2.84-6.33-6.33-6.33
        C45.09,16.29,42.72,18.09,41.88,20.6z" />
    </svg>
  );
};
