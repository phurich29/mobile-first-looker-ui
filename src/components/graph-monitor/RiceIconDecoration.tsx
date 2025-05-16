
import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Heart } from "lucide-react";

interface RiceIconDecorationProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const RiceIconDecoration: React.FC<RiceIconDecorationProps> = ({ position }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  // Position classes - moved further to the edges to avoid content overlap
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-28 left-4 md:bottom-12",
    "bottom-right": "bottom-28 right-4 md:bottom-12"
  };
  
  // Use more transparency in both light and dark modes
  const opacityClass = isDarkMode ? 'opacity-30' : 'opacity-40';
  
  return (
    <div 
      className={`absolute hidden md:block z-0 ${opacityClass} ${positionClasses[position]}`} // Changed z-10 to z-0 and reduced opacity
      aria-hidden="true"
    >
      <div className="relative group">
        <RiceLogoIcon 
          className={`w-24 h-24 ${position.includes('right') ? 'transform rotate-6' : 'transform -rotate-6'} transition-transform duration-300 hover:scale-110`} // Reduced size from w-32 h-32
        />
        
        {/* Hidden heart that appears on hover */}
        <Heart 
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 opacity-0 group-hover:opacity-70 transition-all duration-300 text-pink-300 animate-bounce`} // Reduced opacity
          size={16} // Smaller heart
        />
      </div>
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
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.05))' }} // Reduced shadow
    >
      {/* Rice plant stem */}
      <path 
        d="M50,120 C50,120 47,90 50,60" 
        fill="none" 
        stroke="#0A5A36" 
        strokeWidth="3" // Thinner stroke
        strokeLinecap="round"
        strokeOpacity="0.7" // Added transparency
      />
      
      {/* Rice grains - styled like the logo with yellow fill and green outline */}
      <path 
        d="M43,20 C43,15 45,10 50,10 C55,10 57,15 57,20 C57,25 55,30 50,30 C45,30 43,25 43,20 Z" 
        fill="#FFD966" 
        fillOpacity="0.8" // Added transparency
        stroke="#0A5A36"
        strokeWidth="3" // Thinner stroke
        strokeOpacity="0.7" // Added transparency
      />
      
      <path 
        d="M38,35 C38,31 40,27 44,27 C48,27 50,31 50,35 C50,39 48,43 44,43 C40,43 38,39 38,35 Z" 
        fill="#FFD966" 
        fillOpacity="0.8" // Added transparency
        stroke="#0A5A36"
        strokeWidth="3" // Thinner stroke
        strokeOpacity="0.7" // Added transparency
      />
      
      <path 
        d="M50,35 C50,31 52,27 56,27 C60,27 62,31 62,35 C62,39 60,43 56,43 C52,43 50,39 50,35 Z" 
        fill="#FFD966" 
        fillOpacity="0.8" // Added transparency
        stroke="#0A5A36"
        strokeWidth="3" // Thinner stroke
        strokeOpacity="0.7" // Added transparency
      />
      
      <path 
        d="M43,50 C43,45 45,40 50,40 C55,40 57,45 57,50 C57,55 55,60 50,60 C45,60 43,55 43,50 Z" 
        fill="#FFD966" 
        fillOpacity="0.8" // Added transparency
        stroke="#0A5A36"
        strokeWidth="3" // Thinner stroke
        strokeOpacity="0.7" // Added transparency
      />
      
      {/* Add the little radiation lines like in the logo - with reduced opacity */}
      <path 
        d="M65,20 L75,15" 
        fill="none" 
        stroke="#0A5A36" 
        strokeWidth="3" // Thinner stroke
        strokeOpacity="0.7" // Added transparency
        strokeLinecap="round"
      />
      
      <path 
        d="M65,30 L78,30" 
        fill="none" 
        stroke="#0A5A36" 
        strokeWidth="3" // Thinner stroke
        strokeOpacity="0.7" // Added transparency
        strokeLinecap="round"
      />
      
      <path 
        d="M65,40 L75,45" 
        fill="none" 
        stroke="#0A5A36" 
        strokeWidth="3" // Thinner stroke
        strokeOpacity="0.7" // Added transparency
        strokeLinecap="round"
      />
      
      {/* Add cute eyes for the grain - with reduced opacity */}
      <circle cx="47" cy="17" r="1.5" fill="#0A5A36" fillOpacity="0.7" />
      <circle cx="53" cy="17" r="1.5" fill="#0A5A36" fillOpacity="0.7" />
      
      {/* Add a smile - with reduced opacity */}
      <path 
        d="M48,22 Q50,25 52,22" 
        fill="none" 
        stroke="#0A5A36"
        strokeWidth="1.5"
        strokeOpacity="0.7" // Added transparency
        strokeLinecap="round"
      />
    </svg>
  );
};
