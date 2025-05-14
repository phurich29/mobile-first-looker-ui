
import React from "react";
import { Link } from "react-router-dom";
import { 
  HardDrive,
  Thermometer,
  FileText,
  Bell,
  Wheat 
} from "lucide-react";

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  iconColor: string;
};

const MenuItem = ({ icon, label, to, iconColor }: MenuItemProps) => {
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center justify-center p-2 hover:opacity-80 transition-all duration-300"
    >
      <div className="w-12 h-12 flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement, { 
          size: 28, 
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
    { icon: <HardDrive />, label: "รายการอุปกรณ์", to: "/equipment", iconColor: "#22c55e" },
    { icon: <Thermometer />, label: "ค่าวัดคุณภาพ", to: "/measurements", iconColor: "#8b5cf6" },
    { icon: <FileText />, label: "คู่มือการใช้งาน", to: "#", iconColor: "#f97316" },
    { icon: <Bell />, label: "ตั้งค่าการแจ้งเตือน", to: "/profile", iconColor: "#64748b" },
  ];

  return (
    <div className="px-4 mb-6">
      <div className="px-[5%] mb-3 flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">บริการทั้งหมด</h2>
        <div className="flex items-center">
          <Wheat className="text-amber-500 mr-1" size={20} strokeWidth={2.5} />
          <Wheat className="text-amber-600" size={18} strokeWidth={2.5} />
        </div>
      </div>
      <div className="rounded-lg p-3 grid grid-cols-4 gap-2">
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
