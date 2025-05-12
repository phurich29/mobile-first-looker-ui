
import { Bell, Menu, Home, Wheat } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <header className="flex items-center justify-between px-5 py-4 bg-emerald-600 text-white rounded-b-3xl shadow-md">
      {/* Mobile Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white p-1 md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-emerald-600 text-white p-6 w-64">
          <nav className="flex flex-col space-y-4 mt-8">
            <Link 
              to="/" 
              className="flex items-center gap-2 hover:text-emerald-200 transition-colors text-lg"
              onClick={() => setOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>หน้าหลัก</span>
            </Link>
            <Link 
              to="/rice-prices" 
              className="flex items-center gap-2 hover:text-emerald-200 transition-colors text-lg"
              onClick={() => setOpen(false)}
            >
              <Wheat className="h-5 w-5" />
              <span>ราคาข้าว</span>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      
      {/* Desktop Menu */}
      <nav className="hidden md:flex items-center space-x-6">
        <Link to="/" className="flex items-center gap-2 hover:text-emerald-200 transition-colors">
          <Home className="h-5 w-5" />
          <span>หน้าหลัก</span>
        </Link>
        <Link to="/rice-prices" className="flex items-center gap-2 hover:text-emerald-200 transition-colors">
          <Wheat className="h-5 w-5" />
          <span>ราคาข้าว</span>
        </Link>
      </nav>
      
      <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">Home</h1>
      
      <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
        <Bell className="h-5 w-5 text-emerald-600" />
      </div>
    </header>
  );
};
