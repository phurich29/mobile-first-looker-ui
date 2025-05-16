
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
      <RicePlantIcon className={`w-32 h-32 text-emerald-700 dark:text-emerald-500 ${position.includes('right') ? 'transform rotate-12' : 'transform -rotate-12'}`} />
    </div>
  );
};

// Larger rice plant SVG icon with more detailed plant features
const RicePlantIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 120"
      className={className}
      fill="currentColor"
      style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.08))' }}
    >
      {/* Rice plant stem */}
      <path d="M50,120 L50,60 C50,60 48,40 50,30 C52,20 55,10 50,0" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"/>
      
      {/* Rice plant leaves */}
      <path d="M50,80 C60,70 70,75 80,65" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"/>
      
      <path d="M50,70 C60,65 75,70 85,60" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"/>
      
      <path d="M50,60 C40,50 30,55 20,45" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"/>
      
      <path d="M50,50 C40,45 25,50 15,40" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"/>
      
      {/* Rice grains at the top */}
      <path d="M43,20 C43,15 45,10 50,10 C55,10 57,15 57,20 C57,25 55,30 50,30 C45,30 43,25 43,20 Z" 
        fill="currentColor" 
        opacity="0.8"/>
      
      <path d="M38,15 C38,11 40,7 44,7 C48,7 50,11 50,15 C50,19 48,23 44,23 C40,23 38,19 38,15 Z" 
        fill="currentColor" 
        opacity="0.8"/>
      
      <path d="M50,15 C50,11 52,7 56,7 C60,7 62,11 62,15 C62,19 60,23 56,23 C52,23 50,19 50,15 Z" 
        fill="currentColor" 
        opacity="0.8"/>
    </svg>
  );
};
