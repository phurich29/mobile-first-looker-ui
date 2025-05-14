
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
    <Link to={to} className="block relative overflow-hidden">
      <div className="flex items-center p-4 border-b border-gray-100 hover:brightness-95 transition-all duration-300 relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        {/* Background overlay for depth */}
        <div className="absolute inset-0 w-full h-full bg-white opacity-80"></div>
        
        <div className="flex items-center relative z-10">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-md relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)` }}
          >
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="absolute top-0 left-0 w-3 h-3 bg-white/30 rounded-full blur-sm"></div>
            {React.cloneElement(icon as React.ReactElement, { 
              size: 24, 
              className: "text-white" 
            })}
          </div>
          <div className="px-3 py-2">
            <div className="flex flex-col">
              <h3 className="font-bold text-base text-gray-800">{label}</h3>
            </div>
          </div>
        </div>
      </div>
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
    <div className="px-4 mb-6">
      <div className="px-[5%] mb-3 flex justify-between items-center" style={{ width: '100%', boxSizing: 'border-box' }}>
        <h2 className="font-semibold text-gray-700">บริการทั้งหมด</h2>
        <a href="/services" className="text-sm text-green-600 font-medium">ดูทั้งหมด</a>
      </div>
      <div className="bg-white rounded-md overflow-hidden">
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
