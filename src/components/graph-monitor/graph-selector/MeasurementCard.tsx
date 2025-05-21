
import React from "react";
import { Wheat } from "lucide-react";

interface MeasurementData {
  symbol: string;
  name: string;
  value?: any;
}

interface MeasurementCardProps {
  measurement: MeasurementData;
  onClick: () => void;
}

export const MeasurementCard: React.FC<MeasurementCardProps> = ({
  measurement,
  onClick
}) => {
  // Get icon color based on measurement type
  const getIconColor = (symbol: string) => {
    // For class measurement types
    if (symbol === "class1") return "#9b87f5"; // primary purple instead of amber/orange
    if (symbol === "class2") return "#7E69AB"; // secondary purple instead of blue
    if (symbol === "class3") return "#6E59A5"; // tertiary purple instead of yellow
    if (symbol === "short_grain") return "#333333"; // dark gray
    if (symbol === "slender_kernel") return "#D6BCFA"; // light purple instead of light blue
    
    // Colors for ingredients
    if (symbol === "whole_kernels") return "#4CAF50"; // green
    if (symbol === "head_rice") return "#9b87f5"; // primary purple
    if (symbol === "total_brokens") return "#7E69AB"; // secondary purple
    if (symbol === "small_brokens") return "#6E59A5"; // tertiary purple
    if (symbol === "small_brokens_c1") return "#D6BCFA"; // light purple
    
    // Colors for impurities
    if (symbol.includes("red")) return "#9b87f5"; // purple
    if (symbol.includes("white")) return "#EEEEEE"; // light gray
    if (symbol.includes("yellow")) return "#D6BCFA"; // light purple instead of yellow
    if (symbol.includes("black")) return "#212121"; // almost black
    
    // Hash-based color selection for other measurements
    const hash = symbol.split("").reduce((sum, char, i) => {
      return sum + char.charCodeAt(0) * (i + 1);
    }, 0);
    
    const colors = [
      "#9b87f5", "#7E69AB", "#6E59A5", "#D6BCFA", 
      "#4C51BF", "#38B2AC", "#ED64A6", "#ED8936",
      "#48BB78", "#0EA5E9", "#D946EF", "#F97316"
    ];
    
    return colors[hash % colors.length];
  };

  // Format Thai name from symbol
  const getThaiName = (symbol: string, name: string) => {
    // For class measurement types
    if (symbol === "class1") return "ชั้น 1 (>7.0mm)";
    if (symbol === "class2") return "ชั้น 2 (>6.6-7.0mm)";
    if (symbol === "class3") return "ชั้น 3 (>6.2-6.6mm)";
    if (symbol === "short_grain") return "เมล็ดสั้น";
    if (symbol === "slender_kernel") return "ข้าวลีบ";
    
    // For ingredient measurement types
    if (symbol === "whole_kernels") return "เต็มเมล็ด";
    if (symbol === "head_rice") return "ต้นข้าว";
    if (symbol === "total_brokens") return "ข้าวหักรวม";
    if (symbol === "small_brokens") return "ปลายข้าว";
    if (symbol === "small_brokens_c1") return "ปลายข้าว C1";
    
    // For impurities measurement types
    if (symbol === "red_line_rate") return "สีต่ำกว่ามาตรฐาน";
    if (symbol === "parboiled_red_line") return "เมล็ดแดง";
    if (symbol === "parboiled_white_rice") return "ข้าวดิบ";
    if (symbol === "honey_rice") return "เมล็ดม่วง";
    if (symbol === "yellow_rice_rate") return "เมล็ดข้าวสีเหลือง";
    if (symbol === "black_kernel") return "เมล็ดดำ";
    if (symbol === "partly_black_peck") return "ดำบางส่วน & จุดดำ";
    if (symbol === "partly_black") return "ดำบางส่วน";
    if (symbol === "imperfection_rate") return "เมล็ดเสีย";
    if (symbol === "sticky_rice_rate") return "ข้าวเหนียว";
    if (symbol === "impurity_num") return "เมล็ดอื่นๆ";
    if (symbol === "paddy_rate") return "ข้าวเปลือก(เมล็ด/กก.)";
    if (symbol === "whiteness") return "ความขาว";
    if (symbol === "process_precision") return "ระดับขัดสี";
    
    // Default to the formatted name if no specific Thai name is available
    return name;
  };

  const iconColor = getIconColor(measurement.symbol);
  const thaiName = getThaiName(measurement.symbol, measurement.name);

  return (
    <div
      onClick={onClick}
      className="flex flex-col p-3 border border-gray-100 bg-gray-50 hover:brightness-95 transition-all duration-300 relative overflow-hidden cursor-pointer rounded-lg"
    >
      {/* Background layer */}
      <div className="absolute inset-0 w-full h-full bg-white opacity-80"></div>
      
      <div className="flex items-start relative z-10">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center mr-2 shadow-md relative overflow-hidden flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)` }}
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="absolute top-0 left-0 w-2 h-2 bg-white/30 rounded-full blur-sm"></div>
          <Wheat className="h-3 w-3 text-white" />
        </div>
        <div className="px-1 flex-1">
          <h3 className="font-bold text-sm text-gray-800 leading-tight break-words">{thaiName}</h3>
          <span className="text-xs text-gray-500 hidden sm:block">{measurement.symbol}</span>
        </div>
      </div>
      <div className="text-right relative z-10 text-sm mt-2">
        <p className="font-bold text-gray-600">
          {typeof measurement.value === 'number' ? 
            `${measurement.value.toFixed(1)}%` : 
            measurement.value || '0%'}
        </p>
      </div>
    </div>
  );
};
