
import { Bell, Menu } from "lucide-react";
import { Button } from "./ui/button";

export const Header = () => {
  return (
    <header className="flex items-center justify-between px-5 py-4 bg-emerald-600 text-white rounded-b-3xl shadow-md">
      <Button variant="ghost" size="icon" className="text-white p-1">
        <Menu className="h-6 w-6" />
      </Button>
      
      <h1 className="text-xl font-semibold">Home</h1>
      
      <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
        <Bell className="h-5 w-5 text-emerald-600" />
      </div>
    </header>
  );
};
