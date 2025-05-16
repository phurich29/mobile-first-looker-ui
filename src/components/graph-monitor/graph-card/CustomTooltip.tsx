
import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  className?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  className 
}) => {
  if (active && payload && payload.length) {
    return (
      <div className={className || "bg-white p-2 border border-purple-100 shadow-md rounded-md"}>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-gray-600">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
