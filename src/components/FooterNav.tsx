
import { Home, Hammer, Bell, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const FooterNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    return path !== '/' && currentPath.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 border-t border-emerald-700 flex justify-around py-2 shadow-xl rounded-t-3xl backdrop-blur-sm z-50" style={{ maxHeight: '65px' }}>
      <Link to="/" className="flex flex-col items-center">
        <div className={`p-1 ${isActive('/') ? 'bg-emerald-700 rounded-full' : ''}`}>
          <Home className="w-5 h-5 text-white" />
        </div>
        <span className={`text-xs mt-0.5 ${isActive('/') ? 'text-white' : 'text-white/80'}`}>หน้าหลัก</span>
      </Link>
      
      <Link to="/equipment" className="flex flex-col items-center">
        <div className={`p-1 ${isActive('/equipment') ? 'bg-emerald-700 rounded-full' : ''}`}>
          <Hammer className="w-5 h-5 text-white" />
        </div>
        <span className={`text-xs mt-0.5 ${isActive('/equipment') ? 'text-white' : 'text-white/80'}`}>อุปกรณ์</span>
      </Link>
      
      <Link to="/notifications" className="flex flex-col items-center">
        <div className={`p-1 ${isActive('/notifications') ? 'bg-emerald-700 rounded-full' : ''}`}>
          <Bell className="w-5 h-5 text-white" />
        </div>
        <span className={`text-xs mt-0.5 ${isActive('/notifications') ? 'text-white' : 'text-white/80'}`}>แจ้งเตือน</span>
      </Link>
      
      <Link to="/profile" className="flex flex-col items-center">
        <div className={`p-1 ${isActive('/profile') ? 'bg-emerald-700 rounded-full' : ''}`}>
          <User className="w-5 h-5 text-white" />
        </div>
        <span className={`text-xs mt-0.5 ${isActive('/profile') ? 'text-white' : 'text-white/80'}`}>โปรไฟล์</span>
      </Link>
    </nav>
  );
};
