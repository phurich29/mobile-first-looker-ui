
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
      className={`absolute hidden md:block z-10 opacity-70 ${isDarkMode ? 'opacity-50' : 'opacity-70'} ${positionClasses[position]}`}
      aria-hidden="true"
      style={{
        transform: 'translateZ(0)', // Force GPU rendering for stability
      }}
    >
      <RiceLogoIcon className={`w-32 h-32 ${position.includes('right') ? 'transform rotate-12' : 'transform -rotate-12'}`} />
    </div>
  );
};

// Rice logo styled icon that matches the RiceFlow logo with yellow grains
const RiceLogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 120"
      className={className}
      style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.08))' }}
    >
      {/* Rice plant stem */}
      <path 
        d="M50,120 C50,120 47,90 50,60" 
        fill="none" 
        stroke="#0A5A36" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      
      {/* Rice grains - styled like the logo with yellow fill and green outline */}
      <path 
        d="M43,20 C43,15 45,10 50,10 C55,10 57,15 57,20 C57,25 55,30 50,30 C45,30 43,25 43,20 Z" 
        fill="#FFD966" 
        stroke="#0A5A36"
        strokeWidth="4"
      />
      
      <path 
        d="M38,35 C38,31 40,27 44,27 C48,27 50,31 50,35 C50,39 48,43 44,43 C40,43 38,39 38,35 Z" 
        fill="#FFD966" 
        stroke="#0A5A36"
        strokeWidth="4"
      />
      
      <path 
        d="M50,35 C50,31 52,27 56,27 C60,27 62,31 62,35 C62,39 60,43 56,43 C52,43 50,39 50,35 Z" 
        fill="#FFD966" 
        stroke="#0A5A36"
        strokeWidth="4"
      />
      
      <path 
        d="M43,50 C43,45 45,40 50,40 C55,40 57,45 57,50 C57,55 55,60 50,60 C45,60 43,55 43,50 Z" 
        fill="#FFD966" 
        stroke="#0A5A36"
        strokeWidth="4"
      />
      
      {/* Add the little radiation lines like in the logo */}
      <path 
        d="M65,20 L75,15" 
        fill="none" 
        stroke="#0A5A36" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      
      <path 
        d="M65,30 L78,30" 
        fill="none" 
        stroke="#0A5A36" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
      
      <path 
        d="M65,40 L75,45" 
        fill="none" 
        stroke="#0A5A36" 
        strokeWidth="4" 
        strokeLinecap="round"
      />
    </svg>
  );
};
