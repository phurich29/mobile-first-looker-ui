
import { Bell, Menu, Home, Wheat, BarChart2, User, X, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";
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
      if (window.innerWidth >= 768) { // md breakpoint
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
  
  return (
    <>
      {/* Sidebar for Desktop */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 z-40 w-64 bg-emerald-600 text-white transition-transform duration-300 ease-in-out shadow-xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0" // แสดงเสมอในหน้าจอขนาดใหญ่
      )}>
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-8 mt-4">
            <h2 className="text-xl font-bold">เมนูหลัก</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white md:hidden" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex flex-col space-y-6 mt-4">
            <Link 
              to="/" 
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
                isActive("/") ? "bg-emerald-700 text-white" : "hover:bg-emerald-700/50"
              )}
            >
              <Home className="h-5 w-5" />
              <span className="text-base">หน้าหลัก</span>
            </Link>
            
            <Link 
              to="/rice-prices" 
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
                isActive("/rice-prices") ? "bg-emerald-700 text-white" : "hover:bg-emerald-700/50"
              )}
            >
              <Wheat className="h-5 w-5" />
              <span className="text-base">ราคาข้าว</span>
            </Link>
            
            <Link 
              to="/equipment" 
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
                isActive("/equipment") ? "bg-emerald-700 text-white" : "hover:bg-emerald-700/50"
              )}
            >
              <Settings className="h-5 w-5" />
              <span className="text-base">อุปกรณ์</span>
            </Link>
            
            <Link 
              to="/measurements" 
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
                isActive("/measurements") ? "bg-emerald-700 text-white" : "hover:bg-emerald-700/50"
              )}
            >
              <BarChart2 className="h-5 w-5" />
              <span className="text-base">รายการวัด</span>
            </Link>
          </nav>
        </div>
      </div>
      
      <header className="flex items-center justify-between px-5 py-4 bg-emerald-600 text-white shadow-md md:ml-64">
        {/* Mobile Menu Trigger */}
        <Button variant="ghost" size="icon" className="text-white p-1 md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>

        {/* Minimal Digital Clock */}
        <div className="bg-black/30 px-3 py-1 rounded-md backdrop-blur-sm flex-1 md:flex-none mx-2 md:mx-0">
          <p className="text-sm font-medium tracking-wider text-center">{formatTime()}</p>
        </div>
      
        <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
          <Bell className="h-5 w-5 text-emerald-600" />
        </div>
      </header>
    </>
  );
};
