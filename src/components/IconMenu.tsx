
import React from "react";
import { Link } from "react-router-dom";
import { 
  HardDrive,
  FileText,
  Wheat,
  ChartLine
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  iconColor: string;
};

const MenuItem = ({ icon, label, to, iconColor }: MenuItemProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center justify-center p-2 hover:opacity-80 transition-all duration-300 bg-white rounded-xl shadow-sm border border-gray-100 px-4"
    >
      <div className={`w-12 h-12 flex items-center justify-center ${!isMobile && 'mr-2'}`}>
        {React.cloneElement(icon as React.ReactElement, { 
          size: isMobile ? 28 : 24, 
          color: iconColor,
          strokeWidth: 2.5
        })}
      </div>
      <span className={`text-xs text-gray-700 font-medium text-center mt-1 ${!isMobile && 'text-sm'}`}>{label}</span>
    </Link>
  );
};

export const IconMenu = () => {
  const isMobile = useIsMobile();
  
  const menuItems = [
    { icon: <HardDrive />, label: "รายการอุปกรณ์", to: "/equipment", iconColor: "#22c55e" },
    { icon: <ChartLine />, label: "ค่าวัดคุณภาพ", to: "/device/default", iconColor: "#8b5cf6" },
    { icon: <FileText />, label: "คู่มือการใช้งาน", to: "#", iconColor: "#f97316" },
  ];

  return (
    <div className="px-4 mb-6">
      <div className="px-[5%] mb-3 flex justify-between items-center md:px-0">
        <h2 className="font-semibold text-gray-700 border-b-2 border-[#f7cd56] inline-block pb-1">บริการทั้งหมด</h2>
        <div className="flex items-center relative">
          {/* Wheat icon group with varied sizes and positions */}
          <Wheat className="text-amber-400 absolute -top-3 -left-8" size={16} strokeWidth={2.5} />
          <Wheat className="text-amber-500 mr-1" size={20} strokeWidth={2.5} />
          <Wheat className="text-amber-600" size={18} strokeWidth={2.5} />
          <Wheat className="text-amber-700 ml-1" size={14} strokeWidth={2.5} />
          <Wheat className="text-yellow-600 absolute -bottom-2 -right-3" size={12} strokeWidth={2.5} />
        </div>
      </div>
      <div className={`rounded-lg p-3 ${isMobile ? 'grid grid-cols-3' : 'flex flex-wrap'} gap-2 md:bg-gray-50 md:p-6`}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            label={item.label}
            to={item.to}
            iconColor={item.iconColor}
          />
        ))}
      </div>
    </div>
  );
};
