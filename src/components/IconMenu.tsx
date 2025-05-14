
import React from "react";
import { Link } from "react-router-dom";
import { 
  HardDrive,
  Book,
  Activity,
  Settings
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
      className="flex flex-col items-center justify-center p-4 rounded-xl hover:shadow-md transition-all duration-300"
      style={{ backgroundColor: bgColor }}
    >
      <div 
        className="p-3 rounded-full mb-3 flex items-center justify-center" 
        style={{ backgroundColor: iconColor }}
      >
        {React.cloneElement(icon as React.ReactElement, { 
          size: 24, 
          className: "text-white" 
        })}
      </div>
      <span className="text-sm text-gray-700 font-medium text-center">{label}</span>
    </Link>
  );
};

export const IconMenu = () => {
  const menuItems = [
    { icon: <HardDrive />, label: "รายการอุปกรณ์", to: "/equipment", bgColor: "#f0fdf4", iconColor: "#22c55e" },
    { icon: <Book />, label: "คู่มือการใช้งาน", to: "#", bgColor: "#fff7ed", iconColor: "#f97316" },
    { icon: <Activity />, label: "ตัวบ่งชี้คุณภาพ", to: "#", bgColor: "#f5f3ff", iconColor: "#8b5cf6" },
    { icon: <Settings />, label: "การตั้งค่า", to: "/profile", bgColor: "#f8fafc", iconColor: "#64748b" },
  ];

  return (
    <div className="px-4 py-5 bg-white rounded-xl shadow-sm mx-4 mb-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">บริการทั้งหมด</h2>
      <div className="grid grid-cols-2 gap-4">
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
