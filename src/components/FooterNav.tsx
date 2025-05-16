
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, User, PackageOpen, Bell, Info, Monitor, Layout, BarChart2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "./AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const FooterNav = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthenticated(!!user);
      
      if (user) {
        // Changed to check if user has a token, which implies they are a user
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };
    
    checkAuth();
  }, [user]);
  
  // เมื่อไม่ได้อยู่บนมือถือ ให้แสดง Sidebar แทน
  if (!isMobile) {
    return (
      <div className="fixed bottom-0 left-0 top-[72px] w-64 bg-white border-r border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-800">
        <ScrollArea className="h-full">
          <nav className="p-3 space-y-0.5">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                cn("flex items-center p-2 rounded-lg transition-colors", 
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                    : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                )
              }
            >
              <Home className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">หน้าแรก</span>
            </NavLink>
            
            {isAuthenticated && isAuthorized && (
              <>
                <NavLink 
                  to="/equipment" 
                  className={({ isActive }) => 
                    cn("flex items-center p-2 rounded-lg transition-colors", 
                      isActive 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                        : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                    )
                  }
                >
                  <PackageOpen className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">อุปกรณ์</span>
                </NavLink>
                
                <NavLink 
                  to="/notifications" 
                  className={({ isActive }) => 
                    cn("flex items-center p-2 rounded-lg transition-colors", 
                      isActive 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                        : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                    )
                  }
                >
                  <Bell className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">การแจ้งเตือน</span>
                </NavLink>

                <NavLink 
                  to="/graph-monitor" 
                  className={({ isActive }) => 
                    cn("flex items-center p-2 rounded-lg transition-colors", 
                      isActive 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                        : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                    )
                  }
                >
                  <Monitor className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">Graph Monitor</span>
                </NavLink>
                
                <NavLink 
                  to="/graph-summary" 
                  className={({ isActive }) => 
                    cn("flex items-center p-2 rounded-lg transition-colors", 
                      isActive 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                        : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                    )
                  }
                >
                  <BarChart2 className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">Graph Summary</span>
                </NavLink>
              </>
            )}
            
            <NavLink 
              to="/rice-prices" 
              className={({ isActive }) => 
                cn("flex items-center p-2 rounded-lg transition-colors", 
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                    : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                )
              }
            >
              <Info className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">ราคาข้าว</span>
            </NavLink>
            
            <NavLink 
              to="/news" 
              className={({ isActive }) => 
                cn("flex items-center p-2 rounded-lg transition-colors", 
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                    : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                )
              }
            >
              <Info className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">ข่าวสาร</span>
            </NavLink>
            
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                cn("flex items-center p-2 rounded-lg transition-colors", 
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                    : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
                )
              }
            >
              <User className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">โปรไฟล์</span>
            </NavLink>
          </nav>
        </ScrollArea>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Modern glass-morphism footer */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-14 rounded-t-2xl shadow-lg backdrop-blur-sm bg-opacity-90">
        <nav className="flex justify-around items-center h-full py-2">
          <NavLink to="/" className={({ isActive }) => 
            cn("flex flex-col items-center justify-center w-1/5 h-full", 
              isActive && "relative after:absolute after:bottom-[-8px] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full")
          }>
            <Home className="h-4 w-4 text-white" />
            <span className="text-[10px] mt-0.5 text-white font-medium">หน้าแรก</span>
          </NavLink>
          
          {isAuthenticated && isAuthorized ? (
            <>
              <NavLink to="/equipment" className={({ isActive }) => 
                cn("flex flex-col items-center justify-center w-1/5 h-full", 
                  isActive && "relative after:absolute after:bottom-[-8px] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full")
              }>
                <PackageOpen className="h-4 w-4 text-white" />
                <span className="text-[10px] mt-0.5 text-white font-medium">อุปกรณ์</span>
              </NavLink>
              
              <NavLink to="/graph-summary" className={({ isActive }) => 
                cn("flex flex-col items-center justify-center w-1/5 h-full", 
                  isActive && "relative after:absolute after:bottom-[-8px] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full")
              }>
                <BarChart2 className="h-4 w-4 text-white" />
                <span className="text-[10px] mt-0.5 text-white font-medium">สรุป</span>
              </NavLink>
              
              <NavLink to="/notifications" className={({ isActive }) => 
                cn("flex flex-col items-center justify-center w-1/5 h-full", 
                  isActive && "relative after:absolute after:bottom-[-8px] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full")
              }>
                <Bell className="h-4 w-4 text-white" />
                <span className="text-[10px] mt-0.5 text-white font-medium">แจ้งเตือน</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/rice-prices" className={({ isActive }) => 
                cn("flex flex-col items-center justify-center w-1/5 h-full", 
                  isActive && "relative after:absolute after:bottom-[-8px] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full")
              }>
                <Info className="h-4 w-4 text-white" />
                <span className="text-[10px] mt-0.5 text-white font-medium">ราคาข้าว</span>
              </NavLink>
              
              <NavLink to="/news" className={({ isActive }) => 
                cn("flex flex-col items-center justify-center w-1/5 h-full", 
                  isActive && "relative after:absolute after:bottom-[-8px] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full")
              }>
                <Info className="h-4 w-4 text-white" />
                <span className="text-[10px] mt-0.5 text-white font-medium">ข่าวสาร</span>
              </NavLink>
            </>
          )}
          
          <NavLink to={isAuthenticated ? "/profile" : "/login"} className={({ isActive }) => 
            cn("flex flex-col items-center justify-center w-1/5 h-full", 
              isActive && "relative after:absolute after:bottom-[-8px] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full")
          }>
            <User className="h-4 w-4 text-white" />
            <span className="text-[10px] mt-0.5 text-white font-medium">{isAuthenticated ? "โปรไฟล์" : "เข้าสู่ระบบ"}</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}

export default FooterNav;
