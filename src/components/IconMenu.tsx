
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
};

const MenuItem = ({ icon, label, to }: MenuItemProps) => {
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center justify-center p-3 rounded-lg bg-white shadow-sm hover:bg-emerald-50 transition-colors"
    >
      <div className="text-emerald-600 mb-2">{icon}</div>
      <span className="text-xs text-gray-700 font-medium text-center">{label}</span>
    </Link>
  );
};

export const IconMenu = () => {
  const menuItems = [
    { icon: <Home size={24} />, label: "หน้าหลัก", to: "/" },
    { icon: <Hammer size={24} />, label: "อุปกรณ์", to: "/equipment" },
    { icon: <Calendar size={24} />, label: "ปฏิทิน", to: "#" },
    { icon: <Users size={24} />, label: "กลุ่มสมาชิก", to: "#" },
    { icon: <BookOpen size={24} />, label: "คู่มือ", to: "#" },
    { icon: <FileText size={24} />, label: "ข่าวสาร", to: "#" },
    { icon: <Settings size={24} />, label: "การตั้งค่า", to: "/profile" },
  ];

  return (
    <div className="px-4 py-3 bg-gradient-to-b from-emerald-50 to-green-50 rounded-lg mx-4 mb-4">
      <h2 className="text-base font-semibold text-gray-700 mb-3">เมนูลัด</h2>
      <div className="grid grid-cols-4 gap-3">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            label={item.label}
            to={item.to}
          />
        ))}
      </div>
    </div>
  );
};
