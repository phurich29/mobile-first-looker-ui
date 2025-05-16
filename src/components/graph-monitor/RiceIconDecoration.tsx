
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
    "top-left": "top-8 left-8",
    "top-right": "top-8 right-8",
    "bottom-left": "bottom-24 left-8 md:bottom-8",
    "bottom-right": "bottom-24 right-8 md:bottom-8"
  };
  
  return (
    <div 
      className={`absolute hidden md:block z-10 opacity-15 ${isDarkMode ? 'opacity-10' : 'opacity-15'} ${positionClasses[position]}`}
      aria-hidden="true"
      style={{
        transform: 'translateZ(0)', // Force GPU rendering for stability
      }}
    >
      <RiceGrainIcon className={`w-24 h-24 text-emerald-700 dark:text-emerald-500 ${position.includes('right') ? 'transform rotate-45' : 'transform -rotate-45'}`} />
    </div>
  );
};

// Simpler, optimized Rice Grain SVG Icon with fewer path points for better performance
const RiceGrainIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 64 64" 
      className={className}
      fill="currentColor"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.05))' }}
    >
      <path d="M32,10c-12.15,0-22,9.85-22,22s9.85,22,22,22s22-9.85,22-22S44.15,10,32,10z M32,50
        c-9.94,0-18-8.06-18-18s8.06-18,18-18s18,8.06,18,18S41.94,50,32,50z" />
      <path d="M41,22.5c-0.85-0.18-1.72-0.28-2.6-0.28c-6.71,0-12.18,5.47-12.18,12.18c0,0.88,0.1,1.75,0.28,2.6
        c-2.26,0.75-3.9,2.89-3.9,5.4c0,3.14,2.56,5.7,5.7,5.7c2.51,0,4.65-1.64,5.4-3.9c0.85,0.18,1.72,0.28,2.6,0.28
        c6.71,0,12.18-5.47,12.18-12.18c0-0.88-0.1-1.75-0.28-2.6c2.26-0.75,3.9-2.89,3.9-5.4c0-3.14-2.56-5.7-5.7-5.7
        C43.89,18.6,41.75,20.24,41,22.5z" />
    </svg>
  );
};
