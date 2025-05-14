
import { Bell, Menu, Home, Wheat, BarChart2, User, X, Settings, LogOut, Users, DollarSign, Database, FileText, BellDot } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "./AuthProvider";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useIsMobile();
  const location = useLocation();
  const {
    user,
    userRoles
  } = useAuth();

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

  // Format date for desktop header
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return currentTime.toLocaleDateString('th-TH', options);
  };

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการเข้าถึงหน้าจัดการผู้ใช้งานหรือไม่
  const canAccessUserManagement = userRoles.includes('admin') || userRoles.includes('superadmin');

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการเข้าถึงหน้าจัดการราคาข้าวหรือไม่
  const canAccessRicePriceManagement = userRoles.includes('superadmin');
  
  return <>
      {/* Sidebar for Desktop */}
      <div className={cn("fixed left-0 top-0 bottom-0 z-40 w-64 bg-white text-gray-800 transition-transform duration-300 ease-in-out shadow-sm border-r border-gray-100", sidebarOpen ? "translate-x-0" : "-translate-x-full", "md:translate-x-0" // แสดงเสมอในหน้าจอขนาดใหญ่
    )}>
        <div className="flex flex-col h-full p-4 bg-[#fff9df]">
          <div className="flex justify-between items-center mb-8 mt-4">
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/93c9c8f7-4897-4dae-b13b-462f7b25c39b.png" alt="RiceFlow Logo" className="h-8 w-auto" />
              <h2 className="text-xl font-semibold text-emerald-700">RiceFlow</h2>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500 md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {!isMobile && (
            <div className="bg-emerald-600/10 rounded-lg p-4 mb-6">
              <p className="text-xs text-emerald-800/70">{formatDate()}</p>
              <p className="text-2xl font-semibold text-emerald-800 mt-1">{formatTime()}</p>
            </div>
          )}
          
          <nav className="flex flex-col space-y-1 mt-4">
            <Link to="/" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
              <Home className="h-5 w-5" />
              <span className="text-sm">หน้าหลัก</span>
            </Link>
            
            <Link to="/equipment" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/equipment") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
              <Settings className="h-5 w-5" />
              <span className="text-sm">อุปกรณ์</span>
            </Link>
            
            <Link to="/measurements" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/measurements") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
              <BarChart2 className="h-5 w-5" />
              <span className="text-sm">ค่าวัดคุณภาพ</span>
            </Link>
            
            {/* เพิ่มเมนูข้อมูลส่วนตัว */}
            {user && <Link to="/profile" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/profile") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                <User className="h-5 w-5" />
                <span className="text-sm">ข้อมูลส่วนตัว</span>
              </Link>}
            
            {/* เพิ่มเมนูจัดการผู้ใช้งานสำหรับ admin และ superadmin */}
            {user && canAccessUserManagement && <Link to="/user-management" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/user-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                <Users className="h-5 w-5" />
                <span className="text-sm">จัดการผู้ใช้งาน</span>
              </Link>}
            
            {/* เพิ่มเมนูจัดการราคาข้าวสำหรับ superadmin เท่านั้น */}
            {user && canAccessRicePriceManagement && (
              <Link to="/rice-price-management" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/rice-price-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">จัดการราคาข้าว</span>
              </Link>
            )}
            
            {/* เพิ่มเมนูจัดการอุปกรณ์สำหรับ admin และ superadmin */}
            {user && canAccessUserManagement && <Link to="/device-management" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/device-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                <Database className="h-5 w-5" />
                <span className="text-sm">จัดการอุปกรณ์</span>
              </Link>}
              
            {/* เพิ่มเมนูจัดการข่าวสารสำหรับ admin และ superadmin */}
            {user && canAccessUserManagement && <Link to="/news-management" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/news-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                <FileText className="h-5 w-5" />
                <span className="text-sm">จัดการข่าวสาร</span>
              </Link>}
              
            {/* เพิ่มเมนูจัดการการแจ้งเตือนไว้ล่างสุด */}
            {user && <Link to="/notification-management" className={cn("flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors", isActive("/notification-management") ? "bg-emerald-50 text-emerald-600 font-medium border border-emerald-200" : "hover:bg-gray-50 text-gray-700")}>
                <BellDot className="h-5 w-5" />
                <span className="text-sm">จัดการการแจ้งเตือน</span>
              </Link>}
          </nav>
          
          <div className="mt-auto pt-4">
            {user && <div className="border-t border-gray-200 pt-4">
                <Link to="/logout" className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:border hover:border-red-200">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">ออกจากระบบ</span>
                </Link>
              </div>}
          </div>
        </div>
      </div>
      
      {/* Enhanced header for full-width on desktop with better aesthetics */}
      <header className={`flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg ${!isMobile ? 'w-full md:ml-64 md:py-6 px-8' : 'px-4 py-5'}`}>
        {/* Mobile Menu Trigger */}
        <Button variant="ghost" size="icon" className="text-white p-1 hover:bg-emerald-600/70 md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Digital Clock with enhanced styling */}
        <div className="flex items-center gap-2 mx-auto md:mx-0">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center shadow-inner">
            <p className={`font-medium text-white tracking-wider ${!isMobile ? 'text-sm' : 'text-xs'}`}>{formatTime()}</p>
          </div>
          
          {/* Display date on desktop view */}
          {!isMobile && (
            <div className="ml-4 bg-white/10 px-4 py-2 rounded-full hidden md:block">
              <p className="text-sm text-white/90">{formatDate()}</p>
            </div>
          )}
        </div>
      
        <div className="flex items-center gap-3">
          {user && <Link to="/profile" className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition-colors shadow-inner">
              <User className="h-5 w-5 text-white" />
            </Link>}
          {user && <Link to="/logout" className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition-colors shadow-inner">
              <LogOut className="h-5 w-5 text-white" />
            </Link>}
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition-colors shadow-inner">
            <Bell className="h-5 w-5 text-white" />
          </div>
        </div>
      </header>
    </>;
};
