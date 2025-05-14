
import React from "react";
import { Link } from "react-router-dom";
import { 
  HardDrive,
  Thermometer,
  FileText,
  Bell
} from "lucide-react";

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  bgColor: string;
  iconColor: string;
};

const MenuItem = ({ icon, label, to, bgColor, iconColor }: MenuItemProps) => {
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-white/50 transition-all duration-300"
    >
      <div 
        className="w-14 h-14 rounded-xl mb-2 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {React.cloneElement(icon as React.ReactElement, { 
          size: 24, 
          color: iconColor,
          strokeWidth: 2.5
        })}
      </div>
      <span className="text-xs text-gray-700 font-medium text-center mt-1">{label}</span>
    </Link>
  );
};

export const IconMenu = () => {
  const menuItems = [
    { icon: <HardDrive />, label: "รายการอุปกรณ์", to: "/equipment", bgColor: "rgba(240, 253, 244, 0.6)", iconColor: "#22c55e" },
    { icon: <Thermometer />, label: "ค่าวัดคุณภาพ", to: "/measurements", bgColor: "rgba(245, 243, 255, 0.6)", iconColor: "#8b5cf6" },
    { icon: <FileText />, label: "คู่มือการใช้งาน", to: "#", bgColor: "rgba(255, 247, 237, 0.6)", iconColor: "#f97316" },
    { icon: <Bell />, label: "ตั้งค่าการแจ้งเตือน", to: "/profile", bgColor: "rgba(248, 250, 252, 0.6)", iconColor: "#64748b" },
  ];

  return (
    <div className="px-4 mb-6">
      <div className="px-[5%] mb-3 flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">บริการทั้งหมด</h2>
        <a href="/services" className="text-sm text-green-600 font-medium">ดูทั้งหมด</a>
      </div>
      <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 grid grid-cols-2 gap-3 shadow-sm">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            label={item.label}
            to={item.to}
            bgColor={item.bgColor}
            iconColor={item.iconColor}
          />
        ))}
      </div>
    </div>
  );
};
