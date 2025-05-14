
import React from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  Hammer, 
  Calendar, 
  Users, 
  BookOpen, 
  FileText, 
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
      className="flex flex-col items-center justify-center p-3 rounded-xl hover:shadow-md transition-all duration-300"
      style={{ backgroundColor: bgColor }}
    >
      <div 
        className="p-2 rounded-full mb-2 flex items-center justify-center" 
        style={{ backgroundColor: iconColor }}
      >
        {React.cloneElement(icon as React.ReactElement, { 
          size: 20, 
          className: "text-white" 
        })}
      </div>
      <span className="text-xs text-gray-700 font-medium text-center">{label}</span>
    </Link>
  );
};

export const IconMenu = () => {
  const menuItems = [
    { icon: <Home />, label: "หน้าหลัก", to: "/", bgColor: "#f0f9ff", iconColor: "#0ea5e9" },
    { icon: <Hammer />, label: "อุปกรณ์", to: "/equipment", bgColor: "#f0fdf4", iconColor: "#22c55e" },
    { icon: <Calendar />, label: "ปฏิทิน", to: "#", bgColor: "#fef2f2", iconColor: "#ef4444" },
    { icon: <Users />, label: "กลุ่มสมาชิก", to: "#", bgColor: "#fdf4ff", iconColor: "#d946ef" },
    { icon: <BookOpen />, label: "คู่มือ", to: "#", bgColor: "#fff7ed", iconColor: "#f97316" },
    { icon: <FileText />, label: "ข่าวสาร", to: "#", bgColor: "#f5f3ff", iconColor: "#8b5cf6" },
    { icon: <Settings />, label: "การตั้งค่า", to: "/profile", bgColor: "#f8fafc", iconColor: "#64748b" },
  ];

  return (
    <div className="px-4 py-4 bg-white rounded-xl shadow-sm mx-4 mb-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4">บริการทั้งหมด</h2>
      <div className="grid grid-cols-4 gap-3">
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
