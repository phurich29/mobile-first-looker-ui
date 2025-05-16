
import React from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Heart } from "lucide-react";

interface RiceIconDecorationProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const RiceIconDecoration: React.FC<RiceIconDecorationProps> = ({ position }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  // Position classes - moved further to the edges and corners to avoid content overlap
  const positionClasses = {
    "top-left": "top-0 left-0 -translate-x-1/3 -translate-y-1/3",
    "top-right": "top-0 right-0 translate-x-1/3 -translate-y-1/3",
    "bottom-left": "bottom-0 left-0 -translate-x-1/3 translate-y-1/3", 
    "bottom-right": "bottom-0 right-0 translate-x-1/3 translate-y-1/3"
  };
  
  // Use even more transparency
  const opacityClass = isDarkMode ? 'opacity-20' : 'opacity-30';
  
  return (
    <div 
      className={`absolute hidden md:block z-0 ${opacityClass} ${positionClasses[position]}`}
      aria-hidden="true"
    >
      <div className="relative group">
        <NewRiceLogoIcon 
          className={`w-28 h-28 ${position.includes('right') ? 'transform rotate-6' : 'transform -rotate-6'} transition-transform duration-300 hover:scale-110`}
        />
        
        {/* Hidden heart that appears on hover */}
        <Heart 
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 opacity-0 group-hover:opacity-70 transition-all duration-300 text-pink-300 animate-bounce`}
          size={16}
        />
      </div>
    </div>
  );
};

// New rice logo styled icon with a different approach
const NewRiceLogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 120 120"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.05))' }}
    >
      {/* Rice plant stem - curved for visual interest */}
      <path 
        d="M60,110 C60,110 58,85 63,65 C68,45 55,40 60,30" 
        fill="none" 
        stroke="#0A5A36" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
        strokeDasharray="1 3"
      />
      
      {/* Leaf elements */}
      <path
        d="M60,75 C50,65 45,70 40,65"
        fill="none"
        stroke="#0A5A36"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      
      <path
        d="M60,60 C70,55 72,45 80,45"
        fill="none"
        stroke="#0A5A36"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      
      {/* Rice grains in a different arrangement */}
      <ellipse
        cx="58" cy="22" rx="10" ry="15"
        transform="rotate(-15 58 22)"
        fill="#F8F7E0" 
        fillOpacity="0.9"
        stroke="#0A5A36"
        strokeWidth="2"
        strokeOpacity="0.7"
      />
      
      <ellipse
        cx="45" cy="35" rx="8" ry="12"
        transform="rotate(25 45 35)"
        fill="#F8F7E0" 
        fillOpacity="0.9"
        stroke="#0A5A36"
        strokeWidth="2"
        strokeOpacity="0.7"
      />
      
      <ellipse
        cx="70" cy="35" rx="8" ry="12"
        transform="rotate(-25 70 35)"
        fill="#F8F7E0" 
        fillOpacity="0.9"
        stroke="#0A5A36"
        strokeWidth="2"
        strokeOpacity="0.7"
      />
      
      {/* Add cute face to main grain */}
      <circle cx="54" cy="19" r="1.5" fill="#0A5A36" fillOpacity="0.8" />
      <circle cx="62" cy="19" r="1.5" fill="#0A5A36" fillOpacity="0.8" />
      
      {/* Smile */}
      <path 
        d="M54,25 Q58,28 62,25" 
        fill="none" 
        stroke="#0A5A36"
        strokeWidth="1.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
      
      {/* Decorative elements */}
      <path
        d="M35,15 A20,10 0 0,1 45,10"
        fill="none"
        stroke="#0A5A36"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="1 2"
        strokeOpacity="0.5"
      />
      
      <path
        d="M80,15 A20,10 0 0,0 70,10"
        fill="none"
        stroke="#0A5A36"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="1 2"
        strokeOpacity="0.5"
      />
      
      {/* Small rice grains as accents */}
      <ellipse
        cx="85" cy="25" rx="5" ry="7"
        transform="rotate(-30 85 25)"
        fill="#F8F7E0" 
        fillOpacity="0.8"
        stroke="#0A5A36"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      
      <ellipse
        cx="30" cy="25" rx="5" ry="7"
        transform="rotate(30 30 25)"
        fill="#F8F7E0" 
        fillOpacity="0.8"
        stroke="#0A5A36"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
    </svg>
  );
};
