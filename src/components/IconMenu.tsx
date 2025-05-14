
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
      className="flex items-center gap-4 p-5 rounded-xl transition-transform hover:-translate-y-1 hover:shadow-lg"
      style={{ backgroundColor: bgColor }}
    >
      <div 
        className="p-3 flex items-center justify-center rounded-lg"
        style={{ backgroundColor: iconColor }}
      >
        {React.cloneElement(icon as React.ReactElement, { 
          size: 20, 
          className: "text-white" 
        })}
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
};

export const IconMenu = () => {
  const menuItems = [
    { icon: <HardDrive />, label: "รายการอุปกรณ์", to: "/equipment", bgColor: "#f0fdf4", iconColor: "#22c55e" },
    { icon: <Thermometer />, label: "ค่าวัดคุณภาพ", to: "/measurements", bgColor: "#f5f3ff", iconColor: "#8b5cf6" },
    { icon: <FileText />, label: "คู่มือการใช้งาน", to: "#", bgColor: "#fff7ed", iconColor: "#f97316" },
    { icon: <Bell />, label: "ตั้งค่าการแจ้งเตือน", to: "/profile", bgColor: "#f8fafc", iconColor: "#64748b" },
  ];

  return (
    <div className="px-5 py-6 bg-white rounded-2xl shadow-md mx-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-5">บริการทั้งหมด</h2>
      <div className="flex flex-col gap-3">
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
