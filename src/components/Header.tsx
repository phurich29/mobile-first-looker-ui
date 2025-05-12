import { Bell, Menu, Home, Wheat, BarChart2, User, X, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
export const Header = () => {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useIsMobile();
  const location = useLocation();

  // ตรวจสอบหน้าที่ผู้ใช้กำลังอยู่เพื่อไฮไลท์เมนูที่ตรงกัน
  const isActive = (path: string) => location.pathname === path;

  // อัพเดทเวลาทุกๆ 1 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ทำงานเมื่อหน้าจอเปลี่ยนขนาด
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // เปิด sidebar ทันทีเมื่อหน้าจอมีขนาดใหญ่กว่า md
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ฟังก์ชันแสดงเวลาในรูปแบบ HH:MM:SS
  const formatTime = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  return <>
      {/* Sidebar for Desktop */}
      <div className={cn("fixed left-0 top-0 bottom-0 z-40 w-64 bg-white text-gray-800 transition-transform duration-300 ease-in-out shadow-sm border-r border-gray-100", sidebarOpen ? "translate-x-0" : "-translate-x-full", "md:translate-x-0" // แสดงเสมอในหน้าจอขนาดใหญ่
    )}>
        <div className="flex flex-col h-full p-4 bg-[fff9df] bg-[#fff9df]">
          <div className="flex justify-between items-center mb-8 mt-4">
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/93c9c8f7-4897-4dae-b13b-462f7b25c39b.png" alt="RiceFlow Logo" className="h-8 w-auto" />
              <h2 className="text-xl font-semibold text-emerald-700">RiceFlow</h2>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500 md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex flex-col space-y-1 mt-4">
            <Link to="/" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
              isActive("/") 
                ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" 
                : "hover:bg-gray-50 text-gray-700")}>
              <Home className="h-5 w-5" />
              <span className="text-sm">หน้าหลัก</span>
            </Link>
            
            <Link to="/rice-prices" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
              isActive("/rice-prices") 
                ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" 
                : "hover:bg-gray-50 text-gray-700")}>
              <Wheat className="h-5 w-5" />
              <span className="text-sm">ราคาข้าว</span>
            </Link>
            
            <Link to="/equipment" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
              isActive("/equipment") 
                ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" 
                : "hover:bg-gray-50 text-gray-700")}>
              <Settings className="h-5 w-5" />
              <span className="text-sm">อุปกรณ์</span>
            </Link>
            
            <Link to="/measurements" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", 
              isActive("/measurements") 
                ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" 
                : "hover:bg-gray-50 text-gray-700")}>
              <BarChart2 className="h-5 w-5" />
              <span className="text-sm">รายการวัด</span>
            </Link>
          </nav>
        </div>
      </div>
      
      <header className="flex items-center justify-between px-4 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md border-b border-emerald-700 md:ml-64">
        {/* Mobile Menu Trigger */}
        <Button variant="ghost" size="icon" className="text-white p-1 hover:bg-emerald-600 md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Minimal Digital Clock */}
        <div className="flex items-center gap-2 mx-auto md:mx-0">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center">
            <p className="text-xs font-medium text-white tracking-wider">{formatTime()}</p>
          </div>
        </div>
      
        <div className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center">
          <Bell className="h-5 w-5 text-white" />
        </div>
      </header>
    </>;
};
