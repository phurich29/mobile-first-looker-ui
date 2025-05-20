
import React from "react";

interface RiceIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const RiceIcon: React.FC<RiceIconProps> = ({
  className = "",
  size = 24,
  color = "currentColor"
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.05))' }}
    >
      {/* Rice plant stem - curved for visual interest */}
      <path 
        d="M60,110 C60,110 58,85 63,65 C68,45 55,40 60,30" 
        fill="none" 
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1 3"
      />
      
      {/* Leaf elements */}
      <path
        d="M60,75 C50,65 45,70 40,65"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      <path
        d="M60,60 C70,55 72,45 80,45"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Rice grains in a different arrangement */}
      <ellipse
        cx="58" cy="22" rx="10" ry="15"
        transform="rotate(-15 58 22)"
        fill="#F8F7E0" 
        stroke={color}
        strokeWidth="2"
      />
      
      <ellipse
        cx="45" cy="35" rx="8" ry="12"
        transform="rotate(25 45 35)"
        fill="#F8F7E0" 
        stroke={color}
        strokeWidth="2"
      />
      
      <ellipse
        cx="70" cy="35" rx="8" ry="12"
        transform="rotate(-25 70 35)"
        fill="#F8F7E0" 
        stroke={color}
        strokeWidth="2"
      />
      
      {/* Add cute face to main grain */}
      <circle cx="54" cy="19" r="1.5" fill={color} />
      <circle cx="62" cy="19" r="1.5" fill={color} />
      
      {/* Smile */}
      <path 
        d="M54,25 Q58,28 62,25" 
        fill="none" 
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default RiceIcon;
