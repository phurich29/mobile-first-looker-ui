
import { Bell, Menu, Home, Wheat } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <header className="flex items-center justify-between px-5 py-4 bg-emerald-600 text-white rounded-b-3xl shadow-md">
      {/* Mobile Menu */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white p-1 md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 mt-2">
          <DropdownMenuItem asChild>
            <Link to="/" className="flex items-center gap-2 w-full">
              <Home className="h-4 w-4" />
              <span>หน้าหลัก</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/rice-prices" className="flex items-center gap-2 w-full">
              <Wheat className="h-4 w-4" />
              <span>ราคาข้าว</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
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
