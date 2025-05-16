
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Menu, X, ChevronDown, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
  roles?: string[];
  children?: {
    name: string;
    href: string;
    description?: string;
    roles?: string[];
  }[];
};

// Define navigation items
const navigation: NavItem[] = [
  { name: "หน้าแรก", href: "/" },
  { 
    name: "การจัดการอุปกรณ์", 
    href: "/equipment",
    children: [
      { name: "อุปกรณ์ทั้งหมด", href: "/equipment", description: "ดูอุปกรณ์ทุกชนิดในระบบ" },
      { name: "กราฟมอนิเตอร์", href: "/graph-monitor", description: "เรียกดูข้อมูลอุปกรณ์ในรูปกราฟ" },
    ]
  },
  { name: "การวัด", href: "/measurements" },
  { name: "ราคาข้าว", href: "/rice-prices" },
  { name: "ข่าวสาร", href: "/news" },
  { 
    name: "ผู้ดูแลระบบ", 
    href: "/admin", 
    roles: ["admin"],
    children: [
      { name: "หน้าหลักผู้ดูแล", href: "/admin", description: "สรุปข้อมูลและภาพรวมระบบ" },
      { name: "จัดการผู้ใช้", href: "/user-management", description: "เพิ่ม ลบ แก้ไขผู้ใช้ในระบบ" },
      { name: "จัดการอุปกรณ์", href: "/device-management", description: "จัดการอุปกรณ์และการเข้าถึง" },
      { name: "จัดการราคาข้าว", href: "/rice-price-management", description: "เพิ่ม ลบ แก้ไขข้อมูลราคาข้าว" },
      { name: "จัดการข่าวสาร", href: "/news-management", description: "จัดการข่าวสารในระบบ" },
    ]
  },
];

export const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, userRoles, signOut } = useAuth(); // Changed from logout to signOut
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Close dropdown when location changes
  useEffect(() => {
    setDropdownOpen(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Filter nav items based on user role
  const filteredNav = navigation.filter(item => {
    // If no roles specified or user has required role
    return !item.roles || (user && item.roles.some(role => userRoles.includes(role))); // Changed from user.roles to userRoles
  });

  const toggleDropdown = (name: string) => {
    setDropdownOpen(prev => prev === name ? null : name);
  };

  // Get display name from email or use email directly
  const getDisplayName = () => {
    if (!user) return '';
    return user.email?.split('@')[0] || user.email;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-background/95 dark:bg-background/80 border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-8" aria-label="Global">
        <div className="flex lg:hidden items-center gap-x-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-m-2.5 p-2.5">
                <span className="sr-only">เปิดเมนู</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background border-r border-border">
              <div className="mt-4 flow-root">
                <div className="flex items-center justify-between mb-4">
                  <Link to="/" className="text-lg font-semibold">
                    C2E Tech
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="-my-6 divide-y divide-border">
                  <div className="space-y-2 py-6">
                    {filteredNav.map((item) => (
                      <React.Fragment key={item.name}>
                        {item.children ? (
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              className="w-full justify-start px-3 py-2 rounded-md text-sm"
                              onClick={() => toggleDropdown(item.name)}
                            >
                              {item.name}
                              <ChevronDown
                                className={`ml-auto h-4 w-4 transition-transform ${
                                  dropdownOpen === item.name ? 'rotate-180' : ''
                                }`}
                              />
                            </Button>
                            {dropdownOpen === item.name && (
                              <div className="pl-4 space-y-1">
                                {item.children
                                  .filter(child => !child.roles || (user && child.roles.some(role => userRoles.includes(role)))) // Changed from user.roles to userRoles
                                  .map((child) => (
                                    <Link
                                      key={child.name}
                                      to={child.href}
                                      className={`block px-3 py-2 rounded-md text-sm ${
                                        location.pathname === child.href
                                          ? 'bg-accent text-accent-foreground'
                                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                      }`}
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            to={item.href}
                            className={`block px-3 py-2 rounded-md text-sm ${
                              location.pathname === item.href
                                ? 'bg-accent text-accent-foreground'
                                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {item.name}
                          </Link>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="py-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <ThemeToggle />
                      <Link to="/notifications">
                        <Button variant="ghost" size="icon">
                          <Bell className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          className="block px-3 py-2 -mx-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          โปรไฟล์
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={signOut} // Changed from logout to signOut
                        >
                          ออกจากระบบ
                        </Button>
                      </>
                    ) : (
                      <Link to="/login">
                        <Button className="w-full">เข้าสู่ระบบ</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center">
            <span className="text-lg font-medium text-primary">C2E Tech</span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          <Link to="/" className="flex items-center mr-8">
            <Home className="h-5 w-5 mr-1" />
            <span className="text-lg font-medium text-primary">C2E Tech</span>
          </Link>
          {filteredNav.map((item) => (
            <div key={item.name} className="relative">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`flex items-center gap-x-1 text-sm font-medium leading-6 py-2 px-3 rounded-md ${
                      item.children.some(child => location.pathname === child.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {item.name}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        dropdownOpen === item.name ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {dropdownOpen === item.name && (
                    <div className="absolute z-10 mt-2 w-56 rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {item.children
                          .filter(child => !child.roles || (user && child.roles.some(role => userRoles.includes(role)))) // Changed from user.roles to userRoles
                          .map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`block px-4 py-2 text-sm ${
                                location.pathname === child.href
                                  ? 'bg-accent text-accent-foreground'
                                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                              }`}
                              onClick={() => setDropdownOpen(null)}
                            >
                              <div>
                                {child.name}
                                {child.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{child.description}</p>
                                )}
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  className={`text-sm font-medium leading-6 py-2 px-3 rounded-md ${
                    location.pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:items-center gap-4">
          <ThemeToggle />
          
          {user && (
            <Link to="/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => toggleDropdown('user')}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-800">
                  {getDisplayName().charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">{getDisplayName()}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    dropdownOpen === 'user' ? 'rotate-180' : ''
                  }`}
                />
              </Button>
              
              {dropdownOpen === 'user' && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-popover py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setDropdownOpen(null)}
                  >
                    โปรไฟล์
                  </Link>
                  <Link
                    to="/notification-history"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setDropdownOpen(null)}
                  >
                    ประวัติการแจ้งเตือน
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(null);
                      signOut(); // Changed from logout to signOut
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button>เข้าสู่ระบบ</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
